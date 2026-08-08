import React from 'react';

export default function AdminHeader({ activeTab, onToggleMobileSidebar, onGoToStore, onResetData }) {
    const titleMap = {
        dashboard: {
            title: 'Overview Dashboard',
            subtitle: 'Real-time order metrics and recent sales activity'
        },
        orders: {
            title: 'Orders Management',
            subtitle: 'Track, filter, and update customer order statuses'
        }
    };

    const currentMeta = titleMap[activeTab] || titleMap.dashboard;

    return (
        <header className="admin-topbar">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button 
                    className="admin-mobile-toggle"
                    onClick={onToggleMobileSidebar}
                    aria-label="Toggle navigation menu"
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="3" y1="12" x2="21" y2="12"/>
                        <line x1="3" y1="6" x2="21" y2="6"/>
                        <line x1="3" y1="18" x2="21" y2="18"/>
                    </svg>
                </button>
                <div className="admin-page-title-group">
                    <h1>{currentMeta.title}</h1>
                    <p>{currentMeta.subtitle}</p>
                </div>
            </div>

            <div className="admin-topbar-actions">
                {onResetData && (
                    <button 
                        className="admin-btn-secondary" 
                        onClick={onResetData}
                        title="Reset mock orders to initial state"
                        style={{ fontSize: '0.775rem', padding: '6px 10px' }}
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="1 4 1 10 7 10"/>
                            <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>
                        </svg>
                        <span>Reset Data</span>
                    </button>
                )}
                <button className="admin-btn-secondary" onClick={onGoToStore}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                        <polyline points="9 22 9 12 15 12 15 22"/>
                    </svg>
                    <span>Storefront</span>
                </button>
            </div>
        </header>
    );
}
