import { invalidateMarqueeCache } from '../../utils/cacheManager';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

function getAdminAuthHeaders() {
    const token = localStorage.getItem('mangalam_admin_token') || localStorage.getItem('admin_token') || localStorage.getItem('mangalam_auth_token');
    const headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
}

export const adminMarqueeService = {
    /**
     * Fetch all marquee announcements
     */
    async getMarquees(search = '', status = 'all') {
        try {
            const params = new URLSearchParams();
            if (search) params.append('search', search);
            if (status && status !== 'all') params.append('status', status);

            const url = `${API_BASE_URL}/admin/marquees${params.toString() ? `?${params.toString()}` : ''}`;
            const res = await fetch(url, {
                method: 'GET',
                headers: getAdminAuthHeaders()
            });

            const data = await res.json();
            if (res.ok && data.status) {
                return {
                    success: true,
                    data: data.data?.items || [],
                    is_enabled: data.data?.is_enabled ?? true,
                    total: data.data?.total || 0,
                    message: data.message
                };
            }

            return {
                success: false,
                data: [],
                is_enabled: true,
                message: data.message || 'Failed to fetch marquee items'
            };
        } catch (err) {
            console.error('adminMarqueeService.getMarquees Error:', err);
            return {
                success: false,
                data: [],
                is_enabled: true,
                message: 'Network error fetching marquee items'
            };
        }
    },

    /**
     * Create a new marquee announcement
     */
    async createMarquee(payload) {
        try {
            const res = await fetch(`${API_BASE_URL}/admin/marquees`, {
                method: 'POST',
                headers: getAdminAuthHeaders(),
                body: JSON.stringify(payload)
            });

            const data = await res.json();
            if (res.ok && data.status) {
                invalidateMarqueeCache();
                return {
                    success: true,
                    data: data.data,
                    message: data.message
                };
            }

            return {
                success: false,
                errors: data.errors || null,
                message: data.message || 'Failed to create marquee item'
            };
        } catch (err) {
            console.error('adminMarqueeService.createMarquee Error:', err);
            return {
                success: false,
                message: 'Network error creating marquee item'
            };
        }
    },

    /**
     * Update an existing marquee announcement
     */
    async updateMarquee(id, payload) {
        try {
            const res = await fetch(`${API_BASE_URL}/admin/marquees/${id}`, {
                method: 'PUT',
                headers: getAdminAuthHeaders(),
                body: JSON.stringify(payload)
            });

            const data = await res.json();
            if (res.ok && data.status) {
                invalidateMarqueeCache();
                return {
                    success: true,
                    data: data.data,
                    message: data.message
                };
            }

            return {
                success: false,
                errors: data.errors || null,
                message: data.message || 'Failed to update marquee item'
            };
        } catch (err) {
            console.error('adminMarqueeService.updateMarquee Error:', err);
            return {
                success: false,
                message: 'Network error updating marquee item'
            };
        }
    },

    /**
     * Delete a marquee announcement
     */
    async deleteMarquee(id) {
        try {
            const res = await fetch(`${API_BASE_URL}/admin/marquees/${id}`, {
                method: 'DELETE',
                headers: getAdminAuthHeaders()
            });

            const data = await res.json();
            if (res.ok && data.status) {
                invalidateMarqueeCache();
                return {
                    success: true,
                    message: data.message
                };
            }

            return {
                success: false,
                message: data.message || 'Failed to delete marquee item'
            };
        } catch (err) {
            console.error('adminMarqueeService.deleteMarquee Error:', err);
            return {
                success: false,
                message: 'Network error deleting marquee item'
            };
        }
    },

    /**
     * Quick toggle item active/inactive status
     */
    async toggleStatus(id) {
        try {
            const res = await fetch(`${API_BASE_URL}/admin/marquees/${id}/toggle`, {
                method: 'PATCH',
                headers: getAdminAuthHeaders()
            });

            const data = await res.json();
            if (res.ok && data.status) {
                invalidateMarqueeCache();
                return {
                    success: true,
                    data: data.data,
                    message: data.message
                };
            }

            return {
                success: false,
                message: data.message || 'Failed to toggle status'
            };
        } catch (err) {
            console.error('adminMarqueeService.toggleStatus Error:', err);
            return {
                success: false,
                message: 'Network error toggling status'
            };
        }
    },

    /**
     * Toggle global marquee bar visibility on storefront
     */
    async toggleGlobalVisibility(isEnabled) {
        try {
            const res = await fetch(`${API_BASE_URL}/admin/marquees/toggle-global`, {
                method: 'POST',
                headers: getAdminAuthHeaders(),
                body: JSON.stringify({ is_enabled: isEnabled })
            });

            const data = await res.json();
            if (res.ok && data.status) {
                invalidateMarqueeCache();
                return {
                    success: true,
                    is_enabled: data.data?.is_enabled,
                    message: data.message
                };
            }

            return {
                success: false,
                message: data.message || 'Failed to toggle global marquee visibility'
            };
        } catch (err) {
            console.error('adminMarqueeService.toggleGlobalVisibility Error:', err);
            return {
                success: false,
                message: 'Network error toggling global marquee visibility'
            };
        }
    },

    /**
     * Save reordered marquee list
     */
    async reorderMarquees(orders) {
        try {
            const res = await fetch(`${API_BASE_URL}/admin/marquees/reorder`, {
                method: 'POST',
                headers: getAdminAuthHeaders(),
                body: JSON.stringify({ orders })
            });

            const data = await res.json();
            if (res.ok && data.status) {
                invalidateMarqueeCache();
            }
            return {
                success: res.ok && data.status,
                message: data.message || 'Order updated'
            };
        } catch (err) {
            console.error('adminMarqueeService.reorderMarquees Error:', err);
            return {
                success: false,
                message: 'Network error reordering marquee items'
            };
        }
    }
};
