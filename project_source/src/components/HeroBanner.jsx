import React from 'react';

export default function HeroBanner({
    pillBadge,
    title,
    highlightText,
    description,
    primaryCtaText,
    primaryCtaAction,
    secondaryCtaText,
    secondaryCtaAction,
    image,
    imageStyle = {},
    darkTheme = false,
    reverseLayout = false,
    animatedImage = false
}) {
    return (
        <section className={`hero-section ${darkTheme ? 'promo-dark' : ''}`}>
            <div className={`container hero-container ${reverseLayout ? 'layout-reverse' : ''}`}>
                <div className="hero-content">
                    {pillBadge && (
                        <div className="badge-wrapper">
                            <span className="pill-badge">{pillBadge}</span>
                        </div>
                    )}
                    <h1 className="hero-title">
                        {title}
                        {highlightText && (
                            <> <span className="highlight-text">{highlightText}</span></>
                        )}
                    </h1>
                    <p className="hero-description">{description}</p>
                    
                    <div className="hero-actions">
                        {primaryCtaText && (
                            <button onClick={primaryCtaAction} className="btn btn-primary">
                                <span>{primaryCtaText}</span>
                                <svg className="btn-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="5" y1="12" x2="19" y2="12"></line>
                                    <polyline points="12 5 19 12 12 19"></polyline>
                                </svg>
                            </button>
                        )}
                        {secondaryCtaText && (
                            <button onClick={secondaryCtaAction} className="btn btn-text">
                                {secondaryCtaText}
                            </button>
                        )}
                    </div>
                </div>
                
                <div className="hero-visual">
                    <div className="hero-image-backdrop"></div>
                    {image && (
                        <img 
                            src={image} 
                            alt={title} 
                            className={`hero-image ${animatedImage ? 'animated' : ''}`} 
                            style={imageStyle}
                        />
                    )}
                </div>
            </div>
        </section>
    );
}
