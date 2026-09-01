import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useBranding } from '../context/BrandingContext';

export default function Footer({ setPage }) {
    const { t } = useLanguage();
    const { branding } = useBranding();

    const footerLogo = branding?.logo_dark || branding?.logo_full || '/mangalam_logo.png';
    const footerCopyright = branding?.footer_text || t('copyrightText');
    const [email, setEmail] = useState('');
    const [subscribed, setSubscribed] = useState(false);

    const handleSubscribe = (e) => {
        e.preventDefault();
        if (email.trim()) {
            setSubscribed(true);
            setEmail('');
        }
    };

    return (
        <footer className="main-footer-wavy">
            
            {/* Top Organic Wave Divider & Mascot */}
            <div className="footer-wave-container">
                <svg className="footer-wave-svg" viewBox="0 0 1440 120" preserveAspectRatio="none">
                    <path d="M0,40 C320,90 480,10 720,50 C960,90 1120,20 1440,60 L1440,120 L0,120 Z" fill="#f7f5ea"></path>
                </svg>

                {/* Sprout Grain Mascot illustration popping over center wave curve */}
                <div className="footer-mascot-wrapper">
                    <div className="sprout-mascot-card">
                        <svg width="48" height="48" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M42,70 C24,66 22,44 36,32 C27,42 29,62 42,70 Z" fill="#2c7844" />
                            <path d="M32,74 C10,65 14,38 28,24 C16,36 20,60 32,74 Z" fill="#1b5a2f" />
                            <path d="M58,70 C76,66 78,44 64,32 C73,42 71,62 58,70 Z" fill="#2c7844" />
                            <path d="M68,74 C90,65 86,38 72,24 C84,36 80,60 68,74 Z" fill="#1b5a2f" />
                            <path d="M50,18 C46,24 46,32 50,38 C54,32 54,24 50,18 Z" fill="#e8ab10" />
                            <path d="M48,32 C41,34 37,41 41,48 C46,47 48,41 48,32 Z" fill="#f4b905" />
                            <path d="M52,32 C59,34 63,41 59,48 C54,47 52,41 52,32 Z" fill="#f4b905" />
                            <path d="M49,70 L51,70 L51,78 L49,78 Z" fill="#1b5a2f" />
                        </svg>
                    </div>
                </div>
            </div>

            {/* Footer Main Content */}
            <div className="footer-body">
                <div className="container">
                    <div className="footer-4col-grid">
                        
                        {/* Column 1: Brand & Origin */}
                        <div className="footer-col">
                            <button 
                                onClick={() => setPage('home')} 
                                className="footer-logo-btn"
                            >
                                <img src={footerLogo} alt={`${branding?.site_title || 'Mangalam Healthy Foods'} Logo`} style={{ height: '48px', mixBlendMode: 'multiply' }} onError={(e) => { e.target.src = '/mangalam_logo.png'; }} />
                            </button>
                            <p className="footer-desc" style={{ marginTop: '16px', fontSize: '0.88rem', color: '#646a66', lineHeight: '1.5' }}>
                                {t('footerSlogan')}
                            </p>
                            <div style={{ marginTop: '14px', fontSize: '0.8rem', color: '#646a66', lineHeight: '1.5' }}>
                                <strong>FSSAI Lic. No:</strong> 12423028000746<br />
                                <strong>UDYAM:</strong> UDYAM-TN-04-0125789
                            </div>
                        </div>

                        {/* Column 2: Shop & Explore */}
                        <div className="footer-col">
                            <h4 className="footer-col-title">{t('footerQuickLinks')}</h4>
                            <ul className="footer-links-list">
                                <li><button onClick={() => setPage('shop')}>{t('navProducts')}</button></li>
                                <li><button onClick={() => setPage('science')}>{t('navWhySprouted')}</button></li>
                                <li><button onClick={() => setPage('about')}>{t('navOurStory')}</button></li>
                            </ul>
                        </div>

                        {/* Column 3: Support & Legal */}
                        <div className="footer-col">
                            <h4 className="footer-col-title">{t('footerLegal')}</h4>
                            <ul className="footer-links-list">
                                <li><a href="#about-mangalam" onClick={() => setPage('about')}>Privacy Policy</a></li>
                                <li><a href="#about-mangalam" onClick={() => setPage('about')}>Shipping & Delivery</a></li>
                                <li><a href="#about-mangalam" onClick={() => setPage('about')}>Return & Refund</a></li>
                                <li><a href="#about-mangalam" onClick={() => setPage('about')}>Terms & Conditions</a></li>
                                <li>
                                    <button 
                                        onClick={() => {
                                            const el = document.getElementById('get-in-touch');
                                            if (el) el.scrollIntoView({ behavior: 'smooth' });
                                            else setPage('home');
                                        }}
                                    >
                                        Contact Helpline (+91 7094074655)
                                    </button>
                                </li>
                            </ul>
                        </div>

                        {/* Column 4: Newsletter & Socials */}
                        <div className="footer-col">
                            <h4 className="footer-col-title">{t('footerNewsletterTitle')}</h4>
                            <p style={{ fontSize: '0.85rem', color: '#646a66', marginBottom: '16px', lineHeight: '1.4' }}>
                                {t('footerNewsletterDesc')}
                            </p>

                            {!subscribed ? (
                                <form onSubmit={handleSubscribe} className="footer-pill-subscribe">
                                    <input 
                                        type="email" 
                                        placeholder="Enter e-mail id" 
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="pill-input"
                                    />
                                    <button type="submit" className="pill-submit-btn" aria-label="Subscribe">
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                            <polyline points="9 18 15 12 9 6"></polyline>
                                        </svg>
                                    </button>
                                </form>
                            ) : (
                                <div style={{ fontSize: '0.85rem', color: 'var(--color-primary)', fontWeight: 700, padding: '10px 0' }}>
                                    ✓ Thank you for subscribing!
                                </div>
                            )}

                            <div style={{ marginTop: '24px' }}>
                                <h5 style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-primary)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Socials</h5>
                                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                                    <a href="#" aria-label="Instagram" style={{ transition: 'transform 0.2s' }} title="Instagram">
                                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                                            <radialGradient id="rg" cx="30%" cy="107%" r="150%">
                                                <stop offset="0%" stopColor="#fdf497" />
                                                <stop offset="5%" stopColor="#fdf497" />
                                                <stop offset="45%" stopColor="#fd5949" />
                                                <stop offset="60%" stopColor="#d6249f" />
                                                <stop offset="90%" stopColor="#285AEB" />
                                            </radialGradient>
                                            <rect x="2" y="2" width="20" height="20" rx="5" fill="url(#rg)" />
                                            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" stroke="#ffffff" strokeWidth="1.8" fill="none" />
                                            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
                                        </svg>
                                    </a>
                                    <a href="#" aria-label="Facebook" style={{ transition: 'transform 0.2s' }} title="Facebook">
                                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                                            <circle cx="12" cy="12" r="10" fill="#1877F2" />
                                            <path d="M15 8h-2a1 1 0 0 0-1 1v2h3l-.5 3H12v7H9v-7H7v-3h2V9a3 3 0 0 1 3-3h3v2z" fill="#ffffff" />
                                        </svg>
                                    </a>
                                    <a href="#" aria-label="LinkedIn" style={{ transition: 'transform 0.2s' }} title="LinkedIn">
                                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                                            <rect x="2" y="2" width="20" height="20" rx="4" fill="#0A66C2" />
                                            <path d="M8 19H5V9h3v10zM6.5 7.7a1.75 1.75 0 1 1 0-3.5 1.75 1.75 0 0 1 0 3.5zM19 19h-3v-5.5c0-1.5-.6-2.5-1.8-2.5-1 0-1.6.7-1.9 1.4-.1.3-.1.7-.1 1.1V19H9.2s.04-9 0-10h3v1.4c.4-.6 1.1-1.5 2.7-1.5 2 0 3.5 1.3 3.5 4.1V19z" fill="#ffffff" />
                                        </svg>
                                    </a>
                                </div>
                            </div>

                        </div>

                    </div>

                    {/* Bottom Legal & Disclaimer Bar */}
                    <div className="footer-wavy-bottom">
                        <div className="fda-disclaimer">
                            * These statements have not been evaluated by FSSAI or FDA. Amutham Sprouted Health Mix is formulated for general family dietary wellness.
                        </div>
                        <div className="copyright">
                            {t('copyrightText')}
                        </div>
                    </div>
                </div>
            </div>

        </footer>
    );
}

