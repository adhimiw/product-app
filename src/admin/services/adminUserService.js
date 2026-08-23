/**
 * Admin User Management API Service
 * Integrates directly with Laravel API (GET, PUT, POST, DELETE /api/admin/users)
 * Handles Role 2 (Customer) and Role 3 (Vendor) user operations.
 */

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '/api') + '/admin/users';

export const adminUserService = {
    getHeaders() {
        let token = null;
        try {
            const session = JSON.parse(localStorage.getItem('mangalam_admin_session') || '{}');
            token = session.token || null;
        } catch {
            token = null;
        }

        const headers = {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        return headers;
    },

    /**
     * Fetch users list with optional search, role, status, and sorting filters.
     */
    async getUsers(params = {}) {
        const query = new URLSearchParams();
        if (params.search) query.append('search', params.search);
        if (params.role) query.append('role', params.role);
        if (params.status) query.append('status', params.status);
        if (params.sort_by) query.append('sort_by', params.sort_by);
        if (params.sort_dir) query.append('sort_dir', params.sort_dir);
        if (params.page) query.append('page', params.page);
        if (params.per_page) query.append('per_page', params.per_page);

        const url = `${API_BASE_URL}?${query.toString()}`;

        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: this.getHeaders()
            });

            const data = await response.json();
            if (response.ok && data.status) {
                return {
                    success: true,
                    users: data.data || [],
                    pagination: data.pagination || null,
                    stats: data.stats || { total_users: 0, total_customers: 0, total_vendors: 0, total_blocked: 0 }
                };
            }

            return {
                success: false,
                error: data.message || 'Failed to retrieve users list.',
                users: [],
                stats: { total_users: 0, total_customers: 0, total_vendors: 0, total_blocked: 0 }
            };
        } catch (err) {
            console.error('API Admin Users Fetch Error:', err);
            return {
                success: false,
                error: 'Backend API connection failed.',
                users: [],
                stats: { total_users: 0, total_customers: 0, total_vendors: 0, total_blocked: 0 }
            };
        }
    },

    /**
     * Fetch detailed user profile including addresses and orders.
     */
    async getUserDetails(id) {
        try {
            const response = await fetch(`${API_BASE_URL}/${id}`, {
                method: 'GET',
                headers: this.getHeaders()
            });

            const data = await response.json();
            if (response.ok && data.status) {
                return { success: true, user: data.data };
            }

            return { success: false, error: data.message || 'User not found.' };
        } catch (err) {
            console.error('API Admin User Details Error:', err);
            return { success: false, error: 'Failed to connect to backend server.' };
        }
    },

    /**
     * Update user details (Name, Email, Contact Number, WhatsApp Number, Role, Status)
     * NOTE: Password is intentionally never touched or updated here.
     */
    async updateUser(id, payload) {
        try {
            const response = await fetch(`${API_BASE_URL}/${id}`, {
                method: 'PUT',
                headers: this.getHeaders(),
                body: JSON.stringify({
                    full_name: payload.full_name,
                    email: payload.email,
                    contact_number: payload.contact_number,
                    whatsapp_number: payload.whatsapp_number,
                    role: Number(payload.role),
                    is_blocked: Boolean(payload.is_blocked),
                    blocked_reason: payload.blocked_reason || null
                })
            });

            const data = await response.json();
            if (response.ok && data.status) {
                return { success: true, user: data.data, message: data.message };
            }

            return {
                success: false,
                error: data.message || (data.errors ? Object.values(data.errors).flat().join(' ') : 'Update failed.')
            };
        } catch (err) {
            console.error('API Admin User Update Error:', err);
            return { success: false, error: 'Network error while updating user.' };
        }
    },

    /**
     * Toggle block/unblock status for a user.
     */
    async toggleBlockUser(id, reason = '') {
        try {
            const response = await fetch(`${API_BASE_URL}/${id}/toggle-block`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify({ reason: reason || 'Suspended by admin' })
            });

            const data = await response.json();
            if (response.ok && data.status) {
                return { success: true, data: data.data, message: data.message };
            }

            return { success: false, error: data.message || 'Failed to toggle block status.' };
        } catch (err) {
            console.error('API Admin User Toggle Block Error:', err);
            return { success: false, error: 'Network error while toggling block status.' };
        }
    },

    /**
     * Delete user from database.
     */
    async deleteUser(id) {
        try {
            const response = await fetch(`${API_BASE_URL}/${id}`, {
                method: 'DELETE',
                headers: this.getHeaders()
            });

            const data = await response.json();
            if (response.ok && data.status) {
                return { success: true, message: data.message };
            }

            return { success: false, error: data.message || 'Failed to delete user.' };
        } catch (err) {
            console.error('API Admin User Delete Error:', err);
            return { success: false, error: 'Network error while deleting user.' };
        }
    }
};
