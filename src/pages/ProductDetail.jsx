import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { fetchProductsApi, subscribeToCacheInvalidation, getBadgeLabel } from '../services/api';
import { 
    ArrowLeft, 
    Star, 
    CheckCircle2, 
    ShieldCheck, 
    Award, 
    Truck, 
    Lock, 
    Heart, 
    ShoppingBag, 
    Zap, 
    ChevronDown, 
    ChevronUp, 
    Minus, 
    Plus, 
    Leaf, 
    Share2, 
    Sparkles, 
    PackageCheck,
    Check
} from 'lucide-react';

export default function ProductDetail({ 
    productId, 
    products: propProducts, 
    onAddToCart, 
    onCartOpen,
    onBack,
    setPage,
    isFavorite = false,
    onToggleFavorite 
}) {
    const { t } = useLanguage();
    const [products, setProducts] = useState(propProducts || []);
    const [loading, setLoading] = useState(!propProducts || propProducts.length === 0);
    const [selectedImgIndex, setSelectedImgIndex] = useState(0);
    const [selectedGramIndex, setSelectedGramIndex] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [copied, setCopied] = useState(false);

    // Accordion expand/collapse states
    const [openAccordion, setOpenAccordion] = useState({
        howToUse: true,
        benefits: true,
        ingredients: false
    });

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

    // Reset selection state when navigating between products
    useEffect(() => {
        setSelectedImgIndex(0);
        setSelectedGramIndex(0);
        setQuantity(1);
    }, [productId]);

    // Subscribe to real-time product cache updates
    useEffect(() => {
        const unsubscribe = subscribeToCacheInvalidation('products', async () => {
            const res = await fetchProductsApi(true);
            if (res.success && res.data) {
                setProducts(res.data);
            }
        });
        return () => unsubscribe();
    }, []);

    const product = products.find(p => String(p.id) === String(productId) || p.slug === productId) || products[0];

    // Gram package options (dynamically mapped from backend package_sizes or gramOptions)
    const gramOptions = (product && Array.isArray(product.package_sizes) && product.package_sizes.length > 0)
        ? product.package_sizes.map((pkg, idx) => {
            const sizeNum = pkg.size_number || 300;
            const sizeUnit = pkg.size_unit || 'g';
            const sizeWeight = `${sizeNum}${sizeUnit}`;
            const price = Number(pkg.variant_price || product.actual_price || product.price || 110);
            const badge = getBadgeLabel(pkg.variant_badge);

            return {
                id: pkg.id || `pkg-${idx}`,
                size: `${sizeWeight} Package`,
                sizeWeight,
                price,
                inrPrice: `₹${price}`,
                badge,
                variant_badge: pkg.variant_badge,
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
                    badge: '',
                    variant_badge: 0,
                    variant_images: []
                }
            ]);

    const activeGramOption = gramOptions[selectedGramIndex] || gramOptions[0] || {};
    const currentPrice = Number(activeGramOption?.price || product?.actual_price || product?.price || 110);
    const currentInrPrice = activeGramOption?.inrPrice || `₹${currentPrice}`;

    // Active package details
    const currentPkg = (product && product.package_sizes && product.package_sizes.length > selectedGramIndex)
        ? product.package_sizes[selectedGramIndex]
        : null;

    // Calculate original price (MRP) and savings percentage
    let originalPrice = currentPrice;
    let savingsPercent = 0;
    if (product?.actual_price && Number(product.actual_price) > currentPrice) {
        originalPrice = Number(product.actual_price);
        savingsPercent = Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
    } else if (currentPkg?.discount_value && Number(currentPkg.discount_value) > 0) {
        if (currentPkg.discount_type === 1) {
            savingsPercent = Number(currentPkg.discount_value);
            originalPrice = Math.round(currentPrice / (1 - savingsPercent / 100));
        } else {
            originalPrice = currentPrice + Number(currentPkg.discount_value);
            savingsPercent = Math.round((currentPkg.discount_value / originalPrice) * 100);
        }
    } else if (product?.discount_value && Number(product.discount_value) > 0) {
        if (product.discount_type === 1) {
            savingsPercent = Number(product.discount_value);
            originalPrice = Math.round(currentPrice / (1 - savingsPercent / 100));
        } else {
            originalPrice = currentPrice + Number(product.discount_value);
            savingsPercent = Math.round((product.discount_value / originalPrice) * 100);
        }
    }

    const cleanImgUrl = (url) => {
        if (!url || typeof url !== 'string') return '';
        if (url.includes('/storage/')) {
            return url.replace(/^https?:\/\/(127\.0\.0\.1|localhost)(:\d+)?\/storage\//, '/storage/');
        }
        return url;
    };

    // Show ONLY selected size variant images - no images from other variants
    const variantImages = (currentPkg && Array.isArray(currentPkg.variant_images) && currentPkg.variant_images.length > 0)
        ? currentPkg.variant_images
        : ((currentPkg && Array.isArray(currentPkg.images) && currentPkg.images.length > 0)
            ? currentPkg.images
            : (activeGramOption?.variant_images && activeGramOption.variant_images.length > 0 ? activeGramOption.variant_images : []));

    let rawImages = [];
    if (variantImages && variantImages.length > 0) {
        rawImages = variantImages;
    } else if (product && Array.isArray(product.images) && product.images.length > 0) {
        rawImages = product.images;
    } else if (product?.image) {
        rawImages = [product.image];
    }

    const imgList = Array.from(new Set(rawImages.map(cleanImgUrl).filter(Boolean)));
    if (imgList.length === 0 && product?.image) {
        imgList.push(cleanImgUrl(product.image));
    }
    if (imgList.length === 0) {
        imgList.push('/assets/images/categories/organic-food-ingredients.png');
    }

    const safeImgIndex = selectedImgIndex < imgList.length ? selectedImgIndex : 0;
    const activeDisplayImage = imgList[safeImgIndex];

    if (loading || !product) {
        return (
            <main className="pdp-page">
                <div className="container" style={{ textAlign: 'center', padding: '120px 20px', color: '#64748b' }}>
                    <div style={{ width: '40px', height: '40px', border: '3px solid rgba(27, 59, 43, 0.1)', borderTopColor: '#1b3b2b', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
                    <p style={{ fontSize: '1.1rem', fontWeight: '600' }}>{loading ? 'Loading authentic product details...' : 'Product not found.'}</p>
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
        const pId = activeGramOption?.id ?? activeGramOption?.db_id ?? activeGramOption?.package_id;
        if (pId !== undefined && pId !== null && !isNaN(Number(pId))) {
            packageSizeId = Number(pId);
        } else if (Array.isArray(product.package_sizes) && product.package_sizes.length > 0) {
            const matchedPkg = product.package_sizes.find(ps => `${ps.size_number}${ps.size_unit || 'g'}` === sizeWeight) || product.package_sizes[0];
            const matchId = matchedPkg?.id ?? matchedPkg?.db_id;
            if (matchId !== undefined && matchId !== null && !isNaN(Number(matchId))) {
                packageSizeId = Number(matchId);
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

    const handleBuyNowClick = () => {
        handleAddToCartClick();
        if (setPage) {
            setPage('cart');
        } else if (onCartOpen) {
            setTimeout(() => onCartOpen(), 200);
        }
    };

    const handleShare = () => {
        const url = window.location.href;
        if (navigator.share) {
            navigator.share({
                title: product.name,
                text: product.description,
                url: url
            }).catch(() => {});
        } else if (navigator.clipboard) {
            navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2200);
        }
    };

    const tagsList = Array.isArray(product.tags) ? product.tags.filter(t => t && String(t).trim()) : [];
    const howToUseContent = product.how_to_use || product.howToUse;
    const benefitsContent = product.benefits;
    const ingredientsContent = product.ingredients;
    const hasAnyAccordion = Boolean(howToUseContent || benefitsContent || ingredientsContent);

    return (
        <main className="pdp-page">
            <div className="container">

                {/* Elegant Breadcrumbs & Quick Back Navigation */}
                <div className="pdp-top-nav-bar">
                    <button onClick={onBack} className="pdp-back-btn" title="Go Back">
                        <ArrowLeft size={16} />
                        <span>{t('backToProducts') || 'Back to Products'}</span>
                    </button>

                    <nav className="pdp-breadcrumbs" aria-label="Breadcrumb">
                        <button type="button" className="crumb-item crumb-link" onClick={() => setPage ? setPage('home') : onBack()}>Home</button>
                        <span className="crumb-sep">/</span>
                        <button type="button" className="crumb-item crumb-link" onClick={() => setPage ? setPage('shop') : onBack()}>Shop</button>
                        {product.category && (
                            <>
                                <span className="crumb-sep">/</span>
                                <span className="crumb-item crumb-category">{product.category}</span>
                            </>
                        )}
                        <span className="crumb-sep">/</span>
                        <span className="crumb-item crumb-active" title={product.name}>{product.name}</span>
                    </nav>
                </div>

                {/* Main PDP 2-Column Responsive Grid */}
                <div className="pdp-layout-grid">

                    {/* Left Column: Premium Gallery Showcase */}
                    <div className="pdp-gallery-column">
                        <div className="pdp-gallery-sticky-wrap">
                            
                            {/* Main Featured Image Card */}
                            <div className="pdp-hero-card">
                                {/* Main Image Container */}
                                <div className="pdp-main-image-viewport">
                                    <img
                                        src={activeDisplayImage}
                                        alt={product.name}
                                        className="pdp-hero-image"
                                        onError={(e) => {
                                            e.currentTarget.onerror = null;
                                            e.currentTarget.src = '/assets/images/categories/organic-food-ingredients.png';
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Thumbnail Selector Strip (rendered cleanly when multiple photos exist) */}
                            {imgList.length > 1 && (
                                <div className="pdp-thumbnails-strip">
                                    {imgList.map((imgSrc, idx) => (
                                        <button
                                            key={idx}
                                            type="button"
                                            className={`pdp-thumb-item ${idx === safeImgIndex ? 'active' : ''}`}
                                            onClick={() => setSelectedImgIndex(idx)}
                                            aria-label={`Show product image ${idx + 1}`}
                                        >
                                            <img 
                                                src={imgSrc} 
                                                alt="" 
                                                onError={(e) => {
                                                    e.currentTarget.onerror = null;
                                                    e.currentTarget.src = '/assets/images/categories/organic-food-ingredients.png';
                                                }}
                                            />
                                        </button>
                                    ))}
                                </div>
                            )}

                        </div>
                    </div>

                    {/* Right Column: Product Details & Purchase Actions */}
                    <div className="pdp-details-column">

                        {/* Status & Rating Bar */}
                        <div className="pdp-status-bar">
                            <div className="pdp-stock-indicator">
                                <span className="pdp-pulse-dot" />
                                <span>In Stock • Ready to Dispatch</span>
                            </div>

                            <div className="pdp-ratings-badge">
                                <div className="pdp-stars-row">
                                    {[1, 2, 3, 4, 5].map((s) => (
                                        <Star key={s} size={14} className="star-icon" fill="#f59e0b" color="#f59e0b" />
                                    ))}
                                </div>
                                <span className="pdp-rating-score">{product.rating || '4.9'}</span>
                                <span className="pdp-review-count">({product.reviewCount || 1240} {t('verifiedReviews') || 'Verified Reviews'})</span>
                            </div>
                        </div>

                        {/* Title & Share Row */}
                        <div className="pdp-title-bar">
                            <h1 className="pdp-product-title">{product.name}</h1>
                            <div className="pdp-share-wrap">
                                <button
                                    type="button"
                                    className="pdp-share-button"
                                    onClick={handleShare}
                                    title="Share product link"
                                    aria-label="Share product"
                                >
                                    <Share2 size={18} />
                                    <span>Share</span>
                                </button>
                                {copied && <div className="pdp-share-toast">Link copied to clipboard!</div>}
                            </div>
                        </div>

                        {/* Organic Tag Chips */}
                        {tagsList.length > 0 && (
                            <div className="pdp-tags-cluster">
                                {tagsList.map((tag, idx) => (
                                    <span key={idx} className="pdp-tag-chip">
                                        <CheckCircle2 size={13} className="tag-check-svg" />
                                        <span>{tag}</span>
                                    </span>
                                ))}
                            </div>
                        )}

                        {/* Description */}
                        {product.description && (
                            typeof product.description === 'string' && (product.description.includes('<') || product.description.includes('>')) ? (
                                <div className="pdp-description-text" dangerouslySetInnerHTML={{ __html: product.description }} />
                            ) : (
                                <p className="pdp-description-text">
                                    {product.description}
                                </p>
                            )
                        )}

                        {/* Prominent Pricing Card */}
                        <div className="pdp-pricing-card">
                            <div className="pdp-price-headline">
                                <span className="pdp-currency-sign">₹</span>
                                <span className="pdp-main-amount">{currentPrice}</span>
                                {originalPrice > currentPrice && (
                                    <span className="pdp-strike-mrp">₹{originalPrice}</span>
                                )}
                                {savingsPercent > 0 && (
                                    <span className="pdp-discount-pill">
                                        Save {savingsPercent}%
                                    </span>
                                )}
                            </div>
                            <div className="pdp-pricing-sub">
                                <Check size={14} className="pdp-sub-check" />
                                <span>Inclusive of all taxes • <strong>Free delivery</strong> on orders above ₹499</span>
                            </div>
                        </div>

                        {/* Pack Size Variant Selector */}
                        {gramOptions.length > 0 && (
                            <div className="pdp-pack-selector-section">
                                <div className="pdp-pack-header">
                                    <span className="pdp-pack-label">{t('packSizeLabel') || 'Pack Size:'}</span>
                                    <strong className="pdp-pack-current-choice">{activeGramOption.size}</strong>
                                </div>

                                <div className="pdp-pack-grid">
                                    {gramOptions.map((opt, idx) => {
                                        const isSelected = idx === selectedGramIndex;
                                        return (
                                            <div
                                                key={idx}
                                                className={`pdp-pack-card ${isSelected ? 'selected' : ''}`}
                                                onClick={() => {
                                                    setSelectedGramIndex(idx);
                                                    setSelectedImgIndex(0);
                                                }}
                                            >
                                                {opt.badge && (
                                                    <span className="pdp-pack-badge">{opt.badge}</span>
                                                )}
                                                <div className="pdp-pack-card-content">
                                                    <div className="pdp-radio-indicator">
                                                        {isSelected && <div className="pdp-radio-core" />}
                                                    </div>
                                                    <div className="pdp-pack-text-info">
                                                        <span className="pdp-pack-size-title">{opt.size}</span>
                                                        <span className="pdp-pack-price-tag">{opt.inrPrice}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Action Buttons: Quantity + Add to Bag + Buy Now + Wishlist */}
                        <div className="pdp-actions-bar">
                            <div className="pdp-qty-stepper">
                                <button 
                                    type="button" 
                                    onClick={() => handleQtyChange('dec')} 
                                    aria-label="Decrease quantity"
                                    className="pdp-qty-btn"
                                >
                                    <Minus size={15} />
                                </button>
                                <span className="pdp-qty-number">{quantity}</span>
                                <button 
                                    type="button" 
                                    onClick={() => handleQtyChange('inc')} 
                                    aria-label="Increase quantity"
                                    className="pdp-qty-btn"
                                >
                                    <Plus size={15} />
                                </button>
                            </div>

                            <button
                                type="button"
                                className="pdp-btn-add-to-cart"
                                onClick={handleAddToCartClick}
                            >
                                <ShoppingBag size={18} />
                                <span>{t('addToBagBtn') || 'Add to Bag'} • ₹{currentPrice * quantity}</span>
                            </button>

                            <button
                                type="button"
                                className="pdp-btn-buy-now"
                                onClick={handleBuyNowClick}
                            >
                                <Zap size={17} />
                                <span>Buy Now</span>
                            </button>

                            <button
                                type="button"
                                className={`pdp-btn-wishlist ${isFavorite ? 'favorited' : ''}`}
                                onClick={() => onToggleFavorite && onToggleFavorite(product?.id || productId)}
                                title={isFavorite ? 'Remove from Favourites' : 'Save to Favourites'}
                                aria-label="Toggle Favourite"
                            >
                                <Heart size={20} className={isFavorite ? 'heart-icon-filled' : 'heart-icon-empty'} />
                            </button>
                        </div>

                        {/* Quality Assurance & Trust Perks */}
                        <div className="pdp-trust-grid">
                            <div className="pdp-trust-item">
                                <ShieldCheck size={20} className="pdp-trust-icon" />
                                <div className="pdp-trust-meta">
                                    <strong>100% Pure & Natural</strong>
                                    <span>Chemical-free farming</span>
                                </div>
                            </div>
                            <div className="pdp-trust-item">
                                <Award size={20} className="pdp-trust-icon" />
                                <div className="pdp-trust-meta">
                                    <strong>FSSAI Certified</strong>
                                    <span>Strict hygiene standards</span>
                                </div>
                            </div>
                            <div className="pdp-trust-item">
                                <Truck size={20} className="pdp-trust-icon" />
                                <div className="pdp-trust-meta">
                                    <strong>Express Dispatch</strong>
                                    <span>Ships within 24-48 hrs</span>
                                </div>
                            </div>
                            <div className="pdp-trust-item">
                                <Lock size={20} className="pdp-trust-icon" />
                                <div className="pdp-trust-meta">
                                    <strong>Safe & Secure</strong>
                                    <span>Encrypted checkout</span>
                                </div>
                            </div>
                        </div>

                        {/* Rich Information Accordion Sections */}
                        {hasAnyAccordion && (
                            <div className="pdp-accordions-container">

                                {/* Accordion: How to use & preparation */}
                                {howToUseContent && (
                                    <div className={`pdp-acc-panel ${openAccordion.howToUse ? 'open' : ''}`}>
                                        <button
                                            type="button"
                                            className="pdp-acc-trigger"
                                            onClick={() => toggleAccordion('howToUse')}
                                        >
                                            <div className="pdp-acc-title-left">
                                                <Sparkles size={17} className="pdp-acc-icon" />
                                                <span>{t('accHowToUse') || 'How to Use & Preparation'}</span>
                                            </div>
                                            {openAccordion.howToUse ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                        </button>

                                        {openAccordion.howToUse && (
                                            <div className="pdp-acc-content">
                                                <div className="pdp-acc-inner-html" dangerouslySetInnerHTML={{ __html: howToUseContent }} />
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Accordion: Health Benefits */}
                                {benefitsContent && (
                                    <div className={`pdp-acc-panel ${openAccordion.benefits ? 'open' : ''}`}>
                                        <button
                                            type="button"
                                            className="pdp-acc-trigger"
                                            onClick={() => toggleAccordion('benefits')}
                                        >
                                            <div className="pdp-acc-title-left">
                                                <Leaf size={17} className="pdp-acc-icon" />
                                                <span>{t('accBenefits') || 'Key Health Benefits'}</span>
                                            </div>
                                            {openAccordion.benefits ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                        </button>

                                        {openAccordion.benefits && (
                                            <div className="pdp-acc-content">
                                                <div className="pdp-acc-inner-html" dangerouslySetInnerHTML={{ __html: benefitsContent }} />
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Accordion: Ingredients & Nutrition */}
                                {ingredientsContent && (
                                    <div className={`pdp-acc-panel ${openAccordion.ingredients ? 'open' : ''}`}>
                                        <button
                                            type="button"
                                            className="pdp-acc-trigger"
                                            onClick={() => toggleAccordion('ingredients')}
                                        >
                                            <div className="pdp-acc-title-left">
                                                <PackageCheck size={17} className="pdp-acc-icon" />
                                                <span>{t('accIngredients') || 'Ingredients & Nutritional Value'}</span>
                                            </div>
                                            {openAccordion.ingredients ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                        </button>

                                        {openAccordion.ingredients && (
                                            <div className="pdp-acc-content">
                                                <div className="pdp-acc-inner-html" dangerouslySetInnerHTML={{ __html: ingredientsContent }} />
                                            </div>
                                        )}
                                    </div>
                                )}

                            </div>
                        )}

                    </div>

                </div>

            </div>
        </main>
    );
}
