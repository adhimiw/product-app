import React from 'react';
import ThemeSwitcher from './ThemeSwitcher';

export default function AdminHeader({
    activeTab,
    onToggleMobileSidebar,
    onResetData,
    theme,
    onToggleTheme
}) {
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
                <ThemeSwitcher theme={theme} onToggle={onToggleTheme} />

                {/* Reset Data Shortcut */}
                {onResetData && (
                    <button 
                        type="button"
                        className="admin-btn admin-btn-secondary" 
                        onClick={onResetData}
                        title="Reset mock data to initial baseline"
                        style={{ padding: '7px 12px', fontSize: '0.8rem' }}
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="1 4 1 10 7 10"/>
                            <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>
                        </svg>
                        <span>Reset Data</span>
                    </button>
                )}

                {/* View Website */}
                <a 
                    href="/" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="admin-btn admin-btn-secondary"
                    style={{ padding: '7px 12px', fontSize: '0.8rem' }}
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                        <polyline points="15 3 21 3 21 9"/>
                        <line x1="10" y1="14" x2="21" y2="3"/>
                    </svg>
                    <span>View Store</span>
                </a>
            </div>
        </header>
    );
}
