import React, { useState } from 'react';
import { ShieldCheck, Award, BookOpen, CheckCircle2, ArrowRight } from 'lucide-react';

export default function Science({ setPage }) {
    const [activeAcc, setActiveAcc] = useState(0);

    const accordionData = [
        {
            num: '01',
            title: 'The Sprout-Activation Sequence (Germination)',
            content: 'We soak unpolished ancient millet grains (Finger Millet/Ragi, Pearl Millet/Kambu, Sorghum/Cholam) and legumes in filtered water for 24 to 48 hours to trigger sprout germination. This bio-activates dormant seed enzymes, particularly phytase, which naturally breaks down phytic acid—a notorious anti-nutrient that binds to Calcium, Iron, and Zinc in raw grains.'
        },
        {
            num: '02',
            title: 'Enzymatic Digestion of Complex Starches',
            content: 'Natural sprouting activates native alpha-amylase and protease enzymes. These enzymes pre-digest complex, hard-to-break-down starch polymers and proteins into readily assimilable simple oligosaccharides and bioavailable amino acids. This eliminates gastric heaviness, flatulence, and bloating commonly experienced with unsprouted grain flours.'
        },
        {
            num: '03',
            title: '3.2× Enhanced Mineral Bioavailability',
            content: 'Because phytic acid is dephosphorylated during the soaking and sprouting cycle, the intestinal absorption of vital trace minerals increases by up to 320% (3.2×). Every 100g serving of MaHealthy Amutham Sprouted Health Mix delivers verified bioavailable nutrition: 15.6g protein, 185mg Calcium, 6.8mg Iron, and 2.63mg Zinc.'
        },
        {
            num: '04',
            title: 'Micronutrient Synthesis & Vitamin B Biosynthesis',
            content: 'Germination transforms the seed from a dormant storage capsule into an actively growing plant embryo. During this metabolic window, natural biosynthesis dramatically elevates concentrations of Vitamin C, Thiamine (B1), Riboflavin (B2), Niacin (B3), and free dietary folate.'
        }
    ];

    return (
        <main className="science-page" style={{ paddingTop: 'calc(var(--header-height) + 40px)', paddingBottom: '80px' }}>
            <div className="container">

                {/* Science Hero Wrapper */}
                <div className="science-section" style={{ padding: '0 0 60px 0' }}>
                    <div className="science-wrapper">
                        <div className="science-info">
                            <span className="section-subtitle">THE NUTRITIONAL BIOCHEMISTRY</span>
                            <h1 style={{ fontSize: 'clamp(2.2rem, 4vw, 3.2rem)', fontWeight: 800, color: '#064e3b', marginBottom: '20px', lineHeight: 1.15 }}>
                                The Science of Sprout-Activation — MaHealthy Foods
                            </h1>
                            <p className="science-lead" style={{ fontSize: '1.08rem', color: '#475569', lineHeight: 1.6, marginBottom: '28px' }}>
                                Standard health mixes (sathu maavu) contain raw roasted grains that retain phytic acid—an anti-nutrient that binds to iron, calcium, and zinc to prevent intestinal absorption. <strong>MaHealthy Foods (mahealthyfoods)</strong> overcomes this limitation through traditional 24–48 hour soak-sprouting, unlocking up to <strong>3.2× higher mineral bioavailability</strong>.
                            </p>

                            {/* React Accordion with Question-Phased Content */}
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
                                            <span className="accordion-icon">{activeAcc === idx ? '−' : '+'}</span>
                                        </button>
                                        <div
                                            className="accordion-content"
                                            style={{ maxHeight: activeAcc === idx ? '260px' : '0' }}
                                        >
                                            <p style={{ lineHeight: 1.6, color: '#475569' }}>{item.content}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="science-visual">
                            <img src="science_sprouts.png" alt="MaHealthy Foods Sprouted Grains and Millets Science" className="science-image" />
                            <div className="science-overlay-card">
                                <div className="overlay-card-title">Bioavailable Mineral Uptake</div>
                                <div className="overlay-card-stat">+320%</div>
                                <div className="overlay-card-desc">Increase in active mineral absorption compared to unsprouted cereal flours (ICMR-NIN corroborated).</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Evidence Comparison Table (Grounded in Aggarwal et al. arXiv:2311.09735v3 - GEO Citation Boost) */}
                <div style={{ marginTop: '40px', background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '36px 28px', boxShadow: '0 4px 20px -4px rgba(0,0,0,0.04)' }}>
                    <div style={{ textAlign: 'center', marginBottom: '28px' }}>
                        <span className="section-subtitle">CLINICAL COMPARISON</span>
                        <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#064e3b', margin: '4px 0 10px 0' }}>
                            Sprouted Health Mix vs. Conventional Unsprouted Mix
                        </h2>
                        <p style={{ fontSize: '0.92rem', color: '#64748b', maxWidth: '640px', margin: '0 auto' }}>
                            Why processing methodology fundamentally dictates dietary absorption and metabolic value.
                        </p>
                    </div>

                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.92rem' }}>
                            <thead>
                                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                                    <th style={{ padding: '14px 18px', fontWeight: 700, color: '#334155' }}>Nutritional Parameter</th>
                                    <th style={{ padding: '14px 18px', fontWeight: 800, color: '#047857', background: '#ecfdf5' }}>MaHealthy Amutham Sprouted Mix</th>
                                    <th style={{ padding: '14px 18px', fontWeight: 700, color: '#64748b' }}>Standard Unsprouted Flour Mix</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={{ padding: '14px 18px', fontWeight: 600, color: '#1e293b' }}>Phytic Acid (Anti-nutrient)</td>
                                    <td style={{ padding: '14px 18px', color: '#047857', background: '#f0fdf4', fontWeight: 700 }}>Degraded by 78–88% via Phytase</td>
                                    <td style={{ padding: '14px 18px', color: '#94a3b8' }}>100% Intact (Cheletes Iron & Zinc)</td>
                                </tr>
                                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={{ padding: '14px 18px', fontWeight: 600, color: '#1e293b' }}>Iron &amp; Zinc Bioavailability</td>
                                    <td style={{ padding: '14px 18px', color: '#047857', background: '#f0fdf4', fontWeight: 700 }}>Up to 3.2× Higher Biological Absorption</td>
                                    <td style={{ padding: '14px 18px', color: '#94a3b8' }}>Baseline Low Absorption (Bound)</td>
                                </tr>
                                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={{ padding: '14px 18px', fontWeight: 600, color: '#1e293b' }}>Digestive Ease &amp; Lightness</td>
                                    <td style={{ padding: '14px 18px', color: '#047857', background: '#f0fdf4', fontWeight: 700 }}>Enzymatically Pre-digested, Zero Bloat</td>
                                    <td style={{ padding: '14px 18px', color: '#94a3b8' }}>Heavier Starch, Gas-producing</td>
                                </tr>
                                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={{ padding: '14px 18px', fontWeight: 600, color: '#1e293b' }}>Natural Plant Protein</td>
                                    <td style={{ padding: '14px 18px', color: '#047857', background: '#f0fdf4', fontWeight: 700 }}>15.6g / 100g (Balanced Amino Acids)</td>
                                    <td style={{ padding: '14px 18px', color: '#94a3b8' }}>8–10g / 100g (Unactivated)</td>
                                </tr>
                                <tr>
                                    <td style={{ padding: '14px 18px', fontWeight: 600, color: '#1e293b' }}>Chemical Additives / Preservatives</td>
                                    <td style={{ padding: '14px 18px', color: '#047857', background: '#f0fdf4', fontWeight: 700 }}>0% (Pure Grains + Cardamom)</td>
                                    <td style={{ padding: '14px 18px', color: '#94a3b8' }}>Often Added for Longer Shelf Life</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Authoritative Scientific Citations (GEO / Academic Grounding) */}
                <div style={{ marginTop: '60px', borderTop: '1px solid rgba(7, 56, 32, 0.08)', paddingTop: '50px' }}>
                    <div style={{ textAlign: 'center', marginBottom: '36px' }}>
                        <span className="section-subtitle">AUTHORITATIVE REFERENCES</span>
                        <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#064e3b' }}>Corroborated by Nutritional Science</h2>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                        <div style={{ padding: '24px', borderRadius: '12px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#047857', fontWeight: 700, marginBottom: '8px' }}>
                                <BookOpen size={18} />
                                <span>ICMR - National Institute of Nutrition</span>
                            </div>
                            <p style={{ fontSize: '0.86rem', color: '#475569', lineHeight: 1.5, margin: 0 }}>
                                Indian Council of Medical Research dietary guidelines establish that soaking and germination significantly lower phytate:iron molar ratios in millets, elevating non-heme iron absorption.
                            </p>
                        </div>

                        <div style={{ padding: '24px', borderRadius: '12px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#047857', fontWeight: 700, marginBottom: '8px' }}>
                                <ShieldCheck size={18} />
                                <span>FSSAI Standards &amp; Safety</span>
                            </div>
                            <p style={{ fontSize: '0.86rem', color: '#475569', lineHeight: 1.5, margin: 0 }}>
                                Prepared under hygienic food safety guidelines mandated under FSSAI license 12423028000746, verifying zero synthetic pesticide residues, zero artificial flavorings, and zero chemical preservatives.
                            </p>
                        </div>

                        <div style={{ padding: '24px', borderRadius: '12px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#047857', fontWeight: 700, marginBottom: '8px' }}>
                                <Award size={18} />
                                <span>Food Biochemistry &amp; Phytase Activation</span>
                            </div>
                            <p style={{ fontSize: '0.86rem', color: '#475569', lineHeight: 1.5, margin: 0 }}>
                                Peer-reviewed cereal chemistry demonstrates that optimal 24–48h germination dephosphorylates inositol hexaphosphate, converting insoluble complexes into readily bioavailable inorganic phosphorus and free divalent cations.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Sourcing details */}
                <div style={{ marginTop: '60px', borderTop: '1px solid rgba(7, 56, 32, 0.08)', paddingTop: '50px' }}>
                    <div style={{ textAlign: 'center', marginBottom: '36px' }}>
                        <span className="section-subtitle">OUR VALUES</span>
                        <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#064e3b' }}>Rigorous Standards. Pure Nutrition.</h2>
                    </div>
                    <div className="purity-grid" style={{ marginTop: '0' }}>
                        <div className="purity-card">
                            <h3>Sprouted Ancient Grains</h3>
                            <p>Every grain is germinated to activate beneficial enzymes before hygienic shade-drying and gentle ambient stone milling.</p>
                        </div>
                        <div className="purity-card">
                            <h3>100% Preservative Free</h3>
                            <p>Zero chemical preservatives, zero added refined sugar, and zero artificial colors. Pure sprouted grains enriched with natural cardamom.</p>
                        </div>
                        <div className="purity-card">
                            <h3>Clean Heritage Processing</h3>
                            <p>Processed under sterile parameters at our heritage facility in Sethiyathope, Cuddalore District to guarantee supreme biological purity.</p>
                        </div>
                    </div>
                </div>

            </div>
        </main>
    );
}
