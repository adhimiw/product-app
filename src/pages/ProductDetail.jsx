import React, { useState } from 'react';
import { PRODUCTS } from './Shop';
import { useLanguage } from '../context/LanguageContext';

export default function ProductDetail({ productId, onAddToCart, onBack }) {
    const { t } = useLanguage();
    const product = PRODUCTS.find(p => p.id === productId) || PRODUCTS[0];

    // Multiple images list setup
    const imgList = (product.images && product.images.length > 0)
        ? product.images
        : [product.image];

    // Gram package options (300g and 500g default)
    const gramOptions = product.gramOptions || [
        { size: '300g Package', price: 12.00, inrPrice: '₹499', badge: 'Popular' },
        { size: '500g Package', price: 17.00, inrPrice: '₹699', badge: 'Best Deal' }
    ];

    const [selectedImgIndex, setSelectedImgIndex] = useState(0);
    const [selectedGramIndex, setSelectedGramIndex] = useState(0);
    const [quantity, setQuantity] = useState(1);

    // Accordion expand/collapse states
    const [openAccordion, setOpenAccordion] = useState({
        howToUse: true,
        benefits: false,
        ingredients: false
    });

    const activeGramOption = gramOptions[selectedGramIndex] || gramOptions[0];
    const currentPrice = activeGramOption.price;
    const currentInrPrice = activeGramOption.inrPrice;

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
        onAddToCart(
            product.id,
            `${product.name} (${activeGramOption.size})`,
            currentPrice,
            'one-time',
            quantity
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
                        <p className="pdp-novelty-desc">
                            {product.description}
                        </p>

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
                                        onClick={() => setSelectedGramIndex(idx)}
                                    >
                                        {opt.badge && (
                                            <span className="gram-deal-badge">{opt.badge}</span>
                                        )}
                                        <div className="gram-card-inner">
                                            <img
                                                src={imgList[idx] || product.image}
                                                alt={opt.size}
                                                className="gram-thumb-img"
                                            />
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

                        {/* Big Single Add to Bag CTA Button with Quantity Counter */}
                        <div className="pdp-cta-bar-novelty">
                            <div className="pdp-qty-counter">
                                <button onClick={() => handleQtyChange('dec')}>-</button>
                                <span>{quantity}</span>
                                <button onClick={() => handleQtyChange('inc')}>+</button>
                            </div>

                            <button
                                className="btn btn-primary pdp-big-add-btn"
                                onClick={handleAddToCartClick}
                            >
                                {t('addToBagBtn')} - ({currentInrPrice})
                            </button>
                        </div>

                        {/* Risk-free Guarantee Message */}
                        <div className="pdp-risk-free-msg">
                            <span className="check-shield-icon">🛡️</span>
                            <span>{t('satisfactionGuarantee')}</span>
                        </div>

                        {/* Expandable Accordions: How to use, Benefits, Ingredients */}
                        <div className="pdp-accordions-group">

                            {/* Accordion 1: How to use & taste */}
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
                                            <h5>In English:</h5>
                                            <p>{product.howToUse?.english || "Dissolve 2 tablespoons in 200ml clean water without lumps. Boil on medium flame for 5-6 minutes. Add jaggery or salt to taste. Serve warm with milk."}</p>

                                            <h5 style={{ marginTop: '12px' }}>தமிழ் பதிப்பு:</h5>
                                            <p style={{ fontFamily: 'var(--font-sans)' }}>{product.howToUse?.tamil || "200ml தண்ணீரில் 2 ஸ்பூன் மாவை கட்டியில்லாமல் கரைத்து 5-6 நிமிடம் கொதிக்க வைக்கவும். நாட்டுச்சர்க்கரை அல்லது பாலுடன் பருகவும்."}</p>
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
                                        <ul className="pdp-bullet-list">
                                            {(product.benefitsList || [
                                                "100% Soak-sprouted millets bio-activate maximum nutrient absorption.",
                                                "Zero added sugar and zero chemical preservatives for daily natural energy.",
                                                "Enriched with organic cardamom to prevent stomach acidity and gas."
                                            ]).map((b, i) => (
                                                <li key={i}>✓ {b}</li>
                                            ))}
                                        </ul>
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
                                        <p className="pdp-ingredients-text">
                                            {product.ingredientsList || "Pearl Millet (Kambu), Finger Millet (Ragi), Sorghum (Cholam), Bengal Gram, Black Gram, Green Gram, Wheat, Sprouted Roasted Gram, Organic Green Cardamom."}
                                        </p>
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
