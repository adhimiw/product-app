import React, { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { getBannersApi } from '../services/api';
import { subscribeToCacheInvalidation } from '../utils/cacheManager';
import { Sparkles, ShoppingBag, ArrowRight, Image as ImageIcon } from 'lucide-react';

const STORAGE_KEY = 'mangalam_cached_banners_v1';

// Synchronous cache reader for instant 0ms initial render
function getInitialCachedBanners() {
    try {
        const cached = localStorage.getItem(STORAGE_KEY);
        if (cached) {
            const parsed = JSON.parse(cached);
            if (Array.isArray(parsed) && parsed.length > 0) {
                return parsed;
            }
        }
    } catch {}
    return [];
}

export default function HeroCarousel({ setPage }) {
    const { t } = useLanguage();
    
    // Initialize immediately from cached banners so reload has 0ms loading screen
    const [banners, setBanners] = useState(() => getInitialCachedBanners());
    const [loading, setLoading] = useState(() => getInitialCachedBanners().length === 0);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);

    // Fetch dynamic hero banners from backend API (silent background revalidation)
    const loadBanners = useCallback(async (isSilent = false) => {
        if (!isSilent && banners.length === 0) {
            setLoading(true);
        }

        const res = await getBannersApi();
        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
            setBanners(res.data);
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(res.data));
            } catch {}
        } else if (res.success && Array.isArray(res.data) && res.data.length === 0) {
            setBanners([]);
            try {
                localStorage.removeItem(STORAGE_KEY);
            } catch {}
        }
        setLoading(false);
    }, [banners.length]);

    useEffect(() => {
        // Fetch in background (silent if already cached)
        loadBanners(banners.length > 0);

        // Subscribe to live cache invalidation broadcast (from Admin updates or other tabs)
        const unsubscribe = subscribeToCacheInvalidation('banners', () => {
            loadBanners(false);
        });

        return () => {
            if (typeof unsubscribe === 'function') unsubscribe();
        };
    }, []);

    // Autoplay slider timer with pause-on-hover
    useEffect(() => {
        if (isPaused || banners.length <= 1) return;
        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % banners.length);
        }, 5500);
        return () => clearInterval(timer);
    }, [isPaused, banners.length]);

    // Handle CTA button click
    const handleCtaClick = (link) => {
        if (!link) {
            setPage('shop');
            return;
        }

        if (link.startsWith('http://') || link.startsWith('https://')) {
            window.open(link, '_blank', 'noopener,noreferrer');
            return;
        }

        const clean = link.replace(/^\//, '').trim().toLowerCase();
        if (clean === 'shop' || clean === 'products') setPage('shop');
        else if (clean === 'science' || clean === 'why-sprouted') setPage('science');
        else if (clean === 'about' || clean === 'our-story') setPage('about');
        else if (clean === 'profile') setPage('profile');
        else if (clean.startsWith('product/')) {
            const id = clean.replace('product/', '');
            setPage('product', id);
        } else {
            setPage('shop');
        }
    };

    const activeSlide = banners[currentIndex];

    return (
        <section className="hero-main-wrapper">
            {/* 100% Full-Width Edge-to-Edge Hero Banner */}
            {loading && banners.length === 0 ? (
                <div 
                    className="hero-edge-to-edge-banner skeleton-shimmer"
                    style={{
                        background: '#f1f5f9',
                        minHeight: '340px',
                        width: '100%',
                        display: 'block'
                    }}
                />
            ) : banners.length === 0 ? (
                /* EMPTY STATE IF NO BANNER ADDED YET */
                <div className="container" style={{ marginBottom: '28px' }}>
                    <div
                        style={{
                            background: 'linear-gradient(135deg, #073820 0%, #0d4a2b 50%, #062b18 100%)',
                            borderRadius: '16px',
                            minHeight: '260px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            textAlign: 'center',
                            padding: '40px 24px',
                            width: '100%'
                        }}
                    >
                        <div style={{ maxWidth: '580px', color: '#ffffff' }}>
                            <div style={{
                                width: '50px',
                                height: '50px',
                                borderRadius: '50%',
                                background: 'rgba(255,255,255,0.12)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 14px auto',
                                color: '#10b981'
                            }}>
                                <Sparkles size={24} />
                            </div>
                            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: '0 0 8px 0' }}>
                                No banner added yet
                            </h2>
                            <p style={{ fontSize: '0.86rem', opacity: 0.85, margin: '0 0 18px 0', lineHeight: '1.5' }}>
                                Explore our complete range of 100% soak-sprouted ancient grain health mixes and porridge.
                            </p>
                            <button
                                type="button"
                                className="hero-main-shop-btn"
                                onClick={() => setPage('shop')}
                                style={{ margin: '0 auto', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                            >
                                <span>Explore Products</span>
                                <ArrowRight size={14} />
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                /* DYNAMIC 100% FULL-WIDTH EDGE-TO-EDGE GRAPHIC BANNER (TWO BROTHERS STYLE) */
                <div
                    className="hero-edge-to-edge-banner"
                    style={{
                        cursor: 'pointer',
                        padding: 0,
                        margin: 0,
                        width: '100%',
                        position: 'relative',
                        overflow: 'hidden',
                        background: '#073820',
                        display: 'block'
                    }}
                    onClick={() => handleCtaClick(activeSlide?.button_link)}
                    onMouseEnter={() => setIsPaused(true)}
                    onMouseLeave={() => setIsPaused(false)}
                    title={`Click to open ${activeSlide?.button_link || '/shop'}`}
                >
                    <div style={{ width: '100%', position: 'relative', display: 'block', lineHeight: 0 }}>
                        <img
                            src={activeSlide?.image_url || '/assets/images/300g_amutham/amutham-01.jpg'}
                            alt={activeSlide?.title || 'Storefront Banner'}
                            style={{
                                width: '100%',
                                height: 'auto',
                                display: 'block',
                                objectFit: 'cover'
                            }}
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = '/assets/images/300g_amutham/amutham-01.jpg';
                            }}
                        />
                    </div>

                    {/* Carousel Arrow Controls & Indicator Dots when multiple banners exist */}
                    {banners.length > 1 && (
                        <>
                            {/* Left Arrow */}
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setCurrentIndex((currentIndex - 1 + banners.length) % banners.length);
                                }}
                                aria-label="Previous Slide"
                                style={{
                                    position: 'absolute',
                                    left: '20px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '50%',
                                    background: 'rgba(0, 0, 0, 0.35)',
                                    color: '#ffffff',
                                    border: '1px solid rgba(255, 255, 255, 0.25)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    zIndex: 10,
                                    backdropFilter: 'blur(4px)',
                                    transition: 'all 0.2s ease'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0, 0, 0, 0.65)'}
                                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(0, 0, 0, 0.35)'}
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <polyline points="15 18 9 12 15 6"></polyline>
                                </svg>
                            </button>

                            {/* Right Arrow */}
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setCurrentIndex((currentIndex + 1) % banners.length);
                                }}
                                aria-label="Next Slide"
                                style={{
                                    position: 'absolute',
                                    right: '20px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '50%',
                                    background: 'rgba(0, 0, 0, 0.35)',
                                    color: '#ffffff',
                                    border: '1px solid rgba(255, 255, 255, 0.25)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    zIndex: 10,
                                    backdropFilter: 'blur(4px)',
                                    transition: 'all 0.2s ease'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0, 0, 0, 0.65)'}
                                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(0, 0, 0, 0.35)'}
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <polyline points="9 18 15 12 9 6"></polyline>
                                </svg>
                            </button>

                            {/* Two Brothers Style Centered Slide Dots */}
                            <div 
                                style={{
                                    position: 'absolute',
                                    bottom: '14px',
                                    left: '50%',
                                    transform: 'translateX(-50%)',
                                    display: 'flex',
                                    gap: '8px',
                                    zIndex: 10,
                                    background: 'rgba(0, 0, 0, 0.35)',
                                    padding: '5px 12px',
                                    borderRadius: '20px',
                                    backdropFilter: 'blur(4px)'
                                }}
                                onClick={(e) => e.stopPropagation()}
                            >
                                {banners.map((_, idx) => (
                                    <button
                                        key={idx}
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setCurrentIndex(idx);
                                        }}
                                        style={{
                                            width: currentIndex === idx ? '22px' : '7px',
                                            height: '7px',
                                            borderRadius: '4px',
                                            background: currentIndex === idx ? '#ffffff' : 'rgba(255, 255, 255, 0.45)',
                                            border: 'none',
                                            cursor: 'pointer',
                                            transition: 'all 0.25s ease',
                                            padding: 0
                                        }}
                                        aria-label={`Go to slide ${idx + 1}`}
                                    />
                                ))}
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* 4 Feature / Trust Badges in Container Below Banner */}
            <div className="container" style={{ marginTop: '28px' }}>
                <div className="hero-feature-badges-grid">
                    {/* Card 1: Mega Discounts */}
                    <div className="hero-feature-badge-card card-mint">
                        <div className="hero-feature-badge-icon icon-mint">
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
                                <line x1="7" y1="7" x2="7.01" y2="7"></line>
                            </svg>
                        </div>
                        <div className="hero-feature-badge-text">
                            <h4 className="hero-feature-badge-title">Mega Discounts</h4>
                            <p className="hero-feature-badge-sub">When sign up</p>
                        </div>
                    </div>

                    {/* Card 2: Free Delivery */}
                    <div className="hero-feature-badge-card card-yellow">
                        <div className="hero-feature-badge-icon icon-yellow">
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="1" y="3" width="15" height="13"></rect>
                                <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
                                <circle cx="5.5" cy="18.5" r="2.5"></circle>
                                <circle cx="18.5" cy="18.5" r="2.5"></circle>
                            </svg>
                        </div>
                        <div className="hero-feature-badge-text">
                            <h4 className="hero-feature-badge-title">Free Delivery</h4>
                            <p className="hero-feature-badge-sub">24/7 amazing services</p>
                        </div>
                    </div>

                    {/* Card 3: Secured Payment */}
                    <div className="hero-feature-badge-card card-purple">
                        <div className="hero-feature-badge-icon icon-purple">
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="2" y="5" width="20" height="14" rx="2"></rect>
                                <line x1="2" y1="10" x2="22" y2="10"></line>
                                <circle cx="6" cy="15" r="1"></circle>
                                <circle cx="10" cy="15" r="1"></circle>
                            </svg>
                        </div>
                        <div className="hero-feature-badge-text">
                            <h4 className="hero-feature-badge-title">Secured Payment</h4>
                            <p className="hero-feature-badge-sub">We accept all credit cards</p>
                        </div>
                    </div>

                    {/* Card 4: Easy Returns */}
                    <div className="hero-feature-badge-card card-pink">
                        <div className="hero-feature-badge-icon icon-pink">
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#e11d48" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="1 4 1 10 7 10"></polyline>
                                <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
                            </svg>
                        </div>
                        <div className="hero-feature-badge-text">
                            <h4 className="hero-feature-badge-title">Easy Returns</h4>
                            <p className="hero-feature-badge-sub">30-days free return policy</p>
                        </div>
                    </div>
                </div>

            </div>
        </section>
    );
}
