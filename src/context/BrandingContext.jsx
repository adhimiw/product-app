import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { adminBrandingService, DEFAULT_BRANDING } from '../admin/services/adminBrandingService';
import { subscribeToCacheInvalidation } from '../utils/cacheManager';

const BrandingContext = createContext({
    branding: DEFAULT_BRANDING,
    loading: false,
    updateBranding: async () => {},
    resetBranding: async () => {},
    deleteLogo: async () => {},
    refreshBranding: async () => {},
});

export function BrandingProvider({ children }) {
    const [branding, setBranding] = useState(() => {
        try {
            const cached = localStorage.getItem('mangalam_branding_settings_v1');
            return cached ? { ...DEFAULT_BRANDING, ...JSON.parse(cached) } : DEFAULT_BRANDING;
        } catch {
            return DEFAULT_BRANDING;
        }
    });
    const [loading, setLoading] = useState(false);

    // Apply favicon and page title dynamically to document head
    useEffect(() => {
        if (typeof document !== 'undefined') {
            const faviconUrl = branding.favicon || '/sprout-mascot-badge.png';

            // 1. Remove all previous favicon/shortcut icon elements to avoid conflicting tags
            const existingIcons = document.querySelectorAll("link[rel*='icon']");
            existingIcons.forEach(el => el.remove());

            // 2. Create primary dynamic favicon link
            const link = document.createElement('link');
            link.id = 'dynamic-favicon';
            link.rel = 'icon';
            link.type = faviconUrl.endsWith('.svg') 
                ? 'image/svg+xml' 
                : (faviconUrl.endsWith('.ico') ? 'image/x-icon' : 'image/png');
            // Cache-bust if dynamic to force instant browser tab refresh
            link.href = faviconUrl.startsWith('http') || faviconUrl.startsWith('/storage') 
                ? `${faviconUrl}${faviconUrl.includes('?') ? '&' : '?'}v=${Date.now()}` 
                : faviconUrl;
            document.head.appendChild(link);

            // 3. Update Apple Touch Icon
            const appleLink = document.createElement('link');
            appleLink.rel = 'apple-touch-icon';
            appleLink.href = branding.logo_small || faviconUrl;
            document.head.appendChild(appleLink);
        }
    }, [branding.favicon, branding.logo_small]);

    const refreshBranding = useCallback(async () => {
        setLoading(true);
        try {
            const data = await adminBrandingService.getBrandingSettings();
            if (data) {
                setBranding(prev => ({ ...prev, ...data }));
            }
        } catch (err) {
            console.error('Failed to load branding in context:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        refreshBranding();
    }, [refreshBranding]);

    useEffect(() => {
        const unsubscribe = subscribeToCacheInvalidation('branding', () => {
            refreshBranding();
        });
        return () => unsubscribe();
    }, [refreshBranding]);

    const updateBranding = async (formData) => {
        setLoading(true);
        try {
            const res = await adminBrandingService.updateBrandingSettings(formData);
            if (res.success && res.data) {
                setBranding(res.data);
            }
            return res;
        } finally {
            setLoading(false);
        }
    };

    const deleteLogo = async (key) => {
        setLoading(true);
        try {
            const res = await adminBrandingService.deleteLogo(key);
            if (res.success && res.data) {
                setBranding(res.data);
            }
            return res;
        } finally {
            setLoading(false);
        }
    };

    const resetBranding = async () => {
        setLoading(true);
        try {
            const res = await adminBrandingService.resetAllBranding();
            if (res.success && res.data) {
                setBranding(res.data);
            }
            return res;
        } finally {
            setLoading(false);
        }
    };

    return (
        <BrandingContext.Provider
            value={{
                branding,
                loading,
                updateBranding,
                resetBranding,
                deleteLogo,
                refreshBranding,
            }}
        >
            {children}
        </BrandingContext.Provider>
    );
}

export function useBranding() {
    const context = useContext(BrandingContext);
    if (!context) {
        return {
            branding: DEFAULT_BRANDING,
            loading: false,
            updateBranding: async () => {},
            resetBranding: async () => {},
            deleteLogo: async () => {},
            refreshBranding: async () => {},
        };
    }
    return context;
}
