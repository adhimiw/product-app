import React, { useEffect, useState, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useBranding } from '../context/BrandingContext';
import { fetchMarqueeApi, subscribeToCacheInvalidation } from '../services/api';

export default function Header({ page, setPage, products = [], cartCount, onCartOpen, onProductView, user, onAuthOpen, onLogout, favoriteCount = 0, onFavoritesOpen }) {
    const { lang, toggleLanguage, t } = useLanguage();
    const { branding } = useBranding();
    const [scrolled, setScrolled] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [userDropdownOpen, setUserDropdownOpen] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Lock body scroll when mobile sidebar drawer is open
    useEffect(() => {
        if (mobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [mobileMenuOpen]);

    // Dynamic Marquee state
    const [marqueeData, setMarqueeData] = useState({
        is_enabled: true,
        items: []
    });

    const searchContainerRef = useRef(null);
    const userMenuRef = useRef(null);

    const loadMarquee = (forceRefresh = false) => {
        fetchMarqueeApi(forceRefresh).then(res => {
            if (res && res.success) {
                setMarqueeData({
                    is_enabled: res.is_enabled !== false,
                    items: res.items || []
                });
            }
        });
    };

    // Fetch marquee announcements on mount
    useEffect(() => {
        loadMarquee();
    }, []);

    // Subscribe to marquee updates from Admin or other tabs
    useEffect(() => {
        const unsubscribe = subscribeToCacheInvalidation('marquee', () => {
            loadMarquee(true);
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 20) {
                setScrolled(true);
            } else {
                setScrolled(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close search dropdown & user menu on click outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
                setSearchQuery('');
            }
            if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
                setUserDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const searchResults = searchQuery.trim() === ''
        ? []
        : (products || []).filter(p => 
            (p.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (p.subtitle || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (p.category || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (p.description || '').toLowerCase().includes(searchQuery.toLowerCase())
          );

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (searchResults.length > 0) {
            onProductView(searchResults[0].id);
            setSearchQuery('');
        } else if (searchQuery.trim()) {
            setPage('shop');
        }
    };

    const handleProductSelect = (productId) => {
        if (onProductView) {
            onProductView(productId);
        } else {
            setPage('shop');
        }
        setSearchQuery('');
    };

    const handleMarqueeItemClick = (linkUrl) => {
        if (!linkUrl) return;
        const clean = linkUrl.trim().toLowerCase();
        if (clean === '/shop' || clean === 'shop') setPage('shop');
        else if (clean === '/about' || clean === 'about') setPage('about');
        else if (clean === '/science' || clean === 'science') setPage('science');
        else if (clean.startsWith('http://') || clean.startsWith('https://')) {
            window.open(linkUrl, '_blank', 'noopener,noreferrer');
        } else if (clean.startsWith('/')) {
            const pageName = clean.replace('/', '');
            if (pageName) setPage(pageName);
        }
    };

    const fallbackMarqueeItems = [
        { id: 'f1', text: t('marqueeText1'), icon: '🚚' },
        { id: 'f2', text: t('marqueeText2'), icon: '🎉' },
        { id: 'f3', text: t('marqueeText3'), icon: '🌱' },
        { id: 'f4', text: t('marqueeText4'), icon: '⭐' },
    ];

    const activeMarqueeItems = marqueeData.items.length > 0 ? marqueeData.items : fallbackMarqueeItems;

    return (
        <header className={`main-header ${scrolled ? 'scrolled' : ''}`}>
            {/* Infinite Marquee Running Announcement Bar */}
            {marqueeData.is_enabled && activeMarqueeItems.length > 0 && (
                <div className="announcement-marquee-bar">
                    <div className="marquee-track">
                        {activeMarqueeItems.map((item, idx) => (
                            <React.Fragment key={`mq1-${item.id || idx}`}>
                                <span 
                                    className="marquee-item-span"
                                    onClick={() => handleMarqueeItemClick(item.link_url)}
                                    style={{ cursor: item.link_url ? 'pointer' : 'default' }}
                                >
                                    {item.icon && <span className="marquee-item-icon">{item.icon}</span>}
                                    <span>{item.text}</span>
                                    {item.badge_text && (
                                        <span className="marquee-item-badge">{item.badge_text}</span>
                                    )}
                                </span>
                                <span className="marquee-dot">•</span>
                            </React.Fragment>
                        ))}
                    </div>
                    <div className="marquee-track" aria-hidden="true">
                        {activeMarqueeItems.map((item, idx) => (
                            <React.Fragment key={`mq2-${item.id || idx}`}>
                                <span 
                                    className="marquee-item-span"
                                    onClick={() => handleMarqueeItemClick(item.link_url)}
                                    style={{ cursor: item.link_url ? 'pointer' : 'default' }}
                                >
                                    {item.icon && <span className="marquee-item-icon">{item.icon}</span>}
                                    <span>{item.text}</span>
                                    {item.badge_text && (
                                        <span className="marquee-item-badge">{item.badge_text}</span>
                                    )}
                                </span>
                                <span className="marquee-dot">•</span>
                            </React.Fragment>
                        ))}
                    </div>
                </div>
            )}

            {/* Top Row: Search | Centered Logo | Right Action Icons */}
            <div className="header-top-row">
                <div className="container header-top-container">
                    
                    {/* Left: Mobile Sidebar Hamburger Button & Desktop Search Bar */}
                    <div className="header-left-group">
                        <button 
                            className="mobile-sidebar-toggle-btn"
                            onClick={() => setMobileMenuOpen(true)}
                            aria-label="Open Navigation Menu"
                            title="Open Navigation Menu"
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="3" y1="6" x2="21" y2="6"></line>
                                <line x1="3" y1="12" x2="21" y2="12"></line>
                                <line x1="3" y1="18" x2="21" y2="18"></line>
                            </svg>
                        </button>

                        <div ref={searchContainerRef} className="header-search-wrapper" style={{ position: 'relative', width: '100%', maxWidth: '280px' }}>
                            <form onSubmit={handleSearchSubmit} className="header-search-container">
                                <input 
                                    type="text"
                                    placeholder={t('searchPlaceholder')}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="header-search-input"
                                />
                                <svg className="header-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="11" cy="11" r="8"></circle>
                                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                                </svg>
                            </form>

                            {/* Interactive Search Autocomplete Dropdown */}
                            {searchQuery.trim() !== '' && (
                                <div className="header-search-results-dropdown">
                                    {searchResults.length > 0 ? (
                                        searchResults.map(prod => (
                                            <div 
                                                key={prod.id}
                                                className="search-result-item"
                                                onClick={() => handleProductSelect(prod.id)}
                                            >
                                                <img 
                                                    src={prod.image || (Array.isArray(prod.images) && prod.images[0]) || '/mangalam_logo.png'} 
                                                    alt={prod.name || 'Product'} 
                                                    className="search-result-thumb" 
                                                />
                                                <div className="search-result-info">
                                                    <span className="search-result-title">{prod.name}</span>
                                                    <span className="search-result-sub">{prod.subtitle || prod.category}</span>
                                                </div>
                                                <span className="search-result-price">{prod.inrPrice || `₹${prod.price || prod.actual_price || 110}`}</span>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="search-no-results">
                                            No products found matching "{searchQuery}".
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Center: Main Logo Image */}
                    <button 
                        onClick={() => setPage('home')} 
                        className="header-logo-centered"
                        aria-label={`${branding?.site_title || 'Mangalam Healthy Foods'} Home`}
                    >
                        <img 
                            src={branding?.logo_full || '/mangalam_logo.png'} 
                            alt={`${branding?.site_title || 'Mangalam Healthy Foods'} Logo`} 
                            onError={(e) => { e.target.src = '/mangalam_logo.png'; }}
                        />
                    </button>

                    {/* Right: User Account & Cart Icons */}
                    <div className="header-right-actions">

                        {/* User Account / Profile Dropdown */}
                        <div 
                            ref={userMenuRef} 
                            className="header-user-wrapper" 
                            style={{ position: 'relative' }}
                            onMouseEnter={() => user && setUserDropdownOpen(true)}
                            onMouseLeave={() => user && setUserDropdownOpen(false)}
                        >
                            <button 
                                className={`header-icon-btn ${user ? 'user-logged-in' : ''}`} 
                                onClick={() => {
                                    if (user) {
                                        setUserDropdownOpen(!userDropdownOpen);
                                    } else {
                                        onAuthOpen();
                                    }
                                }}
                                aria-label="User Account"
                                title={user ? `Signed in as ${user.full_name || user.name || user.email}` : 'Login / Register'}
                            >
                                {user ? (
                                    <span className="header-user-avatar-initials">
                                        {(user.full_name || user.name || user.email || 'ME').slice(0, 2).toUpperCase()}
                                    </span>
                                ) : (
                                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                        <circle cx="12" cy="7" r="4"></circle>
                                    </svg>
                                )}
                            </button>

                            {/* Luxury User Hover Dropdown Menu */}
                            {user && userDropdownOpen && (
                                <div className="header-user-dropdown">
                                    <div className="header-user-dropdown-info">
                                        <span className="user-drop-name">{user.full_name || user.name || 'Valued Member'}</span>
                                        <span className="user-drop-email">{user.email}</span>
                                    </div>
                                    <div className="header-user-dropdown-divider"></div>
                                    <button 
                                        className="header-user-drop-btn"
                                        onClick={() => {
                                            setPage('profile');
                                            setUserDropdownOpen(false);
                                        }}
                                    >
                                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                            <circle cx="12" cy="7" r="4"></circle>
                                        </svg>
                                        <span>View Profile & Settings</span>
                                    </button>
                                    <button 
                                        className="header-user-drop-btn logout"
                                        onClick={() => {
                                            if (onLogout) onLogout();
                                            setUserDropdownOpen(false);
                                        }}
                                    >
                                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                                            <polyline points="16 17 21 12 16 7"></polyline>
                                            <line x1="21" y1="12" x2="9" y2="12"></line>
                                        </svg>
                                        <span>Logout</span>
                                    </button>
                                </div>
                            )}
                        </div>

                        <button 
                            className="header-icon-btn" 
                            onClick={onFavoritesOpen || (() => setPage && setPage('shop'))}
                            aria-label="Favourites"
                            title="Favourites"
                        >
                            <svg width="21" height="21" viewBox="0 0 24 24" fill={favoriteCount > 0 ? '#ef4444' : 'none'} stroke={favoriteCount > 0 ? '#ef4444' : 'currentColor'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                            </svg>
                            {favoriteCount > 0 && <span className="cart-badge" style={{ background: '#ef4444' }}>{favoriteCount}</span>}
                        </button>

                        <button 
                            className="header-icon-btn" 
                            onClick={onCartOpen}
                            aria-label="Shopping Cart"
                            title="Shopping Cart"
                        >
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="9" cy="21" r="1"></circle>
                                <circle cx="20" cy="21" r="1"></circle>
                                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                            </svg>
                            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
                        </button>
                    </div>

                </div>
            </div>

            {/* Bottom Row: Header Navigation Links Bar (Desktop) */}
            <nav className="header-bottom-nav">
                <div className="container bottom-nav-container">
                    {/* 1. OUR PRODUCTS */}
                    <button 
                        onClick={() => setPage('shop')} 
                        className={`nav-link-with-icon ${page === 'shop' ? 'active' : ''}`}
                        title="Shop All Mangalam Heritage Products"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                            <line x1="3" y1="6" x2="21" y2="6"></line>
                            <path d="M16 10a4 4 0 0 1-8 0"></path>
                        </svg>
                        <span>Our Products</span>
                    </button>

                    {/* 2. JOIN COLLECTIVE Ticket Badge */}
                    <button 
                        onClick={() => {
                            if (user) {
                                setPage('profile');
                            } else {
                                onAuthOpen();
                            }
                        }} 
                        className="nav-collective-group"
                        title="Join Mangalam Heritage Collective"
                    >
                        <span className="nav-join-text">Join</span>
                        <span className="collective-ticket-badge">
                            <span className="collective-badge-icon">%</span>
                            Collective
                        </span>
                    </button>

                    {/* 3. OUR STORY */}
                    <button 
                        onClick={() => setPage('about')} 
                        className={`nav-link-with-icon ${page === 'about' ? 'active' : ''}`}
                        title="Discover Mangalam's 20-Year Heritage & Story"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                        </svg>
                        <span>Our Story</span>
                    </button>
                </div>
            </nav>

            {/* Slide-out Mobile Sidebar Navigation Drawer */}
            <div className={`mobile-nav-drawer ${mobileMenuOpen ? 'active' : ''}`} aria-hidden={!mobileMenuOpen}>
                <div className="mobile-nav-overlay" onClick={() => setMobileMenuOpen(false)}></div>
                
                <div className="mobile-nav-content">
                    {/* Mobile Drawer Header */}
                    <div className="mobile-nav-header">
                        <div className="mobile-nav-brand" onClick={() => { setPage('home'); setMobileMenuOpen(false); }}>
                            <img 
                                src={branding?.logo_full || '/mangalam_logo.png'} 
                                alt="Mangalam Logo" 
                                className="mobile-nav-logo"
                                onError={(e) => { e.target.src = '/mangalam_logo.png'; }}
                            />
                        </div>
                        <button 
                            className="mobile-nav-close-btn" 
                            onClick={() => setMobileMenuOpen(false)}
                            aria-label="Close Navigation Menu"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>
                    </div>

                    {/* Search input inside Mobile Sidebar */}
                    <div className="mobile-nav-search-container">
                        <form onSubmit={(e) => { handleSearchSubmit(e); setMobileMenuOpen(false); }}>
                            <div style={{ position: 'relative' }}>
                                <input 
                                    type="text" 
                                    placeholder={t('searchPlaceholder')}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="mobile-nav-search-input"
                                />
                                <svg className="mobile-nav-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="11" cy="11" r="8"></circle>
                                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                                </svg>
                            </div>
                        </form>
                        {searchQuery.trim() !== '' && (
                            <div className="mobile-nav-search-results">
                                {searchResults.length > 0 ? (
                                    searchResults.map(prod => (
                                        <div 
                                            key={prod.id}
                                            className="search-result-item"
                                            onClick={() => {
                                                handleProductSelect(prod.id);
                                                setMobileMenuOpen(false);
                                            }}
                                        >
                                            <img 
                                                src={prod.image || (Array.isArray(prod.images) && prod.images[0]) || '/mangalam_logo.png'} 
                                                alt={prod.name || 'Product'} 
                                                className="search-result-thumb" 
                                            />
                                            <div className="search-result-info">
                                                <span className="search-result-title">{prod.name}</span>
                                                <span className="search-result-sub">{prod.subtitle || prod.category}</span>
                                            </div>
                                            <span className="search-result-price">{prod.inrPrice || `₹${prod.price || prod.actual_price || 110}`}</span>
                                        </div>
                                    ))
                                ) : (
                                    <div className="search-no-results">
                                        No products found matching "{searchQuery}".
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Mobile Navigation List */}
                    <div className="mobile-nav-body">
                        <div className="mobile-nav-section-title">Main Navigation</div>

                        {/* 1. OUR PRODUCTS */}
                        <button 
                            className={`mobile-nav-item ${page === 'shop' ? 'active' : ''}`}
                            onClick={() => { setPage('shop'); setMobileMenuOpen(false); }}
                        >
                            <div className="mobile-nav-item-icon">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                                    <line x1="3" y1="6" x2="21" y2="6"></line>
                                    <path d="M16 10a4 4 0 0 1-8 0"></path>
                                </svg>
                            </div>
                            <span className="mobile-nav-item-label">Our Products</span>
                            <svg className="mobile-nav-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
                        </button>

                        {/* 2. JOIN % COLLECTIVE */}
                        <button 
                            className="mobile-nav-item mobile-nav-collective"
                            onClick={() => {
                                if (user) {
                                    setPage('profile');
                                } else {
                                    onAuthOpen();
                                }
                                setMobileMenuOpen(false);
                            }}
                        >
                            <div className="mobile-nav-item-icon collective-icon">
                                <span style={{ fontWeight: 800 }}>%</span>
                            </div>
                            <div className="mobile-nav-item-label flex-row-gap">
                                <span className="nav-join-text">Join</span>
                                <span className="collective-ticket-badge">
                                    <span className="collective-badge-icon">%</span>
                                    Collective
                                </span>
                            </div>
                            <svg className="mobile-nav-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
                        </button>

                        {/* 3. OUR STORY */}
                        <button 
                            className={`mobile-nav-item ${page === 'about' ? 'active' : ''}`}
                            onClick={() => { setPage('about'); setMobileMenuOpen(false); }}
                        >
                            <div className="mobile-nav-item-icon">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                                    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                                </svg>
                            </div>
                            <span className="mobile-nav-item-label">Our Story</span>
                            <svg className="mobile-nav-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
                        </button>

                        <div className="mobile-nav-divider"></div>

                        <div className="mobile-nav-section-title">Explore & Shop</div>

                        {/* Home */}
                        <button 
                            className={`mobile-nav-item ${page === 'home' ? 'active' : ''}`}
                            onClick={() => { setPage('home'); setMobileMenuOpen(false); }}
                        >
                            <div className="mobile-nav-item-icon">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                                    <polyline points="9 22 9 12 15 12 15 22"></polyline>
                                </svg>
                            </div>
                            <span className="mobile-nav-item-label">Home</span>
                        </button>

                        {/* Science & Heritage */}
                        <button 
                            className={`mobile-nav-item ${page === 'science' ? 'active' : ''}`}
                            onClick={() => { setPage('science'); setMobileMenuOpen(false); }}
                        >
                            <div className="mobile-nav-item-icon">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                                </svg>
                            </div>
                            <span className="mobile-nav-item-label">Why Sprouted? (Science)</span>
                        </button>

                        {/* Favourites */}
                        <button 
                            className="mobile-nav-item"
                            onClick={() => {
                                if (onFavoritesOpen) onFavoritesOpen();
                                else setPage('shop');
                                setMobileMenuOpen(false);
                            }}
                        >
                            <div className="mobile-nav-item-icon">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill={favoriteCount > 0 ? '#ef4444' : 'none'} stroke={favoriteCount > 0 ? '#ef4444' : 'currentColor'} strokeWidth="2">
                                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                                </svg>
                            </div>
                            <span className="mobile-nav-item-label">Wishlist & Favourites</span>
                            {favoriteCount > 0 && <span className="mobile-nav-badge red">{favoriteCount}</span>}
                        </button>

                        {/* Shopping Cart */}
                        <button 
                            className="mobile-nav-item"
                            onClick={() => {
                                if (onCartOpen) onCartOpen();
                                setMobileMenuOpen(false);
                            }}
                        >
                            <div className="mobile-nav-item-icon">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="9" cy="21" r="1"></circle>
                                    <circle cx="20" cy="21" r="1"></circle>
                                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                                </svg>
                            </div>
                            <span className="mobile-nav-item-label">Shopping Bag</span>
                            {cartCount > 0 && <span className="mobile-nav-badge green">{cartCount}</span>}
                        </button>
                    </div>

                    {/* Mobile Drawer Footer with Account & Language */}
                    <div className="mobile-nav-footer">
                        {user ? (
                            <div className="mobile-user-card">
                                <div className="mobile-user-info">
                                    <span className="mobile-user-avatar">
                                        {(user.full_name || user.name || user.email || 'ME').slice(0, 2).toUpperCase()}
                                    </span>
                                    <div className="mobile-user-details">
                                        <span className="mobile-user-name">{user.full_name || user.name || 'Valued Member'}</span>
                                        <span className="mobile-user-email">{user.email}</span>
                                    </div>
                                </div>
                                <div className="mobile-user-actions">
                                    <button 
                                        className="mobile-nav-acc-btn" 
                                        onClick={() => { setPage('profile'); setMobileMenuOpen(false); }}
                                    >
                                        Profile
                                    </button>
                                    <button 
                                        className="mobile-nav-acc-btn logout" 
                                        onClick={() => { if (onLogout) onLogout(); setMobileMenuOpen(false); }}
                                    >
                                        Logout
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <button 
                                className="mobile-nav-login-btn"
                                onClick={() => { onAuthOpen(); setMobileMenuOpen(false); }}
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                    <circle cx="12" cy="7" r="4"></circle>
                                </svg>
                                <span>Sign In / Register</span>
                            </button>
                        )}
                    </div>

                </div>
            </div>
        </header>
    );
}

