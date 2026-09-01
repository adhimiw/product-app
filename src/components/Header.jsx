import React, { useEffect, useState, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useBranding } from '../context/BrandingContext';

export default function Header({ page, setPage, products = [], cartCount, onCartOpen, onProductView, user, onAuthOpen, onLogout, favoriteCount = 0, onFavoritesOpen }) {
    const { lang, toggleLanguage, t } = useLanguage();
    const { branding } = useBranding();
    const [scrolled, setScrolled] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [userDropdownOpen, setUserDropdownOpen] = useState(false);

    const searchContainerRef = useRef(null);
    const userMenuRef = useRef(null);

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

    return (
        <header className={`main-header ${scrolled ? 'scrolled' : ''}`}>
            {/* Infinite Marquee Running Announcement Bar */}
            <div className="announcement-marquee-bar">
                <div className="marquee-track">
                    <span>{t('marqueeText1')}</span>
                    <span className="marquee-dot">•</span>
                    <span>{t('marqueeText2')}</span>
                    <span className="marquee-dot">•</span>
                    <span>{t('marqueeText3')}</span>
                    <span className="marquee-dot">•</span>
                    <span>{t('marqueeText4')}</span>
                    <span className="marquee-dot">•</span>
                </div>
                <div className="marquee-track" aria-hidden="true">
                    <span>{t('marqueeText1')}</span>
                    <span className="marquee-dot">•</span>
                    <span>{t('marqueeText2')}</span>
                    <span className="marquee-dot">•</span>
                    <span>{t('marqueeText3')}</span>
                    <span className="marquee-dot">•</span>
                    <span>{t('marqueeText4')}</span>
                    <span className="marquee-dot">•</span>
                </div>
            </div>

            {/* Top Row: Search | Centered Logo | Right Action Icons */}
            <div className="header-top-row">
                <div className="container header-top-container">
                    
                    {/* Left: Search Bar with Autocomplete Dropdown */}
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

            {/* Bottom Row: Header Navigation Links Bar */}
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

                    {/* 3. CORPORATE GIFTING with Gift Icon */}
                    <button 
                        onClick={() => setPage('about')} 
                        className="nav-link-with-icon nav-link-gifting"
                        title="Custom Corporate Hampers & Festive Gifting"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 12 20 22 4 22 4 12" />
                            <rect x="2" y="7" width="20" height="5" />
                            <line x1="12" y1="22" x2="12" y2="7" />
                            <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
                            <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
                        </svg>
                        <span>Corporate Gifting</span>
                    </button>
                </div>
            </nav>
        </header>
    );
}

