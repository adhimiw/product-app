import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useBranding } from '../context/BrandingContext';
import { 
    registerApi, 
    loginApi, 
    sendForgotPasswordOtpApi, 
    verifyForgotPasswordOtpApi, 
    resetForgotPasswordApi 
} from '../services/api';
import { 
    Eye, 
    EyeOff, 
    ArrowLeft, 
    Clock, 
    Check, 
    CheckCircle2, 
    AlertCircle, 
    KeyRound, 
    Mail, 
    Lock, 
    RefreshCw,
    ShieldCheck
} from 'lucide-react';

export default function AuthModal({ isOpen, onClose, user, onLoginSuccess, onLogout }) {
    const { t } = useLanguage();
    const { branding } = useBranding();

    // View state: 'login' | 'register' | 'forgot-email' | 'forgot-otp' | 'forgot-new-password' | 'forgot-success'
    const [authView, setAuthView] = useState('login');

    // Registration inputs
    const [fullName, setFullName] = useState('');
    const [contactNumber, setContactNumber] = useState('');

    // Shared credentials
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // Forgot Password Flow states
    const [otp, setOtp] = useState('');
    const [resetToken, setResetToken] = useState(null);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Timers: 5-minute OTP validity (300s) & 60-second Resend Cooldown
    const [otpSecondsLeft, setOtpSecondsLeft] = useState(300);
    const [resendCooldown, setResendCooldown] = useState(0);

    // Errors & feedback
    const [globalError, setGlobalError] = useState('');
    const [globalSuccess, setGlobalSuccess] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Profile tabs
    const [activeTab, setActiveTab] = useState('profile');

    const otpInputRef = useRef(null);
    const newPasswordInputRef = useRef(null);

    // Countdown timer for 5-minute OTP validity & 60-sec resend
    useEffect(() => {
        let interval = null;
        if (authView === 'forgot-otp') {
            interval = setInterval(() => {
                setOtpSecondsLeft(prev => (prev > 0 ? prev - 1 : 0));
                setResendCooldown(prev => (prev > 0 ? prev - 1 : 0));
            }, 1000);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [authView]);

    // Auto-focus inputs on view changes
    useEffect(() => {
        if (authView === 'forgot-otp' && otpInputRef.current) {
            otpInputRef.current.focus();
        } else if (authView === 'forgot-new-password' && newPasswordInputRef.current) {
            newPasswordInputRef.current.focus();
        }
    }, [authView]);

    if (!isOpen) return null;

    const resetForm = () => {
        setFullName('');
        setContactNumber('');
        setEmail('');
        setPassword('');
        setOtp('');
        setResetToken(null);
        setNewPassword('');
        setConfirmPassword('');
        setGlobalError('');
        setGlobalSuccess('');
        setFieldErrors({});
        setShowPassword(false);
        setShowNewPassword(false);
        setShowConfirmPassword(false);
    };

    const handleSwitchToLogin = () => {
        setAuthView('login');
        setGlobalError('');
        setGlobalSuccess('');
        setFieldErrors({});
    };

    const handleSwitchToRegister = () => {
        setAuthView('register');
        setGlobalError('');
        setGlobalSuccess('');
        setFieldErrors({});
    };

    const handleStartForgotPassword = () => {
        setAuthView('forgot-email');
        setGlobalError('');
        setGlobalSuccess('');
        setFieldErrors({});
        setOtp('');
        setResetToken(null);
    };

    // Format remaining seconds into MM:SS
    const formatTimer = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    };

    // Masked Email for Security Preview
    const getMaskedEmail = (rawEmail) => {
        if (!rawEmail || !rawEmail.includes('@')) return rawEmail;
        const [userPart, domain] = rawEmail.split('@');
        if (userPart.length <= 2) {
            return `${userPart.charAt(0)}***@${domain}`;
        }
        return `${userPart.slice(0, 2)}***${userPart.slice(-1)}@${domain}`;
    };

    // Real-time password requirement checks
    const passwordChecks = {
        hasLength: newPassword.length >= 8,
        hasUpper: /[A-Z]/.test(newPassword),
        hasLower: /[a-z]/.test(newPassword),
        hasNumber: /[0-9]/.test(newPassword),
        hasSpecial: /[@$!%*#?&^_\-]/.test(newPassword),
        isMatch: newPassword.length > 0 && newPassword === confirmPassword,
    };
    const isPasswordStrong = 
        passwordChecks.hasLength && 
        passwordChecks.hasUpper && 
        passwordChecks.hasLower && 
        passwordChecks.hasNumber && 
        passwordChecks.hasSpecial && 
        passwordChecks.isMatch;

    // 1. Submit Login or Register
    const handleAuthSubmit = async (e) => {
        e.preventDefault();
        setGlobalError('');
        setGlobalSuccess('');
        setFieldErrors({});
        setIsSubmitting(true);

        if (authView === 'register') {
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
                if (res.errors) setFieldErrors(res.errors);
            }
        } else {
            const res = await loginApi({ email, password });
            setIsSubmitting(false);

            if (res.success) {
                const userData = res.data?.user || { email };
                const token = res.data?.token || null;
                onLoginSuccess(userData, token, false);
                resetForm();
                onClose();
            } else {
                setGlobalError(res.message || 'Login failed');
                if (res.errors) setFieldErrors(res.errors);
            }
        }
    };

    // 2. Submit Step 1: Send OTP
    const handleSendOtp = async (e) => {
        if (e) e.preventDefault();
        if (!email || !email.includes('@')) {
            setFieldErrors({ email: ['Please enter a valid email address.'] });
            return;
        }

        setGlobalError('');
        setGlobalSuccess('');
        setFieldErrors({});
        setIsSubmitting(true);

        const res = await sendForgotPasswordOtpApi({ email });
        setIsSubmitting(false);

        if (res.success) {
            setAuthView('forgot-otp');
            setOtp('');
            setOtpSecondsLeft(300); // 5 minutes validity
            setResendCooldown(res.data?.cooldown_seconds || 60);
            setGlobalSuccess('A 6-digit verification code has been sent to your email.');
        } else {
            setGlobalError(res.message || 'Failed to send OTP. Please try again.');
            if (res.status === 429 && res.cooldown_seconds) {
                setResendCooldown(res.cooldown_seconds);
            }
        }
    };

    // 3. Submit Step 2: Verify OTP
    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        const cleanOtp = otp.trim();
        if (!cleanOtp || cleanOtp.length !== 6 || !/^\d{6}$/.test(cleanOtp)) {
            setFieldErrors({ otp: ['Please enter the complete 6-digit numerical code.'] });
            return;
        }

        if (otpSecondsLeft <= 0) {
            setGlobalError('The OTP has expired. Please request a new verification code.');
            return;
        }

        setGlobalError('');
        setGlobalSuccess('');
        setFieldErrors({});
        setIsSubmitting(true);

        const res = await verifyForgotPasswordOtpApi({ email, otp: cleanOtp });
        setIsSubmitting(false);

        if (res.success && res.data?.reset_token) {
            setResetToken(res.data.reset_token);
            setAuthView('forgot-new-password');
            setNewPassword('');
            setConfirmPassword('');
            setGlobalSuccess('Code verified! Please create your new secure password.');
        } else {
            setGlobalError(res.message || 'Invalid verification code. Please check and try again.');
        }
    };

    // 4. Submit Step 3: Reset Password
    const handleResetPassword = async (e) => {
        e.preventDefault();

        if (!isPasswordStrong) {
            setGlobalError('Please ensure all password requirements are satisfied before proceeding.');
            return;
        }

        if (!resetToken) {
            setGlobalError('Session expired. Please restart the forgot password process.');
            setAuthView('forgot-email');
            return;
        }

        setGlobalError('');
        setGlobalSuccess('');
        setFieldErrors({});
        setIsSubmitting(true);

        const res = await resetForgotPasswordApi({
            email,
            reset_token: resetToken,
            password: newPassword,
            password_confirmation: confirmPassword
        });

        setIsSubmitting(false);

        if (res.success) {
            setAuthView('forgot-success');
            setResetToken(null);
            setPassword(''); // clear old password
        } else {
            setGlobalError(res.message || 'Password reset failed. Please request a new code.');
            if (res.errors) setFieldErrors(res.errors);
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
                
                {/* Back Button for multi-step subviews */}
                {(authView === 'forgot-email' || authView === 'forgot-otp') && (
                    <button 
                        type="button"
                        className="auth-modal-back-btn" 
                        onClick={() => {
                            if (authView === 'forgot-otp') setAuthView('forgot-email');
                            else setAuthView('login');
                            setGlobalError('');
                            setGlobalSuccess('');
                        }}
                        aria-label="Go Back"
                        title="Back"
                    >
                        <ArrowLeft size={16} />
                    </button>
                )}

                {/* Close Button */}
                <button className="auth-modal-close" onClick={onClose} aria-label="Close">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>

                {/* ============================================================
                    VIEW: LOGGED IN USER PROFILE
                   ============================================================ */}
                {user ? (
                    <div className="auth-profile-body">
                        <div className="auth-profile-header">
                            <div className="auth-profile-avatar-large">
                                <span>{getDisplayName().slice(0, 2).toUpperCase()}</span>
                            </div>
                            <h3 className="auth-profile-name">{getDisplayName()}</h3>
                            <p className="auth-profile-email">{user.email}</p>
                            <span className="auth-badge-verified">✓ Verified Wellness Member</span>
                        </div>

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
                    /* ============================================================
                        VIEW: GUEST AUTHENTICATION / FORGOT PASSWORD FLOWS
                       ============================================================ */
                    <div className="auth-form-body">
                        
                        {/* Brand Logo Header */}
                        <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                            <img
                                src={branding?.logo_full || '/mangalam_logo.png'}
                                alt={branding?.site_title || 'Mangalam Healthy Foods'}
                                style={{ height: '38px', width: 'auto', objectFit: 'contain', margin: '0 auto' }}
                                onError={(e) => { e.target.src = '/mangalam_logo.png'; }}
                            />
                        </div>

                        {/* Error Banner */}
                        {globalError && (
                            <div className="auth-error-alert" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <AlertCircle size={16} style={{ flexShrink: 0 }} />
                                <span>{globalError}</span>
                            </div>
                        )}

                        {/* Success Banner */}
                        {globalSuccess && (
                            <div className="auth-badge-verified" style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 12px', borderRadius: '10px', margin: '0 0 14px 0', fontSize: '0.78rem' }}>
                                <CheckCircle2 size={15} style={{ color: '#16a34a', flexShrink: 0 }} />
                                <span>{globalSuccess}</span>
                            </div>
                        )}

                        {/* ------------------------------------------------------------
                            STEP 1 & 2: LOGIN / REGISTER FORMS
                           ------------------------------------------------------------ */}
                        {(authView === 'login' || authView === 'register') && (
                            <>
                                <h2 className="auth-modal-title">
                                    {authView === 'register' ? t('registerTitle') : t('loginTitle')}
                                </h2>
                                <p className="auth-modal-sub">
                                    {authView === 'register' ? t('registerSubtitle') : t('loginSubtitle')}
                                </p>

                                <form onSubmit={handleAuthSubmit} className="auth-form">
                                    {authView === 'register' && (
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

                                    {authView === 'register' && (
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

                                    <div className="auth-field-group">
                                        <div className="auth-label-flex">
                                            <label className="auth-field-label">{t('passwordHolder')}</label>
                                            {authView === 'login' && (
                                                <button
                                                    type="button"
                                                    onClick={handleStartForgotPassword}
                                                    className="auth-forgot-link"
                                                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                                                >
                                                    Forgot?
                                                </button>
                                            )}
                                        </div>
                                        <div className="auth-input-wrapper">
                                            <input 
                                                type={showPassword ? "text" : "password"}
                                                placeholder="••••••••"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                className={`auth-input-pill ${fieldErrors.password ? 'input-error' : ''}`}
                                                required
                                            />
                                            <button
                                                type="button"
                                                className="auth-eye-toggle-btn"
                                                onClick={() => setShowPassword(!showPassword)}
                                                tabIndex="-1"
                                                aria-label={showPassword ? "Hide password" : "Show password"}
                                            >
                                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                            </button>
                                        </div>
                                        {fieldErrors.password && (
                                            <span className="auth-field-error-text">{fieldErrors.password[0]}</span>
                                        )}
                                    </div>

                                    <button type="submit" className="auth-submit-btn" disabled={isSubmitting}>
                                        {isSubmitting ? (
                                            <span>Processing...</span>
                                        ) : (
                                            <>
                                                <span>{authView === 'register' ? t('createAccountBtn') : t('signInBtn')}</span>
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                                                    <line x1="5" y1="12" x2="19" y2="12"></line>
                                                    <polyline points="12 5 19 12 12 19"></polyline>
                                                </svg>
                                            </>
                                        )}
                                    </button>
                                </form>

                                <div className="auth-switch-mode">
                                    <span>
                                        {authView === 'register' ? t('alreadyHaveAccount') : t('dontHaveAccount')}{' '}
                                    </span>
                                    <button 
                                        type="button" 
                                        className="auth-switch-link"
                                        onClick={() => {
                                            if (authView === 'register') handleSwitchToLogin();
                                            else handleSwitchToRegister();
                                        }}
                                    >
                                        {authView === 'register' ? t('signInLink') : t('createOneLink')}
                                    </button>
                                </div>
                            </>
                        )}

                        {/* ------------------------------------------------------------
                            STEP 3: FORGOT PASSWORD - ENTER EMAIL
                           ------------------------------------------------------------ */}
                        {authView === 'forgot-email' && (
                            <>
                                <h2 className="auth-modal-title">Forgot Password</h2>
                                <p className="auth-modal-sub">
                                    Enter your registered email address below. We'll send a 6-digit verification code to reset your password.
                                </p>

                                <form onSubmit={handleSendOtp} className="auth-form">
                                    <div className="auth-field-group">
                                        <label className="auth-field-label">Registered Email Address</label>
                                        <div className="auth-input-wrapper">
                                            <input 
                                                type="email"
                                                placeholder="john@example.com"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className={`auth-input-pill ${fieldErrors.email ? 'input-error' : ''}`}
                                                required
                                                autoFocus
                                            />
                                        </div>
                                        {fieldErrors.email && (
                                            <span className="auth-field-error-text">{fieldErrors.email[0]}</span>
                                        )}
                                    </div>

                                    <button type="submit" className="auth-submit-btn" disabled={isSubmitting}>
                                        {isSubmitting ? (
                                            <span>Sending Code...</span>
                                        ) : (
                                            <>
                                                <span>Send OTP</span>
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                                                    <line x1="5" y1="12" x2="19" y2="12"></line>
                                                    <polyline points="12 5 19 12 12 19"></polyline>
                                                </svg>
                                            </>
                                        )}
                                    </button>
                                </form>

                                <div className="auth-switch-mode">
                                    <span>Remembered your password? </span>
                                    <button 
                                        type="button" 
                                        className="auth-switch-link"
                                        onClick={handleSwitchToLogin}
                                    >
                                        Back to Sign In
                                    </button>
                                </div>
                            </>
                        )}

                        {/* ------------------------------------------------------------
                            STEP 4: OTP VERIFICATION
                           ------------------------------------------------------------ */}
                        {authView === 'forgot-otp' && (
                            <>
                                <h2 className="auth-modal-title">Verify OTP</h2>
                                <p className="auth-modal-sub">
                                    Enter the 6-digit code sent to <strong style={{ color: 'var(--color-primary)' }}>{getMaskedEmail(email)}</strong>.
                                </p>

                                <form onSubmit={handleVerifyOtp} className="auth-form">
                                    <div className="auth-field-group">
                                        <input 
                                            ref={otpInputRef}
                                            type="text"
                                            inputMode="numeric"
                                            autoComplete="one-time-code"
                                            maxLength={6}
                                            placeholder="••••••"
                                            value={otp}
                                            onChange={(e) => {
                                                const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                                                setOtp(val);
                                            }}
                                            className={`auth-otp-field ${fieldErrors.otp ? 'input-error' : ''}`}
                                            required
                                        />
                                        {fieldErrors.otp && (
                                            <span className="auth-field-error-text">{fieldErrors.otp[0]}</span>
                                        )}
                                    </div>

                                    <div className="auth-otp-meta-bar">
                                        <div className={`auth-timer-badge ${otpSecondsLeft < 60 ? 'urgent' : ''}`}>
                                            <Clock size={13} />
                                            <span>
                                                {otpSecondsLeft > 0 
                                                    ? `Expires in ${formatTimer(otpSecondsLeft)}` 
                                                    : 'OTP Expired'}
                                            </span>
                                        </div>

                                        <button
                                            type="button"
                                            className="auth-resend-btn"
                                            onClick={handleSendOtp}
                                            disabled={isSubmitting || resendCooldown > 0}
                                        >
                                            {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
                                        </button>
                                    </div>

                                    <button 
                                        type="submit" 
                                        className="auth-submit-btn" 
                                        disabled={isSubmitting || otp.length !== 6 || otpSecondsLeft <= 0}
                                        style={{ marginTop: '12px' }}
                                    >
                                        {isSubmitting ? (
                                            <span>Verifying Code...</span>
                                        ) : (
                                            <>
                                                <span>Verify OTP</span>
                                                <KeyRound size={16} />
                                            </>
                                        )}
                                    </button>
                                </form>

                                <div className="auth-switch-mode">
                                    <span>Wrong email? </span>
                                    <button 
                                        type="button" 
                                        className="auth-switch-link"
                                        onClick={() => setAuthView('forgot-email')}
                                    >
                                        Change Email
                                    </button>
                                </div>
                            </>
                        )}

                        {/* ------------------------------------------------------------
                            STEP 5: CREATE NEW PASSWORD
                           ------------------------------------------------------------ */}
                        {authView === 'forgot-new-password' && (
                            <>
                                <h2 className="auth-modal-title">Create New Password</h2>
                                <p className="auth-modal-sub">
                                    Set a strong password for your account to complete the reset.
                                </p>

                                <form onSubmit={handleResetPassword} className="auth-form">
                                    <div className="auth-field-group">
                                        <label className="auth-field-label">New Password</label>
                                        <div className="auth-input-wrapper">
                                            <input 
                                                ref={newPasswordInputRef}
                                                type={showNewPassword ? "text" : "password"}
                                                placeholder="Enter new password"
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                className={`auth-input-pill ${fieldErrors.password ? 'input-error' : ''}`}
                                                required
                                            />
                                            <button
                                                type="button"
                                                className="auth-eye-toggle-btn"
                                                onClick={() => setShowNewPassword(!showNewPassword)}
                                                tabIndex="-1"
                                                aria-label={showNewPassword ? "Hide password" : "Show password"}
                                            >
                                                {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="auth-field-group">
                                        <label className="auth-field-label">Confirm New Password</label>
                                        <div className="auth-input-wrapper">
                                            <input 
                                                type={showConfirmPassword ? "text" : "password"}
                                                placeholder="Confirm new password"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                className={`auth-input-pill ${fieldErrors.password_confirmation ? 'input-error' : ''}`}
                                                required
                                            />
                                            <button
                                                type="button"
                                                className="auth-eye-toggle-btn"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                tabIndex="-1"
                                                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                                            >
                                                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Real-time Checklist */}
                                    <div className="auth-password-checklist">
                                        <span className="auth-checklist-title">Password Security Requirements</span>
                                        <div className={`auth-check-item ${passwordChecks.hasLength ? 'valid' : ''}`}>
                                            <span className="auth-check-icon">{passwordChecks.hasLength ? '✓' : '•'}</span>
                                            <span>Minimum 8 characters</span>
                                        </div>
                                        <div className={`auth-check-item ${passwordChecks.hasUpper ? 'valid' : ''}`}>
                                            <span className="auth-check-icon">{passwordChecks.hasUpper ? '✓' : '•'}</span>
                                            <span>At least one uppercase letter (A-Z)</span>
                                        </div>
                                        <div className={`auth-check-item ${passwordChecks.hasLower ? 'valid' : ''}`}>
                                            <span className="auth-check-icon">{passwordChecks.hasLower ? '✓' : '•'}</span>
                                            <span>At least one lowercase letter (a-z)</span>
                                        </div>
                                        <div className={`auth-check-item ${passwordChecks.hasNumber ? 'valid' : ''}`}>
                                            <span className="auth-check-icon">{passwordChecks.hasNumber ? '✓' : '•'}</span>
                                            <span>At least one number (0-9)</span>
                                        </div>
                                        <div className={`auth-check-item ${passwordChecks.hasSpecial ? 'valid' : ''}`}>
                                            <span className="auth-check-icon">{passwordChecks.hasSpecial ? '✓' : '•'}</span>
                                            <span>At least one special character (@$!%*#?&^_-)</span>
                                        </div>
                                        <div className={`auth-check-item ${passwordChecks.isMatch ? 'valid' : ''}`}>
                                            <span className="auth-check-icon">{passwordChecks.isMatch ? '✓' : '•'}</span>
                                            <span>Passwords match</span>
                                        </div>
                                    </div>

                                    <button 
                                        type="submit" 
                                        className="auth-submit-btn" 
                                        disabled={isSubmitting || !isPasswordStrong}
                                        style={{ marginTop: '8px' }}
                                    >
                                        {isSubmitting ? (
                                            <span>Updating Password...</span>
                                        ) : (
                                            <>
                                                <span>Reset Password</span>
                                                <ShieldCheck size={16} />
                                            </>
                                        )}
                                    </button>
                                </form>
                            </>
                        )}

                        {/* ------------------------------------------------------------
                            STEP 6: PASSWORD RESET SUCCESS CONFIRMATION
                           ------------------------------------------------------------ */}
                        {authView === 'forgot-success' && (
                            <div className="auth-success-screen">
                                <div className="auth-success-icon-badge">
                                    <Check size={36} strokeWidth={2.8} />
                                </div>
                                <h2 className="auth-modal-title" style={{ fontSize: '1.4rem' }}>
                                    Password Reset Successful!
                                </h2>
                                <p className="auth-modal-sub" style={{ margin: '8px auto 24px auto', maxWidth: '320px' }}>
                                    Your password has been reset successfully. You can now log in using your newly created password.
                                </p>

                                <button
                                    type="button"
                                    className="auth-submit-btn"
                                    onClick={handleSwitchToLogin}
                                >
                                    <span>Sign In Now</span>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                                        <line x1="5" y1="12" x2="19" y2="12"></line>
                                        <polyline points="12 5 19 12 12 19"></polyline>
                                    </svg>
                                </button>
                            </div>
                        )}

                    </div>
                )}

            </div>
        </div>
    );
}
