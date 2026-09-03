import React from 'react';
import ThemeSwitcher from './ThemeSwitcher';

export default function AdminHeader({
    activeTab,
    onToggleMobileSidebar,
    theme,
    onToggleTheme
}) {
    const titleMap = {
        dashboard: {
            title: 'Overview Dashboard',
            subtitle: 'Real-time sales performance, revenue timeline, and recent orders'
        },
        categories: {
            title: 'Categories Management',
            subtitle: 'Organize store taxonomy, upload media, and manage active status'
        },
        products: {
            title: 'Products Management',
            subtitle: 'Manage catalog inventory, variants, pricing, discounts, and binary media'
        },
        orders: {
            title: 'Orders Management',
            subtitle: 'Track dispatch status, filter customer orders, and update statuses'
        },
        users: {
            title: 'User Management',
            subtitle: 'Manage registered customer accounts (Role 2) and vendor partners (Role 3)'
        },
        settings: {
            title: 'Logo & Branding',
            subtitle: 'Manage storefront logos, dark/light branding, and brand assets'
        },
        whatsapp: {
            title: 'WhatsApp & Live Chat CRM',
            subtitle: 'Real-time customer WhatsApp messaging, automated order alerts, and OpenWA gateway'
        }
    };

    const currentMeta = titleMap[activeTab] || titleMap.dashboard;

    return (
        <header className="admin-topbar">
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <button 
                    type="button"
                    className="admin-mobile-toggle"
                    onClick={onToggleMobileSidebar}
                    aria-label="Toggle navigation menu"
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="3" y1="12" x2="21" y2="12"/>
                        <line x1="3" y1="6" x2="21" y2="6"/>
                        <line x1="3" y1="18" x2="21" y2="18"/>
                    </svg>
                </button>
            </div>

            <div className="admin-topbar-actions">
                {/* Theme Switcher */}
                <ThemeSwitcher theme={theme} onToggleTheme={onToggleTheme} />
            </div>
        </header>
    );
}
