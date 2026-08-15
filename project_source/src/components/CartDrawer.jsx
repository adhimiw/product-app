import React from 'react';

export default function CartDrawer({ isOpen, onClose, cart, onRemove, onCheckout }) {
    const subtotal = cart.reduce((sum, item) => sum + parseFloat(item.price) * item.quantity, 0);
    const totalQty = cart.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <div className={`cart-drawer ${isOpen ? 'active' : ''}`} aria-hidden={!isOpen}>
            <div className="cart-drawer-overlay" onClick={onClose}></div>
            <div className="cart-drawer-content">
                <div className="cart-header">
                    <h2>Your Rituals ({totalQty})</h2>
                    <button className="cart-close" onClick={onClose} aria-label="Close Shopping Cart">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>
                
                <div className="cart-items">
                    {cart.length === 0 ? (
                        <div className="cart-empty-message">
                            Your daily wellness ritual is currently empty. Add a formulation to begin.
                        </div>
                    ) : (
                        cart.map((item, index) => (
                            <div className="cart-item" key={`${item.id}-${item.option}-${index}`}>
                                <div className="cart-item-info">
                                    <h4 className="cart-item-title">{item.name}</h4>
                                    <p className="cart-item-price" style={{ textTransform: 'capitalize', fontSize: '0.75rem', color: '#b3ad7e' }}>
                                        {item.option} plan
                                    </p>
                                    <div className="cart-item-price">
                                        ${parseFloat(item.price).toFixed(2)} x {item.quantity}
                                    </div>
                                </div>
                                <button 
                                    className="cart-item-remove" 
                                    onClick={() => onRemove(index)}
                                >
                                    Remove
                                </button>
                            </div>
                        ))
                    )}
                </div>
                
                <div className="cart-footer" style={{ opacity: cart.length === 0 ? 0.5 : 1 }}>
                    <div className="cart-subtotal">
                        <span>Subtotal</span>
                        <span>${subtotal.toFixed(2)}</span>
                    </div>
                    <button 
                        className="btn btn-primary checkout-btn" 
                        onClick={onCheckout}
                        disabled={cart.length === 0}
                    >
                        Secure Checkout
                    </button>
                </div>
            </div>
        </div>
    );
}
