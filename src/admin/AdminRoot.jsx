import React, { useState, useEffect } from 'react';
import './admin.css';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AdminOrders from './pages/AdminOrders';
import AdminCategories from './pages/AdminCategories';
import AdminProducts from './pages/AdminProducts';
import AdminUsers from './pages/AdminUsers';
import AdminQueries from './pages/AdminQueries';
import AdminBanners from './pages/AdminBanners';
import AdminMarquee from './pages/AdminMarquee';
import AdminBrandingSettings from './pages/AdminBrandingSettings';
import AdminWhatsApp from './pages/AdminWhatsApp';
import AdminProfile from './pages/AdminProfile';
import AdminLayout from './components/AdminLayout';
import { adminAuthService } from './services/adminAuthService';
import { adminOrderService } from './services/adminOrderService';
import { adminCategoryService } from './services/adminCategoryService';
import { adminProductService } from './services/adminProductService';

export default function AdminRoot({ onGoToStore, initialTab = 'dashboard' }) {
    const [user, setUser] = useState(() => {
        const session = adminAuthService.getCurrentSession();
        return session?.user || null;
    });
    const [isAuthenticated, setIsAuthenticated] = useState(() => {
        const session = adminAuthService.getCurrentSession();
        return Boolean(session && session.user);
    });
    const [activeTab, setActiveTab] = useState(() => {
        const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
        let sub = pathname.replace(/^\/admin\/?/, '').split('/')[0].trim().toLowerCase();
        if (!sub && pathname.startsWith('/')) {
            sub = pathname.substring(1).split('/')[0].trim().toLowerCase();
        }
        if (sub === 'branding') sub = 'settings';
        if (sub === 'inquiries' || sub === 'contact') sub = 'queries';
        if (sub === 'banner' || sub === 'hero-banners') sub = 'banners';
        if (sub === 'my-profile' || sub === 'account') sub = 'profile';
        const valid = ['dashboard', 'categories', 'products', 'orders', 'users', 'queries', 'banners', 'marquee', 'settings', 'whatsapp', 'profile'];
        if (valid.includes(sub)) return sub;
        return initialTab || 'dashboard';
    });
    const [key, setKey] = useState(0); // Force re-render on data reset

    useEffect(() => {
        const session = adminAuthService.getCurrentSession();
        if (session && session.user) {
            setUser(session.user);
            setIsAuthenticated(true);
        } else {
            setUser(null);
            setIsAuthenticated(false);
        }
    }, []);

    // Sync with external route changes
    useEffect(() => {
        if (initialTab && initialTab !== activeTab) {
            const normalized = initialTab === 'branding' ? 'settings' : (initialTab === 'banner' ? 'banners' : initialTab);
            setActiveTab(normalized);
        }
    }, [initialTab]);

    // Handle browser back/forward buttons inside admin
    useEffect(() => {
        const handleAdminPopState = () => {
            const pathname = window.location.pathname;
            let sub = pathname.replace(/^\/admin\/?/, '').split('/')[0].trim().toLowerCase();
            if (!sub && pathname.startsWith('/')) {
                sub = pathname.substring(1).split('/')[0].trim().toLowerCase();
            }
            if (sub === 'branding') sub = 'settings';
            if (sub === 'inquiries' || sub === 'contact') sub = 'queries';
            if (sub === 'banner' || sub === 'hero-banners') sub = 'banners';
            const valid = ['dashboard', 'categories', 'products', 'orders', 'users', 'queries', 'banners', 'marquee', 'settings', 'whatsapp'];
            const targetTab = valid.includes(sub) ? sub : 'dashboard';
            setActiveTab(targetTab);
        };

        window.addEventListener('popstate', handleAdminPopState);
        return () => window.removeEventListener('popstate', handleAdminPopState);
    }, []);

    const handleTabChange = (newTab) => {
        setActiveTab(newTab);
        const targetUrl = newTab === 'dashboard' ? '/admin/dashboard' : `/admin/${newTab}`;
        if (window.location.pathname !== targetUrl) {
            window.history.pushState({ page: 'admin', param: newTab }, '', targetUrl);
        }
    };

    const handleLogin = async (email, password) => {
        const res = await adminAuthService.login(email, password);
        if (res.success) {
            setUser(res.user);
            setIsAuthenticated(true);
        }
        return res;
    };

    const handleLogout = async () => {
        await adminAuthService.logout();
        setUser(null);
        setIsAuthenticated(false);
    };

    if (!isAuthenticated) {
        return (
            <div className="admin-root">
                <AdminLogin onLoginSuccess={handleLogin} />
            </div>
        );
    }

    return (
        <div className="admin-root" key={key}>
            <AdminLayout
                activeTab={activeTab}
                setActiveTab={handleTabChange}
                user={user}
                onLogout={handleLogout}
                onGoToStore={onGoToStore}
            >
                {activeTab === 'dashboard' && (
                    <AdminDashboard
                        onNavigateToOrders={() => handleTabChange('orders')}
                        onNavigateToCategories={() => handleTabChange('categories')}
                        onNavigateToProducts={() => handleTabChange('products')}
                    />
                )}
                {activeTab === 'categories' && (
                    <AdminCategories />
                )}
                {activeTab === 'products' && (
                    <AdminProducts />
                )}
                {activeTab === 'orders' && (
                    <AdminOrders />
                )}
                {activeTab === 'users' && (
                    <AdminUsers />
                )}
                {activeTab === 'queries' && (
                    <AdminQueries />
                )}
                {activeTab === 'banners' && (
                    <AdminBanners />
                )}
                {activeTab === 'marquee' && (
                    <AdminMarquee />
                )}
                {activeTab === 'settings' && (
                    <AdminBrandingSettings />
                )}
                {activeTab === 'whatsapp' && (
                    <AdminWhatsApp />
                )}
                {activeTab === 'profile' && (
                    <AdminProfile 
                        onProfileUpdated={(updatedUser) => {
                            setUser(updatedUser);
                        }} 
                    />
                )}
            </AdminLayout>
        </div>
    );
}
