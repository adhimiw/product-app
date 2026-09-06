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

export const adminQueryService = {
    /**
     * Fetch customer queries with optional status, search, and sort filters
     */
    async getQueries(search = '', status = 'all', sort = 'latest') {
        try {
            const params = new URLSearchParams();
            if (search) params.append('search', search);
            if (status && status !== 'all') params.append('status', status);
            if (sort) params.append('sort', sort);

            const url = `${API_BASE_URL}/admin/queries${params.toString() ? `?${params.toString()}` : ''}`;
            const res = await fetch(url, {
                method: 'GET',
                headers: getAdminAuthHeaders()
            });

            const data = await res.json();
            if (res.ok && data.status) {
                return {
                    success: true,
                    data: data.data || [],
                    counts: data.counts || { all: 0, pending: 0, in_progress: 0, resolved: 0, archived: 0 },
                    message: data.message
                };
            }

            return {
                success: false,
                data: [],
                counts: { all: 0, pending: 0, in_progress: 0, resolved: 0, archived: 0 },
                message: data.message || 'Failed to fetch customer queries'
            };
        } catch (err) {
            console.error('adminQueryService.getQueries Error:', err);
            return {
                success: false,
                data: [],
                counts: { all: 0, pending: 0, in_progress: 0, resolved: 0, archived: 0 },
                message: 'Network error fetching customer queries'
            };
        }
    },

    /**
     * Get single query details
     */
    async getQueryById(id) {
        try {
            const res = await fetch(`${API_BASE_URL}/admin/queries/${id}`, {
                method: 'GET',
                headers: getAdminAuthHeaders()
            });

            const data = await res.json();
            if (res.ok && data.status) {
                return {
                    success: true,
                    data: data.data,
                    message: data.message
                };
            }

            return {
                success: false,
                message: data.message || 'Query not found'
            };
        } catch (err) {
            console.error('adminQueryService.getQueryById Error:', err);
            return {
                success: false,
                message: 'Network error fetching query'
            };
        }
    },

    /**
     * Update query status and optional admin notes
     */
    async updateStatus(id, status, adminNotes = null) {
        try {
            const payload = { status };
            if (adminNotes !== null) payload.admin_notes = adminNotes;

            const res = await fetch(`${API_BASE_URL}/admin/queries/${id}/status`, {
                method: 'PUT',
                headers: getAdminAuthHeaders(),
                body: JSON.stringify(payload)
            });

            const data = await res.json();
            if (res.ok && data.status) {
                return {
                    success: true,
                    data: data.data,
                    message: data.message
                };
            }

            return {
                success: false,
                message: data.message || 'Failed to update query status'
            };
        } catch (err) {
            console.error('adminQueryService.updateStatus Error:', err);
            return {
                success: false,
                message: 'Network error updating query status'
            };
        }
    },

    /**
     * Send email reply to query
     */
    async replyToQuery(id, { subject, message, status = 'resolved', admin_notes = null }) {
        try {
            const res = await fetch(`${API_BASE_URL}/admin/queries/${id}/reply`, {
                method: 'POST',
                headers: getAdminAuthHeaders(),
                body: JSON.stringify({ subject, message, status, admin_notes })
            });

            const data = await res.json();
            if (res.ok && data.status) {
                return {
                    success: true,
                    email_sent: data.email_sent,
                    data: data.data,
                    message: data.message
                };
            }

            return {
                success: false,
                message: data.message || 'Failed to send reply'
            };
        } catch (err) {
            console.error('adminQueryService.replyToQuery Error:', err);
            return {
                success: false,
                message: 'Network error sending reply'
            };
        }
    },

    /**
     * Delete query
     */
    async deleteQuery(id) {
        try {
            const res = await fetch(`${API_BASE_URL}/admin/queries/${id}`, {
                method: 'DELETE',
                headers: getAdminAuthHeaders()
            });

            const data = await res.json();
            if (res.ok && data.status) {
                return {
                    success: true,
                    message: data.message
                };
            }

            return {
                success: false,
                message: data.message || 'Failed to delete query'
            };
        } catch (err) {
            console.error('adminQueryService.deleteQuery Error:', err);
            return {
                success: false,
                message: 'Network error deleting query'
            };
        }
    },

    /**
     * Bulk update queries status
     */
    async bulkUpdateStatus(ids, status) {
        try {
            const res = await fetch(`${API_BASE_URL}/admin/queries/bulk-status`, {
                method: 'POST',
                headers: getAdminAuthHeaders(),
                body: JSON.stringify({ ids, status })
            });

            const data = await res.json();
            if (res.ok && data.status) {
                return {
                    success: true,
                    message: data.message
                };
            }

            return {
                success: false,
                message: data.message || 'Failed to bulk update queries'
            };
        } catch (err) {
            console.error('adminQueryService.bulkUpdateStatus Error:', err);
            return {
                success: false,
                message: 'Network error updating queries'
            };
        }
    },

    /**
     * Bulk delete queries
     */
    async bulkDelete(ids) {
        try {
            const res = await fetch(`${API_BASE_URL}/admin/queries/bulk-delete`, {
                method: 'POST',
                headers: getAdminAuthHeaders(),
                body: JSON.stringify({ ids })
            });

            const data = await res.json();
            if (res.ok && data.status) {
                return {
                    success: true,
                    message: data.message
                };
            }

            return {
                success: false,
                message: data.message || 'Failed to bulk delete queries'
            };
        } catch (err) {
            console.error('adminQueryService.bulkDelete Error:', err);
            return {
                success: false,
                message: 'Network error deleting queries'
            };
        }
    }
};
