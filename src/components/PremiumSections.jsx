import { clickable } from '../clickable';

/* =====================================================================
   LUXURY PODIUM SHOWCASE
   High-end product showcase. Uses the autumn "harvest podium" asset as a
   premium pedestal with the product floating above it (liquid glass stage).
   ===================================================================== */
export function LuxuryShowcase({ onProductView, onAddToCart }) {
    return (
        <section className="podium-showcase" id="signature-showcase">
            <div className="container">
                <div className="podium-grid">
                    <div className="podium-copy">
                        <span className="eyebrow-gold">Our Traditional Taste</span>
                        <h2>Amutham Sprouted Health Mix — wholesome nutrition for your family.</h2>
                        <p className="podium-lead">
                            Nine sprout-activated ancient grains and legumes, hand-finished with green cardamom.
                            Prepared with traditional methods, no chemicals, no preservatives — 100% natural.
                        </p>

                        <div className="podium-feature-list">
                            <div className="podium-feature">
                                <span className="podium-feature-icon" aria-hidden="true">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                                    </svg>
                                </span>
                                <span className="podium-feature-text">
                                    <strong>3× mineral bioavailability</strong>
                                    <span>Sprout-activation neutralises phytic acid for true absorption.</span>
                                </span>
                            </div>
                            <div className="podium-feature">
                                <span className="podium-feature-icon" aria-hidden="true">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                                    </svg>
                                </span>
                                <span className="podium-feature-text">
                                    <strong>15.6g protein &middot; 5.6g fibre</strong>
                                    <span>Per 100g — sustained energy without added sugar.</span>
                                </span>
                            </div>
                            <div className="podium-feature">
                                <span className="podium-feature-icon" aria-hidden="true">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                    </svg>
                                </span>
                                <span className="podium-feature-text">
                                    <strong>FSSAI &amp; UDYAM certified</strong>
                                    <span>Processed under hygienic conditions. GSTIN: 33FDAPM8867B1ZI.</span>
                                </span>
                            </div>
                        </div>

                        <div className="hero-actions">
                            <button type="button"
                                className="btn btn-primary"
                                onClick={() => onAddToCart('health-mix-300g', 'Amutham Sprouted Health Mix (300g)', 110, 'one-time', 1)}
                            >
                                <span>Add Health Mix — ₹110</span>
                                <svg className="btn-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="5" y1="12" x2="19" y2="12" />
                                    <polyline points="12 5 19 12 12 19" />
                                </svg>
                            </button>
                            <button type="button" className="btn btn-text" onClick={() => onProductView('health-mix-300g')}>
                                View full details
                            </button>
                        </div>
                    </div>

                    <div className="podium-stage liquid-glass">
                        <img
                            src="assets/images/autumn_podium.webp"
                            alt="Seasonal harvest display podium"
                            className="podium-stage-bg"
                            loading="lazy"
                            decoding="async"
                        />
                        <img
                            src="refence image/image.webp"
                            alt="Amutham Sprouted Health Mix pouch on display"
                            className="podium-product"
                            loading="lazy"
                            decoding="async"
                            {...clickable(() => onProductView('health-mix-300g'))}
                            style={{ cursor: 'pointer' }}
                        />
                        <div className="podium-price-tag liquid-glass">
                            <span className="pp-label">From</span>
                            <span className="pp-value">₹110</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

/* =====================================================================
   PREMIUM BRAND VALUES
   ===================================================================== */
const VALUES = [
    {
        index: '01',
        title: 'Rooted Heritage',
        desc: 'For over 20 years, our sprouted health mix was prepared only at home for family. In 2019, we began sharing it with our community.',
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 21h18M5 21V7l8-4v18M19 21V11l-6-4" />
            </svg>
        ),
    },
    {
        index: '02',
        title: 'Uncompromised Purity',
        desc: 'No chemicals, no preservatives, no shortcuts. Only whole sprouted grains, legumes and cardamom.',
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <polyline points="9 12 11 14 15 10" />
            </svg>
        ),
    },
    {
        index: '03',
        title: 'Backed by Science',
        desc: 'Sprout-activation is measured, not marketed — unlocking digestibility and real mineral uptake.',
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 3h6M10 3v6.5L5.5 17a2 2 0 0 0 1.8 3h9.4a2 2 0 0 0 1.8-3L14 9.5V3" />
            </svg>
        ),
    },
    {
        index: '04',
        title: 'Made with Love',
        desc: 'We serve with love and transparency. Every batch is prepared using traditional methods that preserve real nutritious values.',
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a9 9 0 0 0-9 9c0 5 9 11 9 11s9-6 9-11a9 9 0 0 0-9-9z" />
                <path d="M12 7v5M9.5 9.5h5" />
            </svg>
        ),
    },
];

export function BrandValues() {
    return (
        <section className="values-section" id="brand-values">
            <div className="container">
                <div className="section-header">
                    <span className="eyebrow-gold" style={{ justifyContent: 'center' }}>Our Promise</span>
                    <h2 className="section-title">Values you can taste</h2>
                    <p className="section-description">
                        Every pouch of Amutham carries four commitments — the same ones we hold for our own family.
                    </p>
                </div>

                <div className="values-grid">
                    {VALUES.map((v) => (
                        <article key={v.index} className="value-card liquid-glass">
                            <span className="value-icon" aria-hidden="true">{v.icon}</span>
                            <span className="value-index">{v.index}</span>
                            <h3>{v.title}</h3>
                            <p>{v.desc}</p>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}

/* =====================================================================
   BRAND STORY  (scroll storytelling chapters)
   Uses the marketing/branding illustration asset framed in glass.
   ===================================================================== */
export function BrandStory({ setPage }) {
    return (
        <section className="story-section" id="brand-story">
            <div className="container">
                <div className="story-grid">
                    <div className="story-visual liquid-glass">
                        <img
                            src="assets/images/marketing_branding.webp"
                            alt="Building a trusted, family-loved health brand"
                            loading="lazy"
                            decoding="async"
                        />
                        <div className="story-visual-badge liquid-glass">
                            <span className="sb-stat">20+ Years</span>
                            <span className="sb-label">of traditional recipe, now shared with the world</span>
                        </div>
                    </div>

                    <div className="story-copy">
                        <span className="eyebrow-gold">Our Story</span>
                        <h2>From a home kitchen to Mangalam Health Foods.</h2>

                        <div className="story-chapter">
                            <span className="story-chapter-num">1</span>
                            <div>
                                <h4>The homemade tradition</h4>
                                <p>For more than 20 years, Amutham Sprouted Health Mix was prepared only at home and shared with family, neighbors, and relatives. Everyone enjoyed better health and energy.</p>
                            </div>
                        </div>
                        <div className="story-chapter">
                            <span className="story-chapter-num">2</span>
                            <div>
                                <h4>The journey begins (2019)</h4>
                                <p>In 2019, the love and trust of our people encouraged us to take the next step. What began as a homemade mix became a small business, and our community proudly called us business women.</p>
                            </div>
                        </div>
                        <div className="story-chapter">
                            <span className="story-chapter-num">3</span>
                            <div>
                                <h4>Mangalam Health Foods Company</h4>
                                <p>With all your blessings, our journey has grown into Mangalam Health Foods Company — continuing the same tradition with care and honesty, bringing health to more families.</p>
                            </div>
                        </div>

                        <button type="button" onClick={() => setPage('about')} className="btn btn-secondary" style={{ marginTop: '28px' }}>
                            Read the full story
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}
