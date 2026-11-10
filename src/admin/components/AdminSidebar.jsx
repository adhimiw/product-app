import React from 'react';
import { useBranding } from '../../context/BrandingContext';
import { 
    LayoutDashboard, 
    FolderTree, 
    Package, 
    ShoppingCart, 
    Users, 
    Palette, 
    MessageSquare, 
    ChevronLeft, 
    LogOut,
    Megaphone,
    Inbox,
    Sliders,
    LayoutGrid,
    Sparkles,
    Cpu
} from 'lucide-react';

export default function AdminSidebar({
    activeTab,
    setActiveTab,
    user,
    onLogout,
    isOpen,
    isCollapsed,
    onToggleCollapse
}) {
    let branding = null;
    try {
        const ctx = useBranding();
        branding = ctx?.branding || null;
    } catch {
        branding = null;
    }

    const navSections = [
        {
            title: 'MASTER',
            icon: <LayoutGrid size={12} style={{ color: 'var(--admin-primary)', flexShrink: 0 }} />,
            items: [
                {
                    id: 'dashboard',
                    label: 'Dashboard',
                    icon: <LayoutDashboard size={15} />
                },
                {
                    id: 'categories',
                    label: 'Categories',
                    icon: <FolderTree size={15} />
                },
                {
                    id: 'products',
                    label: 'Products',
                    icon: <Package size={15} />
                },
                {
                    id: 'orders',
                    label: 'Orders',
                    icon: <ShoppingCart size={15} />
                }
            ]
        },
        {
            title: 'CRM & CUSTOMERS',
            icon: <Users size={12} style={{ color: '#0EA5E9', flexShrink: 0 }} />,
            items: [
                {
                    id: 'users',
                    label: 'Users',
                    icon: <Users size={15} />
                },
                {
                    id: 'queries',
                    label: 'Customer Queries',
                    icon: <Inbox size={15} />
                }
            ]
        },
        {
            title: 'CONTENT & MARKETING',
            icon: <Sparkles size={12} style={{ color: '#F59E0B', flexShrink: 0 }} />,
            items: [
                {
                    id: 'banners',
                    label: 'Hero Banners',
                    icon: <Sliders size={15} />
                },
                {
                    id: 'marquee',
                    label: 'Marquee Banner',
                    icon: <Megaphone size={15} />
                },
                {
                    id: 'settings',
                    label: 'Logo & Branding',
                    icon: <Palette size={15} />
                }
            ]
        },
        {
            title: 'SYSTEM & INTEGRATIONS',
            icon: <Cpu size={12} style={{ color: '#8B5CF6', flexShrink: 0 }} />,
            items: [
                {
                    id: 'whatsapp',
                    label: 'WhatsApp Gateway',
                    icon: <MessageSquare size={15} />,
                    badge: 'Live'
                }
            ]
        }
    ];

    const currentLogo = isCollapsed 
        ? (branding?.logo_small || branding?.logo_full || '/mangalam_logo.png')
        : (branding?.logo_full || '/mangalam_logo.png');

    return (
        <aside className={`admin-sidebar ${isOpen ? 'mobile-open' : ''} ${isCollapsed ? 'collapsed' : ''}`}>
            {/* Header / Brand */}
            <div className="admin-sidebar-header">
                <div 
                    className="admin-sidebar-brand" 
                    title={branding?.slogan || 'Mangalam Healthy Foods'}
                    onClick={() => setActiveTab('dashboard')}
                    style={{ cursor: 'pointer' }}
                >
                    <img
                        src={currentLogo}
                        alt="Mangalam Healthy Foods"
                        className="admin-sidebar-logo"
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = '/mangalam_logo.png';
                        }}
                    />
                </div>
                
                {/* Desktop Collapse Toggle */}
                <button
                    type="button"
                    className="admin-sidebar-collapse-btn"
                    onClick={onToggleCollapse}
                    aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                    title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                >
                    <ChevronLeft 
                        size={14} 
                        style={{ 
                            transform: isCollapsed ? 'rotate(180deg)' : 'none', 
                            transition: 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)' 
                        }} 
                    />
                </button>
            </div>

            {/* Navigation Menu */}
            <nav className="admin-sidebar-nav">
                {navSections.map((section, idx) => (
                    <div key={idx} className="admin-nav-section">
                        {!isCollapsed ? (
                            <div className="admin-nav-section-label">
                                {section.icon}
                                <span>{section.title}</span>
                            </div>
                        ) : (
                            <div className="admin-nav-section-label collapsed-dot" title={section.title}>
                                •
                            </div>
                        )}
                        <div className="admin-nav-group">
                            {section.items.map((item) => {
                                const isActive = activeTab === item.id || (item.id === 'settings' && activeTab === 'branding');
                                return (
                                    <button
                                        key={item.id}
                                        type="button"
                                        className={`admin-nav-item ${isActive ? 'active' : ''}`}
                                        onClick={() => setActiveTab(item.id)}
                                        title={item.label}
                                    >
                                        <span className="admin-nav-icon">{item.icon}</span>
                                        <span className="admin-nav-label">{item.label}</span>
                                        {item.badge && !isCollapsed && (
                                            <span className="admin-nav-badge">{item.badge}</span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </nav>

            {/* Footer / User Profile */}
            <div className="admin-sidebar-footer">
                <div 
                    className={`admin-sidebar-user ${activeTab === 'profile' ? 'active' : ''}`}
                    onClick={() => setActiveTab('profile')}
                    role="button"
                    tabIndex={0}
                    title="View & Edit Administrator Profile"
                    style={{ cursor: 'pointer' }}
                >
                    <div className="admin-sidebar-avatar" title={user?.name || user?.full_name || 'Super Admin'}>
                        {(user?.user_profile || user?.avatarUrl) ? (
                            <img 
                                src={user.user_profile || user.avatarUrl} 
                                alt={user?.name || user?.full_name || 'Super Admin'} 
                                className="admin-sidebar-avatar-img"
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                }}
                            />
                        ) : (
                            <span>{user?.name ? user.name.charAt(0).toUpperCase() : (user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'S')}</span>
                        )}
                    </div>
                    {!isCollapsed && (
                        <div className="admin-sidebar-user-info">
                            <span className="admin-sidebar-user-name" title={user?.name || user?.full_name || 'Super Admin'}>
                                {user?.name || user?.full_name || 'Super Admin'}
                            </span>
                            <span className="admin-sidebar-user-role">
                                {user?.role === 1 || user?.role === 'super_admin' ? 'Super Admin' : (user?.role || 'Administrator')}
                            </span>
                        </div>
                    )}
                    <button
                        type="button"
                        className="admin-sidebar-logout"
                        onClick={(e) => {
                            e.stopPropagation();
                            onLogout();
                        }}
                        title="Logout from Admin Portal"
                        aria-label="Logout"
                    >
                        <LogOut size={14} />
                    </button>
                </div>
            </div>
        </aside>
    );
}