import { invalidateBannersCache } from '../../utils/cacheManager';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

function getAdminAuthHeaders(isMultipart = false) {
    const token = localStorage.getItem('mangalam_admin_token') || localStorage.getItem('admin_token') || localStorage.getItem('mangalam_auth_token');
    const headers = {
        'Accept': 'application/json',
    };
    if (!isMultipart) {
        headers['Content-Type'] = 'application/json';
    }
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
}

export const adminBannerService = {
    /**
     * Fetch all hero banners for Admin CRUD
     */
    async getBanners(search = '', status = 'all') {
        try {
            const params = new URLSearchParams();
            if (search) params.append('search', search);
            if (status && status !== 'all') params.append('status', status);

            const url = `${API_BASE_URL}/admin/banners${params.toString() ? `?${params.toString()}` : ''}`;
            const res = await fetch(url, {
                method: 'GET',
                headers: getAdminAuthHeaders()
            });

            const data = await res.json();
            if (res.ok && data.status) {
                return {
                    success: true,
                    data: Array.isArray(data.data) ? data.data : [],
                    counts: data.counts || { all: 0, active: 0, inactive: 0 },
                    message: data.message
                };
            }

            return {
                success: false,
                data: [],
                counts: { all: 0, active: 0, inactive: 0 },
                message: data.message || 'Failed to fetch banners'
            };
        } catch (err) {
            console.error('adminBannerService.getBanners Error:', err);
            return {
                success: false,
                data: [],
                counts: { all: 0, active: 0, inactive: 0 },
                message: 'Network error fetching banners'
            };
        }
    },

    /**
     * Create a new hero banner (supports FormData for image uploads or JSON)
     */
    async createBanner(payload) {
        try {
            const isMultipart = payload instanceof FormData;
            const res = await fetch(`${API_BASE_URL}/admin/banners`, {
                method: 'POST',
                headers: getAdminAuthHeaders(isMultipart),
                body: isMultipart ? payload : JSON.stringify(payload)
            });

            const data = await res.json();
            if (res.ok && data.status) {
                invalidateBannersCache();
                return {
                    success: true,
                    data: data.data,
                    message: data.message
                };
            }

            return {
                success: false,
                errors: data.errors || null,
                message: data.message || 'Failed to create banner'
            };
        } catch (err) {
            console.error('adminBannerService.createBanner Error:', err);
            return {
                success: false,
                message: 'Network error creating banner'
            };
        }
    },

    /**
     * Update an existing hero banner (supports FormData or JSON)
     */
    async updateBanner(id, payload) {
        try {
            const isMultipart = payload instanceof FormData;
            const res = await fetch(`${API_BASE_URL}/admin/banners/${id}`, {
                method: 'POST', // Use POST for multipart file handling
                headers: getAdminAuthHeaders(isMultipart),
                body: isMultipart ? payload : JSON.stringify(payload)
            });

            const data = await res.json();
            if (res.ok && data.status) {
                invalidateBannersCache();
                return {
                    success: true,
                    data: data.data,
                    message: data.message
                };
            }

            return {
                success: false,
                errors: data.errors || null,
                message: data.message || 'Failed to update banner'
            };
        } catch (err) {
            console.error('adminBannerService.updateBanner Error:', err);
            return {
                success: false,
                message: 'Network error updating banner'
            };
        }
    },

    /**
     * Toggle active/inactive status
     */
    async toggleStatus(id) {
        try {
            const res = await fetch(`${API_BASE_URL}/admin/banners/${id}/status`, {
                method: 'POST',
                headers: getAdminAuthHeaders()
            });

            const data = await res.json();
            if (res.ok && data.status) {
                invalidateBannersCache();
                return {
                    success: true,
                    data: data.data,
                    message: data.message
                };
            }

            return {
                success: false,
                message: data.message || 'Failed to toggle banner status'
            };
        } catch (err) {
            console.error('adminBannerService.toggleStatus Error:', err);
            return {
                success: false,
                message: 'Network error toggling banner status'
            };
        }
    },

    /**
     * Delete a banner
     */
    async deleteBanner(id) {
        try {
            const res = await fetch(`${API_BASE_URL}/admin/banners/${id}`, {
                method: 'DELETE',
                headers: getAdminAuthHeaders()
            });

            const data = await res.json();
            if (res.ok && data.status) {
                invalidateBannersCache();
                return {
                    success: true,
                    message: data.message
                };
            }

            return {
                success: false,
                message: data.message || 'Failed to delete banner'
            };
        } catch (err) {
            console.error('adminBannerService.deleteBanner Error:', err);
            return {
                success: false,
                message: 'Network error deleting banner'
            };
        }
    },

    /**
     * Save reordered banner list
     */
    async reorderBanners(orders) {
        try {
            const res = await fetch(`${API_BASE_URL}/admin/banners/reorder`, {
                method: 'POST',
                headers: getAdminAuthHeaders(),
                body: JSON.stringify({ orders })
            });

            const data = await res.json();
            if (res.ok && data.status) {
                invalidateBannersCache();
            }
            return {
                success: res.ok && data.status,
                message: data.message || 'Banner order updated'
            };
        } catch (err) {
            console.error('adminBannerService.reorderBanners Error:', err);
            return {
                success: false,
                message: 'Network error reordering banners'
            };
        }
    }
};
