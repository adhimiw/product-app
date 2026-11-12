import React from 'react';
import { ShieldCheck, Heart, MapPin, Phone, Award, CheckCircle2 } from 'lucide-react';

export default function About({ setPage }) {
    return (
        <main className="about-page" style={{ paddingTop: 'calc(var(--header-height) + 40px)', paddingBottom: '80px' }}>
            <div className="container">

                {/* Brand Story narrative */}
                <div className="about-narrative">
                    <div className="narrative-content">
                        <span className="section-subtitle">OUR 20-YEAR JOURNEY</span>
                        <h1 style={{ fontSize: 'clamp(2.2rem, 3.8vw, 3rem)', fontWeight: 800, color: '#064e3b', marginBottom: '20px', lineHeight: 1.2 }}>
                            About MaHealthy Foods — Rooted in Sethiyathope Heritage
                        </h1>
                        <p style={{ fontSize: '1.05rem', color: '#475569', lineHeight: 1.6, marginBottom: '18px' }}>
                            Based in the heritage town of <strong>Sethiyathope, Cuddalore District, Tamil Nadu</strong>, <strong>MaHealthy Foods</strong> (registered as <em>Mangalam Healthy Foods Company</em>) was founded with an uncompromising purpose: to bring pure, 100% natural, chemical-free, and bioavailable ancestral nutrition into modern households across India.
                        </p>
                        <p style={{ fontSize: '1rem', color: '#475569', lineHeight: 1.6, marginBottom: '18px' }}>
                            For over 20 years, beginning in our home kitchen, our signature <strong>Amutham Sprouted Health Mix (Sathu Maavu)</strong> was prepared exclusively for family members, neighbors, and relatives recovering from illness or seeking natural daily vitality. Witnessing firsthand how true soak-sprouted millets transformed stamina, digestive comfort, and infant growth, our community urged us to make this wisdom accessible to every Indian family. In 2019, we officially established Mangalam Healthy Foods.
                        </p>
                        <p style={{ fontSize: '1rem', color: '#475569', lineHeight: 1.6, marginBottom: '24px' }}>
                            Unlike mass-produced commercial cereals laden with maltodextrin, emulsifiers, and artificial flavoring, every single batch at MaHealthy Foods undergoes authentic 24–48 hour water soaking and germination. This degrades phytic acid anti-nutrients and delivers up to <strong>3.2× higher mineral bioavailability</strong> of Iron, Calcium, and Zinc.
                        </p>
                        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                            <button onClick={() => setPage('shop')} className="btn btn-primary">
                                Explore Our Fresh Products
                            </button>
                            <button onClick={() => setPage('science')} className="btn btn-secondary" style={{ background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0' }}>
                                The Science of Sprouting
                            </button>
                        </div>
                    </div>
                    <div>
                        <img
                            src="about_sprouts.png"
                            alt="MaHealthy Foods Sourcing and Quality Standards in Sethiyathope"
                            style={{ borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-premium)', width: '100%', objectFit: 'cover' }}
                        />
                    </div>
                </div>

                {/* E-E-A-T Foundation & Verification Section */}
                <div style={{ marginTop: '70px', background: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '40px 32px' }}>
                    <div style={{ textAlign: 'center', marginBottom: '36px' }}>
                        <span className="section-subtitle">TRUST &amp; TRANSPARENCY</span>
                        <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#064e3b', margin: '4px 0 10px 0' }}>
                            Authoritative Credentials &amp; Manufacturing Standards
                        </h2>
                        <p style={{ fontSize: '0.92rem', color: '#64748b', maxWidth: '640px', margin: '0 auto' }}>
                            We operate under rigorous state and central regulatory compliance to assure every spoon of porridge meets the highest food safety benchmarks.
                        </p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px' }}>
                        <div style={{ background: '#ffffff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#047857', marginBottom: '12px' }}>
                                <ShieldCheck size={24} />
                                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>FSSAI Certified</h3>
                            </div>
                            <p style={{ fontSize: '0.88rem', color: '#475569', lineHeight: 1.5, margin: '0 0 8px 0' }}>
                                Fully licensed under Central/State Food Safety Authority:
                            </p>
                            <strong style={{ fontSize: '0.95rem', color: '#064e3b' }}>License No: 12423028000746</strong>
                        </div>

                        <div style={{ background: '#ffffff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#047857', marginBottom: '12px' }}>
                                <Award size={24} />
                                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>MSME UDYAM Registered</h3>
                            </div>
                            <p style={{ fontSize: '0.88rem', color: '#475569', lineHeight: 1.5, margin: '0 0 8px 0' }}>
                                Recognized micro-enterprise contributing to Tamil Nadu farm collectives:
                            </p>
                            <strong style={{ fontSize: '0.95rem', color: '#064e3b' }}>UDYAM-TN-04-0125789</strong>
                        </div>

                        <div style={{ background: '#ffffff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#047857', marginBottom: '12px' }}>
                                <CheckCircle2 size={24} />
                                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>GST Registered Enterprise</h3>
                            </div>
                            <p style={{ fontSize: '0.88rem', color: '#475569', lineHeight: 1.5, margin: '0 0 8px 0' }}>
                                Transparent tax registration and pan-India commercial compliance:
                            </p>
                            <strong style={{ fontSize: '0.95rem', color: '#064e3b' }}>GSTIN: 33FDAPM8867B1ZI</strong>
                        </div>

                        <div style={{ background: '#ffffff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#047857', marginBottom: '12px' }}>
                                <MapPin size={24} />
                                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>Sethiyathope Heritage Unit</h3>
                            </div>
                            <p style={{ fontSize: '0.88rem', color: '#475569', lineHeight: 1.5, margin: '0 0 8px 0' }}>
                                No-18, Mettu St, Sethiyathope, Cuddalore District, Tamil Nadu - 608702
                            </p>
                            <strong style={{ fontSize: '0.95rem', color: '#064e3b' }}>Helpline: +91 94432 84112</strong>
                        </div>
                    </div>
                </div>

                {/* Sourcing Standards Cards */}
                <div style={{ marginTop: '70px', borderTop: '1px solid rgba(7, 56, 32, 0.08)', paddingTop: '60px' }}>
                    <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                        <span className="section-subtitle">THE MAHEALTHY CODE</span>
                        <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#064e3b' }}>Our Four Pillars of Quality</h2>
                    </div>

                    <div className="purity-grid" style={{ marginTop: '0' }}>
                        <div className="purity-card">
                            <h3>100% Sprout-Activated Grains</h3>
                            <p>We hand-select and soak Pearl Millet (Kambu), Finger Millet (Ragi), Sorghum (Cholam), and native legumes to maximize biological enzyme activation.</p>
                        </div>

                        <div className="purity-card">
                            <h3>Zero Chemicals &amp; Preservatives</h3>
                            <p>Zero artificial binders, zero chemical stabilizers, zero synthetic colors, and zero refined white sugar. Pure grain vitality enriched only with real cardamom.</p>
                        </div>

                        <div className="purity-card">
                            <h3>Traditional Ambient Stone-Ground</h3>
                            <p>We slow-mill at natural room temperatures so delicate B-vitamins, essential fats, and heat-sensitive dietary enzymes remain fully active.</p>
                        </div>

                        <div className="purity-card">
                            <h3>Heritage Kitchen Recipes</h3>
                            <p>Crafted following authentic Tamil domestic wisdom to support digestive ease, natural infant growth, postnatal recovery, and elder vitality.</p>
                        </div>
                    </div>
                </div>

            </div>
        </main>
    );
}
