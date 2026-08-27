import React, { useEffect, useState, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';

export default function Header({ page, setPage, products = [], cartCount, onCartOpen, onProductView, user, onAuthOpen, onLogout, favoriteCount = 0, onFavoritesOpen }) {
    const { lang, toggleLanguage, t } = useLanguage();
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

    // Close search dropdown & user dropdown on click outside
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
                        aria-label="Mangalam Healthy Foods Home"
                    >
                        <img src="/mangalam_logo.png" alt="Mangalam Healthy Foods Logo" />
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

            {/* Bottom Row: Main Navigation Links Bar */}
            <nav className="header-bottom-nav">
                <div className="container bottom-nav-container">
                    <button 
                        onClick={() => setPage('shop')} 
                        className={`target-nav-link ${page === 'shop' ? 'active' : ''}`}
                    >
                        {t('navProducts')}
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 9l6 6 6-6"/></svg>
                    </button>

                    <button 
                        onClick={() => setPage('science')} 
                        className={`target-nav-link ${page === 'science' ? 'active' : ''}`}
                    >
                        {t('navWhySprouted')}
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 9l6 6 6-6"/></svg>
                    </button>

                    <button 
                        onClick={() => setPage('about')} 
                        className={`target-nav-link ${page === 'about' ? 'active' : ''}`}
                    >
                        {t('navOurStory')}
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 9l6 6 6-6"/></svg>
                    </button>
                </div>
            </nav>
        </header>
    );
}

