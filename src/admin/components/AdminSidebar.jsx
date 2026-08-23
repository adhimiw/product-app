import React from 'react';

export default function AdminSidebar({
    activeTab,
    setActiveTab,
    user,
    onLogout,
    isOpen,
    isCollapsed,
    onToggleCollapse
}) {
    const navItems = [
        {
            id: 'dashboard',
            label: 'Dashboard',
            icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="7" height="7"/>
                    <rect x="14" y="3" width="7" height="7"/>
                    <rect x="14" y="14" width="7" height="7"/>
                    <rect x="3" y="14" width="7" height="7"/>
                </svg>
            )
        },
        {
            id: 'categories',
            label: 'Categories',
            icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                    <line x1="12" y1="11" x2="12" y2="17"></line>
                    <line x1="9" y1="14" x2="15" y2="14"></line>
                </svg>
            )
        },
        {
            id: 'products',
            label: 'Products',
            icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                    <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                    <line x1="12" y1="22.08" x2="12" y2="12"></line>
                </svg>
            )
        },
        {
            id: 'orders',
            label: 'Orders',
            icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 16v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v1"/>
                    <path d="M18 8h4a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1h-4"/>
                    <circle cx="5.5" cy="18.5" r="2.5"/>
                    <circle cx="18.5" cy="18.5" r="2.5"/>
                </svg>
            )
        }
    ];

    return (
        <aside className={`admin-sidebar ${isOpen ? 'mobile-open' : ''} ${isCollapsed ? 'collapsed' : ''}`}>
            {/* Header / Brand */}
            <div className="admin-sidebar-header">
                <div className="admin-sidebar-brand">
                    <img 
                        src="/mangalam_logo.png" 
                        alt="Mangalam Healthy Foods" 
                        className="admin-brand-full-logo" 
                    />
                </div>

                {!isCollapsed && onToggleCollapse && (
                    <button
                        type="button"
                        className="admin-sidebar-collapse-btn"
                        onClick={onToggleCollapse}
                        title="Collapse sidebar"
                        aria-label="Collapse sidebar"
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="15 18 9 12 15 6"></polyline>
                        </svg>
                    </button>
                )}
            </div>

            {/* Nav Items */}
            <div className="admin-sidebar-nav">
                <div className="admin-nav-section-title">
                    {isCollapsed ? '•••' : 'Main Menu'}
                </div>

                {navItems.map(item => {
                    const isActive = activeTab === item.id;
                    return (
                        <button
                            key={item.id}
                            type="button"
                            className={`admin-nav-item ${isActive ? 'active' : ''}`}
                            onClick={() => setActiveTab(item.id)}
                            title={isCollapsed ? item.label : undefined}
                        >
                            {item.icon}
                            {!isCollapsed && <span>{item.label}</span>}
                        </button>
                    );
                })}

                <div className="admin-nav-section-title" style={{ marginTop: '12px' }}>
                    {isCollapsed ? '•••' : 'Storefront'}
                </div>

                <a
                    href="/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="admin-nav-item"
                    title={isCollapsed ? "View Live Website" : undefined}
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                        <polyline points="15 3 21 3 21 9"/>
                        <line x1="10" y1="14" x2="21" y2="3"/>
                    </svg>
                    {!isCollapsed && <span>View Store</span>}
                </a>
            </div>

            {/* Footer / User Info */}
            <div className="admin-sidebar-footer">
                <div className="admin-user-info-card">
                    <div className="admin-user-details">
                        <div className="admin-avatar">
                            {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
                        </div>
                        {!isCollapsed && (
                            <div style={{ overflow: 'hidden' }}>
                                <div className="admin-user-name">{user?.name || 'Administrator'}</div>
                                <div className="admin-user-role">{user?.role || 'Super Admin'}</div>
                            </div>
                        )}
                    </div>
                    {!isCollapsed && (
                        <button 
                            type="button"
                            className="admin-logout-btn" 
                            onClick={onLogout}
                            title="Sign Out"
                            aria-label="Sign Out"
                        >
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                                <polyline points="16 17 21 12 16 7"/>
                                <line x1="21" y1="12" x2="9" y2="12"/>
                            </svg>
                        </button>
                    )}
                </div>

                {isCollapsed && onToggleCollapse && (
                    <button
                        type="button"
                        className="admin-sidebar-collapse-btn"
                        style={{ margin: '10px auto 0 auto', width: '100%' }}
                        onClick={onToggleCollapse}
                        title="Expand sidebar"
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="9 18 15 12 9 6"></polyline>
                        </svg>
                    </button>
                )}
            </div>
        </aside>
    );
}
