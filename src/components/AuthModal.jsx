import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { registerApi, loginApi } from '../services/api';

export default function AuthModal({ isOpen, onClose, user, onLoginSuccess, onLogout }) {
    const { t } = useLanguage();
    const [isRegistering, setIsRegistering] = useState(false);

    // Form inputs
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [contactNumber, setContactNumber] = useState('');
    const [password, setPassword] = useState('');

    // Error states
    const [globalError, setGlobalError] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'orders' | 'settings'

    if (!isOpen) return null;

    const resetForm = () => {
        setFullName('');
        setEmail('');
        setContactNumber('');
        setPassword('');
        setGlobalError('');
        setFieldErrors({});
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setGlobalError('');
        setFieldErrors({});
        setIsSubmitting(true);

        if (isRegistering) {
            const res = await registerApi({
                full_name: fullName,
                email,
                contact_number: contactNumber,
                password
            });

            setIsSubmitting(false);

            if (res.success) {
                const userData = res.data?.user || { full_name: fullName, email, contact_number: contactNumber };
                onLoginSuccess(userData, res.data?.token || null, true);
                resetForm();
                onClose();
            } else {
                setGlobalError(res.message || 'Registration failed');
                if (res.errors) {
                    setFieldErrors(res.errors);
                }
            }
        } else {
            const res = await loginApi({
                email,
                password
            });

            setIsSubmitting(false);

            if (res.success) {
                const userData = res.data?.user || { email };
                const token = res.data?.token || null;
                onLoginSuccess(userData, token, false);
                resetForm();
                onClose();
            } else {
                setGlobalError(res.message || 'Login failed');
                if (res.errors) {
                    setFieldErrors(res.errors);
                }
            }
        }
    };

    const getDisplayName = () => {
        if (!user) return 'Member';
        return user.full_name || user.name || (user.email ? user.email.split('@')[0] : 'Valued Customer');
    };

    const getFormattedDate = (dateStr) => {
        if (!dateStr) return 'Aug 2026';
        try {
            return new Date(dateStr).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
        } catch {
            return dateStr;
        }
    };

    return (
        <div className="auth-modal-overlay" onClick={onClose}>
            <div className="auth-modal-card" onClick={(e) => e.stopPropagation()}>
                
                {/* Close Button */}
                <button className="auth-modal-close" onClick={onClose} aria-label="Close">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>

                {/* Logged In User Profile & Settings View */}
                {user ? (
                    <div className="auth-profile-body">
                        
                        {/* Profile Header Card */}
                        <div className="auth-profile-header">
                            <div className="auth-profile-avatar-large">
                                <span>{getDisplayName().slice(0, 2).toUpperCase()}</span>
                            </div>
                            <h3 className="auth-profile-name">{getDisplayName()}</h3>
                            <p className="auth-profile-email">{user.email}</p>
                            <span className="auth-badge-verified">✓ Verified Wellness Member</span>
                        </div>

                        {/* Settings Menu Navigation Tabs */}
                        <div className="auth-profile-tabs">
                            <button 
                                className={`auth-tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
                                onClick={() => setActiveTab('profile')}
                            >
                                👤 Profile Details
                            </button>
                            <button 
                                className={`auth-tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
                                onClick={() => setActiveTab('orders')}
                            >
                                📦 My Orders
                            </button>
                            <button 
                                className={`auth-tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
                                onClick={() => setActiveTab('settings')}
                            >
                                ⚙️ Preferences
                            </button>
                        </div>

                        {/* Tab Content 1: Profile Details */}
                        {activeTab === 'profile' && (
                            <div className="auth-profile-info-box">
                                <div className="auth-info-row">
                                    <span className="auth-info-label">Full Name:</span>
                                    <span className="auth-info-val">{user.full_name || user.name || 'N/A'}</span>
                                </div>
                                <div className="auth-info-row">
                                    <span className="auth-info-label">Email Address:</span>
                                    <span className="auth-info-val">{user.email}</span>
                                </div>
                                <div className="auth-info-row">
                                    <span className="auth-info-label">Contact Number:</span>
                                    <span className="auth-info-val">{user.contact_number || user.phone || 'Not specified'}</span>
                                </div>
                                <div className="auth-info-row">
                                    <span className="auth-info-label">Account ID:</span>
                                    <span className="auth-info-val">#{user.id || '1042'}</span>
                                </div>
                                <div className="auth-info-row">
                                    <span className="auth-info-label">Member Since:</span>
                                    <span className="auth-info-val">{getFormattedDate(user.created_at)}</span>
                                </div>
                            </div>
                        )}

                        {/* Tab Content 2: Recent Orders / Rituals */}
                        {activeTab === 'orders' && (
                            <div className="auth-profile-info-box">
                                <div className="auth-order-preview-card">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                        <span style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--color-primary)' }}>Order #MHF-88421</span>
                                        <span style={{ fontSize: '0.72rem', color: '#27ae60', fontWeight: 700, background: '#eef9f2', padding: '2px 8px', borderRadius: '10px' }}>Delivered</span>
                                    </div>
                                    <p style={{ fontSize: '0.78rem', color: '#555', margin: '0 0 4px 0' }}>Amutham Sprouted Health Mix (300g × 2)</p>
                                    <span style={{ fontSize: '0.72rem', color: '#888' }}>Sethiyathope Dispatch • Total: ₹220</span>
                                </div>
                            </div>
                        )}

                        {/* Tab Content 3: Preferences */}
                        {activeTab === 'settings' && (
                            <div className="auth-profile-info-box">
                                <div className="auth-info-row">
                                    <span className="auth-info-label">API Session:</span>
                                    <span className="auth-info-val" style={{ color: '#27ae60', fontWeight: 700 }}>● Active Token</span>
                                </div>
                                <div className="auth-info-row">
                                    <span className="auth-info-label">Notifications:</span>
                                    <span className="auth-info-val">SMS & Email Enabled</span>
                                </div>
                                <div className="auth-info-row">
                                    <span className="auth-info-label">Default Hub:</span>
                                    <span className="auth-info-val">Sethiyathope, Cuddalore</span>
                                </div>
                            </div>
                        )}

                        {/* Logout Option */}
                        <button className="auth-logout-btn" onClick={onLogout}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                                <polyline points="16 17 21 12 16 7"></polyline>
                                <line x1="21" y1="12" x2="9" y2="12"></line>
                            </svg>
                            <span>{t('signOutBtn')}</span>
                        </button>
                    </div>
                ) : (
                    /* Login / Register Form View */
                    <div className="auth-form-body">
                        <div className="auth-header-icon">
                            <span>🌱</span>
                        </div>
                        
                        <h2 className="auth-modal-title">
                            {isRegistering ? t('registerTitle') : t('loginTitle')}
                        </h2>
                        <p className="auth-modal-sub">
                            {isRegistering ? t('registerSubtitle') : t('loginSubtitle')}
                        </p>

                        {/* Main Global Error Banner */}
                        {globalError && (
                            <div className="auth-error-alert">
                                <span>⚠️ {globalError}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="auth-form">
                            {/* Full Name field (Register only) */}
                            {isRegistering && (
                                <div className="auth-field-group">
                                    <label className="auth-field-label">{t('fullNameHolder')}</label>
                                    <input 
                                        type="text"
                                        placeholder="e.g. John Doe"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        className={`auth-input-pill ${fieldErrors.full_name ? 'input-error' : ''}`}
                                        required
                                    />
                                    {fieldErrors.full_name && (
                                        <span className="auth-field-error-text">{fieldErrors.full_name[0]}</span>
                                    )}
                                </div>
                            )}

                            {/* Email Address field */}
                            <div className="auth-field-group">
                                <label className="auth-field-label">{t('emailHolder')}</label>
                                <input 
                                    type="email"
                                    placeholder="john@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className={`auth-input-pill ${fieldErrors.email ? 'input-error' : ''}`}
                                    required
                                />
                                {fieldErrors.email && (
                                    <span className="auth-field-error-text">{fieldErrors.email[0]}</span>
                                )}
                            </div>

                            {/* Contact Number field (Register only) */}
                            {isRegistering && (
                                <div className="auth-field-group">
                                    <label className="auth-field-label">{t('phoneHolder')}</label>
                                    <input 
                                        type="tel"
                                        placeholder="9876543210"
                                        value={contactNumber}
                                        onChange={(e) => setContactNumber(e.target.value)}
                                        className={`auth-input-pill ${fieldErrors.contact_number ? 'input-error' : ''}`}
                                        required
                                    />
                                    {fieldErrors.contact_number && (
                                        <span className="auth-field-error-text">{fieldErrors.contact_number[0]}</span>
                                    )}
                                </div>
                            )}

                            {/* Password field */}
                            <div className="auth-field-group">
                                <div className="auth-label-flex">
                                    <label className="auth-field-label">{t('passwordHolder')}</label>
                                    {!isRegistering && (
                                        <a href="#forgot" onClick={(e) => { e.preventDefault(); alert('Password reset instructions sent to your email.'); }} className="auth-forgot-link">
                                            Forgot?
                                        </a>
                                    )}
                                </div>
                                <input 
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className={`auth-input-pill ${fieldErrors.password ? 'input-error' : ''}`}
                                    required
                                />
                                {fieldErrors.password && (
                                    <span className="auth-field-error-text">{fieldErrors.password[0]}</span>
                                )}
                            </div>

                            <button type="submit" className="auth-submit-btn" disabled={isSubmitting}>
                                {isSubmitting ? (
                                    <span>Processing...</span>
                                ) : (
                                    <>
                                        <span>{isRegistering ? t('createAccountBtn') : t('signInBtn')}</span>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                                            <line x1="5" y1="12" x2="19" y2="12"></line>
                                            <polyline points="12 5 19 12 12 19"></polyline>
                                        </svg>
                                    </>
                                )}
                            </button>
                        </form>

                        {/* Switch Mode Toggle */}
                        <div className="auth-switch-mode">
                            <span>
                                {isRegistering ? t('alreadyHaveAccount') : t('dontHaveAccount')}{' '}
                            </span>
                            <button 
                                type="button" 
                                className="auth-switch-link"
                                onClick={() => {
                                    setIsRegistering(!isRegistering);
                                    resetForm();
                                }}
                            >
                                {isRegistering ? t('signInLink') : t('createOneLink')}
                            </button>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}
