import React, { useEffect, useState, useRef } from 'react';
import { PRODUCTS } from '../pages/Shop';
import { useLanguage } from '../context/LanguageContext';

export default function Header({ page, setPage, cartCount, onCartOpen, onProductView, user, onAuthOpen }) {
    const { lang, toggleLanguage, t } = useLanguage();
    const [scrolled, setScrolled] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const searchContainerRef = useRef(null);

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

    // Close search dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
                setSearchQuery('');
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const searchResults = searchQuery.trim() === ''
        ? []
        : PRODUCTS.filter(p => 
            p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.description.toLowerCase().includes(searchQuery.toLowerCase())
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
                                            <img src={prod.image} alt={prod.name} className="search-result-thumb" />
                                            <div className="search-result-info">
                                                <span className="search-result-title">{prod.name}</span>
                                                <span className="search-result-sub">{prod.subtitle}</span>
                                            </div>
                                            <span className="search-result-price">{prod.inrPrice}</span>
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

                    {/* Right: Language Switcher, User Account & Cart Icons */}
                    <div className="header-right-actions">
                        {/* Minimal Compact Language Switcher Pill */}
                        <button 
                            className="header-lang-btn"
                            onClick={toggleLanguage}
                            title="Switch Language / மொழியை மாற்றுக"
                            aria-label="Switch Language"
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10"></circle>
                                <line x1="2" y1="12" x2="22" y2="12"></line>
                                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                            </svg>
                            <span className="lang-text">{lang === 'en' ? 'ENG' : 'தமிழ்'}</span>
                        </button>

                        <button 
                            className={`header-icon-btn ${user ? 'user-logged-in' : ''}`} 
                            onClick={onAuthOpen}
                            aria-label="User Account"
                            title={user ? `Signed in as ${user.name}` : 'Login / Register'}
                        >
                            {user ? (
                                <span className="header-user-avatar-initials">
                                    {user.name.slice(0, 2).toUpperCase()}
                                </span>
                            ) : (
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                    <circle cx="12" cy="7" r="4"></circle>
                                </svg>
                            )}
                        </button>

                        <button 
                            className="header-icon-btn" 
                            onClick={onCartOpen}
                            aria-label="Shopping Cart"
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

