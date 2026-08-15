import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { 
    updateProfileApi, 
    fetchAddressesApi, 
    storeAddressApi, 
    updateAddressApi, 
    deleteAddressApi, 
    setDefaultAddressApi,
    fetchOrdersApi 
} from '../services/api';

export default function UserProfile({ user, onLogout, onUpdateUser, showToast, setPage }) {
    const { t } = useLanguage();
    const [activeTab, setActiveTab] = useState('info');

    // Profile state
    const [fullName, setFullName] = useState(user?.full_name || user?.name || '');
    const [whatsappNumber, setWhatsappNumber] = useState(user?.whatsapp_number || user?.contact_number || user?.phone || '');
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    // Address Management State
    const [addresses, setAddresses] = useState([]);
    const [loadingAddresses, setLoadingAddresses] = useState(false);
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [editingAddressId, setEditingAddressId] = useState(null);

    // Address Form Inputs
    const [addrType, setAddrType] = useState('Home'); // Home, Office, Other
    const [addrFullName, setAddrFullName] = useState('');
    const [addrPhone, setAddrPhone] = useState('');
    const [addrLine1, setAddrLine1] = useState('');
    const [addrLine2, setAddrLine2] = useState('');
    const [addrCity, setAddrCity] = useState('');
    const [addrState, setAddrState] = useState('');
    const [addrPincode, setAddrPincode] = useState('');
    const [addrIsDefault, setAddrIsDefault] = useState(false);
    const [isSavingAddress, setIsSavingAddress] = useState(false);
    const [addrFormError, setAddrFormError] = useState('');

    // Orders State
    const [orders, setOrders] = useState([]);
    const [loadingOrders, setLoadingOrders] = useState(false);

    useEffect(() => {
        if (user) {
            setFullName(user.full_name || user.name || '');
            setWhatsappNumber(user.whatsapp_number || user.contact_number || user.phone || '');
        }
    }, [user]);

    useEffect(() => {
        if (activeTab === 'address' && user) {
            loadAddresses();
        } else if (activeTab === 'orders' && user) {
            loadOrders();
        }
    }, [activeTab, user]);

    const loadAddresses = async () => {
        setLoadingAddresses(true);
        const res = await fetchAddressesApi();
        if (res.success && res.data) {
            setAddresses(res.data);
        }
        setLoadingAddresses(false);
    };

    const loadOrders = async () => {
        setLoadingOrders(true);
        const res = await fetchOrdersApi();
        if (res.success && res.data) {
            setOrders(res.data);
        }
        setLoadingOrders(false);
    };

    if (!user) {
        return (
            <div className="container" style={{ padding: '120px 20px', textAlign: 'center' }}>
                <h2>Please sign in to view your profile dashboard.</h2>
                <button className="auth-submit-btn" onClick={() => setPage('home')} style={{ maxWidth: '200px', margin: '20px auto' }}>
                    Go to Home
                </button>
            </div>
        );
    }

    const displayName = fullName || user.full_name || user.name || (user.email ? user.email.split('@')[0] : 'Valued Customer');

    const formatDate = (dateStr) => {
        if (!dateStr) return 'Aug 2026';
        try {
            return new Date(dateStr).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
        } catch {
            return dateStr;
        }
    };

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        setErrorMessage('');
        setSaveSuccess(false);

        const updatedData = {
            ...user,
            full_name: fullName,
            name: fullName,
            whatsapp_number: whatsappNumber,
            contact_number: whatsappNumber,
            phone: whatsappNumber
        };

        try {
            const res = await updateProfileApi({
                full_name: fullName,
                whatsapp_number: whatsappNumber,
                contact_number: whatsappNumber,
                token: user?.token
            });

            if (res.success) {
                const mergedUser = { ...updatedData, ...(res.data || {}) };
                if (onUpdateUser) onUpdateUser(mergedUser);
                localStorage.setItem('mangalam_user', JSON.stringify(mergedUser));
                if (showToast) showToast('Profile Updated!', 'Your profile details have been saved successfully.', 'success');
                setSaveSuccess(true);
                setTimeout(() => setSaveSuccess(false), 3500);
            } else {
                const isUnauth = res.status === 401 || (res.message && res.message.toLowerCase().includes('unauthenticated'));
                if (isUnauth) {
                    const msg = 'Session unauthenticated. Please sign out and sign in again to activate your token.';
                    setErrorMessage(msg);
                    if (showToast) showToast('Authentication Error', msg, 'error');
                } else {
                    setErrorMessage(res.message || 'Failed to update profile.');
                    if (showToast) showToast('Update Failed', res.message || 'Failed to update profile.', 'error');
                }
            }
        } catch (err) {
            console.error('Profile update error:', err);
            setErrorMessage('Network error occurred. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    // Address Handlers
    const resetAddressForm = () => {
        setEditingAddressId(null);
        setAddrType('Home');
        setAddrFullName(user?.full_name || user?.name || '');
        setAddrPhone(user?.whatsapp_number || user?.contact_number || user?.phone || '');
        setAddrLine1('');
        setAddrLine2('');
        setAddrCity('');
        setAddrState('Tamil Nadu');
        setAddrPincode('');
        setAddrIsDefault(addresses.length === 0);
        setAddrFormError('');
    };

    const handleOpenAddForm = () => {
        resetAddressForm();
        setShowAddressForm(true);
    };

    const handleOpenEditForm = (addr) => {
        setEditingAddressId(addr.id);
        setAddrType(addr.type || 'Home');
        setAddrFullName(addr.full_name || '');
        setAddrPhone(addr.phone_number || '');
        setAddrLine1(addr.address_line1 || '');
        setAddrLine2(addr.address_line2 || '');
        setAddrCity(addr.city || '');
        setAddrState(addr.state || '');
        setAddrPincode(addr.pincode || '');
        setAddrIsDefault(Boolean(addr.is_default));
        setAddrFormError('');
        setShowAddressForm(true);
    };

    const handleSaveAddressSubmit = async (e) => {
        e.preventDefault();
        setIsSavingAddress(true);
        setAddrFormError('');

        const payload = {
            type: addrType,
            full_name: addrFullName,
            phone_number: addrPhone,
            address_line1: addrLine1,
            address_line2: addrLine2,
            city: addrCity,
            state: addrState,
            pincode: addrPincode,
            is_default: addrIsDefault
        };

        let res;
        if (editingAddressId) {
            res = await updateAddressApi(editingAddressId, payload);
        } else {
            res = await storeAddressApi(payload);
        }

        setIsSavingAddress(false);

        if (res.success) {
            setShowAddressForm(false);
            resetAddressForm();
            loadAddresses();
            if (showToast) {
                showToast(
                    editingAddressId ? 'Address Updated!' : 'Address Saved!',
                    res.message || 'Delivery address saved successfully.',
                    'success'
                );
            }
        } else {
            setAddrFormError(res.message || 'Failed to save address.');
        }
    };

    const handleDeleteAddress = async (id) => {
        if (!window.confirm('Are you sure you want to delete this address?')) return;
        const res = await deleteAddressApi(id);
        if (res.success) {
            loadAddresses();
            if (showToast) showToast('Address Deleted', 'Delivery address removed.', 'info');
        } else {
            if (showToast) showToast('Delete Failed', res.message || 'Unable to delete address.', 'error');
        }
    };

    const handleSetDefaultAddress = async (id) => {
        const res = await setDefaultAddressApi(id);
        if (res.success) {
            loadAddresses();
            if (showToast) showToast('Default Address Set', 'Primary delivery location updated.', 'success');
        }
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case 'Home': return '🏡';
            case 'Office': return '🏢';
            default: return '📍';
        }
    };

    const getTypeBadgeClass = (type) => {
        switch (type) {
            case 'Home': return 'profile-addr-badge-home';
            case 'Office': return 'profile-addr-badge-office';
            default: return 'profile-addr-badge-other';
        }
    };

    return (
        <main className="user-profile-page-container">
            <div className="container">

                {/* Profile Header Hero Banner */}
                <div className="profile-hero-card">
                    <div className="profile-avatar-xl">
                        <span>{displayName.slice(0, 2).toUpperCase()}</span>
                    </div>

                    <div className="profile-hero-details">
                        <div className="profile-hero-title-row">
                            <h1 className="profile-user-fullname">{displayName}</h1>
                        </div>
                        <p className="profile-user-email">{user.email}</p>
                        <span className="profile-member-id">Joined {formatDate(user.created_at)}</span>
                    </div>

                    <button className="profile-logout-top-btn" onClick={onLogout}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                            <polyline points="16 17 21 12 16 7"></polyline>
                            <line x1="21" y1="12" x2="9" y2="12"></line>
                        </svg>
                        <span>Sign Out</span>
                    </button>
                </div>

                {/* Main Dashboard Layout (Sidebar Tabs + Content Area) */}
                <div className="profile-dashboard-grid">

                    {/* Navigation Sidebar */}
                    <aside className="profile-nav-sidebar">
                        <button 
                            className={`profile-nav-item ${activeTab === 'info' ? 'active' : ''}`}
                            onClick={() => setActiveTab('info')}
                        >
                            <span>👤 Account Details & Settings</span>
                        </button>
                        <button 
                            className={`profile-nav-item ${activeTab === 'orders' ? 'active' : ''}`}
                            onClick={() => setActiveTab('orders')}
                        >
                            <span>📦 Order History & Subscriptions</span>
                        </button>
                        <button 
                            className={`profile-nav-item ${activeTab === 'address' ? 'active' : ''}`}
                            onClick={() => setActiveTab('address')}
                        >
                            <span>📍 Saved Delivery Addresses</span>
                        </button>
                        <button 
                            className={`profile-nav-item ${activeTab === 'security' ? 'active' : ''}`}
                            onClick={() => setActiveTab('security')}
                        >
                            <span>🔒 Security & API Access</span>
                        </button>
                    </aside>

                    {/* Main Content Card */}
                    <section className="profile-content-card">

                        {/* Tab 1: Account Details & Settings */}
                        {activeTab === 'info' && (
                            <div className="profile-tab-section">
                                <h3 className="profile-section-title">Personal Profile Information</h3>
                                <p className="profile-section-sub">Manage your official contact details for Sethiyathope orders and health mix deliveries.</p>

                                <form onSubmit={handleSaveProfile}>
                                    <div className="profile-info-grid">
                                        
                                        {/* Full Name - Editable */}
                                        <div className="profile-info-item">
                                            <label className="profile-info-label" htmlFor="user-full-name">Full Name</label>
                                            <input
                                                id="user-full-name"
                                                type="text"
                                                className="profile-info-input"
                                                value={fullName}
                                                onChange={(e) => setFullName(e.target.value)}
                                                placeholder="Enter your full name"
                                                required
                                            />
                                        </div>

                                        {/* Email Address - Disabled */}
                                        <div className="profile-info-item">
                                            <label className="profile-info-label" htmlFor="user-email">
                                                Email Address <span className="profile-disabled-tag">(Disabled)</span>
                                            </label>
                                            <div className="profile-input-wrapper">
                                                <input
                                                    id="user-email"
                                                    type="email"
                                                    className="profile-info-input disabled"
                                                    value={user.email || ''}
                                                    disabled
                                                    readOnly
                                                />
                                                <svg className="profile-lock-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                                                </svg>
                                            </div>
                                        </div>

                                        {/* WhatsApp Number - Editable */}
                                        <div className="profile-info-item">
                                            <label className="profile-info-label" htmlFor="user-whatsapp">
                                                WhatsApp Number
                                            </label>
                                            <input
                                                id="user-whatsapp"
                                                type="tel"
                                                className="profile-info-input"
                                                value={whatsappNumber}
                                                onChange={(e) => setWhatsappNumber(e.target.value)}
                                                placeholder="e.g. 06369810946"
                                                required
                                            />
                                            <span className="profile-field-hint">
                                                💬 Used for dispatch updates & delivery notifications on WhatsApp
                                            </span>
                                        </div>

                                        {/* Registered Date - Read Only */}
                                        <div className="profile-info-item">
                                            <label className="profile-info-label">Registered Date</label>
                                            <div className="profile-info-input disabled" style={{ cursor: 'default', display: 'flex', alignItems: 'center' }}>
                                                {formatDate(user.created_at)}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Notifications */}
                                    {errorMessage && (
                                        <div style={{ marginTop: '16px', padding: '12px 16px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', color: '#991b1b', fontSize: '0.85rem' }}>
                                            ⚠️ {errorMessage}
                                        </div>
                                    )}

                                    {saveSuccess && (
                                        <div style={{ marginTop: '16px', padding: '12px 16px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', color: '#166534', fontSize: '0.85rem', fontWeight: 600 }}>
                                            ✓ Profile details saved successfully!
                                        </div>
                                    )}

                                    {/* Submit Save Button */}
                                    <button type="submit" className="profile-save-btn" disabled={isSaving}>
                                        {isSaving ? (
                                            <>Saving Changes...</>
                                        ) : (
                                            <>
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                                                    <polyline points="17 21 17 13 7 13 7 21"></polyline>
                                                    <polyline points="7 3 7 8 15 8"></polyline>
                                                </svg>
                                                Save Profile Changes
                                            </>
                                        )}
                                    </button>
                                </form>
                            </div>
                        )}

                        {/* Tab 2: Order History */}
                        {activeTab === 'orders' && (
                            <div className="profile-tab-section">
                                <h3 className="profile-section-title">My Orders & Sprouted Health Mix Rituals</h3>
                                <p className="profile-section-sub">Track current dispatch status or review your ancient grain porridge orders.</p>

                                {loadingOrders ? (
                                    <div style={{ textAlign: 'center', padding: '40px 0', color: '#666' }}>
                                        Loading your order history...
                                    </div>
                                ) : orders.length === 0 ? (
                                    <div className="profile-empty-address-box">
                                        <span style={{ fontSize: '2.5rem' }}>📦</span>
                                        <h4>No Orders Placed Yet</h4>
                                        <p>Browse our selection of 100% soak-sprouted health mixes and place your first order today!</p>
                                        <button className="profile-add-addr-btn" onClick={() => setPage('shop')} style={{ marginTop: '12px' }}>
                                            Shop Health Mixes
                                        </button>
                                    </div>
                                ) : (
                                    <div className="profile-orders-list">
                                        {orders.map((ord) => {
                                            const orderDate = formatDate(ord.created_at);
                                            const itemsList = ord.items || [];
                                            const isDelivered = ord.status === 'completed' || ord.status === 'delivered';

                                            return (
                                                <div key={ord.id || ord.order_number} className="profile-order-card">
                                                    <div className="profile-order-header">
                                                        <div>
                                                            <span className="profile-order-number">Order #{ord.order_number}</span>
                                                            <span className="profile-order-date"> • {orderDate}</span>
                                                        </div>
                                                        <span className={isDelivered ? "profile-order-badge-success" : "profile-order-badge-home"}>
                                                            {ord.status ? (ord.status.charAt(0).toUpperCase() + ord.status.slice(1)) : 'Placed'}
                                                        </span>
                                                    </div>

                                                    {itemsList.map((item, idx) => (
                                                        <div key={idx} className="profile-order-items-row">
                                                            <img 
                                                                src="/assets/images/300g_amutham/amutham-01.jpg" 
                                                                alt={item.product_name || 'Health Mix'} 
                                                                className="profile-order-thumb" 
                                                            />
                                                            <div className="profile-order-item-desc">
                                                                <h4 className="profile-order-item-title">{item.product_name || 'Amutham Health Mix'} ({item.package_size || '300g'})</h4>
                                                                <span className="profile-order-item-qty">Qty: {item.quantity} • ₹{item.unit_price} per pack</span>
                                                            </div>
                                                            <div className="profile-order-price">₹{item.total_price || (item.unit_price * item.quantity)}</div>
                                                        </div>
                                                    ))}

                                                    <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                                                        <span style={{ color: '#64748b' }}>
                                                            Payment: <strong>{ord.payment_method || 'COD'}</strong> ({ord.payment_status || 'pending'})
                                                        </span>
                                                        <span style={{ fontWeight: 800, color: 'var(--color-primary, #1e3a29)', fontSize: '1.05rem' }}>
                                                            Total: ₹{ord.total_amount || ord.subtotal}
                                                        </span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Tab 3: Saved Delivery Addresses */}
                        {activeTab === 'address' && (
                            <div className="profile-tab-section">
                                <div className="profile-section-header-flex">
                                    <div>
                                        <h3 className="profile-section-title">Saved Delivery Addresses</h3>
                                        <p className="profile-section-sub">Manage your delivery locations for Home, Office, and Other destinations.</p>
                                    </div>
                                    {!showAddressForm && (
                                        <button className="profile-add-addr-btn" onClick={handleOpenAddForm}>
                                            <span>+ Add New Address</span>
                                        </button>
                                    )}
                                </div>

                                {/* Address Add / Edit Form Card */}
                                {showAddressForm && (
                                    <div className="profile-address-form-card">
                                        <div className="profile-address-form-header">
                                            <h4>{editingAddressId ? '✏️ Edit Delivery Address' : '🏡 Add New Delivery Address'}</h4>
                                            <button className="profile-form-close-btn" onClick={() => setShowAddressForm(false)}>✕</button>
                                        </div>

                                        <form onSubmit={handleSaveAddressSubmit}>
                                            {/* Address Type Selection Pills */}
                                            <div className="profile-addr-type-selector">
                                                <label className="profile-info-label" style={{ width: '100%', marginBottom: '8px' }}>Select Address Type</label>
                                                {['Home', 'Office', 'Other'].map((t) => (
                                                    <button
                                                        key={t}
                                                        type="button"
                                                        className={`profile-addr-type-pill ${addrType === t ? 'active' : ''}`}
                                                        onClick={() => setAddrType(t)}
                                                    >
                                                        <span>{getTypeIcon(t)} {t}</span>
                                                    </button>
                                                ))}
                                            </div>

                                            <div className="profile-info-grid" style={{ marginTop: '16px' }}>
                                                <div className="profile-info-item">
                                                    <label className="profile-info-label">Full Name</label>
                                                    <input
                                                        type="text"
                                                        className="profile-info-input"
                                                        value={addrFullName}
                                                        onChange={(e) => setAddrFullName(e.target.value)}
                                                        placeholder="Recipient Name"
                                                        required
                                                    />
                                                </div>

                                                <div className="profile-info-item">
                                                    <label className="profile-info-label">Phone Number</label>
                                                    <input
                                                        type="tel"
                                                        className="profile-info-input"
                                                        value={addrPhone}
                                                        onChange={(e) => setAddrPhone(e.target.value)}
                                                        placeholder="Delivery Contact Phone"
                                                        required
                                                    />
                                                </div>

                                                <div className="profile-info-item" style={{ gridColumn: 'span 2' }}>
                                                    <label className="profile-info-label">Address Line 1</label>
                                                    <input
                                                        type="text"
                                                        className="profile-info-input"
                                                        value={addrLine1}
                                                        onChange={(e) => setAddrLine1(e.target.value)}
                                                        placeholder="House / Flat No., Building Name, Street"
                                                        required
                                                    />
                                                </div>

                                                <div className="profile-info-item" style={{ gridColumn: 'span 2' }}>
                                                    <label className="profile-info-label">Address Line 2 (Optional)</label>
                                                    <input
                                                        type="text"
                                                        className="profile-info-input"
                                                        value={addrLine2}
                                                        onChange={(e) => setAddrLine2(e.target.value)}
                                                        placeholder="Landmark, Area, Village / Post Office"
                                                    />
                                                </div>

                                                <div className="profile-info-item">
                                                    <label className="profile-info-label">City / District</label>
                                                    <input
                                                        type="text"
                                                        className="profile-info-input"
                                                        value={addrCity}
                                                        onChange={(e) => setAddrCity(e.target.value)}
                                                        placeholder="City or Town"
                                                        required
                                                    />
                                                </div>

                                                <div className="profile-info-item">
                                                    <label className="profile-info-label">State</label>
                                                    <input
                                                        type="text"
                                                        className="profile-info-input"
                                                        value={addrState}
                                                        onChange={(e) => setAddrState(e.target.value)}
                                                        placeholder="State"
                                                        required
                                                    />
                                                </div>

                                                <div className="profile-info-item">
                                                    <label className="profile-info-label">Pincode</label>
                                                    <input
                                                        type="text"
                                                        className="profile-info-input"
                                                        value={addrPincode}
                                                        onChange={(e) => setAddrPincode(e.target.value)}
                                                        placeholder="6-digit PIN code"
                                                        required
                                                    />
                                                </div>

                                                <div className="profile-info-item" style={{ display: 'flex', alignItems: 'center', marginTop: '24px' }}>
                                                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.88rem', fontWeight: 600, color: '#333' }}>
                                                        <input
                                                            type="checkbox"
                                                            checked={addrIsDefault}
                                                            onChange={(e) => setAddrIsDefault(e.target.checked)}
                                                            style={{ width: '18px', height: '18px', accentColor: 'var(--color-primary, #27ae60)' }}
                                                        />
                                                        Set as default delivery address
                                                    </label>
                                                </div>
                                            </div>

                                            {addrFormError && (
                                                <div style={{ marginTop: '12px', padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#991b1b', fontSize: '0.85rem' }}>
                                                    ⚠️ {addrFormError}
                                                </div>
                                            )}

                                            <div className="profile-form-actions-row">
                                                <button type="button" className="profile-cancel-btn" onClick={() => setShowAddressForm(false)}>
                                                    Cancel
                                                </button>
                                                <button type="submit" className="profile-save-btn" disabled={isSavingAddress} style={{ margin: 0 }}>
                                                    {isSavingAddress ? 'Saving Address...' : (editingAddressId ? 'Update Address' : 'Save Address')}
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                )}

                                {/* Saved Addresses Display Grid */}
                                {loadingAddresses ? (
                                    <div style={{ textAlign: 'center', padding: '40px 0', color: '#666' }}>
                                        Loading saved addresses...
                                    </div>
                                ) : addresses.length === 0 && !showAddressForm ? (
                                    <div className="profile-empty-address-box">
                                        <span style={{ fontSize: '2.5rem' }}>📍</span>
                                        <h4>No Saved Addresses Yet</h4>
                                        <p>Add your Home, Office, or Other delivery addresses for quick and effortless checkout.</p>
                                        <button className="profile-add-addr-btn" onClick={handleOpenAddForm} style={{ marginTop: '12px' }}>
                                            + Add Your First Address
                                        </button>
                                    </div>
                                ) : (
                                    <div className="profile-addresses-grid">
                                        {addresses.map((addr) => (
                                            <div key={addr.id} className={`profile-address-card ${addr.is_default ? 'is-default' : ''}`}>
                                                <div className="profile-address-card-header">
                                                    <span className={`profile-addr-badge ${getTypeBadgeClass(addr.type)}`}>
                                                        {getTypeIcon(addr.type)} {addr.type}
                                                    </span>
                                                    {addr.is_default && (
                                                        <span className="profile-default-tag">★ DEFAULT ADDRESS</span>
                                                    )}
                                                </div>

                                                <h4 className="profile-address-name">{addr.full_name}</h4>
                                                <p className="profile-address-phone">📞 {addr.phone_number}</p>
                                                <p className="profile-address-text">
                                                    {addr.address_line1}
                                                    {addr.address_line2 ? `, ${addr.address_line2}` : ''}<br />
                                                    {addr.city}, {addr.state} - <strong>{addr.pincode}</strong>
                                                </p>

                                                <div className="profile-address-card-actions">
                                                    {!addr.is_default && (
                                                        <button className="profile-addr-action-btn default" onClick={() => handleSetDefaultAddress(addr.id)}>
                                                            Set as Default
                                                        </button>
                                                    )}
                                                    <button className="profile-addr-action-btn edit" onClick={() => handleOpenEditForm(addr)}>
                                                        ✏️ Edit
                                                    </button>
                                                    <button className="profile-addr-action-btn delete" onClick={() => handleDeleteAddress(addr.id)}>
                                                        🗑️ Delete
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Tab 4: Security & API Access */}
                        {activeTab === 'security' && (
                            <div className="profile-tab-section">
                                <h3 className="profile-section-title">Security & Session Status</h3>
                                <p className="profile-section-sub">Authenticated via Laravel Sanctum Token Authentication.</p>

                                <div className="profile-info-grid">
                                    <div className="profile-info-item">
                                        <label className="profile-info-label">API Endpoint</label>
                                        <div className="profile-info-val-box">http://127.0.0.1:8000/api</div>
                                    </div>
                                    <div className="profile-info-item">
                                        <label className="profile-info-label">Token Status</label>
                                        <div className="profile-info-val-box" style={{ color: '#27ae60', fontWeight: 700 }}>
                                            Active bearer token in localStorage
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                    </section>
                </div>

            </div>
        </main>
    );
}
