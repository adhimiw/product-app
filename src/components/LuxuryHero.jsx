import { useEffect, useState } from 'react';
import CardSwap, { Card } from './CardSwap';
import { fetchBanners } from '../utils/api';

const Arrow = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="5" y1="12" x2="19" y2="12" />
        <polyline points="12 5 19 12 12 19" />
    </svg>
);

const BANNERS = [
    {
        media: 'assets/images/autumn_podium.webp',
        badge: 'Our traditional taste',
        title: ['100% Natural, ', 'No Preservatives'],
        desc: 'Every grain blend is 100% natural, prepared with traditional methods that bring real taste and real nutrition.',
        cta: 'Shop the mix',
        page: 'shop',
    },
    {
        media: 'about_sprouts.webp',
        badge: 'Your health is our nation\'s priority',
        title: ['Rich in Protein ', '& High Fiber'],
        desc: 'Our health mixes are crafted to give your family strength, energy, and wellness every day.',
        cta: 'View products',
        page: 'shop',
    },
    {
        media: 'science_sprouts.webp',
        badge: 'The Science',
        title: ['3× more ', 'bioavailable'],
        desc: 'Sprout-activation neutralises phytic acid to unlock real mineral uptake — no chemicals, no shortcuts.',
        cta: 'Why sprouted?',
        page: 'science',
    },
    {
        media: 'refence image/image.webp',
        badge: 'We serve with love and transparency',
        title: ['From Our Kitchen ', 'to Your Home'],
        desc: 'What began as a homemade mix is now a trusted tradition for hundreds of families.',
        cta: 'Our story',
        page: 'about',
    },
];

export default function LuxuryHero({ setPage }) {
    // Client-managed banners from the backend; fall back to the built-in set.
    const [banners, setBanners] = useState(BANNERS);
    useEffect(() => {
        fetchBanners('hero').then((rows) => {
            if (rows.length) {
                setBanners(rows.map((b) => ({
                    media: b.image,
                    badge: b.badge,
                    title: [b.title, b.subtitle || ''],
                    desc: b.description,
                    cta: b.cta_text || 'Learn more',
                    page: b.cta_page || 'shop',
                })));
            }
        });
    }, []);

    return (
        <section className="lux-hero">
            <div className="container lux-hero-inner">
                <div className="lux-hero-copy">
                    <span className="eyebrow-gold">100% Sprout-Activated · FSSAI Certified</span>
                    <h1 className="lux-hero-title">
                        Health begins in
                        <br />
                        <span className="highlight-text">our kitchen.</span>
                    </h1>
                    <p className="lux-hero-desc">
                        No chemicals, no preservatives. Our grain mix is 100% natural, prepared with 
                        traditional methods that bring real taste and real nutrition. Rich in protein 
                        and high in fiber.
                    </p>

                    <div className="hero-actions">
                        <button type="button" onClick={() => setPage('shop')} className="btn btn-primary">
                            <span>Shop Sprouted Mix</span>
                            <span className="btn-arrow"><Arrow /></span>
                        </button>
                        <button type="button" onClick={() => setPage('science')} className="btn btn-text">
                            Why Sprouted?
                        </button>
                    </div>

                    <div className="lux-hero-stats">
                        <div className="lux-stat">
                            <strong>15.6g</strong>
                            <span>protein / 100g</span>
                        </div>
                        <div className="lux-stat-divider" />
                        <div className="lux-stat">
                            <strong>9</strong>
                            <span>sprouted grains</span>
                        </div>
                        <div className="lux-stat-divider" />
                        <div className="lux-stat">
                            <strong>1000+</strong>
                            <span>families served</span>
                        </div>
                    </div>
                </div>

                <div className="lux-hero-stage">
                    <CardSwap
                        width={420}
                        height={480}
                        cardDistance={60}
                        verticalDistance={70}
                        delay={4500}
                        pauseOnHover={true}
                    >
                        {banners.map((b, i) => (
                            <Card key={b.media}>
                                <div className="swap-card">
                                    <img
                                        className="swap-card-media"
                                        src={b.media}
                                        alt={[b.badge, ...(Array.isArray(b.title) ? b.title : [b.title])].filter(Boolean).join(' — ')}
                                        decoding="async"
                                        loading={i === 0 ? 'eager' : 'lazy'}
                                        fetchPriority={i === 0 ? 'high' : 'low'}
                                    />
                                    <div className="swap-card-scrim" />
                                    <div className="swap-card-body">
                                        <span className="swap-card-badge">{b.badge}</span>
                                        <h3 className="swap-card-title">
                                            {b.title[0]}
                                            <em>{b.title[1]}</em>
                                        </h3>
                                        <p className="swap-card-desc">{b.desc}</p>
                                        <button type="button"
                                            className="swap-card-cta"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setPage(b.page);
                                            }}
                                        >
                                            {b.cta} <Arrow />
                                        </button>
                                        <span className="swap-card-hint">Click card to browse</span>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </CardSwap>
                </div>
            </div>
        </section>
    );
}
