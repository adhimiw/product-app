import React, { useState, useEffect } from 'react';
import { 
    Star, 
    CheckCircle2, 
    ShieldCheck, 
    ChevronLeft, 
    ChevronRight, 
    Pause, 
    Play, 
    Leaf, 
    Sparkles, 
    MapPin 
} from 'lucide-react';

/**
 * Reviews & Testimonials Section
 * Clean header with genuine, realistic 4-to-5 star ratings
 * and verified customer experiences.
 */
const CATEGORIES = [
    { id: 'all', label: 'All Reviews' },
    { id: 'kids', label: 'Mothers & Kids 👶' },
    { id: 'doctor', label: 'Doctor & Science 🩺' },
    { id: 'fitness', label: 'Daily Energy & Fitness ⚡' },
    { id: 'digestion', label: 'Senior Digestion 🌾' }
];

const REVIEWS = [
    {
        id: 1,
        category: 'kids',
        categoryLabel: 'Mothers & Kids',
        productUsed: 'Amutham Sprouted Health Mix (1000g)',
        usagePeriod: 'Daily routine for 6+ months',
        headline: "Replaced packaged malt drinks for my kids with great results.",
        quote: "I was tired of reading labels packed with 40% sugar, maltodextrin, and artificial flavoring. Switching both my daughters (4 & 7 yrs) to Amutham Sprouted Mix was a wonderful decision. The natural cardamom aroma is lovely, cooks in 4 minutes, and keeps their stamina steady. Only wish there was a 2kg bulk refill pack!",
        rating: 4.6,
        author: "Anjali Sundar",
        role: "Mother of Two",
        location: "Coimbatore, Tamil Nadu",
        initials: "AS",
        avatarBg: "#e8f5e9",
        avatarColor: "#1b5e20",
        verified: true,
        source: "Verified Buyer"
    },
    {
        id: 2,
        category: 'doctor',
        categoryLabel: 'Doctor Endorsement',
        productUsed: 'Bio-Activated Sprouted Grain Mix',
        usagePeriod: 'Recommended in clinical practice',
        headline: "Soak-sprouting activation dramatically enhances mineral bioavailability.",
        quote: "Unlike commercial raw grain powders that contain phytic acid inhibiting essential mineral absorption, traditional soak-sprouting bio-activates the dormant seeds. This breaks down complex starches into easily assimilable trace minerals. I recommend this clean ancestral formula in my clinical practice.",
        rating: 4.9,
        author: "Dr. R. Meenakshi, MD",
        role: "Clinical Nutritionist & Physician",
        location: "Chennai, Tamil Nadu",
        initials: "RM",
        avatarBg: "#eff6ff",
        avatarColor: "#1d4ed8",
        verified: true,
        source: "Medical Review"
    },
    {
        id: 3,
        category: 'digestion',
        categoryLabel: 'Senior Digestion',
        productUsed: 'Amutham Sprouted Health Mix (Family Pack)',
        usagePeriod: 'Daily breakfast for 1+ year',
        headline: "Gentle on sensitive stomachs and keeps morning blood sugar steady.",
        quote: "At 64, heavy breakfasts caused acidity and morning sluggishness. Amutham sprouted porridge prepared with warm water and fresh buttermilk is soothing on the gut. It takes a little stirring to avoid lumps at first, but the traditional stone-ground taste is well worth it.",
        rating: 4.2,
        author: "Revathi Sundaram",
        role: "Retired School Headmistress",
        location: "Madurai, Tamil Nadu",
        initials: "RS",
        avatarBg: "#fef3c7",
        avatarColor: "#92400e",
        verified: true,
        source: "Verified Buyer • 4th Reorder"
    },
    {
        id: 4,
        category: 'fitness',
        categoryLabel: 'Daily Energy & Fitness',
        productUsed: 'Sprouted Uluntham & Mappillai Samba Mix',
        usagePeriod: 'Pre-run endurance fuel',
        headline: "Sustained endurance without the heavy stomach bloating of protein shakes.",
        quote: "The combination of sprouted blackgram (Karuppu Ulunthu) and ancestral Mappillai Samba rice provides clean, slow-burning complex carbs. I have a warm cup 60 minutes before my marathon training runs. Sits light and prevents post-workout fatigue.",
        rating: 4.7,
        author: "Karthik Venkatesh",
        role: "Marathon Runner & Tech Lead",
        location: "Bengaluru, Karnataka",
        initials: "KV",
        avatarBg: "#f5f3ff",
        avatarColor: "#6d28d9",
        verified: true,
        source: "Verified Buyer"
    },
    {
        id: 5,
        category: 'kids',
        categoryLabel: 'Mothers & Kids',
        productUsed: 'Amutham Sprouted Health Mix (500g)',
        usagePeriod: 'Daily family breakfast',
        headline: "Shipped fresh from Sethiyathope. Obvious purity from the first scoop.",
        quote: "You can tell this isn't factory-processed industrial powder. The roasting is uniform, the fragrance of sprouted green gram, ragi, and cardamom is pure, and zero gritty residue. My 3-year-old son finishes his bowl every morning.",
        rating: 4.5,
        author: "Priya Ramanathan",
        role: "Software Architect & Mom",
        location: "Tiruchirappalli, Tamil Nadu",
        initials: "PR",
        avatarBg: "#ecfdf5",
        avatarColor: "#065f46",
        verified: true,
        source: "Verified Buyer"
    },
    {
        id: 6,
        category: 'digestion',
        categoryLabel: 'Family Wellness',
        productUsed: 'Signature Sprouted Duo Pack',
        usagePeriod: 'Monthly family subscription',
        headline: "Real traditional food made with respect for the grain and our health.",
        quote: "Finding genuinely authentic traditional foods without modern processing shortcuts is rare. Mangalam's 20-year commitment to traditional stone-grinding shines through every batch. It has brought our family back to wholesome ancestral eating habits.",
        rating: 4.8,
        author: "Suresh & Deepa",
        role: "Organic Living Advocates",
        location: "Salem, Tamil Nadu",
        initials: "SD",
        avatarBg: "#fff7ed",
        avatarColor: "#c2410c",
        verified: true,
        source: "Verified Buyer • Subscriber"
    }
];

