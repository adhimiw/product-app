import React from 'react';

export default function About({ setPage }) {
    return (
        <main className="about-page">
            <div className="container">
                
                {/* Brand Story narrative */}
                <div className="about-narrative">
                    <div className="narrative-content">
                        <span className="section-subtitle">OUR MISSION</span>
                        <h2>Bridging Traditional Wisdom and Clean Nutrition</h2>
                        <p>
                            Based in Sethiyathope, Cuddalore District, <strong>Mangalam Healthy Foods</strong> was established with a singular mission: to provide families with wholesome, chemical-free, and bioavailable nutrition derived from ancient grains.
                        </p>
                        <p>
                            We specialize in soak-sprouting activation. Sprouting is a natural germination process that degrades anti-nutrients (phytic acid), making key minerals like Calcium, Iron, Zinc, and Magnesium easy to digest and absorb. We enrich our porridges with organic cardamom, creating a comforting, aromatic experience.
                        </p>
                        <button onClick={() => setPage('shop')} className="btn btn-primary" style={{ marginTop: '20px' }}>
                            Explore Our Products
                        </button>
                    </div>
                    <div>
                        <img 
                            src="about_sprouts.png" 
                            alt="Mangalam Sourcing and Quality Standards" 
                            style={{ borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-premium)', width: '100%' }}
                        />
                    </div>
                </div>

                {/* Sourcing Standards Cards */}
                <div style={{ borderTop: '1px solid rgba(7, 56, 32, 0.08)', paddingTop: '60px' }}>
                    <div style={{ textAlign: 'center', marginBottom: '60px' }}>
                        <span className="section-subtitle">THE STANDARD</span>
                        <h2>Our Sourcing & Purity Commitments</h2>
                    </div>
                    
                    <div className="purity-grid" style={{ marginTop: '0' }}>
                        <div className="purity-card">
                            <h3>Sprout-Activated Grains</h3>
                            <p>We soak and sprout Pearl Millet (Kambu), Finger Millet (Ragi), Sorghum (Cholam), and legumes to optimize nutrient accessibility and digestion.</p>
                        </div>

                        <div className="purity-card">
                            <h3>100% Chemical-Free</h3>
                            <p>Zero artificial binders, chemical preservatives, or refined sugar. We rely solely on the pure energy profile of activated grains.</p>
                        </div>

                        <div className="purity-card">
                            <h3>Certified & Safe</h3>
                            <p>Manufactured under strict sanitary guidelines in Sethiyathope, fully certified under FSSAI Registration No: 12423028000746.</p>
                        </div>
                    </div>
                </div>

            </div>
        </main>
    );
}
