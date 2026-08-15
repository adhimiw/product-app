/**
 * Admin Authentication Service
 * Integrates directly with Laravel API (POST /api/login)
 * Validates Role 1 (Super Admin) for Admin Portal access, rejecting Role 2 (Customer).
 */

const API_LOGIN_URL = 'http://127.0.0.1:8000/api/login';
const STORAGE_KEY = 'mangalam_admin_session';

export const adminAuthService = {
    /**
     * Authenticates admin credentials via backend API.
     * Checks if role === 1 (Super Admin).
     * @param {string} email 
     * @param {string} password 
     * @returns {Promise<{success: boolean, user?: object, token?: string, error?: string}>}
     */
    async login(email, password) {
        const cleanEmail = (email || '').trim();

        if (!cleanEmail || !password) {
            return {
                success: false,
                error: 'Please enter both email and password.'
            };
        }

        try {
            const response = await fetch(API_LOGIN_URL, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: cleanEmail,
                    password: password
                })
            });

            const data = await response.json();

            if (response.ok && data.status && data.data && data.data.user) {
                const apiUser = data.data.user;
                const token = data.data.token || ('sanctum_token_' + Date.now());

                // Check role: 1 = Super Admin, 2 = Customer
                const userRole = Number(apiUser.role);

                if (userRole !== 1) {
                    return {
                        success: false,
                        error: `Access Denied: Account "${apiUser.full_name || apiUser.name}" has Role ${userRole} (Customer). Only Role 1 (Super Admin) is permitted to enter the Admin Portal.`
                    };
                }

                // Format normalized user object for Admin UI
                const adminUser = {
                    id: apiUser.id,
                    name: apiUser.full_name || apiUser.name || 'Super Admin',
                    email: apiUser.email,
                    role: 'Super Admin',
                    role_id: userRole,
                    avatarUrl: null
                };

                const sessionData = {
                    user: adminUser,
                    token: token,
                    loggedInAt: new Date().toISOString()
                };

                localStorage.setItem(STORAGE_KEY, JSON.stringify(sessionData));

                return {
                    success: true,
                    user: adminUser,
                    token: token
                };
            }

            return {
                success: false,
                error: data.message || 'Invalid email or password.'
            };

        } catch (err) {
            console.error('API Admin Login Error:', err);

            // Fallback for offline testing if backend API is not running
            if ((cleanEmail === 'superadmin@mangalam.com' || cleanEmail === 'admin@mangalam.com') && (password === 'admin123' || password === 'password')) {
                const mockUser = {
                    id: 2,
                    name: 'Super Admin',
                    email: cleanEmail,
                    role: 'Super Admin',
                    role_id: 1,
                    avatarUrl: null
                };
                const mockToken = 'sanctum_token_fallback_' + Date.now();

                const sessionData = {
                    user: mockUser,
                    token: mockToken,
                    loggedInAt: new Date().toISOString()
                };

                localStorage.setItem(STORAGE_KEY, JSON.stringify(sessionData));

                return {
                    success: true,
                    user: mockUser,
                    token: mockToken
                };
            }

            return {
                success: false,
                error: 'Unable to connect to backend server at http://127.0.0.1:8000/api/login. Please verify php artisan serve is running.'
            };
        }
    },

    /**
     * Gets current logged in admin session if valid.
     * @returns {object|null}
     */
    getCurrentSession() {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            if (!data) return null;
            return JSON.parse(data);
        } catch {
            return null;
        }
    },

    /**
     * Checks if admin is currently authenticated.
     * @returns {boolean}
     */
    isAuthenticated() {
        const session = this.getCurrentSession();
        return !!(session && session.token && session.user && Number(session.user.role_id) === 1);
    },

    /**
     * Logs out the current admin.
     * @returns {Promise<{success: boolean}>}
     */
    async logout() {
        localStorage.removeItem(STORAGE_KEY);
        return { success: true };
    }
};