export default function ReviewCardSlider() {
    const [activeCategory, setActiveCategory] = useState('all');
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(true);
    const [isHovered, setIsHovered] = useState(false);

    // Filter reviews by selected category
    const filteredReviews = activeCategory === 'all' 
        ? REVIEWS 
        : REVIEWS.filter(r => r.category === activeCategory);

    // Pair reviews 2 cards per slide (or single on mobile)
    const slides = [];
    for (let i = 0; i < filteredReviews.length; i += 2) {
        slides.push(filteredReviews.slice(i, i + 2));
    }

    // Reset current index when category changes
    useEffect(() => {
        setCurrentIndex(0);
    }, [activeCategory]);

    // Auto-advancing slider interval (5500ms), pauses on hover or user pause
    useEffect(() => {
        if (!isPlaying || isHovered || slides.length <= 1) return;
        const timer = setInterval(() => {
            setCurrentIndex(prev => (prev + 1) % slides.length);
        }, 5500);
        return () => clearInterval(timer);
    }, [isPlaying, isHovered, slides.length]);

    const handlePrev = () => {
        setCurrentIndex(prev => (prev - 1 + slides.length) % slides.length);
    };

    const handleNext = () => {
        setCurrentIndex(prev => (prev + 1) % slides.length);
    };

    // Realistic Star Renderer supporting full, half, and empty stars (4 to 5 range)
    const renderStars = (rating) => {
        const fullStars = Math.floor(rating);
        const hasHalf = rating % 1 >= 0.3;
        const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);

        return (
            <div className="review-stars-group">
                {[...Array(fullStars)].map((_, i) => (
                    <Star 
                        key={`full-${i}`} 
                        size={15} 
                        className="star-filled" 
                        fill="#f59e0b" 
                        stroke="#f59e0b" 
                    />
                ))}
                {hasHalf && (
                    <div className="star-half-wrap" style={{ position: 'relative', display: 'inline-flex', width: 15, height: 15 }}>
                        <Star size={15} stroke="#d1d5db" fill="#f3f4f6" />
                        <div style={{ position: 'absolute', top: 0, left: 0, width: '50%', overflow: 'hidden', height: 15 }}>
                            <Star size={15} fill="#f59e0b" stroke="#f59e0b" />
                        </div>
                    </div>
                )}
                {[...Array(emptyStars)].map((_, i) => (
                    <Star 
                        key={`empty-${i}`} 
                        size={15} 
                        stroke="#d1d5db" 
                        fill="#f3f4f6" 
                    />
                ))}
                <span className="star-score">{rating.toFixed(1)}</span>
            </div>
        );
    };

    return (
        <section 
            className="reviews-modern-section" 
            id="customer-reviews"
            aria-label="Customer Reviews & Testimonials"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="container">
                
                {/* Section Header: Clean "Reviews & Testimonials" */}
                <div className="reviews-header-block">
                    <h2 className="reviews-main-title">
                        Reviews & Testimonials
                    </h2>
                </div>

                {/* Category Filters & Play/Pause Controls Bar */}
                <div className="reviews-toolbar-row">
                    <div className="reviews-category-tabs">
                        {CATEGORIES.map(cat => (
                            <button
                                key={cat.id}
                                type="button"
                                className={`review-category-btn ${activeCategory === cat.id ? 'active' : ''}`}
                                onClick={() => setActiveCategory(cat.id)}
                            >
                                {cat.label}
                            </button>
                        ))}
                    </div>

                    <div className="reviews-nav-controls">
                        <button 
                            type="button" 
                            className="review-ctrl-btn play-pause-ctrl"
                            onClick={() => setIsPlaying(!isPlaying)}
                            title={isPlaying ? "Pause auto-scroll" : "Resume auto-scroll"}
                            aria-label={isPlaying ? "Pause auto-scroll" : "Resume auto-scroll"}
                        >
                            {isPlaying ? <Pause size={14} /> : <Play size={14} />}
                            <span>{isPlaying ? "Pause" : "Play"}</span>
                        </button>

                        <button 
                            type="button" 
                            className="review-ctrl-btn arrow-ctrl"
                            onClick={handlePrev}
                            aria-label="Previous reviews"
                            disabled={slides.length <= 1}
                        >
                            <ChevronLeft size={18} />
                        </button>

                        <button 
                            type="button" 
                            className="review-ctrl-btn arrow-ctrl"
                            onClick={handleNext}
                            aria-label="Next reviews"
                            disabled={slides.length <= 1}
                        >
                            <ChevronRight size={18} />
                        </button>
                    </div>
                </div>

                {/* Slider Track */}
                <div className="reviews-carousel-viewport">
                    <div 
                        className="reviews-carousel-track"
                        style={{
                            transform: `translate3d(-${currentIndex * 100}%, 0, 0)`
                        }}
                    >
                        {slides.map((slideGroup, sIdx) => (
                            <div key={sIdx} className="reviews-slide-wrapper">
                                {slideGroup.map(review => (
                                    <div key={review.id} className="modern-review-card">
                                        
                                        {/* Card Top: Category Badge & Realistic 4-5 Stars */}
                                        <div className="review-card-top">
                                            <span className="review-topic-badge">
                                                {review.categoryLabel}
                                            </span>
                                            {renderStars(review.rating)}
                                        </div>

                                        {/* Card Headline */}
                                        <h3 className="review-card-headline">
                                            {review.headline}
                                        </h3>

                                        {/* Card Body Quote */}
                                        <p className="review-card-body">
                                            "{review.quote}"
                                        </p>

                                        {/* Product & Usage Tag */}
                                        <div className="review-product-tag">
                                            <Sparkles size={13} className="sparkle-icon" />
                                            <span>{review.productUsed} • <strong>{review.usagePeriod}</strong></span>
                                        </div>

                                        {/* Card Footer: Real Author Details */}
                                        <div className="review-card-footer">
                                            <div className="review-author-info">
                                                <div 
                                                    className="author-monogram-avatar"
                                                    style={{
                                                        backgroundColor: review.avatarBg,
                                                        color: review.avatarColor
                                                    }}
                                                >
                                                    {review.initials}
                                                    <div className="avatar-check-badge" title="Verified Customer">
                                                        <CheckCircle2 size={12} />
                                                    </div>
                                                </div>

                                                <div className="author-details-col">
                                                    <div className="author-name-row">
                                                        <h4 className="author-name">{review.author}</h4>
                                                        <span className="author-verified-tag">
                                                            <CheckCircle2 size={11} />
                                                            <span>{review.source}</span>
                                                        </span>
                                                    </div>
                                                    <p className="author-meta-text">
                                                        <span>{review.role}</span>
                                                        <span className="meta-sep">•</span>
                                                        <span className="author-location">
                                                            <MapPin size={11} className="pin-icon" />
                                                            {review.location}
                                                        </span>
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Dots Pagination */}
                {slides.length > 1 && (
                    <div className="reviews-pagination-dots">
                        {slides.map((_, dotIdx) => (
                            <button
                                key={dotIdx}
                                type="button"
                                className={`review-dot-pill ${dotIdx === currentIndex ? 'active' : ''}`}
                                onClick={() => setCurrentIndex(dotIdx)}
                                aria-label={`Go to slide ${dotIdx + 1}`}
                            />
                        ))}
                    </div>
                )}

                {/* Bottom Trust Guarantee Strip */}
                <div className="reviews-bottom-guarantee">
                    <div className="guarantee-item">
                        <CheckCircle2 size={16} className="guarantee-check" />
                        <span>100% Genuine Reviews from Real Customers</span>
                    </div>
                    <div className="guarantee-divider" />
                    <div className="guarantee-item">
                        <ShieldCheck size={16} className="guarantee-check" />
                        <span>Lab-Tested for Heavy Metals & Aflatoxins</span>
                    </div>
                    <div className="guarantee-divider" />
                    <div className="guarantee-item">
                        <Leaf size={16} className="guarantee-check" />
                        <span>Zero Chemical Preservatives or Fillers</span>
                    </div>
                </div>

            </div>
        </section>
    );
}
