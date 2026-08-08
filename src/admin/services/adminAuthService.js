/**
 * Admin Authentication Service
 * Designed to be easily replaced with Laravel Sanctum API endpoints:
 * e.g., POST /api/admin/login, GET /api/admin/me, POST /api/admin/logout
 */

const STORAGE_KEY = 'mangalam_admin_session';

export const adminAuthService = {
    /**
     * Authenticates admin credentials.
     * @param {string} email 
     * @param {string} password 
     * @returns {Promise<{success: boolean, user?: object, token?: string, error?: string}>}
     */
    async login(email, password) {
        // Simulating async API call delay
        await new Promise(resolve => setTimeout(resolve, 350));

        const cleanEmail = (email || '').trim().toLowerCase();
        
        if (!cleanEmail || !password) {
            return {
                success: false,
                error: 'Please enter both email and password.'
            };
        }

        // Static validation check
        if ((cleanEmail === 'admin@mangalam.com' || cleanEmail === 'admin') && password === 'admin123') {
            const mockUser = {
                id: 1,
                name: 'Admin Manager',
                email: 'admin@mangalam.com',
                role: 'Super Admin',
                avatarUrl: null
            };
            const mockToken = 'sanctum_token_' + Math.random().toString(36).substring(2) + Date.now();

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
            error: 'Invalid credentials. Hint: admin@mangalam.com / admin123'
        };
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
        return !!(session && session.token);
    },

    /**
     * Logs out the current admin.
     * @returns {Promise<{success: boolean}>}
     */
    async logout() {
        await new Promise(resolve => setTimeout(resolve, 150));
        localStorage.removeItem(STORAGE_KEY);
        return { success: true };
    }
};
