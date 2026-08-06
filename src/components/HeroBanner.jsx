import React from 'react';

/**
 * Full-Width Clean Hero Banner Component (50/50 Split)
 * - Left side: Conversion-focused headline, description, pill tag, and Shop Now CTA
 * - Right side: Large, visually dominant product image with edge mask blur and non-cropped object-fit
 */
export default function HeroBanner({
    pillBadge,
    title,
    description,
    primaryCtaText = "Shop Now",
    primaryCtaAction,
    image,
    imageStyle = {},
    backgroundColor = "#ece5b8ff"
}) {
    return (
        <div className="hero-fullwidth-card" style={{ background: backgroundColor }}>
            <div className="hero-split-grid">

                {/* Left Side: Conversion Content */}
                <div className="hero-split-left">
                    {pillBadge && (
                        <div className="hero-pill-badge-wrap">
                            <span className="hero-pill-badge">{pillBadge}</span>
                        </div>
                    )}

                    <h1 className="hero-split-title">
                        {title}
                    </h1>

                    <p className="hero-split-description">
                        {description}
                    </p>

                    <div className="hero-split-actions">
                        <button
                            onClick={primaryCtaAction}
                            className="btn btn-primary hero-cta-btn"
                        >
                            <span>{primaryCtaText}</span>
                            <svg className="btn-arrow" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <line x1="5" y1="12" x2="19" y2="12"></line>
                                <polyline points="12 5 19 12 12 19"></polyline>
                            </svg>
                        </button>
                    </div>

                    {/* Bottom Rating Stars Block */}
                    <div className="hero-rating-block">
                        <span className="hero-rating-score">4.9</span>
                        <div className="hero-rating-details">
                            <div className="hero-stars-gold">★★★★★</div>
                            <span className="hero-rating-count">1,240+ Verified Customer Reviews</span>
                        </div>
                    </div>
                </div>

                {/* Right Side: Large Dominant Product Image */}
                <div className="hero-split-right">
                    {image && (
                        <div className="hero-product-img-frame">
                            <img
                                src={image}
                                alt={title}
                                className="hero-dominant-product-img"
                                style={imageStyle}
                            />
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}



