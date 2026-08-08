import React from 'react';

export default function AdminSidebar({ activeTab, setActiveTab, user, onLogout, onGoToStore, isOpen }) {
    const navItems = [
        {
            id: 'dashboard',
            label: 'Dashboard',
            icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="7" height="7" rx="1"/>
                    <rect x="14" y="3" width="7" height="7" rx="1"/>
                    <rect x="14" y="14" width="7" height="7" rx="1"/>
                    <rect x="3" y="14" width="7" height="7" rx="1"/>
                </svg>
            )
        },
        {
            id: 'orders',
            label: 'Orders',
            icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M16 16v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v1"/>
                    <path d="M18 8h4a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1h-4"/>
                    <circle cx="5.5" cy="18.5" r="2.5"/>
                    <circle cx="18.5" cy="18.5" r="2.5"/>
                </svg>
            )
        }
    ];

    return (
        <aside className={`admin-sidebar ${isOpen ? 'mobile-open' : ''}`}>
            <div className="admin-sidebar-header">
                <div className="admin-sidebar-brand">
                    <div className="admin-brand-icon">M</div>
                    <div className="admin-brand-text">
                        <span className="admin-brand-name">Mangalam</span>
                        <span className="admin-brand-sub">Admin Control</span>
                    </div>
                </div>
            </div>

            <div className="admin-sidebar-nav">
                <div className="admin-nav-section-title">Navigation</div>
                {navItems.map(item => (
                    <button
                        key={item.id}
                        className={`admin-nav-item ${activeTab === item.id ? 'active' : ''}`}
                        onClick={() => setActiveTab(item.id)}
                    >
                        {item.icon}
                        <span>{item.label}</span>
                    </button>
                ))}

                <div className="admin-nav-section-title" style={{ marginTop: '16px' }}>Storefront</div>
                <button
                    className="admin-nav-item"
                    onClick={onGoToStore}
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                        <polyline points="15 3 21 3 21 9"/>
                        <line x1="10" y1="14" x2="21" y2="3"/>
                    </svg>
                    <span>View Website</span>
                </button>
            </div>

            <div className="admin-sidebar-footer">
                <div className="admin-user-info-card">
                    <div className="admin-user-details">
                        <div className="admin-avatar">
                            {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
                        </div>
                        <div style={{ overflow: 'hidden' }}>
                            <div className="admin-user-name">{user?.name || 'Administrator'}</div>
                            <div className="admin-user-role">{user?.role || 'Super Admin'}</div>
                        </div>
                    </div>
                    <button 
                        className="admin-logout-btn" 
                        onClick={onLogout}
                        title="Sign Out"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                            <polyline points="16 17 21 12 16 7"/>
                            <line x1="21" y1="12" x2="9" y2="12"/>
                        </svg>
                    </button>
                </div>
            </div>
        </aside>
    );
}
