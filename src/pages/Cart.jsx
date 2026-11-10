import React, { useState, useEffect } from 'react';
import { 
    ArrowLeft, 
    Minus, 
    Plus, 
    Trash2, 
    Lock, 
    ShieldCheck, 
    Truck, 
    Sparkles, 
    CheckCircle2, 
    Banknote, 
    ShoppingBag, 
    Leaf, 
    Tag, 
    Check, 
    ArrowRight 
} from 'lucide-react';
import { createOrderApi, fetchAddressesApi, clearCartApi } from '../services/api';

export default function Cart({
    cart = [],
    products = [],
    onUpdateQuantity,
    onRemoveFromCart,
    onClearCart,
    user,
    setPage,
    showToast,
    onAuthOpen
}) {
    // Saved addresses from user profile
    const [savedAddresses, setSavedAddresses] = useState([]);
    const [loadingAddresses, setLoadingAddresses] = useState(Boolean(user));
    const [selectedAddressId, setSelectedAddressId] = useState(null);
    const [deliveryInstructions, setDeliveryInstructions] = useState('');

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [orderSuccessData, setOrderSuccessData] = useState(null);
    const [selectedPayment] = useState('COD'); // Only COD as requested

    const getTypeIcon = (type) => {
        switch (type) {
            case 'Home': return '🏡';
            case 'Office': return '🏢';
            default: return '📍';
        }
    };

    const handleSelectSavedAddress = (addr) => {
        setSelectedAddressId(addr.id);
    };

    // Load saved addresses if user is logged in
    useEffect(() => {
        let isMounted = true;
        if (user) {
            setLoadingAddresses(true);
            async function loadSavedAddress() {
                try {
                    const res = await fetchAddressesApi();
                    if (!isMounted) return;
                    const addrList = Array.isArray(res.data) ? res.data : [];
                    setSavedAddresses(addrList);
                    if (addrList.length > 0) {
                        const def = addrList.find(a => a.is_default) || addrList[0];
                        setSelectedAddressId(def.id);
                    } else {
                        setSelectedAddressId(null);
                    }
                } catch (e) {
                    console.error('Failed to load user address:', e);
                } finally {
                    if (isMounted) setLoadingAddresses(false);
                }
            }
            loadSavedAddress();
        } else {
            setLoadingAddresses(false);
            setSavedAddresses([]);
            setSelectedAddressId(null);
        }
        return () => { isMounted = false; };
    }, [user]);

    // Financial Calculations
    const subtotal = cart.reduce((sum, item) => sum + (parseFloat(item.price) || 0) * item.quantity, 0);
    const regularTotal = cart.reduce((sum, item) => {
        const reg = parseFloat(item.regularPrice || item.actual_price) || (parseFloat(item.price) || 0);
        return sum + (reg > 0 ? reg : (parseFloat(item.price) || 0)) * item.quantity;
    }, 0);
    const totalQty = cart.reduce((sum, item) => sum + item.quantity, 0);

    // Free shipping threshold at ₹499
    const isFreeDelivery = subtotal >= 499 || subtotal === 0;
    const deliveryFee = isFreeDelivery ? 0 : 40;
    const calculatedSavings = regularTotal > subtotal ? (regularTotal - subtotal) : (subtotal > 0 ? Math.round(subtotal * 0.15) : 0);
    const totalAmount = subtotal + deliveryFee;

    const handlePlaceOrder = async (e) => {
        if (e && e.preventDefault) e.preventDefault();

        // Restriction 1: ONLY logged-in users can place an order
        if (!user) {
            if (showToast) {
                showToast('Sign In Required', 'Please sign in to your account to place an order.', 'warning');
            }
            if (onAuthOpen) onAuthOpen('login');
            return;
        }

        // Restriction 2: Cart cannot be empty
        if (cart.length === 0) {
            if (showToast) showToast('Your cart is empty', 'Please add products to your cart before placing an order.', 'warning');
            return;
        }

        // Restriction 3: Delivery address must exist in profile
        if (!savedAddresses || savedAddresses.length === 0 || !selectedAddressId) {
            if (showToast) {
                showToast(
                    'Delivery Address Required',
                    'Please add your delivery address in Profile Settings to complete your order.',
                    'warning'
                );
            }
            if (setPage) setPage('profile', 'address');
            return;
        }

        const selectedAddr = savedAddresses.find(a => a.id === selectedAddressId) || savedAddresses[0];
        if (!selectedAddr) {
            if (showToast) showToast('Select Address', 'Please select a delivery address.', 'warning');
            return;
        }

        setIsSubmitting(true);

        const street1 = selectedAddr.address_line1 || selectedAddr.address_line_1 || selectedAddr.address || '';
        const street2 = selectedAddr.address_line2 || selectedAddr.address_line_2 || '';
        const fullStreet = street2 ? `${street1}, ${street2}` : street1;

        const orderPayload = {
            address_id: selectedAddr.id,
            items: cart.map(item => {
                const rawId = item.product_id || item.id;
                const productId = typeof rawId === 'number' ? rawId : (parseInt(rawId, 10) || null);
                return {
                    id: item.id,
                    product_id: productId,
                    name: item.name,
                    price: parseFloat(item.price) || 0,
                    quantity: item.quantity,
                    package_size: item.size || item.name.match(/\(([^)]+)\)/)?.[1] || '500g Package'
                };
            }),
            subtotal: subtotal,
            shipping_fee: deliveryFee,
            total_amount: totalAmount,
            payment_method: 'COD',
            shipping_address: {
                name: selectedAddr.full_name || selectedAddr.name || user.full_name || user.name || '',
                phone: selectedAddr.phone_number || selectedAddr.phone || user.contact_number || user.phone || '',
                email: user.email || '',
                address: fullStreet,
                city: selectedAddr.city || '',
                state: selectedAddr.state || '',
                pincode: selectedAddr.pincode || '',
                instructions: (deliveryInstructions || '').trim()
            }
        };

        try {
            const res = await createOrderApi(orderPayload);
            if (res.success) {
                const orderData = res.data || {};
                setOrderSuccessData({
                    ...orderData,
                    selectedAddress: selectedAddr,
                    deliveryAddressText: fullStreet,
                    deliveryContact: selectedAddr.phone_number || selectedAddr.phone || user.contact_number || user.phone || ''
                });
                if (onClearCart) onClearCart();
                else clearCartApi();
                if (showToast) {
                    showToast('Order Placed Successfully! 🎉', `Order #${orderData.order_number || 'Confirmed'} has been recorded.`, 'success');
                }
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                if (showToast) showToast('Order Failed', res.message || 'Could not place order. Please try again.', 'error');
            }
        } catch (err) {
            console.error('Order placement error:', err);
            if (showToast) showToast('Error', 'An unexpected error occurred while placing your order.', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Step 4: Order Confirmation View
    if (orderSuccessData) {
        return (
            <main className="dedicated-cart-page">
                <div className="container cart-container">
                    
                    {/* Header Progress Tracker */}
                    <div className="cart-header-row">
                        <div className="cart-header-title-block">
                            <h1 className="cart-title">Order Confirmed! 🎉</h1>
                            <p className="cart-subtitle">Thank you for your order. We are preparing your fresh healthy foods.</p>
                        </div>

                        <div className="cart-steps-indicator">
                            <div className="step-item completed">
                                <span className="step-circle"><Check size={14} /></span>
                                <span className="step-text">Cart</span>
                            </div>
                            <span className="step-connector completed" />
                            <div className="step-item completed">
                                <span className="step-circle"><Check size={14} /></span>
                                <span className="step-text">Delivery</span>
                            </div>
                            <span className="step-connector completed" />
                            <div className="step-item completed">
                                <span className="step-circle"><Check size={14} /></span>
                                <span className="step-text">Payment</span>
                            </div>
                            <span className="step-connector completed" />
                            <div className="step-item active">
                                <span className="step-circle">4</span>
                                <span className="step-text">Confirmation</span>
                            </div>
                        </div>
                    </div>

                    <div className="order-success-card">
                        <div className="success-icon-badge">
                            <CheckCircle2 size={56} className="success-check-svg" />
                        </div>
                        <h2>Your Order Has Been Placed Successfully!</h2>
                        <p className="order-number-display">
                            Order Reference: <strong>#{orderSuccessData.order_number || 'MHF-' + Date.now().toString().slice(-6)}</strong>
                        </p>
                        <p className="order-payment-method-tag">
                            <Banknote size={16} /> Payment Mode: <strong>Cash on Delivery (COD)</strong>
                        </p>

                        <div className="order-summary-box">
                            <div className="summary-row">
                                <span>Amount Payable at Doorstep:</span>
                                <strong>₹{orderSuccessData.total_amount || totalAmount}</strong>
                            </div>
                            <div className="summary-row">
                                <span>Delivery Address:</span>
                                <span>{orderSuccessData.deliveryAddressText || 'Saved Profile Address'}, {orderSuccessData.selectedAddress?.city || ''} {orderSuccessData.selectedAddress?.pincode ? '- ' + orderSuccessData.selectedAddress.pincode : ''}</span>
                            </div>
                            <div className="summary-row">
                                <span>Contact Number:</span>
                                <span>{orderSuccessData.deliveryContact || user?.contact_number || user?.phone || 'On file'}</span>
                            </div>
                            <div className="summary-row">
                                <span>Estimated Dispatch:</span>
                                <span>Within 24 Hours • Express Delivery</span>
                            </div>
                        </div>

                        <div className="order-success-actions">
                            <button 
                                type="button" 
                                className="btn-primary-cart"
                                onClick={() => setPage ? setPage('shop') : window.location.assign('/products')}
                            >
                                <ShoppingBag size={18} />
                                <span>Continue Shopping</span>
                            </button>

                            {user && (
                                <button 
                                    type="button" 
                                    className="btn-outline-cart"
                                    onClick={() => setPage ? setPage('profile') : window.location.assign('/profile')}
                                >
                                    <span>View My Orders</span>
                                </button>
                            )}
                        </div>
                    </div>

                </div>
            </main>
        );
    }

    return (
        <main className="dedicated-cart-page">
            <div className="container cart-container">

                {/* Back to Shopping Navigation */}
                <div className="cart-back-row">
                    <button 
                        type="button" 
                        className="cart-continue-btn"
                        onClick={() => setPage ? setPage('shop') : window.location.assign('/products')}
                    >
                        <ArrowLeft size={16} />
                        <span>Continue Shopping</span>
                    </button>
                </div>

                {/* Cart Page Title & 4-Step Progress Indicator */}
                <div className="cart-header-row">
                    <div className="cart-header-title-block">
                        <div className="cart-title-wrap">
                            <h1 className="cart-title">Your Cart</h1>
                            <Leaf size={24} className="cart-leaf-icon" />
                        </div>
                        <p className="cart-subtitle">Review your items and place your order</p>
                    </div>

                    <div className="cart-steps-indicator">
                        <div className="step-item active">
                            <span className="step-circle">1</span>
                            <span className="step-text">Cart</span>
                        </div>
                        <span className="step-connector" />
                        <div className="step-item">
                            <span className="step-circle">2</span>
                            <span className="step-text">Delivery</span>
                        </div>
                        <span className="step-connector" />
                        <div className="step-item">
                            <span className="step-circle">3</span>
                            <span className="step-text">Payment</span>
                        </div>
                        <span className="step-connector" />
                        <div className="step-item">
                            <span className="step-circle">4</span>
                            <span className="step-text">Confirmation</span>
                        </div>
                    </div>
                </div>

                {/* Main 2-Column Cart Layout */}
                <div className="cart-layout-grid">

                    {/* Left Column: Items List + Delivery Information */}
                    <div className="cart-left-column">

                        {/* Card 1: Cart Items */}
                        <div className="cart-section-card">
                            <div className="cart-section-header">
                                <h2 className="section-title">Cart Items ({totalQty})</h2>
                            </div>

                            {cart.length === 0 ? (
                                <div className="empty-cart-view">
                                    <div className="empty-cart-icon-wrap">
                                        <ShoppingBag size={48} />
                                    </div>
                                    <h3>Your Cart is Currently Empty</h3>
                                    <p>Explore our ancestral stone-ground sprouted health mixes and pure organic foods.</p>
                                    <button 
                                        type="button" 
                                        className="btn-primary-cart"
                                        onClick={() => setPage ? setPage('shop') : window.location.assign('/products')}
                                    >
                                        <span>Browse Products</span>
                                        <ArrowRight size={16} />
                                    </button>
                                </div>
                            ) : (
                                <div className="cart-items-list">
                                    {cart.map((item, index) => {
                                        const cleanImg = item.image || '/assets/images/categories/organic-food-ingredients.png';
                                        const itemUnitPrice = parseFloat(item.price) || 0;
                                        const itemTotalPrice = itemUnitPrice * item.quantity;
                                        const sizeLabel = item.size || item.name.match(/\(([^)]+)\)/)?.[1] || 'Standard Pack';
                                        const cleanTitle = (item.name || 'Mangalam Health Mix').replace(/\s*\([^)]*\)/g, '').trim();

                                        return (
                                            <div key={item.cart_item_id || item.id || index} className="cart-item-row">
                                                <div className="item-thumbnail-box">
                                                    <img 
                                                        src={cleanImg} 
                                                        alt={item.name} 
                                                        onError={(e) => {
                                                            e.currentTarget.onerror = null;
                                                            e.currentTarget.src = '/assets/images/categories/organic-food-ingredients.png';
                                                        }}
                                                    />
                                                </div>

                                                <div className="item-info-col">
                                                    <h3 className="item-name">{cleanTitle}</h3>
                                                    <p className="item-meta">Farm Fresh • {sizeLabel}</p>
                                                    <div className="item-badge-pill">
                                                        <Leaf size={11} />
                                                        <span>100% Organic</span>
                                                    </div>
                                                </div>

                                                <div className="item-stepper-col">
                                                    <div className="cart-stepper">
                                                        <button 
                                                            type="button" 
                                                            onClick={() => onUpdateQuantity && onUpdateQuantity(item.cart_item_id || item.id, item.quantity - 1, item.package_size_id)}
                                                            className="stepper-btn"
                                                            aria-label="Decrease quantity"
                                                        >
                                                            <Minus size={14} />
                                                        </button>
                                                        <span className="stepper-qty">{item.quantity}</span>
                                                        <button 
                                                            type="button" 
                                                            onClick={() => onUpdateQuantity && onUpdateQuantity(item.cart_item_id || item.id, item.quantity + 1, item.package_size_id)}
                                                            className="stepper-btn"
                                                            aria-label="Increase quantity"
                                                        >
                                                            <Plus size={14} />
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="item-price-remove-col">
                                                    <span className="item-total-price">₹{itemTotalPrice}</span>
                                                    <button 
                                                        type="button" 
                                                        className="item-remove-btn"
                                                        onClick={() => onRemoveFromCart && onRemoveFromCart(item.cart_item_id || item.id, item.package_size_id)}
                                                    >
                                                        <Trash2 size={14} />
                                                        <span>Remove</span>
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {cart.length > 0 && (
                                <div className="cart-organic-banner">
                                    <Leaf size={16} className="organic-leaf-icon" />
                                    <span>Good choice! You're choosing fresh, organic & healthy traditional food.</span>
                                </div>
                            )}
                        </div>

                        {/* Card 2: Delivery Information (Shows profile saved address; redirects if none) */}
                        <div className="cart-section-card">
                            <div className="cart-section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                                <div>
                                    <h2 className="section-title">Delivery Information</h2>
                                    {user && savedAddresses.length > 0 && (
                                        <p style={{ margin: '4px 0 0', fontSize: '0.84rem', color: '#64748b' }}>
                                            Delivering to your saved address
                                        </p>
                                    )}
                                </div>
                                {user && (
                                    <button 
                                        type="button" 
                                        className="cart-add-new-addr-link"
                                        onClick={() => setPage ? setPage('profile', 'address') : window.location.assign('/profile/address')}
                                        style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                                    >
                                        <span>Manage in Profile</span>
                                        <ArrowRight size={14} />
                                    </button>
                                )}
                            </div>

                            {/* Case 1: Loading User Addresses */}
                            {user && loadingAddresses ? (
                                <div className="cart-addr-loading-state" style={{ padding: '36px 16px', textAlign: 'center' }}>
                                    <div className="cart-addr-spinner" style={{ margin: '0 auto 12px' }} />
                                    <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem', fontWeight: 600 }}>
                                        Loading your saved delivery address...
                                    </p>
                                </div>
                            ) : user && savedAddresses.length > 0 ? (
                                /* Case 2: Logged-in User has Saved Address(es) */
                                <div>
                                    <div className="cart-saved-addresses-grid">
                                        {savedAddresses.map((addr) => {
                                            const isSelected = selectedAddressId === addr.id;
                                            const street1 = addr.address_line1 || addr.address_line_1 || addr.address || '';
                                            const street2 = addr.address_line2 || addr.address_line_2 || '';
                                            const fullStreet = street2 ? `${street1}, ${street2}` : street1;

                                            return (
                                                <div 
                                                    key={addr.id} 
                                                    className={`cart-saved-address-card ${isSelected ? 'selected' : ''}`}
                                                    onClick={() => handleSelectSavedAddress(addr)}
                                                    role="button"
                                                    tabIndex={0}
                                                >
                                                    <div className="cart-addr-card-header">
                                                        <div className="cart-addr-radio-wrap">
                                                            <div className={`cart-addr-radio ${isSelected ? 'active' : ''}`}>
                                                                {isSelected && <div className="cart-addr-radio-dot" />}
                                                            </div>
                                                            <span className="cart-addr-type-pill" style={{ 
                                                                background: '#ecfdf5', 
                                                                color: '#065f46', 
                                                                padding: '3px 10px', 
                                                                borderRadius: '20px', 
                                                                fontSize: '0.75rem', 
                                                                fontWeight: 700 
                                                            }}>
                                                                {getTypeIcon(addr.type)} {addr.type?.toUpperCase() || 'HOME'}
                                                            </span>
                                                        </div>
                                                        {addr.is_default ? (
                                                            <span className="cart-addr-default-pill" style={{ 
                                                                background: '#fef3c7', 
                                                                color: '#92400e', 
                                                                padding: '3px 8px', 
                                                                borderRadius: '6px', 
                                                                fontSize: '0.72rem', 
                                                                fontWeight: 800 
                                                            }}>
                                                                ★ DEFAULT ADDRESS
                                                            </span>
                                                        ) : null}
                                                    </div>

                                                    <h4 className="cart-addr-name">{addr.full_name || addr.name || user?.full_name || user?.name || 'Recipient'}</h4>
                                                    <p className="cart-addr-phone">📞 {addr.phone_number || addr.phone || user?.contact_number || user?.phone}</p>
                                                    <p className="cart-addr-text">
                                                        {fullStreet}
                                                        <br />
                                                        {addr.city}, {addr.state} - <strong>{addr.pincode}</strong>
                                                    </p>

                                                    <div className="cart-addr-card-footer">
                                                        <span className={`cart-deliver-tag ${isSelected ? 'active' : ''}`}>
                                                            {isSelected ? '✓ Deliver to this address' : 'Click to select'}
                                                        </span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    <div className="cart-addr-options-bar">
                                        <button 
                                            type="button" 
                                            className="cart-add-new-addr-link"
                                            onClick={() => setPage ? setPage('profile', 'address') : window.location.assign('/profile/address')}
                                        >
                                            + Add or Edit Address in Profile
                                        </button>
                                    </div>

                                    {/* Optional Delivery Instructions */}
                                    <div className="form-group" style={{ marginTop: '16px' }}>
                                        <label htmlFor="deliveryInstructions">Delivery Instructions (Optional)</label>
                                        <input 
                                            type="text" 
                                            id="deliveryInstructions" 
                                            name="deliveryInstructions"
                                            value={deliveryInstructions}
                                            onChange={(e) => setDeliveryInstructions(e.target.value)}
                                            placeholder="e.g. Leave at door, ring bell, call upon arrival, etc."
                                        />
                                    </div>
                                </div>
                            ) : user && savedAddresses.length === 0 ? (
                                /* Case 3: Logged-in User has NO Saved Address */
                                <div className="cart-no-address-state">
                                    <div className="cart-no-addr-icon">📍</div>
                                    <h3 className="cart-no-addr-title">No Saved Delivery Address</h3>
                                    <p className="cart-no-addr-desc">
                                        You haven't added a delivery address to your account yet. Please add your address in Profile Settings to complete checkout.
                                    </p>
                                    <button 
                                        type="button" 
                                        className="btn-primary-cart cart-go-profile-btn"
                                        onClick={() => setPage ? setPage('profile', 'address') : window.location.assign('/profile/address')}
                                    >
                                        <span>+ Add Delivery Address in Profile</span>
                                        <ArrowRight size={16} />
                                    </button>
                                </div>
                            ) : (
                                /* Case 4: Guest User - Sign in required to place order */
                                <div className="cart-guest-login-card">
                                    <div className="cart-guest-login-icon-badge">
                                        <Lock size={28} />
                                    </div>
                                    <h3 className="cart-guest-login-title">Sign In to Place Order</h3>
                                    <p className="cart-guest-login-desc">
                                        You must be logged in to your account with a saved delivery address to place an order. Addresses are added and managed securely in your Profile.
                                    </p>
                                    <button 
                                        type="button" 
                                        className="btn-primary-cart cart-guest-login-cta"
                                        onClick={() => onAuthOpen && onAuthOpen('login')}
                                    >
                                        <Lock size={16} />
                                        <span>Sign In / Register</span>
                                        <ArrowRight size={16} />
                                    </button>
                                </div>
                            )}
                        </div>

                    </div>

                    {/* Right Column: Order Summary + Payment Options (COD Only) + Place Order */}
                    <div className="cart-right-column">

                        {/* Order Summary Card */}
                        <div className="cart-summary-card">
                            <div className="summary-header-row">
                                <h2 className="summary-title">Order Summary</h2>
                                <Leaf size={18} className="summary-leaf" />
                            </div>

                            <div className="summary-lines-group">
                                <div className="summary-line">
                                    <span className="line-label">Subtotal ({totalQty} {totalQty === 1 ? 'item' : 'items'})</span>
                                    <span className="line-val">₹{subtotal}</span>
                                </div>

                                <div className="summary-line">
                                    <span className="line-label">Delivery Fee</span>
                                    <span className={`line-val ${deliveryFee === 0 ? 'free-badge' : ''}`}>
                                        {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}
                                    </span>
                                </div>

                                {calculatedSavings > 0 && (
                                    <div className="summary-line discount-line">
                                        <span className="line-label">Discount (NATURAL SAVINGS)</span>
                                        <span className="line-val discount-val">-₹{calculatedSavings}</span>
                                    </div>
                                )}
                            </div>

                            <div className="summary-divider" />

                            <div className="summary-total-row">
                                <div className="total-label-block">
                                    <span className="total-title">Total Amount</span>
                                    <span className="total-sub">Inclusive of all taxes</span>
                                </div>
                                <span className="total-amount-display">₹{totalAmount}</span>
                            </div>

                            {calculatedSavings > 0 && (
                                <div className="savings-highlight-pill">
                                    <Tag size={15} className="tag-icon" />
                                    <span>You saved ₹{calculatedSavings} on this order!</span>
                                    <Leaf size={14} className="leaf-icon" />
                                </div>
                            )}

                            {!isFreeDelivery && subtotal > 0 && (
                                <div className="free-shipping-progress-box">
                                    <span>Add <strong>₹{499 - subtotal}</strong> more for <strong>FREE Delivery!</strong></span>
                                </div>
                            )}
                        </div>

                        {/* Payment Options Card (COD ONLY per user instruction) */}
                        <div className="cart-payment-card">
                            <div className="payment-card-header">
                                <h3 className="payment-title">Payment Options</h3>
                                <div className="secure-badge">
                                    <Lock size={13} />
                                    <span>100% Secure</span>
                                </div>
                            </div>

                            {/* Only Cash on Delivery */}
                            <div className="payment-option-box selected">
                                <div className="payment-radio-circle selected">
                                    <div className="radio-dot" />
                                </div>

                                <div className="payment-icon-wrap cod">
                                    <Banknote size={22} />
                                </div>

                                <div className="payment-meta">
                                    <strong className="payment-name">Cash on Delivery</strong>
                                    <span className="payment-desc">Pay when you receive the order at your doorstep</span>
                                </div>
                            </div>

                            {/* Place Order CTA Button */}
                            {!user ? (
                                <button
                                    type="button"
                                    className="btn-place-order"
                                    onClick={() => {
                                        if (showToast) showToast('Sign In Required', 'Please sign in to your account to place an order.', 'warning');
                                        if (onAuthOpen) onAuthOpen('login');
                                    }}
                                    disabled={cart.length === 0}
                                >
                                    <Lock size={18} />
                                    <span>Sign In to Place Order</span>
                                </button>
                            ) : savedAddresses.length === 0 ? (
                                <button
                                    type="button"
                                    className="btn-place-order"
                                    onClick={() => {
                                        if (showToast) showToast('Delivery Address Required', 'Please add your delivery address in Profile Settings.', 'warning');
                                        if (setPage) setPage('profile', 'address');
                                    }}
                                    disabled={cart.length === 0}
                                >
                                    <span>Add Address in Profile to Order</span>
                                    <ArrowRight size={18} />
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    className="btn-place-order"
                                    onClick={handlePlaceOrder}
                                    disabled={isSubmitting || cart.length === 0 || !selectedAddressId}
                                >
                                    {isSubmitting ? (
                                        <span>Placing Order...</span>
                                    ) : (
                                        <>
                                            <span>Place Order</span>
                                            <ArrowRight size={18} />
                                        </>
                                    )}
                                </button>
                            )}

                            <p className="cart-terms-note">
                                <Lock size={12} />
                                <span>By placing this order, you agree to our Terms & Conditions and Privacy Policy.</span>
                            </p>
                        </div>

                        {/* Why Shop with Mangalam Healthy Foods Trust Strip */}
                        <div className="cart-trust-card">
                            <h4 className="trust-card-title">Why shop with Mangalam Healthy Foods?</h4>
                            <div className="trust-perks-grid">
                                <div className="trust-perk">
                                    <ShieldCheck size={20} className="trust-icon" />
                                    <div>
                                        <strong>Secure Payment</strong>
                                        <span>100% Protected</span>
                                    </div>
                                </div>
                                <div className="trust-perk">
                                    <Leaf size={20} className="trust-icon" />
                                    <div>
                                        <strong>Fresh Guarantee</strong>
                                        <span>Farm to Doorstep</span>
                                    </div>
                                </div>
                                <div className="trust-perk">
                                    <Truck size={20} className="trust-icon" />
                                    <div>
                                        <strong>On-time Delivery</strong>
                                        <span>Always on time</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>

                </div>

            </div>
        </main>
    );
}
