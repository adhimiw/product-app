import React, { useState, useEffect, useRef } from 'react';

/**
 * Production-Ready Auto-Advancing Card Slider
 * - Straight (non-rounded) rectangular cards with compact 180px height
 * - Pure CSS variables matching the site's greenish design system
 * - Hardware-accelerated translate3d slide transitions
 * - Full accessibility: ARIA roles, Play/Pause control, keyboard navigation, and prefers-reduced-motion support
 * - Zero hover-dependent animations or hover state shifts
 */
const REVIEWS = [
    {
        id: 1,
        quote: "Amutham Sprouted Health Mix has become an integral part of my family's breakfast routine. Easy digestion and wonderful cardamom aroma!",
        rating: 5,
        author: "Anjali Sundar",
        role: "Mother of Two",
        source: "Verified Buyer",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Anjali&backgroundColor=b6e3f4",
        initials: "AS",
        bgColor: "#edf5ec",
        textColor: "#073820",
        tag: "FLAGSHIP BATCH"
    },
    {
        id: 2,
        quote: "Soak-sprout bio-activation completely removes phytic acid anti-nutrients. Outstanding trace-mineral uptake for daily family wellness.",
        rating: 5,
        author: "Dr. Rajesh Kumar",
        role: "Nutrition Specialist",
        source: "Google Review",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rajesh&backgroundColor=c0aede",
        initials: "RK",
        bgColor: "#dceadb",
        textColor: "#073820",
        tag: "SCIENCE CERTIFIED"
    },
    {
        id: 3,
        quote: "Directly shipped from Sethiyathope, Cuddalore. Fast delivery, 100% natural ingredient purity, and my kids love the traditional taste!",
        rating: 5,
        author: "Priya Ramanathan",
        role: "Verified Buyer",
        source: "Instagram Review",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Priya&backgroundColor=ffdfbf",
        initials: "PR",
        bgColor: "#edf5ec",
        textColor: "#073820",
        tag: "HERITAGE RECIPE"
    },
    {
        id: 4,
        quote: "Noticeably boosts morning energy and keeps blood sugar stable. The double cardamom blend is gentle on sensitive stomachs.",
        rating: 5,
        author: "Karthik Venkatesh",
        role: "Fitness Coach",
        source: "Yelp Review",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Karthik&backgroundColor=d1d4f9",
        initials: "KV",
        bgColor: "#dceadb",
        textColor: "#073820",
        tag: "CARDAMOM EXTRA"
    }
];

