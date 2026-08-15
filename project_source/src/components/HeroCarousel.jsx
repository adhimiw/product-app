import React, { useState, useEffect } from 'react';
import HeroBanner from './HeroBanner';

export default function HeroCarousel({ setPage }) {
    const [currentIndex, setCurrentIndex] = useState(0);

    const slides = [
        {
            pillBadge: "🌱 100% Sprout-Activated",
            title: "Traditional Nutrition for",
            highlightText: "Modern Living",
            description: "Discover the power of sprouted ancient grains. Soak-sprout activation unlocks 3x more mineral bioavailability for premium family vitality.",
            primaryCtaText: "Shop Sprouted Mix",
            primaryCtaAction: () => setPage('shop'),
            secondaryCtaText: "Why Sprouted?",
            secondaryCtaAction: () => setPage('science'),
            image: "refence image/image.png",
            animatedImage: false
        },
        {
            pillBadge: "✨ Festival of Purity Offer",
            title: "Save 15% on Sprouted",
            highlightText: "Family Packs",
            description: "Nurture your family's health this festive season. Use coupon code AMUTHAM15 at check-out for an instant 15% discount on all 1kg Family Value packs.",
            primaryCtaText: "Shop Family Pack",
            primaryCtaAction: () => setPage('shop'),
            secondaryCtaText: "Our Story",
            secondaryCtaAction: () => setPage('about'),
            image: "refence image/image.png",
            imageStyle: { filter: 'hue-rotate(25deg) saturate(1.15)' },
            animatedImage: false
        },
        {
            pillBadge: "Monsoon Health Shield 🛡️",
            title: "Bio-Activated Grains to",
            highlightText: "Shield Your Family",
            description: "Sprouted pearl millet, ragi, and sorghum enriched with cardamom. Nature's trace minerals help defend cells and optimize protein synthesis.",
            primaryCtaText: "Why Sprouted?",
            primaryCtaAction: () => setPage('science'),
            secondaryCtaText: "Shop Porridges",
            secondaryCtaAction: () => setPage('shop'),
            image: "refence image/image.png",
            animatedImage: false
        },
        {
            pillBadge: "☕ Aromatic Digest Elixir",
            title: "Double Cardamom Infused",
            highlightText: "Digestive Comfort",
            description: "Enriched with a double concentration of handpicked green cardamom from Cuddalore to balance digestive tracts, relieve acidity, and optimize absorption.",
            primaryCtaText: "Shop Premium Batch",
            primaryCtaAction: () => setPage('shop'),
            secondaryCtaText: "Why Sprouted?",
            secondaryCtaAction: () => setPage('science'),
            image: "refence image/image.png",
            imageStyle: { filter: 'hue-rotate(185deg) brightness(0.9)' },
            animatedImage: false
        }
    ];

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
        }, 6000);
        return () => clearInterval(timer);
    }, [slides.length]);

    const handlePrev = () => {
        setCurrentIndex((prevIndex) => (prevIndex - 1 + slides.length) % slides.length);
    };

    const handleNext = () => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
    };

    return (
        <div className="hero-carousel-wrapper" style={{ position: 'relative', width: '100%', overflow: 'hidden' }}>
            
            {/* Slides container */}
            <div className="hero-slides-container">
                {slides.map((slide, index) => (
                    <div 
                        key={index} 
                        style={{ 
                            display: index === currentIndex ? 'block' : 'none',
                            animation: 'fadeIn 0.8s ease-in-out'
                        }}
                    >
                        <HeroBanner 
                            {...slide} 
                        />
                    </div>
                ))}
            </div>

            {/* Left / Right Arrow navigation */}
            <button 
                onClick={handlePrev} 
                className="carousel-control prev"
                style={{ 
                    position: 'absolute', 
                    top: '55%', 
                    left: '20px', 
                    transform: 'translateY(-50%)', 
                    zIndex: 10, 
                    background: 'rgba(255, 255, 255, 0.4)', 
                    border: '1px solid rgba(7, 56, 32, 0.08)',
                    borderRadius: '50%', 
                    width: '44px', 
                    height: '44px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    color: 'var(--color-primary)', 
                    cursor: 'pointer',
                    transition: 'var(--transition-fast)'
                }}
                aria-label="Previous Slide"
            >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
            </button>

            <button 
                onClick={handleNext} 
                className="carousel-control next"
                style={{ 
                    position: 'absolute', 
                    top: '55%', 
                    right: '20px', 
                    transform: 'translateY(-50%)', 
                    zIndex: 10, 
                    background: 'rgba(255, 255, 255, 0.4)', 
                    border: '1px solid rgba(7, 56, 32, 0.08)',
                    borderRadius: '50%', 
                    width: '44px', 
                    height: '44px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    color: 'var(--color-primary)', 
                    cursor: 'pointer',
                    transition: 'var(--transition-fast)'
                }}
                aria-label="Next Slide"
            >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
            </button>

            {/* Stretch Pill Dots indicators */}
            <div 
                className="carousel-dots" 
                style={{ 
                    position: 'absolute', 
                    bottom: '24px', 
                    left: '50%', 
                    transform: 'translateX(-50%)', 
                    zIndex: 10, 
                    display: 'flex', 
                    gap: '8px', 
                    alignItems: 'center' 
                }}
            >
                {slides.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrentIndex(index)}
                        style={{
                            height: '8px',
                            width: index === currentIndex ? '24px' : '8px',
                            borderRadius: '4px',
                            backgroundColor: index === currentIndex ? 'var(--color-primary)' : 'rgba(7, 56, 32, 0.2)',
                            border: 'none',
                            cursor: 'pointer',
                            transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                            padding: 0
                        }}
                        aria-label={`Go to slide ${index + 1}`}
                    />
                ))}
            </div>
            
            {/* Fade Animation Style */}
            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: scale(1.01); }
                    to { opacity: 1; transform: scale(1); }
                }
                .carousel-control:hover {
                    background: var(--color-primary) !important;
                    color: var(--color-white) !important;
                    transform: translateY(-50%) scale(1.05) !important;
                }
            `}</style>
        </div>
    );
}
