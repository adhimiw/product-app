// API Utility for communicating with Django backend

const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:8000'
    : '';

// Generate or retrieve persistent Session ID for tracking user activity
const getSessionId = () => {
    let sessionId = localStorage.getItem('mangalam_session_id');
    if (!sessionId) {
        sessionId = 'sess_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        localStorage.setItem('mangalam_session_id', sessionId);
    }
    return sessionId;
};

export const sessionId = getSessionId();

// The backend still stores the original heavy placeholder image paths.
// The frontend ships optimized .webp versions of those exact assets, so we
// remap the known placeholder filenames to .webp as responses come in.
// Real/absolute backend media URLs are left untouched.
const PLACEHOLDER_ASSETS = [
    'refence image/image.png',
    'assets/images/autumn_podium.jpg',
    'assets/images/marketing_branding.jpg',
    'about_sprouts.png',
    'science_sprouts.png',
];

function remapAsset(value) {
    if (typeof value !== 'string') return value;
    for (const asset of PLACEHOLDER_ASSETS) {
        if (value.endsWith(asset)) {
            return value.replace(/\.(png|jpe?g)$/i, '.webp');
        }
    }
    return value;
}

function remapProductImages(product) {
    if (!product || typeof product !== 'object') return product;
    return { ...product, image: remapAsset(product.image) };
}

/**
 * Log activity to the Django backend
 * @param {string} eventType - e.g. PAGE_VIEW, ADD_TO_CART, REMOVE_FROM_CART, APPLY_COUPON, CHECKOUT_SUBMIT
 * @param {object} payload - arbitrary JSON metadata
 */
export async function logActivity(eventType, payload = {}) {
    try {
        const response = await fetch(`${API_BASE}/api/activity/log/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                session_id: sessionId,
                event_type: eventType,
                payload: payload
            })
        });
        return await response.json();
    } catch (error) {
        console.error('Error logging activity:', error);
        return null;
    }
}

/**
 * Fetch products from Django backend
 */
export async function fetchProducts() {
    try {
        const response = await fetch(`${API_BASE}/api/products/`);
        if (!response.ok) throw new Error('Failed to fetch products');
        const data = await response.json();
        return Array.isArray(data) ? data.map(remapProductImages) : data;
    } catch (error) {
        console.error('Error fetching products:', error);
        return [];
    }
}

/**
 * Fetch active banners (optionally by placement, e.g. 'hero')
 */
export async function fetchBanners(placement = '') {
    try {
        const qs = placement ? `?placement=${encodeURIComponent(placement)}` : '';
        const response = await fetch(`${API_BASE}/api/banners/${qs}`);
        if (!response.ok) throw new Error('Failed to fetch banners');
        const data = await response.json();
        return Array.isArray(data) ? data : [];
    } catch (error) {
        console.error('Error fetching banners:', error);
        return [];
    }
}

/**
 * Fetch public site settings from Django backend
 */
export async function fetchSiteConfig() {
    try {
        const response = await fetch(`${API_BASE}/api/site-config/`);
        if (!response.ok) throw new Error('Failed to fetch site config');
        const data = await response.json();
        if (data && typeof data === 'object') {
            for (const key of Object.keys(data)) {
                data[key] = remapAsset(data[key]);
            }
        }
        return data;
    } catch (error) {
        console.error('Error fetching site config:', error);
        return null;
    }
}

/**
 * Validate coupon code against subtotal
 * @param {string} code 
 * @param {number} subtotal 
 */
export async function validateCoupon(code, subtotal) {
    try {
        const response = await fetch(`${API_BASE}/api/coupons/validate/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ code, subtotal })
        });
        return await response.json();
    } catch (error) {
        console.error('Error validating coupon:', error);
        return { valid: false, message: 'Server error validating coupon.' };
    }
}

/**
 * Create a new order and trigger WhatsApp notification
 * @param {object} orderData - { name, mobile, address, items, coupon_code }
 */
export async function createOrder(orderData) {
    try {
        const response = await fetch(`${API_BASE}/api/orders/create/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                ...orderData,
                session_id: sessionId
            })
        });
        return await response.json();
    } catch (error) {
        console.error('Error creating order:', error);
        return { success: false, error: 'Server error processing checkout.' };
    }
}
