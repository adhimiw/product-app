import React, { useState, useEffect } from 'react';
import './admin.css';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AdminOrders from './pages/AdminOrders';
import AdminCategories from './pages/AdminCategories';
import AdminProducts from './pages/AdminProducts';
import AdminUsers from './pages/AdminUsers';
import AdminBrandingSettings from './pages/AdminBrandingSettings';
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
        const sub = pathname.replace(/^\/admin\/?/, '').split('/')[0].trim();
        const valid = ['dashboard', 'categories', 'products', 'orders', 'users', 'settings'];
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
            setActiveTab(initialTab);
        }
    }, [initialTab]);

    // Handle browser back/forward buttons inside admin
    useEffect(() => {
        const handleAdminPopState = () => {
            const pathname = window.location.pathname;
            if (pathname.startsWith('/admin')) {
                const sub = pathname.replace(/^\/admin\/?/, '').split('/')[0].trim();
                const valid = ['dashboard', 'categories', 'products', 'orders', 'users', 'settings'];
                const targetTab = valid.includes(sub) ? sub : 'dashboard';
                setActiveTab(targetTab);
            }
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

    const handleResetData = async () => {
        if (window.confirm('Reset all mock orders, categories, and products data back to default initial state?')) {
            await adminOrderService.resetData();
            adminCategoryService.resetData();
            adminProductService.resetData();
            setKey(prev => prev + 1); // re-mount current view to fetch fresh reset data
        }
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
                onResetData={handleResetData}
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
                {activeTab === 'settings' && (
                    <AdminBrandingSettings />
                )}
            </AdminLayout>
        </div>
    );
}
