import React, { useState, useEffect } from 'react';
import HeroBanner from './HeroBanner';
import { useLanguage } from '../context/LanguageContext';

export default function HeroCarousel({ setPage }) {
    const { t } = useLanguage();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);

    const categories = [
        {
            name: "Health Mix",
            icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                </svg>
            ),
            action: () => setPage('shop')
        },
        {
            name: "Family Packs",
            icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                    <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                    <line x1="12" y1="22.08" x2="12" y2="12"></line>
                </svg>
            ),
            action: () => setPage('shop')
        },
        {
            name: "Digestive Care",
            icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                </svg>
            ),
            action: () => setPage('science')
        },
        {
            name: "Monsoon Special",
            icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"></path>
                    <path d="M16 14v6M8 14v6M12 16v6"></path>
                </svg>
            ),
            action: () => setPage('shop')
        },
        {
            name: "All Products",
            icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="7" height="7"></rect>
                    <rect x="14" y="3" width="7" height="7"></rect>
                    <rect x="14" y="14" width="7" height="7"></rect>
                    <rect x="3" y="14" width="7" height="7"></rect>
                </svg>
            ),
            action: () => setPage('shop')
        }
    ];

    const slides = [
        {
            id: 1,
            pillBadge: t('heroSlide1Badge'),
            title: t('heroSlide1Title'),
            description: t('heroSlide1Desc'),
            primaryCtaText: t('heroSlide1Cta'),
            primaryCtaAction: () => setPage('shop'),
            image: "/assets/images/300g_amutham/amutham-01.jpg",
            backgroundColor: "linear-gradient(135deg, #e4efe4 0%, #d8e7d7 100%)"
        },
        {
            id: 2,
            pillBadge: t('heroSlide2Badge'),
            title: t('heroSlide2Title'),
            description: t('heroSlide2Desc'),
            primaryCtaText: t('heroSlide2Cta'),
            primaryCtaAction: () => setPage('shop'),
            image: "/assets/images/300g_mangalam/Black Ulundhu Mix-10cm 12cm outline-01.jpg",
            backgroundColor: "linear-gradient(135deg, #dce8db 0%, #d0e1cf 100%)"
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

    return (
        <section className="hero-main-wrapper">
            <div className="container">

                {/* Clean Top Category Chips Bar */}
                <div className="hero-category-row">
                    {categories.map((cat, idx) => (
                        <button key={idx} className="category-circle-item" onClick={cat.action}>
                            <div className="category-circle-icon">
                                {cat.icon}
                            </div>
                            <span className="category-circle-label">{cat.name}</span>
                        </button>
                    ))}
                </div>

                {/* Single Full-Width Banner Slider (No Side Cards, No Navigation Arrows) */}
                <div
                    className="hero-slider-fullwidth-container"
                    onMouseEnter={() => setIsPaused(true)}
                    onMouseLeave={() => setIsPaused(false)}
                >
                    <div className="hero-slides-viewport">
                        {slides.map((slide, index) => (
                            <div
                                key={slide.id}
                                className="hero-slide-pane"
                                style={{
                                    display: index === currentIndex ? 'block' : 'none',
                                    animation: 'heroSlideFade 0.8s cubic-bezier(0.25, 1, 0.5, 1)'
                                }}
                            >
                                <HeroBanner {...slide} />
                            </div>
                        ))}
                    </div>

                    {/* Minimal Dots Pagination (No Arrows) */}
                    <div className="hero-pagination-dots">
                        {slides.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentIndex(index)}
                                className={`hero-dot-pill ${index === currentIndex ? 'active' : ''}`}
                                aria-label={`Go to slide ${index + 1}`}
                            />
                        ))}
                    </div>
                </div>

            </div>

            <style>{`
                @keyframes heroSlideFade {
                    0% {
                        opacity: 0;
                        transform: scale(0.985) translateY(3px);
                    }
                    100% {
                        opacity: 1;
                        transform: scale(1) translateY(0);
                    }
                }
            `}</style>
        </section>
    );
}

