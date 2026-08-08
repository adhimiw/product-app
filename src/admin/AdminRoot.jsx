import React, { useState, useEffect } from 'react';
import './admin.css';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AdminOrders from './pages/AdminOrders';
import AdminLayout from './components/AdminLayout';
import { adminAuthService } from './services/adminAuthService';
import { adminOrderService } from './services/adminOrderService';

export default function AdminRoot({ onGoToStore }) {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [activeTab, setActiveTab] = useState('dashboard');
    const [key, setKey] = useState(0); // Force re-render on data reset

    useEffect(() => {
        const session = adminAuthService.getCurrentSession();
        if (session && session.user) {
            setUser(session.user);
            setIsAuthenticated(true);
        }
    }, []);

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
        if (window.confirm('Reset all mock orders data back to default initial state?')) {
            await adminOrderService.resetData();
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
                setActiveTab={setActiveTab}
                user={user}
                onLogout={handleLogout}
                onGoToStore={onGoToStore}
                onResetData={handleResetData}
            >
                {activeTab === 'dashboard' && (
                    <AdminDashboard
                        onNavigateToOrders={() => setActiveTab('orders')}
                    />
                )}
                {activeTab === 'orders' && (
                    <AdminOrders />
                )}
            </AdminLayout>
        </div>
    );
}
