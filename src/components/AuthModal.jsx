import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';

export default function AuthModal({ isOpen, onClose, user, onLogin, onRegister, onLogout }) {
    const { t } = useLanguage();
    const [isRegistering, setIsRegistering] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [phone, setPhone] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        setErrorMsg('');

        if (!email.trim() || !password.trim()) {
            setErrorMsg('Please fill in all required fields.');
            return;
        }

        if (isRegistering && !fullName.trim()) {
            setErrorMsg('Please enter your full name.');
            return;
        }

        if (isRegistering) {
            const newUser = {
                name: fullName || 'Valued Customer',
                email: email,
                phone: phone || '+91 98765 43210',
                joined: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
            };
            onRegister(newUser);
        } else {
            const loggedUser = {
                name: email.split('@')[0].toUpperCase() || 'Member',
                email: email,
                phone: '+91 98765 43210',
                joined: 'Aug 2026'
            };
            onLogin(loggedUser);
        }

        // Reset form
        setEmail('');
        setPassword('');
        setFullName('');
        setPhone('');
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

                {/* Logged In Profile View */}
                {user ? (
                    <div className="auth-profile-body">
                        <div className="auth-profile-avatar-large">
                            <span>{user.name.slice(0, 2).toUpperCase()}</span>
                        </div>
                        <h3 className="auth-profile-name">{user.name}</h3>
                        <p className="auth-profile-email">{user.email}</p>
                        <span className="auth-badge-verified">✓ Verified Wellness Member</span>

                        <div className="auth-profile-info-box">
                            <div className="auth-info-row">
                                <span className="auth-info-label">Mobile:</span>
                                <span className="auth-info-val">{user.phone}</span>
                            </div>
                            <div className="auth-info-row">
                                <span className="auth-info-label">Member Since:</span>
                                <span className="auth-info-val">{user.joined}</span>
                            </div>
                            <div className="auth-info-row">
                                <span className="auth-info-label">Recent Rituals:</span>
                                <span className="auth-info-val">Amutham Health Mix (300g)</span>
                            </div>
                        </div>

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
                    /* Login / Register Form */
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

                        {errorMsg && (
                            <div className="auth-error-alert">
                                <span>⚠️ {errorMsg}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="auth-form">
                            {isRegistering && (
                                <div className="auth-field-group">
                                    <label className="auth-field-label">{t('fullNameHolder')}</label>
                                    <input 
                                        type="text"
                                        placeholder="e.g. Anjali Sundaram"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        className="auth-input-pill"
                                        required
                                    />
                                </div>
                            )}

                            <div className="auth-field-group">
                                <label className="auth-field-label">{t('emailHolder')}</label>
                                <input 
                                    type="email"
                                    placeholder="name@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="auth-input-pill"
                                    required
                                />
                            </div>

                            {isRegistering && (
                                <div className="auth-field-group">
                                    <label className="auth-field-label">{t('phoneHolder')}</label>
                                    <input 
                                        type="tel"
                                        placeholder="+91 98765 43210"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        className="auth-input-pill"
                                    />
                                </div>
                            )}

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
                                    className="auth-input-pill"
                                    required
                                />
                            </div>

                            <button type="submit" className="auth-submit-btn">
                                <span>{isRegistering ? t('createAccountBtn') : t('signInBtn')}</span>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                                    <line x1="5" y1="12" x2="19" y2="12"></line>
                                    <polyline points="12 5 19 12 12 19"></polyline>
                                </svg>
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
                                    setErrorMsg('');
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
