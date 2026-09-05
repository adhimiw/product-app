import React from 'react';
import ThemeSwitcher from './ThemeSwitcher';
import { Menu, ExternalLink, ShieldCheck, Sparkles } from 'lucide-react';

export default function AdminHeader({
    activeTab,
    onToggleMobileSidebar,
    onGoToStore,
    theme,
    onToggleTheme
}) {
    const titleMap = {
        dashboard: {
            title: 'Overview Dashboard',
            badge: 'Real-time'
        },
        categories: {
            title: 'Categories Directory',
            badge: 'Taxonomy'
        },
        products: {
            title: 'Products Inventory',
            badge: 'Catalog'
        },
        orders: {
            title: 'Orders Management',
            badge: 'Dispatches'
        },
        users: {
            title: 'User Management',
            badge: 'Directory'
        },
        settings: {
            title: 'Logo & Branding',
            badge: 'Settings'
        },
        whatsapp: {
            title: 'WhatsApp & Live CRM',
            badge: 'OpenWA'
        }
    };

    const currentMeta = titleMap[activeTab] || titleMap.dashboard;

    return (
        <header className="admin-topbar">
            <div className="admin-topbar-left">
                <button 
                    type="button"
                    className="admin-mobile-toggle"
                    onClick={onToggleMobileSidebar}
                    aria-label="Toggle navigation menu"
                >
                    <Menu size={18} />
                </button>

                <div className="admin-topbar-breadcrumb">
                    <span className="admin-topbar-brand-tag">Mangalam Admin</span>
                    <span className="admin-topbar-sep">/</span>
                    <span className="admin-topbar-current">{currentMeta.title}</span>
                    <span className="admin-topbar-pill">{currentMeta.badge}</span>
                </div>
            </div>

            <div className="admin-topbar-actions">
                {/* Live Store Button */}
                {onGoToStore && (
                    <button
                        type="button"
                        className="admin-btn admin-btn-view-store"
                        onClick={onGoToStore}
                        title="View Live Storefront"
                    >
                        <ExternalLink size={13} />
                        <span>Live Store</span>
                    </button>
                )}

                {/* Theme Switcher */}
                <ThemeSwitcher theme={theme} onToggleTheme={onToggleTheme} onToggle={onToggleTheme} />
            </div>
        </header>
    );
}
