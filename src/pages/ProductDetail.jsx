import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { fetchProductsApi } from '../services/api';

export default function ProductDetail({ 
    productId, 
    products: propProducts, 
    onAddToCart, 
    onBack,
    isFavorite = false,
    onToggleFavorite 
}) {
    const { t } = useLanguage();
    const [products, setProducts] = useState(propProducts || []);
    const [loading, setLoading] = useState(!propProducts || propProducts.length === 0);

    useEffect(() => {
        if (propProducts && propProducts.length > 0) {
            setProducts(propProducts);
            setLoading(false);
        } else {
            async function loadProducts() {
                setLoading(true);
                const res = await fetchProductsApi();
                if (res.success && res.data) {
                    setProducts(res.data);
                }
                setLoading(false);
            }
            loadProducts();
        }
    }, [propProducts]);

    const product = products.find(p => String(p.id) === String(productId) || p.slug === productId) || products[0];

    const [selectedImgIndex, setSelectedImgIndex] = useState(0);
    const [selectedGramIndex, setSelectedGramIndex] = useState(0);
    const [quantity, setQuantity] = useState(1);
    // Gram package options (dynamically mapped from backend package_sizes or gramOptions)
    const gramOptions = (product && Array.isArray(product.package_sizes) && product.package_sizes.length > 0)
        ? product.package_sizes.map((pkg, idx) => {
            const sizeNum = pkg.size_number || 300;
            const sizeUnit = pkg.size_unit || 'g';
            const sizeWeight = `${sizeNum}${sizeUnit}`;
            const price = Number(pkg.variant_price || product.actual_price || product.price || 110);
            let badge = '';
            if (pkg.variant_badge === 1) badge = 'Best Value';
            else if (pkg.variant_badge === 2) badge = 'Save 15%';
            else if (idx === 0) badge = 'Popular';

            return {
                id: pkg.id || `pkg-${idx}`,
                size: `${sizeWeight} Package`,
                sizeWeight,
                price,
                inrPrice: `₹${price}`,
                badge,
                variant_images: pkg.variant_images || pkg.images || []
            };
        })
        : ((product && Array.isArray(product.gramOptions) && product.gramOptions.length > 0)
            ? product.gramOptions
            : [
                {
                    id: 'pkg-default',
                    size: '300g Package',
                    sizeWeight: '300g',
                    price: Number(product?.actual_price || product?.price || 110),
                    inrPrice: `₹${Number(product?.actual_price || product?.price || 110)}`,
                    badge: 'Popular',
                    variant_images: []
                }
            ]);

    const activeGramOption = gramOptions[selectedGramIndex] || gramOptions[0] || {};
    const currentPrice = Number(activeGramOption?.price || product?.actual_price || product?.price || 110);
    const currentInrPrice = activeGramOption?.inrPrice || `₹${currentPrice}`;

    // Selected package variant specific images if available, otherwise deduplicated product images
    const currentPkg = (product && product.package_sizes && product.package_sizes.length > selectedGramIndex)
        ? product.package_sizes[selectedGramIndex]
        : null;

    const variantImages = (currentPkg && Array.isArray(currentPkg.variant_images) && currentPkg.variant_images.length > 0)
        ? currentPkg.variant_images
        : ((currentPkg && Array.isArray(currentPkg.images) && currentPkg.images.length > 0)
            ? currentPkg.images
            : (activeGramOption?.variant_images && activeGramOption.variant_images.length > 0 ? activeGramOption.variant_images : null));

    const rawImgList = variantImages || (product && Array.isArray(product.images) && product.images.length > 0 ? product.images : [product?.image]);
    
    // Deduplicate image URLs to eliminate duplicate thumbnails
    const imgList = Array.from(new Set((rawImgList || []).filter(Boolean)));

    // Accordion expand/collapse states
    const [openAccordion, setOpenAccordion] = useState({
        howToUse: true,
        benefits: false,
        ingredients: false
    });

    if (loading || !product) {
        return (
            <main className="pdp-page">
                <div className="container" style={{ textAlign: 'center', padding: '100px 20px', color: '#646a66' }}>
                    {loading ? 'Loading product details...' : 'Product not found.'}
                </div>
            </main>
        );
    }

    const toggleAccordion = (key) => {
        setOpenAccordion(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    const handleQtyChange = (type) => {
        if (type === 'dec' && quantity > 1) {
            setQuantity(quantity - 1);
        } else if (type === 'inc') {
            setQuantity(quantity + 1);
        }
    };

    const handleAddToCartClick = () => {
        if (!product || !onAddToCart) return;
        const cleanName = (product.name || 'Amutham Sprouted Health Mix').replace(/\s*\(\d+[a-zA-Z]+[^\)]*\)/i, '').trim();
        const sizeWeight = activeGramOption.sizeWeight || (activeGramOption.size ? String(activeGramOption.size).replace(/\s*Package/i, '').trim() : '300g');
        const variantName = `${cleanName} (${sizeWeight})`;

        let packageSizeId = null;
        if (activeGramOption && activeGramOption.id && typeof activeGramOption.id === 'number') {
            packageSizeId = activeGramOption.id;
        } else if (Array.isArray(product.package_sizes)) {
            const matchedPkg = product.package_sizes.find(ps => `${ps.size_number}${ps.size_unit || 'g'}` === sizeWeight);
            if (matchedPkg && typeof matchedPkg.id === 'number') {
                packageSizeId = matchedPkg.id;
            }
        }

        onAddToCart(
            product.id,
            variantName,
            Number(currentPrice || 110),
            'one-time',
            Number(quantity || 1),
            packageSizeId
        );
    };

    const defaultFeatures = [
        { icon: '🍵', text: 'Traditional Taste' },
        { icon: '🌾', text: '0g Added Sugar' },
        { icon: '🌱', text: '100% Sprouted' },
        { icon: '⚡', text: '15.6g Bio-Protein' }
    ];
    const featuresList = product.features || defaultFeatures;

    const defaultTags = ['Digestion', 'Immunity', 'Calm', 'Vitality'];
    const tagsList = product.tags || defaultTags;

    return (
        <main className="pdp-page">
            <div className="container">

                {/* Back button */}
                <button onClick={onBack} className="pdp-back">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <line x1="19" y1="12" x2="5" y2="12"></line>
                        <polyline points="12 19 5 12 12 5"></polyline>
                    </svg>
                    <span>{t('backToProducts')}</span>
                </button>

                {/* Main PDP 2-Column Grid (Reference Screenshot Structure) */}
                <div className="pdp-grid-novelty">

                    {/* Left Column: Vertical Thumbnails on Left Side (Centered) + Main Hero Image */}
                    <div className="pdp-left-gallery-wrap">
                        <div className="pdp-gallery-flex-left">

                            {/* Vertical Thumbnails List on Left Side */}
                            {imgList.length > 1 && (
                                <div className="pdp-thumbnails-col-vertical">
                                    {imgList.map((imgSrc, idx) => (
                                        <div
                                            key={idx}
                                            className={`pdp-thumb-box ${idx === selectedImgIndex ? 'active' : ''}`}
                                            onClick={() => setSelectedImgIndex(idx)}
                                        >
                                            <img src={imgSrc} alt={`Thumbnail ${idx + 1}`} />
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Main Featured Card with Product Image */}
                            <div className="pdp-main-image-card">
                                <div className="pdp-main-img-holder">
                                    <img
                                        src={imgList[selectedImgIndex] || product.image}
                                        alt={product.name}
                                        className="pdp-hero-display-img"
                                    />
                                </div>
                            </div>

                        </div>
                    </div>

                    {/* Right Column: Title, Gram Package Options, Price, Big CTA, & Accordions */}
                    <div className="pdp-right-info-panel">

                        {/* Rating Row */}
                        <div className="pdp-stars-row">
                            <span className="stars-gold">★★★★★</span>
                            <span className="reviews-label">{product.rating || '4.9'} ({product.reviewCount || 1240} {t('verifiedReviews')})</span>
                        </div>

                        {/* Product Title */}
                        <h1 className="pdp-novelty-title">{product.name}</h1>

                        {/* Benefit Checkmarks Tags Row */}
                        <div className="pdp-benefits-tags-row">
                            {tagsList.map((tag, idx) => (
                                <span key={idx} className="benefit-tag-item">
                                    ✓ {tag}
                                </span>
                            ))}
                        </div>

                        {/* Lead Description Paragraph */}
                        {typeof product.description === 'string' && (product.description.includes('<') || product.description.includes('>')) ? (
                            <div className="pdp-novelty-desc" dangerouslySetInnerHTML={{ __html: product.description }} />
                        ) : (
                            <p className="pdp-novelty-desc">
                                {product.description}
                            </p>
                        )}

                        {/* Gram Package Size Selector (300g & 500g Packets) */}
                        <div className="pdp-gram-selector-block">
                            <div className="gram-selector-label">
                                {t('packSizeLabel')} <strong>{activeGramOption.size}</strong>
                            </div>

                            <div className="gram-options-grid">
                                {gramOptions.map((opt, idx) => (
                                    <div
                                        key={idx}
                                        className={`gram-card-box ${idx === selectedGramIndex ? 'active' : ''}`}
                                        onClick={() => {
                                            setSelectedGramIndex(idx);
                                            setSelectedImgIndex(0);
                                        }}
                                    >
                                        {opt.badge && (
                                            <span className="gram-deal-badge">{opt.badge}</span>
                                        )}
                                        <div className="gram-card-inner">
                                            <div className="gram-card-info">
                                                <span className="gram-size-text">{opt.size}</span>
                                                <span className="gram-price-text">{opt.inrPrice}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Trust / Guarantee Perks Line */}
                        <div className="pdp-trust-guarantee-row">
                            <span>{t('trustGuarantee1')}</span>
                            <span>{t('trustGuarantee2')}</span>
                            <span>{t('trustGuarantee3')}</span>
                        </div>

                        {/* Dynamic Price Display */}
                        <div className="pdp-novelty-price-row">
                            <span className="novelty-current-price">{currentInrPrice}</span>
                            <span className="novelty-original-price">₹{(parseInt(currentInrPrice.replace(/\D/g, '')) * 1.25).toFixed(0)}</span>
                        </div>

                        {/* Big Single Add to Bag CTA Button with Quantity Counter & Wishlist Button */}
                        <div className="pdp-cta-bar-novelty" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div className="pdp-qty-counter">
                                <button onClick={() => handleQtyChange('dec')}>-</button>
                                <span>{quantity}</span>
                                <button onClick={() => handleQtyChange('inc')}>+</button>
                            </div>

                            <button
                                className="btn btn-primary pdp-big-add-btn"
                                onClick={handleAddToCartClick}
                                style={{ flex: 1 }}
                            >
                                {t('addToBagBtn')} - ({currentInrPrice})
                            </button>

                            <button
                                type="button"
                                className={`btn-icon ${isFavorite ? 'liked' : ''}`}
                                onClick={() => onToggleFavorite && onToggleFavorite(product?.id || productId)}
                                title={isFavorite ? 'Remove from Favourites' : 'Save to Favourites'}
                                aria-label="Toggle Favourite"
                                style={{
                                    width: '48px',
                                    height: '48px',
                                    borderRadius: '12px',
                                    border: isFavorite ? '1.5px solid #ef4444' : '1.5px solid #cbd5e1',
                                    background: isFavorite ? 'rgba(239, 68, 68, 0.08)' : '#ffffff',
                                    color: isFavorite ? '#ef4444' : '#64748b',
                                    fontSize: '22px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    flexShrink: 0
                                }}
                            >
                                {isFavorite ? '♥' : '♡'}
                            </button>
                        </div>

                        {/* Risk-free Guarantee Message */}
                        <div className="pdp-risk-free-msg">
                            <span className="check-shield-icon">🛡️</span>
                            <span>{t('satisfactionGuarantee')}</span>
                        </div>

                        {/* Expandable Accordions: How to use, Benefits, Ingredients */}
                        <div className="pdp-accordions-group">

                            {/* Accordion 1: How to use & preparation */}
                            <div className={`pdp-accordion-item ${openAccordion.howToUse ? 'open' : ''}`}>
                                <button
                                    className="pdp-accordion-head"
                                    onClick={() => toggleAccordion('howToUse')}
                                >
                                    <span>{t('accHowToUse')}</span>
                                    <span className="acc-chevron">{openAccordion.howToUse ? '▲' : '▼'}</span>
                                </button>

                                {openAccordion.howToUse && (
                                    <div className="pdp-accordion-body">
                                        <div className="how-to-use-box">
                                            {product.howToUse ? (
                                                <div dangerouslySetInnerHTML={{ __html: product.howToUse }} />
                                            ) : (
                                                <p>Dissolve 2 tablespoons in 200ml clean water without lumps. Boil on medium flame for 5-6 minutes. Add jaggery or salt to taste. Serve warm with milk.</p>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Accordion 2: Benefits */}
                            <div className={`pdp-accordion-item ${openAccordion.benefits ? 'open' : ''}`}>
                                <button
                                    className="pdp-accordion-head"
                                    onClick={() => toggleAccordion('benefits')}
                                >
                                    <span>{t('accBenefits')}</span>
                                    <span className="acc-chevron">{openAccordion.benefits ? '▲' : '▼'}</span>
                                </button>

                                {openAccordion.benefits && (
                                    <div className="pdp-accordion-body">
                                        {product.benefits ? (
                                            <div dangerouslySetInnerHTML={{ __html: product.benefits }} />
                                        ) : (
                                            <p>100% Soak-sprouted millets bio-activate maximum nutrient absorption.</p>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Accordion 3: Ingredients */}
                            <div className={`pdp-accordion-item ${openAccordion.ingredients ? 'open' : ''}`}>
                                <button
                                    className="pdp-accordion-head"
                                    onClick={() => toggleAccordion('ingredients')}
                                >
                                    <span>{t('accIngredients')}</span>
                                    <span className="acc-chevron">{openAccordion.ingredients ? '▲' : '▼'}</span>
                                </button>

                                {openAccordion.ingredients && (
                                    <div className="pdp-accordion-body">
                                        {product.ingredients ? (
                                            <div className="pdp-ingredients-text" dangerouslySetInnerHTML={{ __html: product.ingredients }} />
                                        ) : (
                                            <p className="pdp-ingredients-text">
                                                Pearl Millet (Kambu), Finger Millet (Ragi), Sorghum (Cholam), Bengal Gram, Black Gram, Green Gram, Wheat, Sprouted Roasted Gram, Organic Green Cardamom.
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>

                        </div>

                    </div>

                </div>

            </div>
        </main>
    );
}
