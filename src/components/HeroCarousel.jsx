import React, { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { getBannersApi } from '../services/api';
import { subscribeToCacheInvalidation } from '../utils/cacheManager';
import { Sparkles, ShoppingBag, ArrowRight, Image as ImageIcon, Sprout, ShieldCheck, Award, BadgeCheck } from 'lucide-react';

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

    // Touch Swipe Handlers for BookMyShow style mobile slider
    const [touchStartX, setTouchStartX] = useState(null);
    const [touchEndX, setTouchEndX] = useState(null);

    const handleTouchStart = (e) => {
        setTouchStartX(e.targetTouches[0].clientX);
    };

    const handleTouchMove = (e) => {
        setTouchEndX(e.targetTouches[0].clientX);
    };

    const handleTouchEnd = () => {
        if (!touchStartX || !touchEndX) return;
        const distance = touchStartX - touchEndX;
        const minSwipeDistance = 35;

        if (distance > minSwipeDistance) {
            // Swiped Left -> Next Banner
            setCurrentIndex((prev) => (prev + 1) % banners.length);
        } else if (distance < -minSwipeDistance) {
            // Swiped Right -> Previous Banner
            setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
        }

        setTouchStartX(null);
        setTouchEndX(null);
    };

    return (
        <section className="hero-main-wrapper">
            <div className="hero-bms-card-container">
                {/* BookMyShow Style Hero Banner Card */}
                {loading && banners.length === 0 ? (
                    <div 
                        className="hero-bms-card skeleton-shimmer"
                        style={{
                            background: '#e2e8f0',
                            minHeight: '200px',
                            width: '100%',
                            display: 'block',
                            borderRadius: '16px'
                        }}
                    />
                ) : banners.length === 0 ? (
                    /* EMPTY STATE IF NO BANNER ADDED YET */
                    <div className="hero-bms-card" style={{ padding: '32px 20px', borderRadius: '16px', background: 'linear-gradient(135deg, #073820 0%, #0d4a2b 50%, #062b18 100%)' }}>
                        <div style={{ maxWidth: '580px', color: '#ffffff', margin: '0 auto', textAlign: 'center' }}>
                            <div style={{
                                width: '48px',
                                height: '48px',
                                borderRadius: '50%',
                                background: 'rgba(255,255,255,0.12)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 12px auto',
                                color: '#10b981'
                            }}>
                                <Sparkles size={22} />
                            </div>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0 0 6px 0' }}>
                                No banner added yet
                            </h2>
                            <p style={{ fontSize: '0.82rem', opacity: 0.85, margin: '0 0 16px 0', lineHeight: '1.5' }}>
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
                ) : (
                    /* BOOKMYSHOW STYLE SLIDER CARD */
                    <div
                        className="hero-bms-card"
                        onClick={() => handleCtaClick(activeSlide?.button_link)}
                        onMouseEnter={() => setIsPaused(true)}
                        onMouseLeave={() => setIsPaused(false)}
                        onTouchStart={handleTouchStart}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={handleTouchEnd}
                        title={`Click to open ${activeSlide?.button_link || '/shop'}`}
                    >
                        <div className="hero-banner-inner" style={{ width: '100%', position: 'relative', display: 'block', lineHeight: 0 }}>
                            <img
                                src={activeSlide?.image_url || '/assets/images/300g_amutham/amutham-01.jpg'}
                                alt={activeSlide?.title || 'Storefront Banner'}
                                className="hero-bms-img"
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = '/assets/images/300g_amutham/amutham-01.jpg';
                                }}
                            />
                        </div>

                        {/* Carousel Controls & Sleek Indicator Dots */}
                        {banners.length > 1 && (
                            <>
                                {/* Left Arrow */}
                                <button
                                    type="button"
                                    className="hero-carousel-arrow hero-carousel-arrow-prev"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setCurrentIndex((currentIndex - 1 + banners.length) % banners.length);
                                    }}
                                    aria-label="Previous Slide"
                                >
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                        <polyline points="15 18 9 12 15 6"></polyline>
                                    </svg>
                                </button>

                                {/* Right Arrow */}
                                <button
                                    type="button"
                                    className="hero-carousel-arrow hero-carousel-arrow-next"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setCurrentIndex((currentIndex + 1) % banners.length);
                                    }}
                                    aria-label="Next Slide"
                                >
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                        <polyline points="9 18 15 12 9 6"></polyline>
                                    </svg>
                                </button>

                                {/* Sleek Centered Floating Dots */}
                                <div 
                                    className="hero-carousel-dots"
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
                                                width: currentIndex === idx ? '20px' : '6px',
                                                height: '6px',
                                                borderRadius: '3px',
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
            </div>

            {/* 4 Authentic Mangalam Site Pillars / Trust Badges */}
            <div className="container hero-feature-badges-container" style={{ marginTop: '28px' }}>
                <div className="hero-feature-badges-grid">
                    {/* Pillar 1: 100% Sprout-Activated */}
                    <div className="hero-feature-badge-card card-sprout">
                        <div className="hero-feature-badge-icon icon-sprout">
                            <Sprout size={22} strokeWidth={2.2} />
                        </div>
                        <div className="hero-feature-badge-text">
                            <h4 className="hero-feature-badge-title">{t('trustBadge1Title') || '100% Sprout-Activated'}</h4>
                            <p className="hero-feature-badge-sub">{t('trustBadge1Sub') || 'Bio-activated grains for superior absorption'}</p>
                        </div>
                    </div>

                    {/* Pillar 2: 0% Chemicals & Preservatives */}
                    <div className="hero-feature-badge-card card-pure">
                        <div className="hero-feature-badge-icon icon-pure">
                            <ShieldCheck size={22} strokeWidth={2.2} />
                        </div>
                        <div className="hero-feature-badge-text">
                            <h4 className="hero-feature-badge-title">{t('trustBadge2Title') || '0% Chemicals & Preservatives'}</h4>
                            <p className="hero-feature-badge-sub">{t('trustBadge2Sub') || 'Pure kitchen recipes with zero artificial additives'}</p>
                        </div>
                    </div>

                    {/* Pillar 3: Traditional Stone-Ground */}
                    <div className="hero-feature-badge-card card-stone">
                        <div className="hero-feature-badge-icon icon-stone">
                            <Award size={22} strokeWidth={2.2} />
                        </div>
                        <div className="hero-feature-badge-text">
                            <h4 className="hero-feature-badge-title">{t('trustBadge3Title') || 'Traditional Stone-Ground'}</h4>
                            <p className="hero-feature-badge-sub">{t('trustBadge3Sub') || 'Slow-crafted & cold wood-pressed heritage methods'}</p>
                        </div>
                    </div>

                    {/* Pillar 4: FSSAI & UDYAM Certified */}
                    <div className="hero-feature-badge-card card-certified">
                        <div className="hero-feature-badge-icon icon-certified">
                            <BadgeCheck size={22} strokeWidth={2.2} />
                        </div>
                        <div className="hero-feature-badge-text">
                            <h4 className="hero-feature-badge-title">{t('trustBadge4Title') || 'FSSAI & UDYAM Certified'}</h4>
                            <p className="hero-feature-badge-sub">{t('trustBadge4Sub') || 'Sethiyathope Heritage Facility, Tamil Nadu'}</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
