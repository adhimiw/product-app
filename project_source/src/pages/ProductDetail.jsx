import React, { useState } from 'react';
import { PRODUCTS } from './Shop';

export default function ProductDetail({ productId, onAddToCart, onBack }) {
    const product = PRODUCTS.find(p => p.id === productId) || PRODUCTS[0];
    const [purchaseOption, setPurchaseOption] = useState('one-time'); // Default to one-time for local products
    const [quantity, setQuantity] = useState(1);

    const subscriptionPrice = product.price * 0.9; // 10% discount for sub
    const currentPrice = purchaseOption === 'subscribe' ? subscriptionPrice : product.price;

    const handleQtyChange = (type) => {
        if (type === 'dec' && quantity > 1) {
            setQuantity(quantity - 1);
        } else if (type === 'inc') {
            setQuantity(quantity + 1);
        }
    };

    const handleAddToCartClick = () => {
        onAddToCart(product.id, product.name, currentPrice, purchaseOption, quantity);
    };

    return (
        <main className="pdp-page">
            <div className="container">
                
                {/* Back button */}
                <button onClick={onBack} className="pdp-back">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <line x1="19" y1="12" x2="5" y2="12"></line>
                        <polyline points="12 19 5 12 12 5"></polyline>
                    </svg>
                    <span>Back to Products</span>
                </button>

                {/* Main PDP Grid */}
                <div className="pdp-grid">
                    
                    {/* Left Gallery */}
                    <div className="pdp-gallery">
                        <img 
                            src={product.image} 
                            alt={product.name} 
                            className="pdp-gallery-image"
                            style={product.imageStyle || {}}
                        />
                    </div>

                    {/* Right Details */}
                    <div className="pdp-details">
                        <span className="pdp-badge">{product.category}</span>
                        <h1 className="pdp-title">{product.name}</h1>
                        
                        <div className="pdp-rating">
                            <span className="stars">★★★★★</span>
                            <span>5.0 (1,240+ Verified Reviews)</span>
                        </div>

                        <p className="pdp-lead">{product.description}</p>

                        {/* Purchase Options Selector */}
                        <div className="purchase-options">
                            <div 
                                className={`purchase-option-card ${purchaseOption === 'subscribe' ? 'active' : ''}`}
                                onClick={() => setPurchaseOption('subscribe')}
                            >
                                <div className="option-left">
                                    <div className="option-radio">
                                        <div className="option-radio-inner"></div>
                                    </div>
                                    <div className="option-text">
                                        <span className="option-title">Subscribe & Save 10%</span>
                                        <span className="option-subtitle">Delivered directly to your door monthly.</span>
                                    </div>
                                </div>
                                <span className="option-price">${subscriptionPrice.toFixed(2)}</span>
                            </div>

                            <div 
                                className={`purchase-option-card ${purchaseOption === 'one-time' ? 'active' : ''}`}
                                onClick={() => setPurchaseOption('one-time')}
                            >
                                <div className="option-left">
                                    <div className="option-radio">
                                        <div className="option-radio-inner"></div>
                                    </div>
                                    <div className="option-text">
                                        <span className="option-title">One-Time Pouch</span>
                                        <span className="option-subtitle">Standard single shipment dispatch.</span>
                                    </div>
                                </div>
                                <span className="option-price">${product.price.toFixed(2)}</span>
                            </div>
                        </div>

                        {/* Action buttons */}
                        <div className="pdp-actions" style={{ marginBottom: '40px' }}>
                            <div className="pdp-qty-select">
                                <button className="qty-btn" onClick={() => handleQtyChange('dec')}>-</button>
                                <span>{quantity}</span>
                                <button className="qty-btn" onClick={() => handleQtyChange('inc')}>+</button>
                            </div>
                            <button 
                                className="btn btn-primary pdp-add-btn"
                                onClick={handleAddToCartClick}
                            >
                                Add to Cart
                            </button>
                        </div>

                        {/* Ingredients Tag */}
                        <div className="pdp-ingredients-block" style={{ borderBottom: '1px solid rgba(7, 56, 32, 0.08)', paddingBottom: '30px' }}>
                            <h4>Ingredients / பொருட்கள்</h4>
                            <p style={{ fontStyle: 'italic', color: 'var(--color-primary)', fontWeight: 600, marginBottom: '8px' }}>
                                Pearl Millet (Kambu), Finger Millet (Ragi), Sorghum (Cholam), Bengal Gram (Pottukadalai), Black Gram (Ulundhu), Green Gram (Pasi Payaru), Wheat (Godhumai), Sprouted Roasted Gram, Cardamom.
                            </p>
                            <p>
                                Selected premium ancient grains are thoroughly sprout-activated, hygienically processed, and ground to create a complete nutritious elixir. 100% natural, no chemical preservatives or artificial elements added.
                            </p>
                        </div>

                    </div>
                </div>

                {/* Preparation & Nutrition Double Column */}
                <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '80px', borderTop: '1px solid rgba(7, 56, 32, 0.08)', paddingTop: '60px' }}>
                    
                    {/* Column 1: Preparation Method */}
                    <div>
                        <span className="section-subtitle">PREPARATION METHOD</span>
                        <h2 style={{ fontSize: '2.25rem', marginBottom: '24px' }}>How to Prepare / தயாரிப்பு முறை</h2>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            <div style={{ padding: '24px', backgroundColor: 'var(--color-white)', borderRadius: 'var(--radius-md)', borderLeft: '4px solid var(--color-accent-gold)', boxShadow: 'var(--shadow-premium)' }}>
                                <h3 style={{ fontSize: '1.25rem', marginBottom: '12px', color: 'var(--color-primary)' }}>In English</h3>
                                <p style={{ fontSize: '0.95rem', lineHeight: '1.6', color: 'var(--color-text-main)' }}>
                                    Dissolve 2 tablespoons of Amutham Sprouted Health Mix flour in 200ml of clean water without lumps, then boil it for 5-6 minutes on medium heat. After boiling well, add brown sugar (naattu sarkarai) or a little salt as required. It tastes even better if mixed with boiled milk (without salt).
                                </p>
                            </div>
                            
                            <div style={{ padding: '24px', backgroundColor: 'var(--color-white)', borderRadius: 'var(--radius-md)', borderLeft: '4px solid var(--color-primary)', boxShadow: 'var(--shadow-premium)' }}>
                                <h3 style={{ fontSize: '1.25rem', marginBottom: '12px', color: 'var(--color-primary)' }}>தமிழ் பதிப்பு</h3>
                                <p style={{ fontSize: '0.95rem', lineHeight: '1.6', color: 'var(--color-text-main)', fontFamily: 'var(--font-sans)', fontWeight: 500 }}>
                                    200ml தண்ணீரில் 2 ஸ்பூன் மாவை கட்டியில்லாமல் கரைத்து பின் கொதிக்க வைக்கவும். 5-6 நிமிடம் நன்றாக கொதித்த பின் நாட்டுச்சர்க்கரை அல்லது உப்பு சேர்க்கவும். இது காய்ச்சிய பாலுடன் சேர்த்து சாப்பிடும் போது மேலும் சுவையாக இருக்கும் (உப்பு சேர்க்காமல்).
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Column 2: Nutrition Facts */}
                    <div style={{ padding: '36px', backgroundColor: 'var(--color-white)', borderRadius: 'var(--radius-lg)', border: '2px solid var(--color-primary)', boxShadow: 'var(--shadow-premium)' }}>
                        <h3 style={{ textAlign: 'center', marginBottom: '20px', fontSize: '1.8rem', borderBottom: '3px double var(--color-primary)', paddingBottom: '10px' }}>NUTRITION FACTS</h3>
                        <p style={{ fontSize: '0.75rem', textAlign: 'center', color: '#646a66', marginTop: '-10px', marginBottom: '20px' }}>Approximate values per 100g of powder</p>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #ddd', paddingBottom: '6px', fontWeight: 700 }}>
                                <span>Energy (Calories)</span>
                                <span>384 Kcal</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #ddd', paddingBottom: '6px' }}>
                                <span>Total Carbohydrates</span>
                                <strong>78.0 g</strong>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #ddd', paddingBottom: '6px', paddingLeft: '16px', fontSize: '0.85rem' }}>
                                <span>Dietary Fibre</span>
                                <span>5.6 g</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #ddd', paddingBottom: '6px', paddingLeft: '16px', fontSize: '0.85rem' }}>
                                <span>Total Sugars</span>
                                <span>4.4 g</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #ddd', paddingBottom: '6px' }}>
                                <span>Protein</span>
                                <strong>15.6 g</strong>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid var(--color-primary)', paddingBottom: '6px' }}>
                                <span>Total Fat</span>
                                <strong>5.82 g</strong>
                            </div>
                            
                            {/* Minerals */}
                            <h4 style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-accent-gold)', marginTop: '10px' }}>Essential Minerals</h4>
                            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #ddd', paddingBottom: '6px' }}>
                                <span>Calcium (Ca)</span>
                                <span>99.7 mg</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #ddd', paddingBottom: '6px' }}>
                                <span>Iron (Fe)</span>
                                <span>5.06 mg</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #ddd', paddingBottom: '6px' }}>
                                <span>Magnesium (Mg)</span>
                                <span>136.9 mg</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid var(--color-primary)', paddingBottom: '6px' }}>
                                <span>Zinc (Zn)</span>
                                <span>2.63 mg</span>
                            </div>

                            {/* Vitamins */}
                            <h4 style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-accent-gold)', marginTop: '10px' }}>Vitamins Profile</h4>
                            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #ddd', paddingBottom: '6px' }}>
                                <span>Vitamin C</span>
                                <span>8.2 mg</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #ddd', paddingBottom: '6px' }}>
                                <span>Vitamin E</span>
                                <span>1.23 mg</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #ddd', paddingBottom: '6px' }}>
                                <span>Vitamin D3</span>
                                <span>0.27 mg</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '6px' }}>
                                <span>Vitamin A</span>
                                <span>0.052 mg</span>
                            </div>
                        </div>
                    </div>

                </div>

            </div>
        </main>
    );
}
