import React, { useState, useEffect } from 'react';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';

export default function AdminLayout({
    children,
    activeTab,
    setActiveTab,
    user,
    onLogout,
    onGoToStore
}) {
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(() => {
        try {
            return localStorage.getItem('mangalam_admin_sidebar_collapsed') === 'true';
        } catch {
            return false;
        }
    });

    const [theme, setTheme] = useState(() => {
        try {
            return localStorage.getItem('mangalam_admin_theme') || 'light';
        } catch {
            return 'light';
        }
    });

    useEffect(() => {
        try {
            localStorage.setItem('mangalam_admin_theme', theme);
        } catch (e) {
            console.error('Failed to save theme in localStorage', e);
        }
    }, [theme]);

    const handleToggleTheme = () => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light');
    };

    const handleToggleCollapse = () => {
        setIsCollapsed(prev => {
            const next = !prev;
            try {
                localStorage.setItem('mangalam_admin_sidebar_collapsed', String(next));
            } catch (e) {
                console.error('Failed to save sidebar state in localStorage', e);
            }
            return next;
        });
    };

    return (
        <div className={`admin-app-shell admin-theme-${theme}`} data-theme={theme}>
            {/* Mobile Backdrop */}
            {isMobileSidebarOpen && (
                <div
                    className="admin-sidebar-backdrop"
                    onClick={() => setIsMobileSidebarOpen(false)}
                />
            )}

            <AdminSidebar
                activeTab={activeTab}
                setActiveTab={(tab) => {
                    setActiveTab(tab);
                    setIsMobileSidebarOpen(false);
                }}
                user={user}
                onLogout={onLogout}
                onGoToStore={onGoToStore}
                isOpen={isMobileSidebarOpen}
                isCollapsed={isCollapsed}
                onToggleCollapse={handleToggleCollapse}
            />

            <div className="admin-main-wrapper">
                <AdminHeader
                    activeTab={activeTab}
                    onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
                    onGoToStore={onGoToStore}
                    theme={theme}
                    onToggleTheme={handleToggleTheme}
                />
                <main className="admin-content">
                    {children}
                </main>
            </div>
        </div>
    );
}
