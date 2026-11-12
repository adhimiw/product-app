import React, { useState, useEffect, useMemo } from 'react';
import HeroCarousel from '../components/HeroCarousel';
import ProductCard from '../components/ProductCard';
import ReviewCardSlider from '../components/ReviewCardSlider';
import { useLanguage } from '../context/LanguageContext';
import { useBranding } from '../context/BrandingContext';
import { fetchCategoriesApi, fetchProductsApi, submitContactQueryApi, subscribeToCacheInvalidation } from '../services/api';
import { ArrowRight, Sparkles, Flame, HelpCircle, ChevronDown, CheckCircle2, ShieldCheck } from 'lucide-react';

export default function Home({
    products: propProducts,
    loadingProducts: propLoading,
    setPage,
    onProductView,
    onAddToCart,
    cart = [],
    onUpdateQuantity,
    onRemoveFromCart,
    onSelectCategory,
    favoriteProductIds = [],
    onToggleFavorite
}) {
    const { t } = useLanguage();
    let branding = null;
    try {
        const ctx = useBranding();
        branding = ctx?.branding || null;
    } catch {
        branding = null;
    }

    const [activeTab, setActiveTab] = useState('300g');
    const [purchaseOption, setPurchaseOption] = useState('one-time');
    const [newsletterEmail, setNewsletterEmail] = useState('');
    const [newsletterSubmitted, setNewsletterSubmitted] = useState(false);
    const [openFaq, setOpenFaq] = useState(0);

    const HOME_FAQS = useMemo(() => [
        {
            q: "What is MaHealthy Foods (mahealthyfoods) and Amutham Sprouted Health Mix?",
            a: "MaHealthy Foods (registered as Mangalam Healthy Foods Company) is a traditional health-food kitchen in Sethiyathope, Tamil Nadu. Our flagship Amutham Sprouted Health Mix (Sathu Maavu) is crafted from 9 soak-sprouted ancient grains and millets blended with heirloom Mappillai Samba rice. It delivers 15.6g natural protein per 100g and up to 3.2× higher mineral bioavailability with 0% preservatives."
        },
        {
            q: "Why are sprouted millets and grains better than ordinary health mix?",
            a: "Unsprouted grains contain phytic acid—a natural anti-nutrient that binds to Calcium, Iron, and Zinc, preventing effective absorption. Our 24-to-48-hour water germination process activates endogenous phytase enzymes to naturally dephosphorylate phytates, unlocking maximum mineral assimilation as corroborated by ICMR-NIN nutritional standards."
        },
        {
            q: "How to prepare Amutham Sprouted Porridge in 3 minutes?",
            a: "Mix 2 tablespoons (approx. 30g) of Amutham Sprouted Health Mix with 250ml water or milk until lump-free. Cook on medium heat for 3–5 minutes while stirring continuously until thick and aromatic. Serve warm with country sugar (Nattu Sakkarai) or as a savory porridge with buttermilk and rock salt."
        },
        {
            q: "Is Amutham Sprouted Health Mix suitable for infants, elders, and diabetics?",
            a: "Yes. The natural germination process pre-digests complex grain starches into easily assimilable simple oligosaccharides, preventing infantile colic and digestive heaviness. It is 100% free of added sugar, maltodextrin, and chemical preservatives, making it ideal for toddlers (6+ months), nursing mothers, elders, and diabetic wellness."
        },
        {
            q: "Where is Mangalam Healthy Foods located and how can I order online?",
            a: "Mangalam Healthy Foods is headquartered at No-18, Mettu St, Sethiyathope, Cuddalore District, Tamil Nadu 608702, operating under FSSAI license 12423028000746. You can order directly online at https://mahealthyfoods.in/shop with secure pan-India delivery, or call our customer helpline at +91-94432-84112."
        }
    ], []);

    // Dynamic Products State - Powered by App-level state & Instant Cache
    const [productList, setProductList] = useState(propProducts || []);
    const [loadingProducts, setLoadingProducts] = useState(propLoading !== undefined ? propLoading : (!propProducts || propProducts.length === 0));

    useEffect(() => {
        if (propProducts && propProducts.length > 0) {
            setProductList(propProducts);
            setLoadingProducts(false);
        } else if (!propProducts || propProducts.length === 0) {
            if (propLoading === false) {
                let isMounted = true;
                async function loadProducts() {
                    const res = await fetchProductsApi();
                    if (isMounted && res.success && res.data) {
                        setProductList(res.data);
                    }
                    if (isMounted) setLoadingProducts(false);
                }
                loadProducts();
                return () => { isMounted = false; };
            }
        }
    }, [propProducts, propLoading]);

    // Subscribe to product updates
    useEffect(() => {
        const unsubscribe = subscribeToCacheInvalidation('products', async () => {
            const res = await fetchProductsApi(true);
            if (res.success && res.data) {
                setProductList(res.data);
            }
        });
        return () => unsubscribe();
    }, []);

    // Section 1 Products: Newly Launched (product_badge === 1)
    const newLaunchedProducts = useMemo(() => {
        if (!Array.isArray(productList) || productList.length === 0) return [];
        const matches = productList.filter(p => Number(p.product_badge) === 1);
        return matches.length > 0 ? matches : productList.slice(0, 4);
    }, [productList]);

    // Section 2 Products: Popular & Customer Favorites (product_badge === 2)
    const popularProducts = useMemo(() => {
        if (!Array.isArray(productList) || productList.length === 0) return [];
        const matches = productList.filter(p => Number(p.product_badge) === 2);
        return matches.length > 0 ? matches : productList.slice(4, 8);
    }, [productList]);

    // Dynamic Categories State - 100% API Driven with Instant Storage Cache
    const [categoryItems, setCategoryItems] = useState([]);
    const [loadingCategories, setLoadingCategories] = useState(true);

    const loadCategories = async (forceRefresh = false) => {
        const res = await fetchCategoriesApi(forceRefresh);
        if (res.success && res.data) {
            setCategoryItems(res.data);
        }
        setLoadingCategories(false);
    };

    useEffect(() => {
        loadCategories();
    }, []);

    // Subscribe to category cache invalidation
    useEffect(() => {
        const unsubscribe = subscribeToCacheInvalidation('categories', () => {
            loadCategories(true);
        });
        return () => unsubscribe();
    }, []);

    const handleCategoryClick = (catName) => {
        if (onSelectCategory) {
            onSelectCategory(catName);
        } else {
            setPage('shop');
        }
    };

    // Contact Form States
    const [contactName, setContactName] = useState('');
    const [contactEmail, setContactEmail] = useState('');
    const [contactPhone, setContactPhone] = useState('');
    const [contactMessage, setContactMessage] = useState('');
    const [contactSubmitting, setContactSubmitting] = useState(false);
    const [contactSubmitted, setContactSubmitted] = useState(false);
    const [contactError, setContactError] = useState('');

    const handleNewsletterSubmit = (e) => {
        e.preventDefault();
        if (newsletterEmail) {
            setNewsletterSubmitted(true);
        }
    };

    const handleContactSubmit = async (e) => {
        e.preventDefault();
        setContactError('');
        if (!contactName.trim() || !contactEmail.trim() || !contactMessage.trim()) {
            setContactError('Please fill in all required fields.');
            return;
        }

        setContactSubmitting(true);
        const res = await submitContactQueryApi({
            name: contactName.trim(),
            email: contactEmail.trim(),
            phone: contactPhone.trim() || null,
            message: contactMessage.trim()
        });
        setContactSubmitting(false);

        if (res.success) {
            setContactSubmitted(true);
            setContactName('');
            setContactEmail('');
            setContactPhone('');
            setContactMessage('');
        } else {
            setContactError(res.message || 'Failed to send message. Please try again.');
        }
    };

    return (
        <main style={{ width: '100%' }}>

            {/* Multi-banner interactive Hero Carousel with 2-Column Split & 4 Pastel Feature Badges */}
            <HeroCarousel setPage={setPage} />

            {/* Shop by Category Section (Exact Reference Image Structure) */}
            <section className="shop-by-category-section reveal-on-scroll" id="shop-by-category">
                <div className="container">

                    {/* Header Row matching Reference Image layout */}
                    <div className="category-ref-header">
                        <div className="category-ref-title-group">
                            <h2 className="category-ref-heading">Browse by Heritage Category</h2>
                            <button
                                className="category-all-link-btn"
                                onClick={() => handleCategoryClick('All Products')}
                            >
                                <span>All Categories</span>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <polyline points="9 18 15 12 9 6"></polyline>
                                </svg>
                            </button>
                        </div>

                        {/* Navigation Arrows matching Reference Image */}
                        <div className="category-ref-nav-arrows">
                            <button className="category-arrow-btn" aria-label="Previous categories">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <polyline points="15 18 9 12 15 6"></polyline>
                                </svg>
                            </button>
                            <button className="category-arrow-btn" aria-label="Next categories">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <polyline points="9 18 15 12 9 6"></polyline>
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Category Cards Grid with Dynamic API Data */}
                    <div className="category-ref-cards-row">
                        {loadingCategories ? (
                            <div className="empty-category-container">
                                <div className="admin-circle-spinner" style={{ margin: '0 auto 8px auto', width: '28px', height: '28px' }}>
                                    <svg viewBox="0 0 50 50" className="admin-spinner-svg">
                                        <circle className="admin-spinner-path" cx="25" cy="25" r="20" fill="none" strokeWidth="4" />
                                    </svg>
                                </div>
                                <span className="empty-category-text">Loading categories...</span>
                            </div>
                        ) : categoryItems && categoryItems.length > 0 ? (
                            categoryItems.map((cat) => {
                                const imgSrc = cat.icon_url || cat.image_url || cat.image || '/assets/images/categories/organic-food-ingredients.png';
                                return (
                                    <div
                                        key={cat.id || cat.name}
                                        className="category-ref-card"
                                        onClick={() => handleCategoryClick(cat.name)}
                                    >
                                        <div className="category-ref-icon-wrap">
                                            <img 
                                                src={imgSrc} 
                                                alt={cat.name} 
                                                className="category-ref-icon-img"
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src = '/assets/images/categories/organic-food-ingredients.png';
                                                }}
                                            />
                                        </div>
                                        <h3 className="category-ref-card-title">{cat.name}</h3>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="empty-category-simple">
                                No category available yet.
                            </div>
                        )}
                    </div>

                </div>
            </section>

            {/* Section 1: About Mangalam Healthy Foods (Clean, Minimal & Informative Format with PDF Journey) - Hidden for now */}
            {/*
            <section className="about-minimal-section" id="about-mangalam">
                <div className="container">
                    <div className="about-minimal-grid">

                        <div className="about-minimal-left">
                            <span className="about-minimal-tag">{t('aboutTag')}</span>
                            <h2 className="about-minimal-title">
                                {t('aboutTitle')}
                            </h2>
                            <p className="about-minimal-desc">
                                {t('aboutDesc')}
                            </p>

                            <div className="about-info-list">
                                <div className="about-info-item">
                                    <div className="about-info-check">✓</div>
                                    <div className="about-info-text">
                                        <strong>{t('aboutPoint1Title')}</strong> {t('aboutPoint1Text')}
                                    </div>
                                </div>

                                <div className="about-info-item">
                                    <div className="about-info-check">✓</div>
                                    <div className="about-info-text">
                                        <strong>{t('aboutPoint2Title')}</strong> {t('aboutPoint2Text')}
                                    </div>
                                </div>

                                <div className="about-info-item">
                                    <div className="about-info-check">✓</div>
                                    <div className="about-info-text">
                                        <strong>{t('aboutPoint3Title')}</strong> {t('aboutPoint3Text')}
                                    </div>
                                </div>
                            </div>

                            <button onClick={() => setPage('about')} className="btn btn-primary">
                                <span>{t('aboutReadStoryBtn')}</span>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <line x1="5" y1="12" x2="19" y2="12"></line>
                                    <polyline points="12 5 19 12 12 19"></polyline>
                                </svg>
                            </button>
                        </div>

                        <div className="about-minimal-right">
                            <div className="about-minimal-img-frame">
                                <img
                                    src="/assets/images/istockphoto-611609186-612x612.jpg"
                                    alt="Mangalam Sprouted Health Mix Heritage"
                                />
                            </div>
                        </div>

                    </div>
                </div>
            </section>
            */}

            {/* Section 2: Newly Launched Products Showcase */}
            <section className="home-showcase-section new-launched-section" id="newly-launched">
                <div className="container">
                    <div className="home-showcase-header">
                        <div className="home-showcase-title-wrap">
                            <div className="home-section-badge-pill new-launched-tag">
                                <Sparkles size={13} className="home-badge-icon" />
                                <span>{t('sectionNewLaunchedTag')}</span>
                            </div>
                            <h2 className="home-showcase-title">
                                {t('sectionNewLaunchedTitle')}
                            </h2>
                            <p className="home-showcase-desc">
                                {t('sectionNewLaunchedDesc')}
                            </p>
                        </div>
                        <button
                            type="button"
                            className="home-showcase-view-btn new-launched-btn"
                            onClick={() => {
                                if (setPage) setPage('shop');
                                else handleCategoryClick('All');
                            }}
                        >
                            <span>{t('sectionNewLaunchedBtn')}</span>
                            <ArrowRight size={15} />
                        </button>
                    </div>

                    <div className="shop-grid-4col">
                        {loadingProducts ? (
                            <div style={{ textAlign: 'center', gridColumn: '1 / -1', padding: '40px 0', color: '#646a66' }}>
                                Loading products from backend server...
                            </div>
                        ) : newLaunchedProducts.length > 0 ? (
                            newLaunchedProducts.map(product => (
                                <ProductCard
                                    key={product.id}
                                    {...product}
                                    product_badge={product.product_badge}
                                    onProductView={onProductView}
                                    onAddToCart={onAddToCart}
                                    cart={cart}
                                    onUpdateQuantity={onUpdateQuantity}
                                    onRemoveFromCart={onRemoveFromCart}
                                    isFavorite={Array.isArray(favoriteProductIds) && favoriteProductIds.includes(product.id)}
                                    onToggleFavorite={onToggleFavorite}
                                />
                            ))
                        ) : (
                            <div style={{ textAlign: 'center', gridColumn: '1 / -1', padding: '40px 0', color: '#646a66' }}>
                                No products marked as newly launched yet.
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* Section 3: Popular & Best Sellers Showcase */}
            <section className="home-showcase-section popular-section" id="popular-products">
                <div className="container">
                    <div className="home-showcase-header">
                        <div className="home-showcase-title-wrap">
                            <div className="home-section-badge-pill popular-tag">
                                <Flame size={13} className="home-badge-icon" />
                                <span>{t('sectionPopularTag')}</span>
                            </div>
                            <h2 className="home-showcase-title">
                                {t('sectionPopularTitle')}
                            </h2>
                            <p className="home-showcase-desc">
                                {t('sectionPopularDesc')}
                            </p>
                        </div>
                        <button
                            type="button"
                            className="home-showcase-view-btn popular-btn"
                            onClick={() => {
                                if (setPage) setPage('shop');
                                else handleCategoryClick('All');
                            }}
                        >
                            <span>{t('sectionPopularBtn')}</span>
                            <ArrowRight size={15} />
                        </button>
                    </div>

                    <div className="shop-grid-4col">
                        {loadingProducts ? (
                            <div style={{ textAlign: 'center', gridColumn: '1 / -1', padding: '40px 0', color: '#646a66' }}>
                                Loading products from backend server...
                            </div>
                        ) : popularProducts.length > 0 ? (
                            popularProducts.map(product => (
                                <ProductCard
                                    key={product.id}
                                    {...product}
                                    product_badge={product.product_badge}
                                    onProductView={onProductView}
                                    onAddToCart={onAddToCart}
                                    cart={cart}
                                    onUpdateQuantity={onUpdateQuantity}
                                    onRemoveFromCart={onRemoveFromCart}
                                    isFavorite={Array.isArray(favoriteProductIds) && favoriteProductIds.includes(product.id)}
                                    onToggleFavorite={onToggleFavorite}
                                />
                            ))
                        ) : (
                            <div style={{ textAlign: 'center', gridColumn: '1 / -1', padding: '40px 0', color: '#646a66' }}>
                                No products marked as popular yet.
                            </div>
                        )}
                    </div>
                </div>
            </section>


            {/* Section 4: Customer Reviews (Tilted Sticky-Note Card Slider) */}
            <ReviewCardSlider />

            {/* Section 4.5: Authoritative Q&A / Sprout Science FAQ (GEO & AEO Intent Answering) */}
            <section className="home-faq-section" id="faq-section" style={{ padding: '64px 0', background: 'linear-gradient(180deg, #fafaf9 0%, #ffffff 100%)', borderTop: '1px solid rgba(7, 56, 32, 0.06)' }}>
                <div className="container" style={{ maxWidth: '920px', margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                        <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            background: 'rgba(16, 185, 129, 0.1)',
                            color: '#065f46',
                            padding: '4px 14px',
                            borderRadius: '999px',
                            fontSize: '0.78rem',
                            fontWeight: 800,
                            letterSpacing: '0.04em',
                            textTransform: 'uppercase',
                            marginBottom: '12px'
                        }}>
                            <HelpCircle size={14} />
                            <span>Verified Knowledge &amp; Guidance</span>
                        </div>
                        <h2 style={{
                            fontSize: 'clamp(1.6rem, 3vw, 2.2rem)',
                            fontWeight: 800,
                            color: '#064e3b',
                            letterSpacing: '-0.02em',
                            margin: '0 0 12px 0'
                        }}>
                            Frequently Asked Questions about MaHealthy Foods
                        </h2>
                        <p style={{
                            fontSize: '0.95rem',
                            color: '#64748b',
                            maxWidth: '680px',
                            margin: '0 auto',
                            lineHeight: 1.5
                        }}>
                            Everything you need to know about Amutham Sprouted Health Mix, germination science, nutrition standards, and genuine online orders.
                        </p>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        {HOME_FAQS.map((faq, idx) => {
                            const isOpen = openFaq === idx;
                            return (
                                <div
                                    key={idx}
                                    style={{
                                        border: isOpen ? '1.5px solid #10b981' : '1px solid #e2e8f0',
                                        borderRadius: '14px',
                                        background: '#ffffff',
                                        boxShadow: isOpen ? '0 8px 24px -6px rgba(16, 185, 129, 0.12)' : '0 2px 6px rgba(0,0,0,0.02)',
                                        overflow: 'hidden',
                                        transition: 'all 0.25s ease'
                                    }}
                                >
                                    <button
                                        type="button"
                                        onClick={() => setOpenFaq(isOpen ? -1 : idx)}
                                        aria-expanded={isOpen}
                                        style={{
                                            width: '100%',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            gap: '16px',
                                            padding: '18px 22px',
                                            background: 'none',
                                            border: 'none',
                                            textAlign: 'left',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <h3 style={{
                                            fontSize: '1rem',
                                            fontWeight: 700,
                                            color: isOpen ? '#047857' : '#1e293b',
                                            margin: 0,
                                            lineHeight: 1.4
                                        }}>
                                            {faq.q}
                                        </h3>
                                        <ChevronDown
                                            size={20}
                                            style={{
                                                flexShrink: 0,
                                                color: isOpen ? '#10b981' : '#94a3b8',
                                                transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                                                transition: 'transform 0.25s ease'
                                            }}
                                        />
                                    </button>
                                    {isOpen && (
                                        <div style={{
                                            padding: '0 22px 20px 22px',
                                            fontSize: '0.92rem',
                                            color: '#475569',
                                            lineHeight: 1.6,
                                            borderTop: '1px solid #f1f5f9',
                                            paddingTop: '14px'
                                        }}>
                                            <p style={{ margin: 0 }}>{faq.a}</p>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    <div style={{
                        marginTop: '32px',
                        padding: '16px 20px',
                        borderRadius: '12px',
                        background: '#f0fdf4',
                        border: '1px solid #bbf7d0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '12px'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <ShieldCheck size={22} color="#16a34a" />
                            <span style={{ fontSize: '0.86rem', color: '#166534', fontWeight: 600 }}>
                                Have a customized dietary question? Reach our Sethiyathope kitchen directly.
                            </span>
                        </div>
                        <a
                            href="tel:+919443284112"
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                fontSize: '0.85rem',
                                fontWeight: 700,
                                color: '#15803d',
                                textDecoration: 'none'
                            }}
                        >
                            <span>Call +91 94432 84112</span>
                            <ArrowRight size={14} />
                        </a>
                    </div>
                </div>
            </section>

            {/* Section 5: Get In Touch (Contact form & address details) */}
            <section className="newsletter-section" id="get-in-touch" style={{ padding: '80px 0' }}>
                <div className="container contact-grid-container" style={{ display: 'grid', gridTemplateColumns: '0.9fr 1.1fr', gap: '60px', alignItems: 'flex-start' }}>

                    {/* Left: Contact Info details */}
                    <div style={{ textAlign: 'left' }}>
                        <span className="section-subtitle">{t('getInTouchSub')}</span>
                        <h2 style={{ fontSize: '2.5rem', marginBottom: '24px' }}>{t('getInTouchTitle')}</h2>
                        <p style={{ marginBottom: '32px', fontSize: '1.05rem', color: '#646a66' }}>
                            {t('getInTouchDesc')}
                        </p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                                <div className="feature-icon-wrapper" style={{ width: '40px', height: '40px' }}>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                                    </svg>
                                </div>
                                <div>
                                    <h4 style={{ fontFamily: 'var(--font-sans)', fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-primary)' }}>{t('phoneLabel')}</h4>
                                    <p style={{ fontSize: '0.85rem' }}>{branding?.support_phone || '+91 7094074655'}</p>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                                <div className="feature-icon-wrapper" style={{ width: '40px', height: '40px' }}>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                                        <polyline points="22,6 12,13 2,6"></polyline>
                                    </svg>
                                </div>
                                <div>
                                    <h4 style={{ fontFamily: 'var(--font-sans)', fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-primary)' }}>{t('emailLabel')}</h4>
                                    <p style={{ fontSize: '0.85rem' }}>{branding?.support_email || 'mangalamhealthyfood@zohomail.in'}</p>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                                <div className="feature-icon-wrapper" style={{ width: '40px', height: '40px' }}>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                        <circle cx="12" cy="10" r="3"></circle>
                                    </svg>
                                </div>
                                <div>
                                    <h4 style={{ fontFamily: 'var(--font-sans)', fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-primary)' }}>{t('factoryLabel')}</h4>
                                    <p style={{ fontSize: '0.85rem', lineHeight: '1.4' }}>
                                        {branding?.address || t('factoryAddr')}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Contact Form */}
                    <div className="newsletter-wrapper" style={{ width: '100%', padding: '40px', textAlign: 'left' }}>
                        <h3 style={{ fontSize: '1.75rem', marginBottom: '20px' }}>{t('getInTouchTitle')}</h3>

                        {contactError && (
                            <div style={{
                                padding: '10px 14px',
                                marginBottom: '16px',
                                borderRadius: 'var(--radius-md)',
                                background: 'rgba(239, 68, 68, 0.1)',
                                border: '1px solid rgba(239, 68, 68, 0.3)',
                                color: '#b91c1c',
                                fontSize: '0.82rem',
                                fontWeight: 600
                            }}>
                                {contactError}
                            </div>
                        )}

                        {!contactSubmitted ? (
                            <form onSubmit={handleContactSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                    <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>{t('contactNameHolder')} *</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Your full name"
                                        className="newsletter-input"
                                        style={{ borderRadius: 'var(--radius-md)', width: '100%', border: '1px solid rgba(7, 56, 32, 0.1)' }}
                                        value={contactName}
                                        onChange={(e) => setContactName(e.target.value)}
                                        disabled={contactSubmitting}
                                    />
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                        <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Email Address *</label>
                                        <input
                                            type="email"
                                            required
                                            placeholder="you@example.com"
                                            className="newsletter-input"
                                            style={{ borderRadius: 'var(--radius-md)', width: '100%', border: '1px solid rgba(7, 56, 32, 0.1)' }}
                                            value={contactEmail}
                                            onChange={(e) => setContactEmail(e.target.value)}
                                            disabled={contactSubmitting}
                                        />
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                        <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Phone Number (Optional)</label>
                                        <input
                                            type="tel"
                                            placeholder="+91 98765 43210"
                                            className="newsletter-input"
                                            style={{ borderRadius: 'var(--radius-md)', width: '100%', border: '1px solid rgba(7, 56, 32, 0.1)' }}
                                            value={contactPhone}
                                            onChange={(e) => setContactPhone(e.target.value)}
                                            disabled={contactSubmitting}
                                        />
                                    </div>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                    <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Message *</label>
                                    <textarea
                                        required
                                        rows="4"
                                        placeholder="Write your message, question, or feedback here..."
                                        className="newsletter-input"
                                        style={{ borderRadius: 'var(--radius-md)', width: '100%', border: '1px solid rgba(7, 56, 32, 0.1)', minHeight: '100px', resize: 'vertical', fontFamily: 'inherit' }}
                                        value={contactMessage}
                                        onChange={(e) => setContactMessage(e.target.value)}
                                        disabled={contactSubmitting}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={contactSubmitting}
                                    style={{
                                        alignSelf: 'flex-start',
                                        padding: '12px 28px',
                                        opacity: contactSubmitting ? 0.7 : 1,
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '8px'
                                    }}
                                >
                                    {contactSubmitting ? 'Sending Message...' : 'Send Message'}
                                </button>
                            </form>
                        ) : (
                            <div className="newsletter-success" style={{ margin: '0', padding: '24px', background: 'rgba(7, 56, 32, 0.06)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(7, 56, 32, 0.15)' }}>
                                <div style={{ fontSize: '1.5rem', marginBottom: '8px' }}>✓</div>
                                <h4 style={{ margin: '0 0 6px 0', fontSize: '1.1rem', color: 'var(--color-primary)' }}>Message Sent Successfully!</h4>
                                <p style={{ margin: '0 0 16px 0', fontSize: '0.88rem', color: '#4b5563', lineHeight: '1.5' }}>
                                    Thank you for reaching out to us. Our team has received your inquiry and will contact you promptly.
                                </p>
                                <button
                                    type="button"
                                    onClick={() => setContactSubmitted(false)}
                                    className="btn btn-outline"
                                    style={{ padding: '8px 18px', fontSize: '0.82rem' }}
                                >
                                    Send Another Message
                                </button>
                            </div>
                        )}
                    </div>

                </div>
            </section>

        </main>
    );
}
