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
    id = 1,
    name = "Amutham Sprouted Health Mix",
    price,
    actual_price,
    inrPrice,
    subtitle = "100% Sprouted | Bio-Activated",
    rating = 4.9,
    reviewCount = 1240,
    badge = "Best Seller",
    badgeType = "green", // "green" or "orange"
    image,
    images = [],
    imageStyle = {},
    weights = ["300g", "500g"],
    package_sizes = [],
    gramOptions = [],
    onProductView,
    onAddToCart,
    isFavorite = false,
    onToggleFavorite
}) {
    const { t } = useLanguage();

    const availableWeights = (Array.isArray(package_sizes) && package_sizes.length > 0)
        ? package_sizes.map(ps => `${ps.size_number}${ps.size_unit || 'g'}`)
        : (Array.isArray(weights) && weights.length > 0 ? weights : ["300g", "500g"]);

    const [selectedWeight, setSelectedWeight] = useState(availableWeights[0] || "300g");
    const [localWishlisted, setLocalWishlisted] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const isLiked = isFavorite || localWishlisted;
    const basePrice = price || actual_price || (inrPrice ? parseInt(String(inrPrice).replace(/\D/g, ''), 10) : 110);
    const displayImage = image || (Array.isArray(images) && images.length > 0 ? images[0] : "/mangalam_logo.png");

    let activePrice = basePrice;
    let packageSizeId = null;

    if (Array.isArray(package_sizes) && package_sizes.length > 0) {
        const found = package_sizes.find(ps => `${ps.size_number}${ps.size_unit || 'g'}` === selectedWeight);
        if (found) {
            if (found.id && typeof found.id === 'number') {
                packageSizeId = found.id;
            }
            if (found.variant_price !== undefined && found.variant_price !== null) {
                activePrice = Number(found.variant_price);
            }
        }
    } else if (Array.isArray(gramOptions) && gramOptions.length > 0) {
        const foundOpt = gramOptions.find(opt => opt.size && opt.size.startsWith(selectedWeight));
        if (foundOpt && foundOpt.price) {
            activePrice = Number(foundOpt.price);
        }
    }

    const displayInrPrice = `₹${activePrice}`;

    const handleHeartClick = (e) => {
        e.stopPropagation();
        if (onToggleFavorite) {
            onToggleFavorite(id);
        } else {
            setLocalWishlisted(!localWishlisted);
        }
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

                {/* Floating Badge Pill in Top Right or Standalone Heart */}
                {badge ? (
                    <div className={`tb-badge-pill ${badgeType === 'orange' ? 'trending' : 'bestseller'}`}>
                        <span>{badge}</span>
                        <span className="tb-badge-divider">|</span>
                        <button
                            type="button"
                            className={`tb-heart-btn ${isLiked ? 'liked' : ''}`}
                            onClick={handleHeartClick}
                            aria-label="Wishlist"
                        >
                            {isLiked ? '♥' : '♡'}
                        </button>
                    </div>
                ) : (
                    <button
                        type="button"
                        className={`tb-heart-btn standalone ${isLiked ? 'liked' : ''}`}
                        onClick={handleHeartClick}
                        aria-label="Wishlist"
                        style={{
                            position: 'absolute',
                            top: '10px',
                            right: '10px',
                            background: 'rgba(255, 255, 255, 0.9)',
                            border: 'none',
                            borderRadius: '50%',
                            width: '30px',
                            height: '30px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '17px',
                            color: isLiked ? '#ef4444' : '#64748b',
                            boxShadow: '0 2px 6px rgba(0,0,0,0.12)',
                            cursor: 'pointer',
                            zIndex: 3
                        }}
                    >
                        {isLiked ? '♥' : '♡'}
                    </button>
                )}

                {/* Product Packaging Image */}
                <img
                    src={displayImage}
                    alt={name || 'Product'}
                    className="tb-product-img"
                    loading="lazy"
                    decoding="async"
                    width="300"
                    height="300"
                    style={imageStyle}
                    onError={(e) => {
                        e.target.src = '/mangalam_logo.png';
                    }}
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
                        {displayInrPrice}
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
                        type="button"
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
                            {availableWeights.map((w) => (
                                <button
                                    type="button"
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
                    type="button"
                    className="tb-add-cart-btn"
                    onClick={() => {
                        const cleanBaseName = String(name || 'Amutham Sprouted Health Mix').replace(/\s*\(\d+g[^\)]*\)/i, '');
                        const variantName = `${cleanBaseName} (${selectedWeight})`;

                        if (onAddToCart) {
                            onAddToCart(id, variantName, activePrice, '1 Pack', 1, packageSizeId);
                        }
                    }}
                >
                    {t('addToBagBtn') || 'Add to Bag'}
                </button>

            </div>
        </div>
    );
}
