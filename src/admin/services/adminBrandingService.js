/**
 * Admin Branding API Service
 * Manages Full Logo, Small Logo, Dark Logo, Favicon, and Brand Metadata.
 */

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '/api') + '/admin/settings/branding';
const PUBLIC_API_URL = (import.meta.env.VITE_API_BASE_URL || '/api') + '/branding';
const STORAGE_KEY = 'mangalam_branding_settings_v1';

export const DEFAULT_BRANDING = {
    logo_full: '/mangalam_logo.png',
    logo_small: '/mangalam_logo.png',
    logo_dark: '/mangalam_logo.png',
    favicon: '/mangalam_logo.png',
    site_title: 'Mangalam Healthy Foods',
    tagline: 'Traditional & Heritage Wellness Foods',
    footer_text: '© 2026 Mangalam Healthy Foods. All rights reserved.'
};

export const adminBrandingService = {
    getHeaders() {
        let token = null;
        try {
            const session = JSON.parse(localStorage.getItem('mangalam_admin_session') || '{}');
            token = session.token || null;
        } catch (e) {
            token = null;
        }

        const headers = {
            'Accept': 'application/json'
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        return headers;
    },

    /**
     * Fetch all branding settings (admin or public fallback with cache)
     */
    async getBrandingSettings() {
        try {
            const headers = this.getHeaders();
            const targetUrl = headers.Authorization ? API_BASE_URL : PUBLIC_API_URL;
            
            let response = await fetch(targetUrl, {
                method: 'GET',
                headers: { 'Accept': 'application/json', ...(headers.Authorization ? { 'Authorization': headers.Authorization } : {}) }
            });

            if (!response.ok && targetUrl !== PUBLIC_API_URL) {
                response = await fetch(PUBLIC_API_URL, {
                    method: 'GET',
                    headers: { 'Accept': 'application/json' }
                });
            }

            if (response.ok) {
                const resData = await response.json();
                const branding = resData.data || resData || DEFAULT_BRANDING;
                const merged = { ...DEFAULT_BRANDING, ...branding };
                localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
                return merged;
            }

            const cached = localStorage.getItem(STORAGE_KEY);
            return cached ? JSON.parse(cached) : DEFAULT_BRANDING;
        } catch (err) {
            console.warn('API Fetch Branding failed, using cache:', err);
            const cached = localStorage.getItem(STORAGE_KEY);
            return cached ? JSON.parse(cached) : DEFAULT_BRANDING;
        }
    },

    /**
     * Upload / Update Branding Settings (multipart/form-data)
     */
    async updateBrandingSettings(formData) {
        try {
            const response = await fetch(API_BASE_URL, {
                method: 'POST',
                headers: this.getHeaders(),
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `Failed to update branding (${response.status})`);
            }

            const resData = await response.json();
            const updated = resData.data || resData || DEFAULT_BRANDING;
            const merged = { ...DEFAULT_BRANDING, ...updated };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));

            return {
                success: true,
                data: merged,
                message: resData.message || 'Branding settings updated successfully'
            };
        } catch (err) {
            console.error('Error updating branding settings:', err);
            return {
                success: false,
                message: err.message || 'Network error updating branding settings'
            };
        }
    },

    /**
     * Delete/Reset an individual logo key
     */
    async deleteLogo(key) {
        try {
            const response = await fetch(`${API_BASE_URL}/${key}`, {
                method: 'DELETE',
                headers: this.getHeaders()
            });

            if (response.ok) {
                const resData = await response.json();
                const updated = resData.data || DEFAULT_BRANDING;
                const merged = { ...DEFAULT_BRANDING, ...updated };
                localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
                return { success: true, data: merged };
            }

            return { success: false, message: 'Failed to reset logo' };
        } catch (err) {
            console.error('Error deleting logo:', err);
            return { success: false, message: err.message };
        }
    },

    /**
     * Reset all branding settings back to factory default
     */
    async resetAllBranding() {
        try {
            const response = await fetch(`${API_BASE_URL}/reset`, {
                method: 'POST',
                headers: this.getHeaders()
            });

            if (response.ok) {
                const resData = await response.json();
                const updated = resData.data || DEFAULT_BRANDING;
                const merged = { ...DEFAULT_BRANDING, ...updated };
                localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
                return { success: true, data: merged };
            }

            return { success: false, message: 'Failed to reset branding' };
        } catch (err) {
            console.error('Error resetting branding:', err);
            return { success: false, message: err.message };
        }
    }
};
