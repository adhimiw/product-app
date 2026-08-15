import { useState } from 'react';
import { clickable } from '../clickable';

/* =====================================================================
   PRODUCT SHOWCASE
   Inspired by premium nut-milk hero sliders: a giant product word sits
   behind a centred pack, ingredients float, and switching the variant
   shifts the whole scene's tone. On-brand (green / gold / cream).
   ===================================================================== */

const VARIANTS = [
    {
        id: 'health-mix-300g',
        word: 'HEALTH',
        name: 'Amutham Sprouted Health Mix',
        size: '300g · Flagship Pouch',
        price: 110,
        inr: '₹110',
        image: 'refence image/image.webp',
        imageStyle: {},
        tint: 'tint-green',
    },
    {
        id: 'health-mix-500g',
        word: 'FAMILY',
        name: 'Amutham Sprouted Health Mix',
        size: '500g · Family Pack',
        price: 160,
        inr: '₹160',
        image: 'refence image/image.webp',
        imageStyle: {},
        tint: 'tint-gold',
    },
    {
        id: 'uluntham-500g',
        word: 'ULUNTHAM',
        name: 'Mangalam Uluntham Mix',
        size: '500g · Traditional Special',
        price: 180,
        inr: '₹180',
        image: 'refence image/image.webp',
        imageStyle: {},
        tint: 'tint-terra',
    },
];

export default function ProductShowcase({ products = [], onProductView, onAddToCart }) {
    const [active, setActive] = useState(0);
    
    // Merge backend products into the beautifully styled presentation variants
    const activeVariants = VARIANTS.map(v => {
        const backendProd = products.find(p => p.id === v.id);
        if (backendProd) {
            return {
                ...v,
                name: backendProd.name,
                price: parseFloat(backendProd.price),
                inr: backendProd.inr_price || `₹${parseInt(backendProd.price)}`,
                image: backendProd.image
            };
        }
        return v;
    });

    const v = activeVariants[active] || VARIANTS[active] || VARIANTS[0];

    return (
        <section className="pshow">
            <div className="container">
                <div className="section-header" style={{ marginBottom: '24px' }}>
                    <span className="eyebrow-gold" style={{ justifyContent: 'center' }}>Signature Range</span>
                    <h2 className="section-title" style={{ fontSize: '2.5rem' }}>Choose Your Amutham</h2>
                </div>

                <div className={`pshow-stage ${v.tint}`}>
                    <span className="pshow-accent a1" />
                    <span className="pshow-accent a2" />
                    <span className="pshow-accent a3" />
                    <span className="pshow-accent a4" />

                    {/* giant word behind the product (re-keyed so it animates on change) */}
                    <span key={`w-${v.id}`} className="pshow-word">{v.word}</span>

                    <img
                        key={`p-${v.id}`}
                        className="pshow-product"
                        src={v.image}
                        alt={v.name}
                        loading="lazy"
                        decoding="async"
                        style={{ ...v.imageStyle, cursor: 'pointer' }}
                        {...clickable(() => onProductView(v.id))}
                    />

                    {/* side rail of variant switches */}
                    <div className="pshow-rail">
                        {activeVariants.map((item, i) => (
                            <button type="button"
                                key={item.id}
                                className={`pshow-rail-btn ${i === active ? 'active' : ''}`}
                                onClick={() => setActive(i)}
                                aria-label={`Show ${item.word}`}
                            >
                                <span className="pshow-rail-dot" />
                                {item.word}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="pshow-bar">
                    <div key={`i-${v.id}`} className="pshow-info">
                        <span className="pshow-size">{v.size}</span>
                        <h3 className="pshow-name">{v.name}</h3>
                        <span className="pshow-price">
                            {v.inr}
                        </span>
                    </div>

                    <div className="pshow-actions">
                        <button type="button"
                            className="btn btn-primary"
                            onClick={() => onAddToCart(v.id, v.name, v.price, 'one-time', 1)}
                        >
                            <span>Add to Cart</span>
                            <svg className="btn-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="5" y1="12" x2="19" y2="12" />
                                <polyline points="12 5 19 12 12 19" />
                            </svg>
                        </button>
                        <button type="button" className="btn btn-secondary" onClick={() => onProductView(v.id)}>
                            View Details
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}

