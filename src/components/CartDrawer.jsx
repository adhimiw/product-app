import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { PRODUCTS } from '../pages/Shop';

export default function CartDrawer({ isOpen, onClose, cart, onUpdateQuantity, onRemove, onCheckout }) {
    const { t } = useLanguage();

    const subtotal = cart.reduce((sum, item) => sum + (parseFloat(item.price) || 0) * item.quantity, 0);
    const totalQty = cart.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <div className={`cart-drawer ${isOpen ? 'active' : ''}`} aria-hidden={!isOpen}>
            <div className="cart-drawer-overlay" onClick={onClose}></div>
            <div className="cart-drawer-content">
                
                {/* Header Row */}
                <div className="cart-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--color-primary)' }}>
                            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                            <line x1="3" y1="6" x2="21" y2="6"></line>
                            <path d="M16 10a4 4 0 0 1-8 0"></path>
                        </svg>
                        <h3 className="cart-drawer-title" style={{ fontSize: '1.2rem', fontWeight: 800 }}>{t('cartTitle')} ({totalQty})</h3>
                    </div>
                    
                    <button className="cart-close" onClick={onClose} aria-label="Close Shopping Bag">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>
                
                {/* Scrollable Compact Items List */}
                <div className="cart-items">
                    {cart.length === 0 ? (
                        <div className="cart-empty-message">
                            <span style={{ fontSize: '2.4rem', marginBottom: '12px', display: 'block' }}>🛍️</span>
                            <p style={{ fontWeight: 800, color: 'var(--color-primary)', marginBottom: '4px', fontSize: '0.95rem' }}>{t('cartEmpty')}</p>
                            <p style={{ fontSize: '0.8rem', color: '#646a66' }}>Add our 100% soak-sprouted health mixes to begin.</p>
                        </div>
                    ) : (
                        cart.map((item, index) => {
                            const matchedProduct = PRODUCTS.find(p => p.id === item.id) || PRODUCTS[0];
                            const itemImg = matchedProduct ? matchedProduct.image : '/assets/images/300g_amutham/amutham-01.jpg';
                            const itemPriceNum = parseFloat(item.price) || 110;
                            const lineTotal = itemPriceNum * item.quantity;

                            // Extract gram size badge (e.g. 300g vs 500g)
                            const matchGram = item.name.match(/\((\d+g[^\)]*)\)/i);
                            const gramBadge = matchGram ? matchGram[1] : (matchedProduct.weights ? matchedProduct.weights[0] : '300g');
                            const cleanTitle = item.name.replace(/\s*\(\d+g[^\)]*\)/i, '');

                            return (
                                <div className="cart-item-card" key={`${item.id}-${item.name}-${index}`}>
                                    <div className="cart-item-img-holder">
                                        <img src={itemImg} alt={cleanTitle} />
                                    </div>

                                    <div className="cart-item-details">
                                        <div className="cart-item-top-info">
                                            <h4 className="cart-item-name" title={item.name}>{cleanTitle}</h4>
                                            <span className="cart-item-gram-pill">{gramBadge}</span>
                                        </div>

                                        <div className="cart-item-controls-row">
                                            <div className="cart-qty-counter">
                                                <button 
                                                    onClick={() => onUpdateQuantity && onUpdateQuantity(index, item.quantity - 1)}
                                                    aria-label="Decrease quantity"
                                                >-</button>
                                                <span>{item.quantity}</span>
                                                <button 
                                                    onClick={() => onUpdateQuantity && onUpdateQuantity(index, item.quantity + 1)}
                                                    aria-label="Increase quantity"
                                                >+</button>
                                            </div>
                                            <span className="cart-item-unit-price">₹{itemPriceNum} / unit</span>
                                            <span className="cart-item-total-price">₹{lineTotal}</span>
                                        </div>
                                    </div>

                                    <button 
                                        className="cart-item-delete-btn" 
                                        onClick={() => onRemove(index)}
                                        title="Remove Item"
                                        aria-label="Remove Item"
                                    >
                                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="3 6 5 6 21 6"></polyline>
                                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                        </svg>
                                    </button>
                                </div>
                            );
                        })
                    )}
                </div>
                
                {/* Edge-to-Edge Footer Subtotal & Checkout CTA */}
                <div className="cart-drawer-footer" style={{ opacity: cart.length === 0 ? 0.6 : 1 }}>
                    <div className="cart-subtotal-row">
                        <span className="subtotal-label">Subtotal</span>
                        <span className="subtotal-val">₹{subtotal}</span>
                    </div>

                    <p style={{ fontSize: '0.74rem', color: '#646a66', marginBottom: '14px', textAlign: 'center' }}>
                        Taxes and shipping calculated at checkout
                    </p>

                    <button 
                        className="checkout-pill-btn" 
                        onClick={onCheckout}
                        disabled={cart.length === 0}
                    >
                        <span>🔒 {t('checkoutBtn')}</span>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                            <polyline points="12 5 19 12 12 19"></polyline>
                        </svg>
                    </button>
                </div>

            </div>
        </div>
    );
}
