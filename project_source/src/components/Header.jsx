import React, { useEffect, useState } from 'react';

export default function Header({ page, setPage, cartCount, onCartOpen }) {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 50) {
                setScrolled(true);
            } else {
                setScrolled(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <header className={`main-header ${scrolled ? 'scrolled' : ''}`} style={{ display: 'flex', flexDirection: 'column' }}>
            {/* Promo Announcement Bar */}
            <div className="promo-bar" style={{ background: 'var(--color-primary)', color: 'var(--color-primary-light)', width: '100%', textAlign: 'center', padding: '8px 0', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', zIndex: 1001 }}>
                🎉 FREE SHIPPING ON ORDERS OVER ₹999 / $40 • SAVE 10% ON SUBSCRIPTIONS 🌱
            </div>

            <div className="container header-container" style={{ width: '100%', height: scrolled ? '64px' : '80px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', transition: 'var(--transition-smooth)' }}>
                <button 
                    onClick={() => setPage('home')} 
                    className="logo" 
                    style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                >
                    <svg width="36" height="36" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                        {/* Leaves */}
                        <path d="M42,70 C24,66 22,44 36,32 C27,42 29,62 42,70 Z" fill="#2c7844" />
                        <path d="M32,74 C10,65 14,38 28,24 C16,36 20,60 32,74 Z" fill="#1b5a2f" />
                        <path d="M58,70 C76,66 78,44 64,32 C73,42 71,62 58,70 Z" fill="#2c7844" />
                        <path d="M68,74 C90,65 86,38 72,24 C84,36 80,60 68,74 Z" fill="#1b5a2f" />
                        {/* Gold Sprout Grains */}
                        <path d="M50,18 C46,24 46,32 50,38 C54,32 54,24 50,18 Z" fill="#e8ab10" />
                        <path d="M48,32 C41,34 37,41 41,48 C46,47 48,41 48,32 Z" fill="#f4b905" />
                        <path d="M52,32 C59,34 63,41 59,48 C54,47 52,41 52,32 Z" fill="#f4b905" />
                        <path d="M48,46 C41,48 37,55 41,62 C46,61 48,55 48,46 Z" fill="#f4b905" />
                        <path d="M52,46 C59,48 63,55 59,62 C54,61 52,55 52,46 Z" fill="#f4b905" />
                        {/* Base stem */}
                        <path d="M49,70 L51,70 L51,78 L49,78 Z" fill="#1b5a2f" />
                    </svg>
                    <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
                        <span className="logo-text" style={{ fontSize: '1.35rem', fontWeight: 800, letterSpacing: '0.03em', color: 'var(--color-primary)', lineHeight: '1.1' }}>MANGALAM</span>
                        <span className="logo-subtext" style={{ fontSize: '0.58rem', fontWeight: 700, letterSpacing: '0.22em', color: 'var(--color-accent-gold)', marginTop: '2px' }}>HEALTHY FOODS</span>
                    </div>
                </button>
                
                <nav className="nav-menu">
                    <button 
                        onClick={() => setPage('shop')} 
                        className={`nav-link ${page === 'shop' ? 'active' : ''}`}
                    >
                        Our Products
                    </button>
                    <button 
                        onClick={() => setPage('science')} 
                        className={`nav-link ${page === 'science' ? 'active' : ''}`}
                    >
                        Why Sprouted?
                    </button>
                    <button 
                        onClick={() => setPage('about')} 
                        className={`nav-link ${page === 'about' ? 'active' : ''}`}
                    >
                        Our Story
                    </button>
                </nav>
                
                <div className="header-actions">
                    <button onClick={() => setPage('shop')} className="btn btn-secondary nav-cta">
                        Shop Now
                    </button>
                    <button 
                        className="cart-toggle" 
                        onClick={onCartOpen}
                        aria-label="View Shopping Cart"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="9" cy="21" r="1"></circle>
                            <circle cx="20" cy="21" r="1"></circle>
                            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                        </svg>
                        {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
                    </button>
                </div>
            </div>
        </header>
    );
}
