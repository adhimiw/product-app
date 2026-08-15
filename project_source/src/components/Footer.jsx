import React from 'react';

export default function Footer({ setPage }) {
    return (
        <footer className="main-footer">
            <div className="container footer-container">
                <div className="footer-brand">
                    <button 
                        onClick={() => setPage('home')} 
                        className="logo" 
                        style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                    >
                        <svg width="36" height="36" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                            {/* Leaves */}
                            <path d="M42,70 C24,66 22,44 36,32 C27,42 29,62 42,70 Z" fill="#2c7844" />
                            <path d="M32,74 C10,65 14,38 28,24 C16,36 20,60 32,74 Z" fill="#1b5a2f" />
                            <path d="M58,70 C76,66 78,44 64,32 C73,42 71,62 58,70 Z" fill="#2c7844" />
                            <path d="M68,74 C90,65 86,38 72,24 C84,36 80,60 68,74 Z" fill="#1b5a2f" />
                            {/* Gold Sprout Grains */}
                            <path d="M50,18 C46,24 46,32 50,38 C54,32 54,24 50,18 Z" fill="#e8ab10" />
                            <path d="M48,32 C41,34 37,41 41,48 C46,47 48,41 48,32 Z" fill="#f4b905" />
                            <path d="M52,32 C59,34 63,41 59,48 C54,47 52,41 52,32 Z" fill="#f4b905" />
                            <path d="M48,46 C41,48 37,55 41,62 C46,61 48,55 48,46 Z" fill="#f4b905" />
                            <path d="M52,46 C59,48 63,55 59,62 C54,61 52,55 52,46 Z" fill="#f4b905" />
                            {/* Base stem */}
                            <path d="M49,70 L51,70 L51,78 L49,78 Z" fill="#1b5a2f" />
                        </svg>
                        <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
                            <span className="logo-text" style={{ fontSize: '1.35rem', fontWeight: 800, letterSpacing: '0.03em', color: 'var(--color-primary)', lineHeight: '1.1' }}>MANGALAM</span>
                            <span className="logo-subtext" style={{ fontSize: '0.58rem', fontWeight: 700, letterSpacing: '0.22em', color: 'var(--color-accent-gold)', marginTop: '2px' }}>HEALTHY FOODS</span>
                        </div>
                    </button>
                    <p className="footer-tagline" style={{ marginTop: '16px', fontSize: '0.9rem', color: '#646a66' }}>
                        Sethiyathope, Cuddalore.<br />
                        Purity in sprouted ancient nutrition.
                    </p>
                    <p style={{ marginTop: '12px', fontSize: '0.8rem', color: '#646a66', lineHeight: '1.4' }}>
                        <strong>FSSAI Lic. No:</strong> 12423028000746<br />
                        <strong>UDYAM:</strong> UDYAM-TN-04-0125789
                    </p>
                </div>
                
                <div className="footer-links">
                    <div className="footer-column">
                        <h4>Contact Us</h4>
                        <span style={{ fontSize: '0.85rem', color: '#646a66' }}>
                            <strong>Phone:</strong> +91 7094074655
                        </span>
                        <span style={{ fontSize: '0.85rem', color: '#646a66' }}>
                            <strong>Email:</strong> mangalamhealthyfood@zohomail.in
                        </span>
                        <span style={{ fontSize: '0.85rem', color: '#646a66', lineHeight: '1.4' }}>
                            <strong>Address:</strong> No-18, Mettu st, Sethiyathope, Cuddalore District, Pin - 608702.
                        </span>
                    </div>
                    
                    <div className="footer-column">
                        <h4>Explore</h4>
                        <button onClick={() => setPage('shop')}>Our Products</button>
                        <button onClick={() => setPage('science')}>Why Sprouted?</button>
                        <button onClick={() => setPage('about')}>Our Story</button>
                    </div>

                    <div className="footer-column">
                        <h4>Legal</h4>
                        <a href="#">Privacy Policy</a>
                        <a href="#">Terms of Service</a>
                        <a href="#">FDA Disclosure</a>
                    </div>
                </div>
            </div>
            
            <div className="container footer-bottom">
                <div className="fda-disclaimer">
                    * These statements have not been evaluated by the Food and Drug Administration or FSSAI. This product is not intended to diagnose, treat, cure, or prevent any disease.
                </div>
                <div className="copyright">
                    &copy; 2026 Mangalam Healthy Foods. All rights reserved. Manufactured in India.
                </div>
            </div>
        </footer>
    );
}
