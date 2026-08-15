import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { fetchAddressesApi, createOrderApi } from '../services/api';

export default function CartDrawer({
    isOpen,
    onClose,
    cart,
    products = [],
    onUpdateQuantity,
    onRemove,
    onCheckout,
    onCheckoutSuccess,
    user,
    onAuthOpen,
    setPage,
    showToast
}) {
    const { t } = useLanguage();
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen && user) {
            loadUserAddress();
        }
    }, [isOpen, user]);

    const loadUserAddress = async () => {
        const res = await fetchAddressesApi();
        if (res.success && res.data && res.data.length > 0) {
            const def = res.data.find(a => a.is_default) || res.data[0];
            setSelectedAddress(def);
        } else {
            setSelectedAddress(null);
        }
    };

    const subtotal = cart.reduce((sum, item) => sum + (parseFloat(item.price) || 0) * item.quantity, 0);
    const totalQty = cart.reduce((sum, item) => sum + item.quantity, 0);

    const handleAddressRedirect = () => {
        onClose();
        if (setPage) {
            setPage('profile');
        }
    };

    const handleCheckoutClick = async () => {
        if (!user) {
            if (onAuthOpen) onAuthOpen();
            return;
        }

        if (!selectedAddress) {
            if (showToast) {
                showToast('Delivery Address Required', 'Please add or select a delivery address to place your order.', 'warning');
            } else {
                alert('Please add or select a delivery address to place your order.');
            }
            handleAddressRedirect();
            return;
        }

        setIsSubmitting(true);

        try {
            const payload = {
                address_id: selectedAddress.id,
                items: cart.map(item => {
                    const rawId = item.product_id || item.id;
                    const productId = typeof rawId === 'number' ? rawId : (parseInt(rawId, 10) || null);
                    return {
                        id: item.id,
                        product_id: productId,
                        name: item.name,
                        price: parseFloat(item.price) || 0,
                        quantity: item.quantity,
                        package_size: item.name.match(/\(([^)]+)\)/)?.[1] || '300g'
                    };
                }),
                subtotal: subtotal,
                total_amount: subtotal,
                payment_method: 'COD'
            };

            const res = await createOrderApi(payload);

            if (res.success) {
                const orderData = res.data || {};
                const orderNum = orderData.order_number || ('MHF-' + Date.now().toString().slice(-6));

                if (showToast) {
                    showToast('Order Placed Successfully!', `Order #${orderNum} has been recorded. Thank you for your purchase!`, 'success');
                }

                if (onCheckoutSuccess) {
                    onCheckoutSuccess(orderData);
                } else if (onCheckout) {
                    onCheckout(orderData);
                }
            } else {
                if (showToast) {
                    showToast('Checkout Failed', res.message || 'Unable to complete order.', 'error');
                } else {
                    alert(res.message || 'Unable to complete order.');
                }
            }
        } catch (err) {
            console.error('Checkout error:', err);
            if (showToast) {
                showToast('Checkout Error', 'An unexpected error occurred during checkout.', 'error');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

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
                            const matchedProduct = products.find(p => String(p.id) === String(item.id) || String(item.id).startsWith(String(p.id))) || products[0];
                            const itemImg = matchedProduct ? (matchedProduct.image || (matchedProduct.images ? matchedProduct.images[0] : '')) : '/assets/images/300g_amutham/amutham-01.jpg';
                            const itemPriceNum = parseFloat(item.price) || 110;
                            const lineTotal = itemPriceNum * item.quantity;

                            // Extract gram size badge (e.g. 300g vs 500g)
                            const matchGram = item.name.match(/\((\d+g[^\)]*)\)/i);
                            const gramBadge = matchGram ? matchGram[1] : (matchedProduct.weights ? matchedProduct.weights[0] : '300g');
                            const cleanTitle = item.name.replace(/\s*\(\d+g[^\)]*\)/i, '');

                            return (
                                <div className="cart-item-card" key={`${item.id}-${index}`}>
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
                    
                    {/* Delivery Address Section inside Cart */}
                    {cart.length > 0 && (
                        <div className="cart-address-box">
                            <div className="cart-address-header">
                                <div className="cart-address-title-group">
                                    <span className="cart-address-icon">📍</span>
                                    <span className="cart-address-title">Delivery Destination</span>
                                </div>
                                {user && (
                                    <button 
                                        className="cart-address-manage-btn"
                                        onClick={handleAddressRedirect}
                                    >
                                        {selectedAddress ? 'Change Address ↗' : '+ Add Address'}
                                    </button>
                                )}
                            </div>

                            {!user ? (
                                <div className="cart-address-guest">
                                    <p className="cart-address-guest-text">
                                        Sign in to select your saved delivery address.
                                    </p>
                                    <button 
                                        className="cart-address-signin-btn"
                                        onClick={() => {
                                            if (onAuthOpen) onAuthOpen();
                                        }}
                                    >
                                        Sign In to Add / Select Address
                                    </button>
                                </div>
                            ) : selectedAddress ? (
                                <div className="cart-address-details">
                                    <div className="cart-address-name-row">
                                        <span className="cart-address-badge">{selectedAddress.type || 'Home'}</span>
                                        <strong className="cart-address-name">{selectedAddress.full_name || selectedAddress.name}</strong>
                                        {selectedAddress.phone_number && (
                                            <span className="cart-address-phone">📞 {selectedAddress.phone_number}</span>
                                        )}
                                    </div>
                                    <p className="cart-address-text">
                                        {selectedAddress.address_line1 || selectedAddress.line1}
                                        {selectedAddress.address_line2 ? `, ${selectedAddress.address_line2}` : ''}, {selectedAddress.city}, {selectedAddress.state} - <strong>{selectedAddress.pincode}</strong>
                                    </p>
                                </div>
                            ) : (
                                <div className="cart-address-empty">
                                    <p style={{ margin: '0 0 8px 0', fontSize: '0.82rem', color: '#64748b' }}>No saved delivery address found.</p>
                                    <button 
                                        className="cart-address-add-btn"
                                        onClick={handleAddressRedirect}
                                    >
                                        + Add New Delivery Address
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="cart-subtotal-row">
                        <span className="subtotal-label">Subtotal</span>
                        <span className="subtotal-val">₹{subtotal}</span>
                    </div>

                    <p style={{ fontSize: '0.74rem', color: '#646a66', marginBottom: '14px', textAlign: 'center' }}>
                        Taxes and shipping calculated at checkout
                    </p>

                    <button 
                        className="checkout-pill-btn" 
                        onClick={handleCheckoutClick}
                        disabled={cart.length === 0 || isSubmitting}
                    >
                        <span>
                            {isSubmitting 
                                ? 'Processing Checkout...' 
                                : (!user ? 'Sign In to Checkout' : t('checkoutBtn'))
                            }
                        </span>
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
