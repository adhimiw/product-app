import React, { useState } from 'react';
import HeroCarousel from '../components/HeroCarousel';

export default function Home({ setPage, onProductView, onAddToCart }) {
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
                <div className="container" style={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '1.5rem' }}>🌱</span>
                        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>100% Sprout-Activated</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '1.5rem' }}>🚫</span>
                        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>No Added Sugar / Preservatives</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '1.5rem' }}>🚚</span>
                        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Free Shipping over ₹999 / $40</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '1.5rem' }}>🛡️</span>
                        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>FSSAI & UDYAM Certified</span>
                    </div>
                </div>
            </section>

            {/* Section 1: About Mangalam Healthy Foods */}
            <section className="about-narrative-section" id="about-mangalam" style={{ padding: '80px 0', background: 'rgba(255, 255, 255, 0.25)', borderTop: '1px solid rgba(7, 56, 32, 0.05)', borderBottom: '1px solid rgba(7, 56, 32, 0.05)' }}>
                <div className="container" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px', alignItems: 'center' }}>
                    <div className="narrative-content">
                        <span className="section-subtitle">OUR HERITAGE</span>
                        <h2>About Mangalam Healthy Foods</h2>
                        <p>
                            Based in Sethiyathope, Cuddalore, <strong>Mangalam Healthy Foods</strong> is dedicated to bringing pure, traditional, and science-backed nutrition to your family. Our signature blend, <strong>Amutham Sprouted Health Mix</strong>, is built upon generations of food wisdom.
                        </p>
                        <p>
                            We select high-potency ancient grains, legumes, and millets—such as Pearl Millet (Kambu), Finger Millet (Ragi), and Sorghum (Cholam). We sprout and process them under hygienic clinical conditions, enriching them with cardamoms for digestive comfort and premium aroma.
                        </p>
                        <button onClick={() => setPage('about')} className="btn btn-secondary" style={{ marginTop: '20px' }}>
                            Read Our Story
                        </button>
                    </div>
                    <div>
                        {/* Showcase beautiful sprouted grain image */}
                        <img 
                            src="about_sprouts.png" 
                            alt="Mangalam Amutham Sprouted Grains and Ingredients" 
                            style={{ borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-premium)', width: '100%' }}
                        />
                    </div>
                </div>
            </section>

            {/* Section 2: Why Choose Mangalam? (Sprout Bioavailability & Nutrition) */}
            <section className="features-section" id="why-choose-mangalam" style={{ padding: '80px 0', margin: '0' }}>
                <div className="container">
                    <div className="section-header">
                        <span className="section-subtitle">WHY CHOOSE US</span>
                        <h2 className="section-title">The Power of Sprout-Activation</h2>
                        <p className="section-description">Unsprouted grains contain anti-nutrients like phytic acid. Mangalam sprouts every millet to unlock maximum digestibility and mineral bio-uptake.</p>
                    </div>
                    
                    <div className="features-grid">
                        <div className="feature-item">
                            <div className="feature-icon-wrapper">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                                </svg>
                            </div>
                            <div className="feature-text">
                                <h3>High Bioavailability</h3>
                                <p>Soak-sprouting triggers enzymes that digest complex starches and eliminate anti-nutrients completely.</p>
                            </div>
                        </div>
                        
                        <div className="feature-item">
                            <div className="feature-icon-wrapper">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                                </svg>
                            </div>
                            <div className="feature-text">
                                <h3>15.6% Pure Protein</h3>
                                <p>Loaded with roasted gram, green gram, and wheat yielding 15.6g protein and 5.6g dietary fiber per 100g.</p>
                            </div>
                        </div>
                        
                        <div className="feature-item">
                            <div className="feature-icon-wrapper">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                                </svg>
                            </div>
                            <div className="feature-text">
                                <h3>Registered Certification</h3>
                                <p>Fully certified with FSSAI registration (No: 12423028000746) and UDYAM-TN-04-0125789 for purity assurance.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Section 3: Our Products (Interactive Tab Showcase) */}
            <section className="rituals-section" id="our-products" style={{ background: 'var(--bg-glass)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', borderTop: '1px solid rgba(255, 255, 255, 0.25)', borderBottom: '1px solid rgba(255, 255, 255, 0.25)' }}>
                <div className="container">
                    <div className="section-header">
                        <span className="section-subtitle">OUR PRODUCTS</span>
                        <h2 className="section-title">Amutham Sprouted Health Mix</h2>
                        <p className="section-description">Available in dynamic packs to fit your lifestyle. Formulated with 9 premium sprouted grains, seeds, and aromatic cardamom.</p>
                    </div>
                    
                    <div className="tabs-nav">
                        <button 
                            className={`tab-btn ${activeTab === '300g' ? 'active' : ''}`}
                            onClick={() => { setActiveTab('300g'); setPurchaseOption('one-time'); }}
                        >
                            300g Starter Pouch
                        </button>
                        <button 
                            className={`tab-btn ${activeTab === '1kg' ? 'active' : ''}`}
                            onClick={() => { setActiveTab('1kg'); setPurchaseOption('one-time'); }}
                        >
                            1kg Family Value Pack
                        </button>
                        <button 
                            className={`tab-btn ${activeTab === 'premium' ? 'active' : ''}`}
                            onClick={() => { setActiveTab('premium'); setPurchaseOption('one-time'); }}
                        >
                            500g Premium Cardamom
                        </button>
                    </div>
                    
                    <div className="tabs-content">
                        {activeTab === '300g' && (
                            <div className="tab-panel">
                                <div className="panel-grid">
                                    <div className="panel-image-container">
                                        <img src="refence image/image.png" alt="Amutham Sprouted Health Mix 300g Pouch" className="panel-image" onClick={() => onProductView('300g')} style={{ cursor: 'pointer' }} />
                                    </div>
                                    <div className="panel-details">
                                        <div className="panel-badge">Flagship Product</div>
                                        <h3 onClick={() => onProductView('300g')} style={{ cursor: 'pointer' }}>Amutham Sprouted Health Mix (300g)</h3>
                                        <p className="panel-lead">The perfect trial size pouch. High-protein sprouted ancient grain formulation enriched with cardamom.</p>
                                        
                                        <div className="benefits-checklist" style={{ marginBottom: '24px' }}>
                                            <div className="benefit-item">
                                                <svg className="check-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                                    <polyline points="20 6 9 17 4 12"></polyline>
                                                </svg>
                                                <span>Contains Finger Millet, Pearl Millet, Sorghum, and legumes.</span>
                                            </div>
                                            <div className="benefit-item">
                                                <svg className="check-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                                    <polyline points="20 6 9 17 4 12"></polyline>
                                                </svg>
                                                <span>Bilingual Tamil/English preparation method printed on back.</span>
                                            </div>
                                        </div>
                                        
                                        <div className="panel-ingredients-tag" style={{ borderTop: '1px solid rgba(7, 56, 32, 0.08)', paddingTop: '15px', marginBottom: '20px' }}>
                                            <strong>Ingredients:</strong> Pearl Millet, Finger Millet, Sorghum, Bengal Gram, Black Gram, Green Gram, Wheat, Roasted Gram, Cardamom.
                                        </div>

                                        {/* Purchase Options */}
                                        <div className="purchase-options" style={{ marginBottom: '24px', width: '100%', maxWidth: '420px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                            <div 
                                                className={`purchase-option-card ${purchaseOption === 'subscribe' ? 'active' : ''}`}
                                                onClick={() => setPurchaseOption('subscribe')}
                                                style={{ padding: '12px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', borderRadius: '12px', border: purchaseOption === 'subscribe' ? '2px solid var(--color-primary)' : '1px solid rgba(7, 56, 32, 0.08)', background: '#fff' }}
                                            >
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    <div style={{ width: '16px', height: '16px', borderRadius: '50%', border: purchaseOption === 'subscribe' ? '5px solid var(--color-primary)' : '2px solid var(--color-accent-gold)', boxSizing: 'border-box' }}></div>
                                                    <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
                                                        <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--color-primary)' }}>Subscribe & Save 10%</span>
                                                        <span style={{ fontSize: '0.7rem', color: '#646a66' }}>Monthly delivery</span>
                                                    </div>
                                                </div>
                                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', textAlign: 'right' }}>
                                                    <span style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--color-primary)' }}>$10.80</span>
                                                    <span style={{ fontSize: '0.7rem', color: '#646a66' }}>₹449.00</span>
                                                </div>
                                            </div>

                                            <div 
                                                className={`purchase-option-card ${purchaseOption === 'one-time' ? 'active' : ''}`}
                                                onClick={() => setPurchaseOption('one-time')}
                                                style={{ padding: '12px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', borderRadius: '12px', border: purchaseOption === 'one-time' ? '2px solid var(--color-primary)' : '1px solid rgba(7, 56, 32, 0.08)', background: '#fff' }}
                                            >
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    <div style={{ width: '16px', height: '16px', borderRadius: '50%', border: purchaseOption === 'one-time' ? '5px solid var(--color-primary)' : '2px solid var(--color-accent-gold)', boxSizing: 'border-box' }}></div>
                                                    <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
                                                        <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--color-primary)' }}>One-Time Purchase</span>
                                                        <span style={{ fontSize: '0.7rem', color: '#646a66' }}>Single shipment</span>
                                                    </div>
                                                </div>
                                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', textAlign: 'right' }}>
                                                    <span style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--color-primary)' }}>$12.00</span>
                                                    <span style={{ fontSize: '0.7rem', color: '#646a66' }}>₹499.00</span>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="panel-purchase-block" style={{ display: 'block' }}>
                                            <button 
                                                className="btn btn-primary add-to-cart-btn"
                                                onClick={() => onAddToCart('300g', 'Amutham Sprouted Health Mix (300g)', purchaseOption === 'subscribe' ? 10.80 : 12.00, purchaseOption, 1)}
                                                style={{ width: '100%', maxWidth: '420px', padding: '16px 24px' }}
                                            >
                                                Add to Cart
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === '1kg' && (
                            <div className="tab-panel">
                                <div className="panel-grid">
                                    <div className="panel-image-container">
                                        <img src="refence image/image.png" alt="Amutham Sprouted Health Mix 1kg Family Pack" className="panel-image" style={{ filter: 'hue-rotate(25deg) saturate(1.15)', cursor: 'pointer' }} onClick={() => onProductView('1kg')} />
                                    </div>
                                    <div className="panel-details">
                                        <div className="panel-badge">Family Value</div>
                                        <h3 onClick={() => onProductView('1kg')} style={{ cursor: 'pointer' }}>Amutham Family Pack (1kg)</h3>
                                        <p className="panel-lead">Sustain the health of your entire family with our bulk value pack. High fiber, nutrient dense.</p>
                                        
                                        <div className="benefits-checklist" style={{ marginBottom: '24px' }}>
                                            <div className="benefit-item">
                                                <svg className="check-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                                    <polyline points="20 6 9 17 4 12"></polyline>
                                                </svg>
                                                <span>Offers substantial savings for daily family porridge routines.</span>
                                            </div>
                                            <div className="benefit-item">
                                                <svg className="check-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                                    <polyline points="20 6 9 17 4 12"></polyline>
                                                </svg>
                                                <span>Resealable bag maintains freshness and prevents humidity.</span>
                                            </div>
                                        </div>
                                        
                                        <div className="panel-ingredients-tag" style={{ borderTop: '1px solid rgba(7, 56, 32, 0.08)', paddingTop: '15px', marginBottom: '20px' }}>
                                            <strong>Ingredients:</strong> Pearl Millet, Finger Millet, Sorghum, Bengal Gram, Black Gram, Green Gram, Wheat, Roasted Gram, Cardamom.
                                        </div>

                                        {/* Purchase Options */}
                                        <div className="purchase-options" style={{ marginBottom: '24px', width: '100%', maxWidth: '420px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                            <div 
                                                className={`purchase-option-card ${purchaseOption === 'subscribe' ? 'active' : ''}`}
                                                onClick={() => setPurchaseOption('subscribe')}
                                                style={{ padding: '12px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', borderRadius: '12px', border: purchaseOption === 'subscribe' ? '2px solid var(--color-primary)' : '1px solid rgba(7, 56, 32, 0.08)', background: '#fff' }}
                                            >
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    <div style={{ width: '16px', height: '16px', borderRadius: '50%', border: purchaseOption === 'subscribe' ? '5px solid var(--color-primary)' : '2px solid var(--color-accent-gold)', boxSizing: 'border-box' }}></div>
                                                    <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
                                                        <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--color-primary)' }}>Subscribe & Save 10%</span>
                                                        <span style={{ fontSize: '0.7rem', color: '#646a66' }}>Monthly delivery</span>
                                                    </div>
                                                </div>
                                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', textAlign: 'right' }}>
                                                    <span style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--color-primary)' }}>$28.80</span>
                                                    <span style={{ fontSize: '0.7rem', color: '#646a66' }}>₹1,169.00</span>
                                                </div>
                                            </div>

                                            <div 
                                                className={`purchase-option-card ${purchaseOption === 'one-time' ? 'active' : ''}`}
                                                onClick={() => setPurchaseOption('one-time')}
                                                style={{ padding: '12px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', borderRadius: '12px', border: purchaseOption === 'one-time' ? '2px solid var(--color-primary)' : '1px solid rgba(7, 56, 32, 0.08)', background: '#fff' }}
                                            >
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    <div style={{ width: '16px', height: '16px', borderRadius: '50%', border: purchaseOption === 'one-time' ? '5px solid var(--color-primary)' : '2px solid var(--color-accent-gold)', boxSizing: 'border-box' }}></div>
                                                    <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
                                                        <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--color-primary)' }}>One-Time Purchase</span>
                                                        <span style={{ fontSize: '0.7rem', color: '#646a66' }}>Single shipment</span>
                                                    </div>
                                                </div>
                                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', textAlign: 'right' }}>
                                                    <span style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--color-primary)' }}>$32.00</span>
                                                    <span style={{ fontSize: '0.7rem', color: '#646a66' }}>₹1,299.00</span>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="panel-purchase-block" style={{ display: 'block' }}>
                                            <button 
                                                className="btn btn-primary add-to-cart-btn"
                                                onClick={() => onAddToCart('1kg', 'Amutham Family Pack (1kg)', purchaseOption === 'subscribe' ? 28.80 : 32.00, purchaseOption, 1)}
                                                style={{ width: '100%', maxWidth: '420px', padding: '16px 24px' }}
                                            >
                                                Add to Cart
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'premium' && (
                            <div className="tab-panel">
                                <div className="panel-grid">
                                    <div className="panel-image-container">
                                        <img src="refence image/image.png" alt="Amutham Premium Cardamom Elixir 500g" className="panel-image" style={{ filter: 'hue-rotate(185deg) brightness(0.9)', cursor: 'pointer' }} onClick={() => onProductView('premium')} />
                                    </div>
                                    <div className="panel-details">
                                        <div className="panel-badge">Aromatic Elixir</div>
                                        <h3 onClick={() => onProductView('premium')} style={{ cursor: 'pointer' }}>Amutham Cardamom Premium (500g)</h3>
                                        <p className="panel-lead">Infused with a double concentration of handpicked green cardamom from organic gardens for unmatched digestive wellness.</p>
                                        
                                        <div className="benefits-checklist" style={{ marginBottom: '24px' }}>
                                            <div className="benefit-item">
                                                <svg className="check-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                                    <polyline points="20 6 9 17 4 12"></polyline>
                                                </svg>
                                                <span>Aromatic spice helps calm digestive tracts and balances pH.</span>
                                            </div>
                                            <div className="benefit-item">
                                                <svg className="check-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                                    <polyline points="20 6 9 17 4 12"></polyline>
                                                </svg>
                                                <span>Sprouted grains facilitate cell-restorative recovery.</span>
                                            </div>
                                        </div>
                                        
                                        <div className="panel-ingredients-tag" style={{ borderTop: '1px solid rgba(7, 56, 32, 0.08)', paddingTop: '15px', marginBottom: '20px' }}>
                                            <strong>Ingredients:</strong> Pearl Millet, Finger Millet, Sorghum, Legumes, Infused Double Cardamom Extract.
                                        </div>

                                        {/* Purchase Options */}
                                        <div className="purchase-options" style={{ marginBottom: '24px', width: '100%', maxWidth: '420px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                            <div 
                                                className={`purchase-option-card ${purchaseOption === 'subscribe' ? 'active' : ''}`}
                                                onClick={() => setPurchaseOption('subscribe')}
                                                style={{ padding: '12px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', borderRadius: '12px', border: purchaseOption === 'subscribe' ? '2px solid var(--color-primary)' : '1px solid rgba(7, 56, 32, 0.08)', background: '#fff' }}
                                            >
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    <div style={{ width: '16px', height: '16px', borderRadius: '50%', border: purchaseOption === 'subscribe' ? '5px solid var(--color-primary)' : '2px solid var(--color-accent-gold)', boxSizing: 'border-box' }}></div>
                                                    <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
                                                        <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--color-primary)' }}>Subscribe & Save 10%</span>
                                                        <span style={{ fontSize: '0.7rem', color: '#646a66' }}>Monthly delivery</span>
                                                    </div>
                                                </div>
                                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', textAlign: 'right' }}>
                                                    <span style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--color-primary)' }}>$19.80</span>
                                                    <span style={{ fontSize: '0.7rem', color: '#646a66' }}>₹809.00</span>
                                                </div>
                                            </div>

                                            <div 
                                                className={`purchase-option-card ${purchaseOption === 'one-time' ? 'active' : ''}`}
                                                onClick={() => setPurchaseOption('one-time')}
                                                style={{ padding: '12px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', borderRadius: '12px', border: purchaseOption === 'one-time' ? '2px solid var(--color-primary)' : '1px solid rgba(7, 56, 32, 0.08)', background: '#fff' }}
                                            >
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    <div style={{ width: '16px', height: '16px', borderRadius: '50%', border: purchaseOption === 'one-time' ? '5px solid var(--color-primary)' : '2px solid var(--color-accent-gold)', boxSizing: 'border-box' }}></div>
                                                    <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
                                                        <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--color-primary)' }}>One-Time Purchase</span>
                                                        <span style={{ fontSize: '0.7rem', color: '#646a66' }}>Single shipment</span>
                                                    </div>
                                                </div>
                                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', textAlign: 'right' }}>
                                                    <span style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--color-primary)' }}>$22.00</span>
                                                    <span style={{ fontSize: '0.7rem', color: '#646a66' }}>₹899.00</span>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="panel-purchase-block" style={{ display: 'block' }}>
                                            <button 
                                                className="btn btn-primary add-to-cart-btn"
                                                onClick={() => onAddToCart('premium', 'Amutham Cardamom Premium (500g)', purchaseOption === 'subscribe' ? 19.80 : 22.00, purchaseOption, 1)}
                                                style={{ width: '100%', maxWidth: '420px', padding: '16px 24px' }}
                                            >
                                                Add to Cart
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* Section 4: Customer Reviews (Premium reviews grid) */}
            <section className="testimonials-section" id="customer-reviews">
                <div className="container">
                    <div className="testimonials-wrapper">
                        <div className="testimonial-quote-icon">“</div>
                        <div className="testimonial-slider">
                            <div className="testimonial-slide active">
                                <p className="testimonial-text">
                                    "Amutham Sprouted Health Mix has become an integral part of my family's breakfast. It digests so easily compared to unsprouted mixes, and the subtle cardamom aroma is wonderful. Knowing it comes directly from Sethiyathope, Cuddalore gives me total peace of mind regarding purity."
                                </p>
                                <div className="testimonial-author">
                                    <span className="author-name">Anjali Sundar</span>
                                    <span className="author-title">Verified Customer & Mother of Two</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Section 5: Get In Touch (Contact form & address details) */}
            <section className="newsletter-section" id="get-in-touch" style={{ padding: '80px 0' }}>
                <div className="container" style={{ display: 'grid', gridTemplateColumns: '0.9fr 1.1fr', gap: '60px', alignItems: 'flex-start' }}>
                    
                    {/* Left: Contact Info details */}
                    <div style={{ textAlign: 'left' }}>
                        <span className="section-subtitle">GET IN TOUCH</span>
                        <h2 style={{ fontSize: '2.5rem', marginBottom: '24px' }}>Connect with Us</h2>
                        <p style={{ marginBottom: '32px', fontSize: '1.05rem', color: '#646a66' }}>
                            Have questions about our sprouted blends, delivery schedules, or bulk ordering? We'd love to hear from you.
                        </p>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                                <div className="feature-icon-wrapper" style={{ width: '40px', height: '40px' }}>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                                    </svg>
                                </div>
                                <div>
                                    <h4 style={{ fontFamily: 'var(--font-sans)', fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-primary)' }}>Phone Helpline</h4>
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
                                    <h4 style={{ fontFamily: 'var(--font-sans)', fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-primary)' }}>Email Address</h4>
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
                                    <h4 style={{ fontFamily: 'var(--font-sans)', fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-primary)' }}>Factory Address</h4>
                                    <p style={{ fontSize: '0.85rem', lineHeight: '1.4' }}>
                                        No-18, Mettu st, Sethiyathope,<br />
                                        Bhuvanagiri taluk, Cuddalore District,<br />
                                        Tamil Nadu, India - 608702.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Contact Form */}
                    <div className="newsletter-wrapper" style={{ width: '100%', padding: '40px', textAlign: 'left' }}>
                        <h3 style={{ fontSize: '1.75rem', marginBottom: '20px' }}>Send us a Message</h3>
                        
                        {!contactSubmitted ? (
                            <form onSubmit={handleContactSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                    <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Your Name</label>
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
