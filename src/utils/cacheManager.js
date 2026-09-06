/**
 * Unified Cache & Reactive Invalidation Bus for Mangalam Store
 * Manages fast memory caching, Web Storage synchronization, and
 * cross-tab / cross-component reactive broadcast invalidation.
 */

// In-Memory Fast Cache Store with configurable TTL
export const memoryStore = {
    products: null,
    productsTimestamp: 0,
    categories: null,
    categoriesTimestamp: 0,
    marquee: null,
    marqueeTimestamp: 0,
    banners: null,
    bannersTimestamp: 0,
    TTL: 10 * 60 * 1000 // 10 minutes cache TTL for instant rendering
};

// Standardized Storage Keys
export const CACHE_KEYS = {
    PRODUCTS_SESSION: 'mangalam_cached_products',
    PRODUCTS_ADMIN: 'mangalam_admin_products_v6',
    CATEGORIES_SESSION: 'mangalam_cached_categories',
    CATEGORIES_ADMIN: 'mangalam_admin_categories',
    MARQUEE_SESSION: 'mangalam_cached_marquee',
    BRANDING_LOCAL: 'mangalam_branding_settings_v1',
    BANNERS_LOCAL: 'mangalam_cached_banners_v1',
    SIGNAL_LOCAL: 'mangalam_cache_invalidation_signal'
};

// Cross-tab BroadcastChannel instance
let cacheBroadcastChannel = null;
try {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        cacheBroadcastChannel = new BroadcastChannel('mangalam_cache_bus');
    }
} catch {
    cacheBroadcastChannel = null;
}

/**
 * Dispatch cache invalidation across in-memory cache, current window, other tabs, and storage.
 * @param {'products' | 'categories' | 'marquee' | 'branding' | 'banners' | 'all'} entityType
 */
export function emitCacheInvalidation(entityType = 'all') {
    const timestamp = Date.now();
    const payload = { type: entityType, timestamp };

    // 1. Invalidate Memory & Storage selectively
    if (entityType === 'products' || entityType === 'all') {
        memoryStore.products = null;
        memoryStore.productsTimestamp = 0;
        try {
            sessionStorage.removeItem(CACHE_KEYS.PRODUCTS_SESSION);
            localStorage.removeItem(CACHE_KEYS.PRODUCTS_ADMIN);
        } catch {}
    }

    if (entityType === 'categories' || entityType === 'all') {
        memoryStore.categories = null;
        memoryStore.categoriesTimestamp = 0;
        try {
            sessionStorage.removeItem(CACHE_KEYS.CATEGORIES_SESSION);
            localStorage.removeItem(CACHE_KEYS.CATEGORIES_ADMIN);
        } catch {}
    }

    if (entityType === 'marquee' || entityType === 'all') {
        memoryStore.marquee = null;
        memoryStore.marqueeTimestamp = 0;
        try {
            sessionStorage.removeItem(CACHE_KEYS.MARQUEE_SESSION);
        } catch {}
    }

    if (entityType === 'branding' || entityType === 'all') {
        try {
            localStorage.removeItem(CACHE_KEYS.BRANDING_LOCAL);
        } catch {}
    }

    if (entityType === 'banners' || entityType === 'all') {
        memoryStore.banners = null;
        memoryStore.bannersTimestamp = 0;
        try {
            localStorage.removeItem(CACHE_KEYS.BANNERS_LOCAL);
        } catch {}
    }

    // 2. Dispatch Local Window CustomEvent (for active React state updates in the same window)
    if (typeof window !== 'undefined') {
        try {
            window.dispatchEvent(new CustomEvent('mangalam_cache_invalidated', { detail: payload }));
        } catch {}

        // 3. Dispatch LocalStorage Signal (triggers 'storage' event across other browser tabs)
        try {
            localStorage.setItem(CACHE_KEYS.SIGNAL_LOCAL, JSON.stringify(payload));
        } catch {}

        // 4. Dispatch BroadcastChannel message (instant modern cross-tab bus)
        try {
            if (cacheBroadcastChannel) {
                cacheBroadcastChannel.postMessage(payload);
            }
        } catch {}
    }
}

// Granular Cache Invalidation Helpers
export const invalidateProductsCache = () => emitCacheInvalidation('products');
export const invalidateCategoriesCache = () => emitCacheInvalidation('categories');
export const invalidateMarqueeCache = () => emitCacheInvalidation('marquee');
export const invalidateBrandingCache = () => emitCacheInvalidation('branding');
export const invalidateBannersCache = () => emitCacheInvalidation('banners');
export const invalidateAllStoreCache = () => emitCacheInvalidation('all');

/**
 * Subscribe to cache invalidation events (supports CustomEvents, Storage events, BroadcastChannel)
 * @param {'products' | 'categories' | 'marquee' | 'branding' | 'all'} entityType
 * @param {(payload: { type: string, timestamp: number }) => void} callback
 * @returns {() => void} unsubscribe cleanup function
 */
export function subscribeToCacheInvalidation(entityType, callback) {
    if (typeof window === 'undefined' || typeof callback !== 'function') {
        return () => {};
    }

    const handleSignal = (payload) => {
        if (!payload || !payload.type) return;
        if (entityType === 'all' || payload.type === 'all' || payload.type === entityType) {
            callback(payload);
        }
    };

    // 1. Same-window CustomEvent listener
    const onCustomEvent = (e) => {
        if (e && e.detail) {
            handleSignal(e.detail);
        }
    };
    window.addEventListener('mangalam_cache_invalidated', onCustomEvent);

    // 2. Other-tab Storage Event listener
    const onStorageEvent = (e) => {
        if (e.key === CACHE_KEYS.SIGNAL_LOCAL && e.newValue) {
            try {
                const parsed = JSON.parse(e.newValue);
                handleSignal(parsed);
            } catch {}
        }
    };
    window.addEventListener('storage', onStorageEvent);

    // 3. BroadcastChannel listener
    const onBroadcastMessage = (e) => {
        if (e && e.data) {
            handleSignal(e.data);
        }
    };
    if (cacheBroadcastChannel) {
        cacheBroadcastChannel.addEventListener('message', onBroadcastMessage);
    }

    return () => {
        window.removeEventListener('mangalam_cache_invalidated', onCustomEvent);
        window.removeEventListener('storage', onStorageEvent);
        if (cacheBroadcastChannel) {
            cacheBroadcastChannel.removeEventListener('message', onBroadcastMessage);
        }
    };
}
