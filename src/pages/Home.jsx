import React, { useState } from 'react';
import HeroCarousel from '../components/HeroCarousel';
import ProductCard from '../components/ProductCard';
import ReviewCardSlider from '../components/ReviewCardSlider';
import { PRODUCTS } from './Shop';
import { useLanguage } from '../context/LanguageContext';

export default function Home({ setPage, onProductView, onAddToCart, onSelectCategory }) {
    const { t } = useLanguage();
    const [activeTab, setActiveTab] = useState('300g');
    const [purchaseOption, setPurchaseOption] = useState('one-time');
    const [newsletterEmail, setNewsletterEmail] = useState('');
    const [newsletterSubmitted, setNewsletterSubmitted] = useState(false);

    const categoryItems = [
        {
            id: 'health-mixes',
            name: 'Health Mixes',
            image: '/assets/images/categories/whey-protein.png'
        },
        {
            id: 'traditional-rice',
            name: 'Traditional Rice',
            image: '/assets/images/categories/rice-svgrepo-com.svg'
        },
        {
            id: 'millets-grains',
            name: 'Millets & Grains',
            image: '/assets/images/categories/rice.png'
        },
        {
            id: 'natural-foods',
            name: 'Traditional & Natural Foods',
            image: '/assets/images/categories/organic-food-ingredients.png'
        }
    ];

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
    const [contactMessage, setContactMessage] = useState('');
    const [contactSubmitted, setContactSubmitted] = useState(false);

    const handleNewsletterSubmit = (e) => {
        e.preventDefault();
        if (newsletterEmail) {
            setNewsletterSubmitted(true);
        }
    };

    const handleContactSubmit = (e) => {
        e.preventDefault();
        if (contactName && contactEmail && contactMessage) {
            setContactSubmitted(true);
            setContactName('');
            setContactEmail('');
            setContactMessage('');
        }
    };

    return (
        <main style={{ width: '100%' }}>

            {/* Multi-banner interactive Hero Carousel */}
            <HeroCarousel setPage={setPage} />

            {/* Trust Badges Bar */}
            <section style={{ background: 'var(--color-primary-light)', padding: '24px 0', borderBottom: '1px solid rgba(7, 56, 32, 0.05)' }}>
                <div className="container trust-badges-container" style={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '1.5rem' }}>🌱</span>
                        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('badgeSprouted')}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '1.5rem' }}>🚫</span>
                        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('badgeNoChemicals')}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '1.5rem' }}>🚚</span>
                        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('badgeFreeShipping')}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '1.5rem' }}>🛡️</span>
                        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('badgeCertified')}</span>
                    </div>
                </div>
            </section>

            {/* Shop by Category Section (Exact Reference Image Structure) */}
            <section className="shop-by-category-section" id="shop-by-category">
                <div className="container">
                    
                    {/* Header Row matching Reference Image layout */}
                    <div className="category-ref-header">
                        <div className="category-ref-title-group">
                            <h2 className="category-ref-heading">Browse by Category</h2>
                            <button
                                className="category-all-link-btn"
                                onClick={() => handleCategoryClick('All Products')}
                            >
                                <span>All Categories</span>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <polyline points="9 18 15 12 9 6"></polyline>
                                </svg>
                            </button>
                        </div>

                        {/* Navigation Arrows matching Reference Image */}
                        <div className="category-ref-nav-arrows">
                            <button className="category-arrow-btn" aria-label="Previous categories">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <polyline points="15 18 9 12 15 6"></polyline>
                                </svg>
                            </button>
                            <button className="category-arrow-btn" aria-label="Next categories">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <polyline points="9 18 15 12 9 6"></polyline>
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* 4 Category Cards Grid matching Reference Portrait Card Structure */}
                    <div className="category-ref-cards-row">
                        {categoryItems.map((cat) => (
                            <div
                                key={cat.id}
                                className="category-ref-card"
                                onClick={() => handleCategoryClick(cat.name)}
                            >
                                <div className="category-ref-icon-wrap">
                                    <img src={cat.image} alt={cat.name} className="category-ref-icon-img" />
                                </div>
                                <h3 className="category-ref-card-title">{cat.name}</h3>
                            </div>
                        ))}
                    </div>

                </div>
            </section>

            {/* Section 1: About Mangalam Healthy Foods (Clean, Minimal & Informative Format with PDF Journey) */}
            <section className="about-minimal-section" id="about-mangalam">
                <div className="container">
                    <div className="about-minimal-grid">

                        {/* Left Side: Clean Informative Copy & Highlights */}
                        <div className="about-minimal-left">
                            <span className="about-minimal-tag">{t('aboutTag')}</span>
                            <h2 className="about-minimal-title">
                                {t('aboutTitle')}
                            </h2>
                            <p className="about-minimal-desc">
                                {t('aboutDesc')}
                            </p>

                            {/* Informative Key Points */}
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

                        {/* Right Side: Clean Rounded Photo Frame */}
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

            {/* Section 2: Product Showcase (4 Official Product Cards) */}
            <section className="rituals-section" id="our-products" style={{ padding: '80px 0', background: 'linear-gradient(180deg, #e4efe3 0%, #d8ebd6 100%)' }}>
                <div className="container">
                    <div className="section-header">
                        <span className="section-subtitle">{t('productSectionSub')}</span>
                        <h2 className="section-title">{t('productSectionTitle')}</h2>
                        <p className="section-description">{t('productSectionDesc')}</p>
                    </div>

                    <div className="shop-grid-4col" style={{ marginTop: '40px' }}>
                        {PRODUCTS.map(product => (
                            <ProductCard
                                key={product.id}
                                {...product}
                                onProductView={onProductView}
                                onAddToCart={onAddToCart}
                            />
                        ))}
                    </div>
                </div>
            </section>


            {/* Section 4: Customer Reviews (Tilted Sticky-Note Card Slider) */}
            <ReviewCardSlider />

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
                                    <p style={{ fontSize: '0.85rem' }}>+91 7094074655</p>
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
                                    <p style={{ fontSize: '0.85rem' }}>mangalamhealthyfood@zohomail.in</p>
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
                                        {t('factoryAddr')}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Contact Form */}
                    <div className="newsletter-wrapper" style={{ width: '100%', padding: '40px', textAlign: 'left' }}>
                        <h3 style={{ fontSize: '1.75rem', marginBottom: '20px' }}>{t('getInTouchTitle')}</h3>

                        {!contactSubmitted ? (
                            <form onSubmit={handleContactSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                    <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>{t('contactNameHolder')}</label>
                                    <input
                                        type="text"
                                        required
                                        className="newsletter-input"
                                        style={{ borderRadius: 'var(--radius-md)', width: '100%', border: '1px solid rgba(7, 56, 32, 0.1)' }}
                                        value={contactName}
                                        onChange={(e) => setContactName(e.target.value)}
                                    />
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                    <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Email Address</label>
                                    <input
                                        type="email"
                                        required
                                        className="newsletter-input"
                                        style={{ borderRadius: 'var(--radius-md)', width: '100%', border: '1px solid rgba(7, 56, 32, 0.1)' }}
                                        value={contactEmail}
                                        onChange={(e) => setContactEmail(e.target.value)}
                                    />
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                    <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Message</label>
                                    <textarea
                                        required
                                        rows="4"
                                        className="newsletter-input"
                                        style={{ borderRadius: 'var(--radius-md)', width: '100%', border: '1px solid rgba(7, 56, 32, 0.1)', minHeight: '100px', resize: 'vertical', fontFamily: 'inherit' }}
                                        value={contactMessage}
                                        onChange={(e) => setContactMessage(e.target.value)}
                                    />
                                </div>

                                <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start', padding: '12px 24px' }}>
                                    Send Message
                                </button>
                            </form>
                        ) : (
                            <div className="newsletter-success" style={{ margin: '0', display: 'block' }}>
                                Thank you, {contactName}! Your message has been dispatched successfully. We'll be in touch shortly.
                            </div>
                        )}
                    </div>

                </div>
            </section>

        </main>
    );
}
