import React, { useEffect } from 'react';
import { 
    ShieldCheck, 
    FileText, 
    Truck, 
    RotateCcw, 
    ArrowLeft, 
    Building2, 
    CheckCircle2, 
    Lock, 
    Clock, 
    PackageCheck, 
    Sparkles, 
    PhoneCall,
    Award,
    HelpCircle,
    BadgeCheck
} from 'lucide-react';

export default function LegalPage({ type = 'privacy', setPage }) {
    const [activeTab, setActiveTab] = React.useState(type);

    useEffect(() => {
        setActiveTab(type);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [type]);

    const handleTabChange = (tabKey) => {
        setActiveTab(tabKey);
        if (setPage) {
            setPage(tabKey);
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <main className="legal-page-container" style={{ background: '#fcfbfa', minHeight: '85vh', paddingTop: '115px', paddingBottom: '90px' }}>
            <div className="container" style={{ maxWidth: '1160px', margin: '0 auto', padding: '0 20px' }}>
                
                {/* Back Button & Breadcrumbs */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
                    <button
                        onClick={() => setPage ? setPage('home') : window.history.back()}
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            background: '#ffffff',
                            border: '1.5px solid rgba(27, 59, 43, 0.14)',
                            padding: '8px 18px',
                            borderRadius: '30px',
                            color: '#1b3b2b',
                            fontSize: '0.85rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            transition: 'all 0.22s ease',
                            boxShadow: '0 2px 8px rgba(27, 59, 43, 0.04)'
                        }}
                    >
                        <ArrowLeft size={16} />
                        <span>Back to Home</span>
                    </button>
                    <span style={{ fontSize: '0.85rem', color: '#a0aec0' }}>/</span>
                    <span style={{ fontSize: '0.85rem', color: '#1b3b2b', fontWeight: 700 }}>Legal & Compliance</span>
                </div>

                {/* Hero Header Card */}
                <div style={{
                    background: 'linear-gradient(135deg, #1b3b2b 0%, #0d2217 100%)',
                    borderRadius: '24px',
                    padding: '42px 48px',
                    color: '#ffffff',
                    marginBottom: '36px',
                    boxShadow: '0 12px 36px rgba(27, 59, 43, 0.15)',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    <div style={{ position: 'relative', zIndex: 2 }}>
                        <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            background: 'rgba(212, 163, 115, 0.18)',
                            border: '1px solid rgba(212, 163, 115, 0.35)',
                            color: '#f3d5b5',
                            padding: '6px 16px',
                            borderRadius: '30px',
                            fontSize: '0.78rem',
                            fontWeight: 800,
                            letterSpacing: '0.06em',
                            textTransform: 'uppercase',
                            marginBottom: '16px'
                        }}>
                            <Building2 size={14} color="#f3d5b5" />
                            <span>MANGALAM HEALTHY FOODS • OFFICIAL COMPLIANCE</span>
                        </div>

                        <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '2.3rem', fontWeight: 800, margin: '0 0 12px', lineHeight: 1.25, letterSpacing: '-0.02em' }}>
                            {activeTab === 'privacy' && 'Privacy Policy'}
                            {activeTab === 'terms' && 'Terms & Conditions'}
                            {activeTab === 'shipping' && 'Shipping & Delivery Policy'}
                            {activeTab === 'refund' && 'Return & Refund Policy'}
                        </h1>
                        <p style={{ fontSize: '0.98rem', color: 'rgba(255, 255, 255, 0.85)', margin: 0, maxWidth: '720px', lineHeight: 1.6 }}>
                            Transparent, ethical, and customer-first policies governing your purchases of pure traditional sprouted foods from Mangalam Healthy Foods.
                        </p>

                        {/* Official Statutory Registrations Grid */}
                        <div style={{
                            marginTop: '28px',
                            paddingTop: '24px',
                            borderTop: '1px solid rgba(255, 255, 255, 0.14)',
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                            gap: '16px'
                        }}>
                            <div style={{ background: 'rgba(255, 255, 255, 0.08)', padding: '12px 18px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.1)' }}>
                                <div style={{ fontSize: '0.72rem', color: '#d4a373', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.05em' }}>GSTIN Number</div>
                                <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#ffffff', marginTop: '2px' }}>33FDAPM8867B1ZI</div>
                            </div>
                            <div style={{ background: 'rgba(255, 255, 255, 0.08)', padding: '12px 18px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.1)' }}>
                                <div style={{ fontSize: '0.72rem', color: '#d4a373', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.05em' }}>FSSAI License</div>
                                <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#ffffff', marginTop: '2px' }}>12423028000746</div>
                            </div>
                            <div style={{ background: 'rgba(255, 255, 255, 0.08)', padding: '12px 18px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.1)' }}>
                                <div style={{ fontSize: '0.72rem', color: '#d4a373', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.05em' }}>UDYAM Registration</div>
                                <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#ffffff', marginTop: '2px' }}>UDYAM-TN-04-0125789</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Two-Column Layout */}
                <div style={{ display: 'grid', gridTemplateColumns: '270px 1fr', gap: '36px' }} className="legal-content-grid">
                    
                    {/* Left Sticky Sidebar */}
                    <aside style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div style={{
                            background: '#ffffff',
                            borderRadius: '20px',
                            padding: '16px',
                            border: '1px solid rgba(27, 59, 43, 0.09)',
                            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.02)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '8px'
                        }}>
                            <div style={{ padding: '8px 12px 4px', fontSize: '0.75rem', fontWeight: 800, color: '#8c9c93', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                                Navigation Menu
                            </div>

                            <button
                                onClick={() => handleTabChange('privacy')}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    padding: '13px 16px',
                                    borderRadius: '12px',
                                    border: 'none',
                                    background: activeTab === 'privacy' ? '#1b3b2b' : 'transparent',
                                    color: activeTab === 'privacy' ? '#ffffff' : '#334155',
                                    fontWeight: 700,
                                    fontSize: '0.92rem',
                                    cursor: 'pointer',
                                    textAlign: 'left',
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                <ShieldCheck size={19} color={activeTab === 'privacy' ? '#ffffff' : '#1b3b2b'} />
                                <span>Privacy Policy</span>
                            </button>

                            <button
                                onClick={() => handleTabChange('terms')}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    padding: '13px 16px',
                                    borderRadius: '12px',
                                    border: 'none',
                                    background: activeTab === 'terms' ? '#1b3b2b' : 'transparent',
                                    color: activeTab === 'terms' ? '#ffffff' : '#334155',
                                    fontWeight: 700,
                                    fontSize: '0.92rem',
                                    cursor: 'pointer',
                                    textAlign: 'left',
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                <FileText size={19} color={activeTab === 'terms' ? '#ffffff' : '#1b3b2b'} />
                                <span>Terms & Conditions</span>
                            </button>

                            <button
                                onClick={() => handleTabChange('shipping')}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    padding: '13px 16px',
                                    borderRadius: '12px',
                                    border: 'none',
                                    background: activeTab === 'shipping' ? '#1b3b2b' : 'transparent',
                                    color: activeTab === 'shipping' ? '#ffffff' : '#334155',
                                    fontWeight: 700,
                                    fontSize: '0.92rem',
                                    cursor: 'pointer',
                                    textAlign: 'left',
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                <Truck size={19} color={activeTab === 'shipping' ? '#ffffff' : '#1b3b2b'} />
                                <span>Shipping & Delivery</span>
                            </button>

                            <button
                                onClick={() => handleTabChange('refund')}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    padding: '13px 16px',
                                    borderRadius: '12px',
                                    border: 'none',
                                    background: activeTab === 'refund' ? '#1b3b2b' : 'transparent',
                                    color: activeTab === 'refund' ? '#ffffff' : '#334155',
                                    fontWeight: 700,
                                    fontSize: '0.92rem',
                                    cursor: 'pointer',
                                    textAlign: 'left',
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                <RotateCcw size={19} color={activeTab === 'refund' ? '#ffffff' : '#1b3b2b'} />
                                <span>Return & Refund</span>
                            </button>
                        </div>

                        {/* Customer Support Contact Card */}
                        <div style={{
                            background: '#ffffff',
                            borderRadius: '20px',
                            padding: '24px',
                            border: '1px solid rgba(27, 59, 43, 0.1)',
                            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.02)'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#eef6f1', color: '#1b3b2b', display: 'flex', alignItems: 'center', justifyCenter: 'center', flexShrink: 0, paddingLeft: '8px' }}>
                                    <PhoneCall size={18} />
                                </div>
                                <h5 style={{ margin: 0, fontSize: '0.95rem', color: '#1b3b2b', fontWeight: 800 }}>Need Help?</h5>
                            </div>
                            <p style={{ margin: '0 0 14px', color: '#64748b', fontSize: '0.86rem', lineHeight: 1.5 }}>
                                Have questions regarding your order or policies? Contact our helpline.
                            </p>
                            <a
                                href="tel:+917094074655"
                                style={{
                                    display: 'block',
                                    textAlign: 'center',
                                    padding: '10px 14px',
                                    background: '#1b3b2b',
                                    color: '#ffffff',
                                    borderRadius: '12px',
                                    fontWeight: 700,
                                    fontSize: '0.88rem',
                                    textDecoration: 'none',
                                    transition: 'background 0.2s'
                                }}
                            >
                                📞 +91 7094074655
                            </a>
                        </div>
                    </aside>

                    {/* Right Main Article Blocks */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>

                        {/* ===================================================
                           PRIVACY POLICY SECTIONS
                           =================================================== */}
                        {activeTab === 'privacy' && (
                            <>
                                {/* Section Block 1 */}
                                <section style={{ background: '#ffffff', borderRadius: '20px', padding: '36px 40px', border: '1px solid rgba(27, 59, 43, 0.08)', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '18px' }}>
                                        <span style={{ width: '34px', height: '34px', borderRadius: '10px', background: 'rgba(27, 59, 43, 0.09)', color: '#1b3b2b', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem' }}>01</span>
                                        <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '1.35rem', fontWeight: 800, color: '#1b3b2b', margin: 0 }}>
                                            Introduction & Data Protection Overview
                                        </h2>
                                    </div>
                                    <p style={{ margin: 0, color: '#475569', lineHeight: 1.8, fontSize: '0.96rem' }}>
                                        Welcome to <strong>Mangalam Healthy Foods</strong> ("we", "our", "us"). We are committed to safeguarding the privacy, security, and confidentiality of our customers and website visitors. This Privacy Policy outlines how we handle your personal data when you browse our storefront or purchase our natural sprouted ancient health mixes and cold wood-pressed oils.
                                    </p>
                                </section>

                                {/* Section Block 2 */}
                                <section style={{ background: '#ffffff', borderRadius: '20px', padding: '36px 40px', border: '1px solid rgba(27, 59, 43, 0.08)', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '18px' }}>
                                        <span style={{ width: '34px', height: '34px', borderRadius: '10px', background: 'rgba(27, 59, 43, 0.09)', color: '#1b3b2b', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem' }}>02</span>
                                        <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '1.35rem', fontWeight: 800, color: '#1b3b2b', margin: 0 }}>
                                            Information We Collect
                                        </h2>
                                    </div>
                                    <p style={{ margin: '0 0 18px', color: '#475569', lineHeight: 1.8, fontSize: '0.96rem' }}>
                                        To fulfill your orders efficiently and provide a smooth shopping experience, we collect essential customer information:
                                    </p>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
                                        <div style={{ background: '#f8faf9', padding: '18px 20px', borderRadius: '14px', border: '1px solid rgba(27, 59, 43, 0.07)' }}>
                                            <strong style={{ color: '#1b3b2b', display: 'block', marginBottom: '6px' }}>👤 Personal Details</strong>
                                            <span style={{ fontSize: '0.9rem', color: '#64748b', lineHeight: 1.5 }}>Full name, delivery address, phone number, and email address.</span>
                                        </div>
                                        <div style={{ background: '#f8faf9', padding: '18px 20px', borderRadius: '14px', border: '1px solid rgba(27, 59, 43, 0.07)' }}>
                                            <strong style={{ color: '#1b3b2b', display: 'block', marginBottom: '6px' }}>🔒 Payment Security</strong>
                                            <span style={{ fontSize: '0.9rem', color: '#64748b', lineHeight: 1.5 }}>Payments are processed via PCI-DSS compliant gateways. We NEVER store card numbers or passwords.</span>
                                        </div>
                                    </div>
                                </section>

                                {/* Section Block 3 */}
                                <section style={{ background: '#ffffff', borderRadius: '20px', padding: '36px 40px', border: '1px solid rgba(27, 59, 43, 0.08)', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '18px' }}>
                                        <span style={{ width: '34px', height: '34px', borderRadius: '10px', background: 'rgba(27, 59, 43, 0.09)', color: '#1b3b2b', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem' }}>03</span>
                                        <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '1.35rem', fontWeight: 800, color: '#1b3b2b', margin: 0 }}>
                                            Business Registration & Tax Compliance
                                        </h2>
                                    </div>
                                    <p style={{ margin: '0 0 18px', color: '#475569', lineHeight: 1.8, fontSize: '0.96rem' }}>
                                        Mangalam Healthy Foods is a fully compliant registered food business entity in Tamil Nadu, India.
                                    </p>
                                    <div style={{ background: '#f0f7f3', borderLeft: '4px solid #1b3b2b', padding: '20px 24px', borderRadius: '0 16px 16px 0' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.94rem', color: '#1b3b2b' }}>
                                            <div><strong>GSTIN:</strong> 33FDAPM8867B1ZI</div>
                                            <div><strong>FSSAI Registration License No:</strong> 12423028000746</div>
                                            <div><strong>UDYAM Enterprise Registration:</strong> UDYAM-TN-04-0125789</div>
                                        </div>
                                    </div>
                                </section>
                            </>
                        )}

                        {/* ===================================================
                           TERMS & CONDITIONS SECTIONS
                           =================================================== */}
                        {activeTab === 'terms' && (
                            <>
                                <section style={{ background: '#ffffff', borderRadius: '20px', padding: '36px 40px', border: '1px solid rgba(27, 59, 43, 0.08)', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '18px' }}>
                                        <span style={{ width: '34px', height: '34px', borderRadius: '10px', background: 'rgba(27, 59, 43, 0.09)', color: '#1b3b2b', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem' }}>01</span>
                                        <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '1.35rem', fontWeight: 800, color: '#1b3b2b', margin: 0 }}>
                                            Acceptance of Terms
                                        </h2>
                                    </div>
                                    <p style={{ margin: 0, color: '#475569', lineHeight: 1.8, fontSize: '0.96rem' }}>
                                        By using or purchasing from <strong>Mangalam Healthy Foods</strong>, you agree to be bound by these Terms and Conditions. Please review them carefully prior to placing your order.
                                    </p>
                                </section>

                                <section style={{ background: '#ffffff', borderRadius: '20px', padding: '36px 40px', border: '1px solid rgba(27, 59, 43, 0.08)', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '18px' }}>
                                        <span style={{ width: '34px', height: '34px', borderRadius: '10px', background: 'rgba(27, 59, 43, 0.09)', color: '#1b3b2b', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem' }}>02</span>
                                        <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '1.35rem', fontWeight: 800, color: '#1b3b2b', margin: 0 }}>
                                            Product Quality & Natural Ingredients
                                        </h2>
                                    </div>
                                    <p style={{ margin: '0 0 16px', color: '#475569', lineHeight: 1.8, fontSize: '0.96rem' }}>
                                        All food products—including Sprouted Ancient Millet Health Mix, Palm Jaggery, Nattu Sakkarai, and Wood Pressed Oils—are crafted using 100% natural, unadulterated ingredients without artificial preservatives or chemical colors.
                                    </p>
                                    <div style={{ background: '#fdf8f2', border: '1px solid #fce8d5', padding: '16px 20px', borderRadius: '14px', color: '#9a5b13', fontSize: '0.9rem', lineHeight: 1.6 }}>
                                        💡 <strong>Nutritional Disclaimer:</strong> Statements regarding dietary benefits are for general health and wellness. They are not intended as pharmaceutical cures.
                                    </div>
                                </section>

                                <section style={{ background: '#ffffff', borderRadius: '20px', padding: '36px 40px', border: '1px solid rgba(27, 59, 43, 0.08)', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '18px' }}>
                                        <span style={{ width: '34px', height: '34px', borderRadius: '10px', background: 'rgba(27, 59, 43, 0.09)', color: '#1b3b2b', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem' }}>03</span>
                                        <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '1.35rem', fontWeight: 800, color: '#1b3b2b', margin: 0 }}>
                                            GST Tax Invoice & Pricing
                                        </h2>
                                    </div>
                                    <ul style={{ margin: 0, paddingLeft: '20px', color: '#475569', lineHeight: 1.8, fontSize: '0.96rem' }}>
                                        <li>All prices are in Indian Rupees (INR) and are inclusive of GST taxes under <strong>GSTIN 33FDAPM8867B1ZI</strong>.</li>
                                        <li>Prices and variant packages are subject to update based on raw crop availability.</li>
                                    </ul>
                                </section>
                            </>
                        )}

                        {/* ===================================================
                           SHIPPING & DELIVERY SECTIONS
                           =================================================== */}
                        {activeTab === 'shipping' && (
                            <>
                                <section style={{ background: '#ffffff', borderRadius: '20px', padding: '36px 40px', border: '1px solid rgba(27, 59, 43, 0.08)', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '18px' }}>
                                        <span style={{ width: '34px', height: '34px', borderRadius: '10px', background: 'rgba(27, 59, 43, 0.09)', color: '#1b3b2b', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem' }}>01</span>
                                        <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '1.35rem', fontWeight: 800, color: '#1b3b2b', margin: 0 }}>
                                            Dispatch Timeline (24 – 48 Hours)
                                        </h2>
                                    </div>
                                    <p style={{ margin: 0, color: '#475569', lineHeight: 1.8, fontSize: '0.96rem' }}>
                                        To ensure maximum freshness, orders are freshly packaged and dispatched within <strong>24 to 48 hours</strong> of order confirmation (excluding Sundays and national holidays).
                                    </p>
                                </section>

                                <section style={{ background: '#ffffff', borderRadius: '20px', padding: '36px 40px', border: '1px solid rgba(27, 59, 43, 0.08)', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '18px' }}>
                                        <span style={{ width: '34px', height: '34px', borderRadius: '10px', background: 'rgba(27, 59, 43, 0.09)', color: '#1b3b2b', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem' }}>02</span>
                                        <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '1.35rem', fontWeight: 800, color: '#1b3b2b', margin: 0 }}>
                                            Delivery Duration & Regional Schedules
                                        </h2>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', margin: '20px 0' }}>
                                        <div style={{ background: '#f8faf9', padding: '24px', borderRadius: '16px', border: '1.5px solid rgba(27, 59, 43, 0.12)' }}>
                                            <div style={{ fontSize: '0.78rem', color: '#1b3b2b', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.05em' }}>Tamil Nadu & South India</div>
                                            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1b3b2b', margin: '8px 0 4px' }}>2 – 4 Days</div>
                                            <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Fast express road delivery</div>
                                        </div>

                                        <div style={{ background: '#f8faf9', padding: '24px', borderRadius: '16px', border: '1.5px solid rgba(27, 59, 43, 0.12)' }}>
                                            <div style={{ fontSize: '0.78rem', color: '#1b3b2b', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.05em' }}>Rest of India</div>
                                            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1b3b2b', margin: '8px 0 4px' }}>4 – 7 Days</div>
                                            <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Standard express parcel transit</div>
                                        </div>
                                    </div>
                                </section>

                                <section style={{ background: '#ffffff', borderRadius: '20px', padding: '36px 40px', border: '1px solid rgba(27, 59, 43, 0.08)', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '18px' }}>
                                        <span style={{ width: '34px', height: '34px', borderRadius: '10px', background: 'rgba(27, 59, 43, 0.09)', color: '#1b3b2b', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem' }}>03</span>
                                        <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '1.35rem', fontWeight: 800, color: '#1b3b2b', margin: 0 }}>
                                            Free Delivery & Tracking
                                        </h2>
                                    </div>
                                    <div style={{ background: '#f0f7f3', padding: '20px 24px', borderRadius: '16px', border: '1px solid #cce5d6', color: '#1b3b2b', lineHeight: 1.7 }}>
                                        <div style={{ fontWeight: 800, fontSize: '1rem', marginBottom: '4px' }}>🚚 Free Express Shipping on orders above ₹499!</div>
                                        <div style={{ fontSize: '0.9rem', color: '#526058' }}>For orders below ₹499, a nominal delivery fee of ₹40 applies. Once dispatched, tracking updates are sent via WhatsApp and SMS.</div>
                                    </div>
                                </section>
                            </>
                        )}

                        {/* ===================================================
                           RETURN & REFUND SECTIONS
                           =================================================== */}
                        {activeTab === 'refund' && (
                            <>
                                <section style={{ background: '#ffffff', borderRadius: '20px', padding: '36px 40px', border: '1px solid rgba(27, 59, 43, 0.08)', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '18px' }}>
                                        <span style={{ width: '34px', height: '34px', borderRadius: '10px', background: 'rgba(27, 59, 43, 0.09)', color: '#1b3b2b', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem' }}>01</span>
                                        <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '1.35rem', fontWeight: 800, color: '#1b3b2b', margin: 0 }}>
                                            7-Day Replacement & Refund Policy
                                        </h2>
                                    </div>
                                    <p style={{ margin: 0, color: '#475569', lineHeight: 1.8, fontSize: '0.96rem' }}>
                                        As fresh food items, returns are eligible for unopened, damaged, or incorrect packages reported within <strong>7 days</strong> of delivery.
                                    </p>
                                </section>

                                <section style={{ background: '#ffffff', borderRadius: '20px', padding: '36px 40px', border: '1px solid rgba(27, 59, 43, 0.08)', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '18px' }}>
                                        <span style={{ width: '34px', height: '34px', borderRadius: '10px', background: 'rgba(27, 59, 43, 0.09)', color: '#1b3b2b', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem' }}>02</span>
                                        <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '1.35rem', fontWeight: 800, color: '#1b3b2b', margin: 0 }}>
                                            Refund Timelines
                                        </h2>
                                    </div>
                                    <p style={{ margin: 0, color: '#475569', lineHeight: 1.8, fontSize: '0.96rem' }}>
                                        Approved refunds are credited back to your original payment method (Bank Account / UPI / Card) within <strong>5 to 7 business days</strong>.
                                    </p>
                                </section>
                            </>
                        )}

                    </div>
                </div>

            </div>
        </main>
    );
}
