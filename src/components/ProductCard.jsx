import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';

/**
 * Two Brothers Style Product Card Component
 * Exactly matches the reference layout:
 * 1. Top Image container with grain texture backdrop & floating badge pill (Badge text | ♡)
 * 2. Card body with Title (left) & Price (right) in Row 1
 * 3. Subtitle / spec highlights in Row 2
 * 4. Star rating & review count in Row 3
 * 5. Weight selector dropdown pill in Row 4
 */
export default function ProductCard({
    id,
    name,
    price,
    inrPrice,
    subtitle = "100% Sprouted | Bio-Activated",
    rating = 4.9,
    reviewCount = 1240,
    badge = "Best Seller",
    badgeType = "green", // "green" or "orange"
    image = "/assets/images/300g_amutham/amutham-01.jpg",
    imageStyle = {},
    weights = ["300g", "500g", "1kg"],
    onProductView,
    onAddToCart
}) {
    const { t } = useLanguage();
    const [selectedWeight, setSelectedWeight] = useState(weights[0] || "300g");
    const [isWishlisted, setIsWishlisted] = useState(false);

    const itemPrice = price || (inrPrice ? parseInt(inrPrice.replace(/\D/g, '')) : 110);
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const toggleWishlist = (e) => {
        e.stopPropagation();
        setIsWishlisted(!isWishlisted);
    };

    return (
        <div className="two-brothers-product-card">

            {/* Top Image Container with Grain Texture Backdrop */}
            <div
                className="tb-card-image-wrap"
                onClick={() => onProductView && onProductView(id)}
            >
                {/* Grain texture backdrop */}
                <div className="tb-grain-backdrop"></div>

                {/* Floating Badge Pill in Top Right */}
                {badge && (
                    <div className={`tb-badge-pill ${badgeType === 'orange' ? 'trending' : 'bestseller'}`}>
                        <span>{badge}</span>
                        <span className="tb-badge-divider">|</span>
                        <button
                            className={`tb-heart-btn ${isWishlisted ? 'liked' : ''}`}
                            onClick={toggleWishlist}
                            aria-label="Wishlist"
                        >
                            {isWishlisted ? '♥' : '♡'}
                        </button>
                    </div>
                )}

                {/* Product Packaging Image */}
                <img
                    src={image}
                    alt={name}
                    className="tb-product-img"
                    style={imageStyle}
                />
            </div>

            {/* Bottom Info Content */}
            <div className="tb-card-body">

                {/* Row 1: Title (Left) + Price (Right) */}
                <div className="tb-card-header-row">
                    <h3
                        className="tb-card-title"
                        onClick={() => onProductView && onProductView(id)}
                        title={name}
                    >
                        {name}
                    </h3>
                    <span className="tb-card-price">
                        {inrPrice}
                    </span>
                </div>

                {/* Row 2: Subtitle / Spec Highlights */}
                <div className="tb-card-subtitle">
                    {subtitle}
                </div>

                {/* Row 3: Rating Stars + Review Count */}
                <div className="tb-card-rating-row">
                    <span className="tb-stars">★★★★★</span>
                    <span className="tb-rating-val">{rating}</span>
                    <span className="tb-rating-sep">|</span>
                    <span className="tb-reviews-count">{reviewCount} Reviews</span>
                </div>

                {/* Row 4: Weight Selector Dropdown Pill */}
                <div className="tb-weight-selector-wrap">
                    <button
                        className="tb-weight-dropdown-btn"
                        onClick={() => setDropdownOpen(!dropdownOpen)}
                    >
                        <span>{selectedWeight}</span>
                        <svg className={`tb-chevron ${dropdownOpen ? 'open' : ''}`} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                    </button>

                    {/* Weight Options Dropdown Menu */}
                    {dropdownOpen && (
                        <div className="tb-weight-dropdown-menu">
                            {weights.map((w) => (
                                <button
                                    key={w}
                                    className={`tb-weight-option ${w === selectedWeight ? 'active' : ''}`}
                                    onClick={() => {
                                        setSelectedWeight(w);
                                        setDropdownOpen(false);
                                    }}
                                >
                                    {w}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Quick Add to Cart Action */}
                <button
                    className="tb-add-cart-btn"
                    onClick={() => onAddToCart && onAddToCart(id, name, itemPrice, '1 Pack')}
                >
                    {t('addToBagBtn')}
                </button>

            </div>
        </div>
    );
}
