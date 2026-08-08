import React, { useState } from 'react';
import HeroCarousel from '../components/HeroCarousel';
import ProductCard from '../components/ProductCard';
import ReviewCardSlider from '../components/ReviewCardSlider';
import { PRODUCTS } from './Shop';
import { useLanguage } from '../context/LanguageContext';

export default function Home({ setPage, onProductView, onAddToCart }) {
    const { t } = useLanguage();
    const [activeTab, setActiveTab] = useState('300g');
    const [purchaseOption, setPurchaseOption] = useState('one-time');
    const [newsletterEmail, setNewsletterEmail] = useState('');
    const [newsletterSubmitted, setNewsletterSubmitted] = useState(false);

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

            {/* Section 1: Product Showcase (4 Official Product Cards) */}
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

            {/* Section 2: Why Sprouted? (The Bioavailability Breakthrough) */}
            <section className="science-section" id="why-sprouted" style={{ padding: '80px 0', background: '#f6faf5' }}>
                <div className="container">
                    <div className="science-wrapper">
                        <div className="science-info">
                            <span className="section-subtitle">{t('navWhySprouted')}</span>
                            <h2 className="section-title" style={{ fontSize: '2.5rem', marginBottom: '16px' }}>
                                {t('scienceTitle')}
                            </h2>
                            <p className="science-lead">
                                {t('scienceLead')}
                            </p>

                            <div className="accordion">
                                <div className="accordion-item active">
                                    <div className="accordion-trigger" style={{ cursor: 'default' }}>
                                        <span>01. {t('sciencePoint1Title')}</span>
                                    </div>
                                    <div className="accordion-content" style={{ maxHeight: '200px' }}>
                                        <p>{t('sciencePoint1Desc')}</p>
                                    </div>
                                </div>

                                <div className="accordion-item">
                                    <div className="accordion-trigger" style={{ cursor: 'default' }}>
                                        <span>02. {t('sciencePoint2Title')}</span>
                                    </div>
                                    <div className="accordion-content" style={{ maxHeight: '200px' }}>
                                        <p>{t('sciencePoint2Desc')}</p>
                                    </div>
                                </div>
                            </div>

                            <button onClick={() => setPage('science')} className="btn btn-secondary" style={{ marginTop: '24px', alignSelf: 'flex-start' }}>
                                <span>{t('learnMoreScience')}</span>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <line x1="5" y1="12" x2="19" y2="12"></line>
                                    <polyline points="12 5 19 12 12 19"></polyline>
                                </svg>
                            </button>
                        </div>

                        <div className="science-visual">
                            <img src="/science_sprouts.png" alt="Mangalam Sprouted Ingredients" className="science-image" />
                            <div className="science-overlay-card">
                                <div className="overlay-card-title">Enzymatic Vitality</div>
                                <div className="overlay-card-stat">+300%</div>
                                <div className="overlay-card-desc">Increase in mineral absorption compared to unsprouted flours.</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Section 3: Our Story (About Mangalam Healthy Foods) */}
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
