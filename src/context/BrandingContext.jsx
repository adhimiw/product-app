import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { adminBrandingService, DEFAULT_BRANDING } from '../admin/services/adminBrandingService';

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
            // Update Favicon
            const faviconUrl = branding.favicon || '/mangalam_logo.png';
            let link = document.querySelector("link[rel~='icon']");
            if (!link) {
                link = document.createElement('link');
                link.rel = 'icon';
                document.getElementsByTagName('head')[0].appendChild(link);
            }
            link.href = faviconUrl;

            // Update Apple Touch Icon
            let appleLink = document.querySelector("link[rel='apple-touch-icon']");
            if (!appleLink) {
                appleLink = document.createElement('link');
                appleLink.rel = 'apple-touch-icon';
                document.getElementsByTagName('head')[0].appendChild(appleLink);
            }
            appleLink.href = branding.logo_small || faviconUrl;
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