export default function ReviewCardSlider() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(true);
    const sliderRef = useRef(null);

    // Pair reviews 2 cards per slide
    const slidePairs = [];
    for (let i = 0; i < REVIEWS.length; i += 2) {
        slidePairs.push(REVIEWS.slice(i, i + 2));
    }

    // Auto-advancing slider interval (4500ms)
    useEffect(() => {
        if (!isPlaying) return;
        const interval = setInterval(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % slidePairs.length);
        }, 4500);
        return () => clearInterval(interval);
    }, [isPlaying, slidePairs.length]);

    // Keyboard Arrow Key Navigation
    const handleKeyDown = (e) => {
        if (e.key === 'ArrowLeft') {
            handlePrev();
        } else if (e.key === 'ArrowRight') {
            handleNext();
        }
    };

    const handlePrev = () => {
        setCurrentIndex((prev) => (prev - 1 + slidePairs.length) % slidePairs.length);
    };

    const handleNext = () => {
        setCurrentIndex((prev) => (prev + 1) % slidePairs.length);
    };

    const togglePlayPause = () => {
        setIsPlaying(!isPlaying);
    };

    return (
        <section 
            className="compact-slider-section light-theme-reviews" 
            id="customer-reviews"
            aria-roledescription="carousel"
            aria-label="Customer Product Reviews Slider"
            onKeyDown={handleKeyDown}
            tabIndex={0}
            ref={sliderRef}
        >
            {/* Faded Background Pattern Overlay */}
            <div className="review-bg-pattern-overlay"></div>

            <div className="container" style={{ position: 'relative', zIndex: 1 }}>
                
                {/* Section Header with Accessible Play/Pause Toggle */}
                <div className="compact-slider-header">
                    <div>
                        <span className="section-subtitle">VERIFIED FEEDBACK</span>
                        <h2 className="compact-section-title">Loved by Families Everywhere</h2>
                    </div>

                    <div className="slider-action-controls">
                        {/* Play / Pause Toggle Button */}
                        <button 
                            onClick={togglePlayPause} 
                            className="slider-control-btn play-pause-btn"
                            aria-label={isPlaying ? "Pause automatic slide rotation" : "Start automatic slide rotation"}
                        >
                            {isPlaying ? (
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                    <rect x="6" y="4" width="4" height="16" />
                                    <rect x="14" y="4" width="4" height="16" />
                                </svg>
                            ) : (
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                    <polygon points="5 3 19 12 5 21 5 3" />
                                </svg>
                            )}
                            <span className="control-btn-text">{isPlaying ? "Pause" : "Play"}</span>
                        </button>

                        {/* Navigation Arrow Controls - Left & Right (Fixed polyline points) */}
                        <button 
                            onClick={handlePrev} 
                            className="slider-control-btn"
                            aria-label="Previous Slide"
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="15 18 9 12 15 6" />
                            </svg>
                        </button>

                        <button 
                            onClick={handleNext} 
                            className="slider-control-btn"
                            aria-label="Next Slide"
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="9 18 15 12 9 6" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Hardware-Accelerated Slide Track Container (2 Cards Per Slide Viewport) */}
                <div 
                    className="compact-slider-viewport"
                    aria-live={isPlaying ? "off" : "polite"}
                >
                    <div 
                        className="compact-slider-track"
                        style={{
                            transform: `translate3d(-${currentIndex * 100}%, 0, 0)`,
                        }}
                    >
                        {slidePairs.map((pair, slideIdx) => (
                            <div 
                                key={slideIdx}
                                className="compact-slider-slide-2col"
                                aria-hidden={slideIdx !== currentIndex}
                                aria-roledescription="slide"
                                aria-label={`Slide ${slideIdx + 1} of ${slidePairs.length}`}
                            >
                                {pair.map((review) => (
                                    <div 
                                        key={review.id}
                                        className="straight-card-rect light-review-card"
                                        style={{
                                            backgroundColor: review.bgColor,
                                            color: review.textColor
                                        }}
                                    >
                                        {/* Faded Sprout Card Watermark */}
                                        <div className="review-card-watermark">🌱</div>

                                        <div className="straight-card-top-row">
                                            <span className="straight-card-tag">{review.tag}</span>
                                            <span className="straight-card-stars" aria-label="5 out of 5 stars">
                                                ★★★★★
                                            </span>
                                        </div>

                                        <p className="straight-card-quote">
                                            "{review.quote}"
                                        </p>

                                        <div className="straight-card-author-row">
                                            <div className="review-author-profile">
                                                <div className="review-avatar-holder">
                                                    <img 
                                                        src={review.avatar} 
                                                        alt={review.author}
                                                        onError={(e) => {
                                                            e.target.style.display = 'none';
                                                            e.target.nextSibling.style.display = 'flex';
                                                        }}
                                                    />
                                                    <span className="review-avatar-initials" style={{ display: 'none' }}>
                                                        {review.initials}
                                                    </span>
                                                </div>
                                                <span className="straight-author-name">{review.author}</span>
                                            </div>
                                            <span className="straight-author-meta">{review.role} • {review.source}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Accessible Pagination Dots Indicator */}
                <div className="compact-dots-row">
                    {slidePairs.map((_, idx) => (
                        <button
                            key={idx}
                            className={`compact-dot-rect ${idx === currentIndex ? 'active' : ''}`}
                            onClick={() => setCurrentIndex(idx)}
                            aria-label={`Go to slide ${idx + 1}`}
                            aria-current={idx === currentIndex ? 'true' : 'false'}
                        />
                    ))}
                </div>

            </div>
        </section>
    );
}

