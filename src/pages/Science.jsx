import React, { useState } from 'react';

export default function Science({ setPage }) {
    const [activeAcc, setActiveAcc] = useState(0);

    const accordionData = [
        {
            num: '01',
            title: 'The Sprout-Activation Sequence',
            content: 'We soak ancient millet grains (Finger, Pearl, Sorghum) in pure water to trigger sprout activation. This naturally activates phytase, an enzyme that degrades phytic acid—a compound that binds minerals like Calcium and Iron and prevents absorption.'
        },
        {
            num: '02',
            title: 'Enzymatic Digestion of Complex Starches',
            content: 'Sprouting triggers amylase and protease enzymes, which pre-digest complex carbohydrates and proteins into simple amino acids and sugars. This increases cellular digestibility and eliminates digestive heaviness.'
        },
        {
            num: '03',
            title: 'Rich Mineral Enrichment',
            content: 'Due to phytic acid degradation, the bioavailability of trace minerals increases up to 300%. Our sprouted mix guarantees 99.7mg Calcium, 5.06mg Iron, 136.9mg Magnesium, and 2.63mg Zinc per 100g.'
        }
    ];

    return (
        <main className="science-page" style={{ paddingTop: 'calc(var(--header-height) + 40px)', paddingBottom: '80px' }}>
            <div className="container">
                
                {/* Science Hero Wrapper */}
                <div className="science-section" style={{ padding: '0 0 60px 0' }}>
                    <div className="science-wrapper">
                        <div className="science-info">
                            <span className="section-subtitle">THE SCIENCE</span>
                            <h1 className="science-page-h1">{t('scienceTitle') || 'The Bioavailability Breakthrough'}</h1>
                            <p className="science-lead">Standard health mixes contain unsprouted grains that carry phytic acid—an anti-nutrient that binds to minerals and prevents absorption. Mangalam bypasses this limitation entirely.</p>
                            
                            {/* React Accordion */}
                            <div className="accordion">
                                {accordionData.map((item, idx) => (
                                    <div 
                                        className={`accordion-item ${activeAcc === idx ? 'active' : ''}`}
                                        key={idx}
                                    >
                                        <button 
                                            className="accordion-trigger" 
                                            onClick={() => setActiveAcc(activeAcc === idx ? -1 : idx)}
                                            aria-expanded={activeAcc === idx}
                                        >
                                            <span>{item.num}. {item.title}</span>
                                            <span className="accordion-icon">+</span>
                                        </button>
                                        <div 
                                            className="accordion-content"
                                            style={{ maxHeight: activeAcc === idx ? '200px' : '0' }}
                                        >
                                            <p>{item.content}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        
                        <div className="science-visual">
                            <img src="science_sprouts.png" alt="Mangalam Sprouted Ingredients" className="science-image" />
                            <div className="science-overlay-card">
                                <div className="overlay-card-title">Enzymatic Vitality</div>
                                <div className="overlay-card-stat">+300%</div>
                                <div className="overlay-card-desc">Increase in mineral absorption compared to unsprouted grain flour.</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sourcing details */}
                <div style={{ marginTop: '80px', borderTop: '1px solid rgba(7, 56, 32, 0.08)', paddingTop: '60px' }}>
                    <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                        <span className="section-subtitle">CLINICAL VALUES</span>
                        <h2>Rigorous Standards. Pure Nutrition.</h2>
                    </div>
                    <div className="purity-grid" style={{ marginTop: '0' }}>
                        <div className="purity-card">
                            <h3>Sprouted Grains</h3>
                            <p>All grains are germinated to trigger enzymatic processes before vacuum drying and hygienic milling.</p>
                        </div>
                        <div className="purity-card">
                            <h3>100% Preservative Free</h3>
                            <p>No chemical preservatives, artificial colors, or refined sugar. Pure sprouted grains enriched with cardamom.</p>
                        </div>
                        <div className="purity-card">
                            <h3>Clean Processing</h3>
                            <p>Processed under sterile parameters in Sethiyathope, Cuddalore to guarantee supreme biological purity.</p>
                        </div>
                    </div>
                </div>

            </div>
        </main>
    );
}
