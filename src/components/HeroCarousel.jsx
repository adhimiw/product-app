import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';

export default function HeroCarousel({ setPage }) {
    const { t } = useLanguage();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);

    const slides = [
        {
            id: 1,
            pillBadge: "LIMITED OFFER 25% OFF",
            title: "Organic Sprouted Food For Your Family's Health",
            description: "Save 25% on Freshly Prepared Sprouted Health Mix & Porridge",
            primaryCtaText: "Shop Now",
            primaryCtaAction: () => setPage('shop'),
            image: "/assets/images/300g_amutham/amutham-01.jpg",
            backgroundColor: "linear-gradient(135deg, #f25a2b 0%, #ea4f20 50%, #d73d10 100%)"
        },
        {
            id: 2,
            pillBadge: "HERITAGE SPECIAL 20% OFF",
            title: "Traditional Sprouted Grains For Everyday Energy",
            description: "100% Soak-Sprouted Ancient Grains Bio-Activated For Pure Wellness",
            primaryCtaText: "Shop Now",
            primaryCtaAction: () => setPage('shop'),
            image: "/assets/images/300g_mangalam/Black Ulundhu Mix-10cm 12cm outline-01.jpg",
            backgroundColor: "linear-gradient(135deg, #1b5e3b 0%, #154c30 50%, #0d3822 100%)"
        }
    ];

    // Infinite autoplay timer with pause-on-hover
    useEffect(() => {
        if (isPaused) return;
        const timer = setInterval(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [isPaused, slides.length]);

    const activeSlide = slides[currentIndex];

    return (
        <section className="hero-main-wrapper">
            <div className="container">

                {/* 2-Column Split Hero Layout: Main Banner Left + 2 Stacked Promos Right */}
                <div className="hero-grid-split">

                    {/* Left Main Hero Banner */}
                    <div
                        className="hero-main-carousel-col"
                        style={{ background: activeSlide.backgroundColor }}
                        onMouseEnter={() => setIsPaused(true)}
                        onMouseLeave={() => setIsPaused(false)}
                    >
                        <div className="hero-main-slide-inner">
                            <div className="hero-main-slide-content">
                                <span className="hero-offer-badge">{activeSlide.pillBadge}</span>
                                <h1 className="hero-main-title">{activeSlide.title}</h1>
                                <p className="hero-main-desc">{activeSlide.description}</p>
                                <button
                                    type="button"
                                    className="hero-main-shop-btn"
                                    onClick={activeSlide.primaryCtaAction}
                                >
                                    <span>{activeSlide.primaryCtaText}</span>
                                </button>
                            </div>

                            <div className="hero-main-slide-img-wrap">
                                <img
                                    src={activeSlide.image}
                                    alt={activeSlide.title}
                                    className="hero-main-slide-img"
                                />
                            </div>
                        </div>

                        {/* Carousel Arrow Controls at Bottom Center */}
                        <div className="hero-main-nav-arrows">
                            <button
                                type="button"
                                className="hero-nav-arrow-btn"
                                onClick={() => setCurrentIndex((currentIndex - 1 + slides.length) % slides.length)}
                                aria-label="Previous Slide"
                            >
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <polyline points="15 18 9 12 15 6"></polyline>
                                </svg>
                            </button>
                            <button
                                type="button"
                                className="hero-nav-arrow-btn"
                                onClick={() => setCurrentIndex((currentIndex + 1) % slides.length)}
                                aria-label="Next Slide"
                            >
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <polyline points="9 18 15 12 9 6"></polyline>
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Right 2 Stacked Promo Cards */}
                    <div className="hero-side-promos-col">
                        {/* Top Promo Card */}
                        <div className="hero-promo-card promo-card-green" onClick={() => setPage('shop')}>
                            <div className="hero-promo-info">
                                <span className="hero-promo-tag">Weekend Discount 20%</span>
                                <h3 className="hero-promo-title">Everyday Fresh &amp; Clean Products</h3>
                                <button type="button" className="hero-promo-btn btn-green">
                                    <span>Shop Now</span>
                                </button>
                            </div>
                            <div className="hero-promo-img-wrap">
                                <img
                                    src="/assets/images/300g_amutham/amutham-01.jpg"
                                    alt="Fresh & Clean Products"
                                    className="hero-promo-img"
                                />
                            </div>
                        </div>

                        {/* Bottom Promo Card */}
                        <div className="hero-promo-card promo-card-rose" onClick={() => setPage('shop')}>
                            <div className="hero-promo-info">
                                <span className="hero-promo-tag">Weekend Discount 20%</span>
                                <h3 className="hero-promo-title">Traditional Health Mix Collection</h3>
                                <button type="button" className="hero-promo-btn btn-coral">
                                    <span>Shop Now</span>
                                </button>
                            </div>
                            <div className="hero-promo-img-wrap">
                                <img
                                    src="/assets/images/300g_mangalam/Black Ulundhu Mix-10cm 12cm outline-01.jpg"
                                    alt="Traditional Mix"
                                    className="hero-promo-img"
                                />
                            </div>
                        </div>
                    </div>

                </div>

                {/* 4 Feature / Trust Badges in Colorful Pastel Cards (Matching Reference) */}
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
