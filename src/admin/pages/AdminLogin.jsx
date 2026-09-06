import React, { useState } from 'react';
import { 
    Mail, 
    Lock, 
    Eye, 
    EyeOff, 
    ShieldCheck, 
    ArrowRight, 
    Loader2, 
    AlertCircle, 
    Sparkles, 
    Package, 
    Zap,
    KeyRound
} from 'lucide-react';
import { useBranding } from '../../context/BrandingContext';

export default function AdminLogin({ onLoginSuccess }) {
    const { branding } = useBranding();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage('');

        if (!email.trim()) {
            setErrorMessage('Email or username is required.');
            return;
        }

        if (!password) {
            setErrorMessage('Password is required.');
            return;
        }

        setIsSubmitting(true);
        try {
            const result = await onLoginSuccess(email.trim(), password);
            if (!result.success) {
                setErrorMessage(result.error || 'Invalid credentials. Please verify your email and password.');
            }
        } catch {
            setErrorMessage('An unexpected error occurred. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="admin-login-viewport">
            {/* Left Hero Brand Panel */}
            <div className="admin-login-hero-panel">
                <div className="admin-login-hero-glow glow-1"></div>
                <div className="admin-login-hero-glow glow-2"></div>
                
                <div className="admin-login-hero-content">
                    {/* Brand Header */}
                    <div className="admin-login-brand-header">
                        <div className="admin-login-logo-wrap">
                            <img
                                src={branding?.logo_full || '/mangalam_logo.png'}
                                alt={branding?.site_title || 'Mangalam Healthy Foods'}
                                className="admin-login-hero-logo"
                                onError={(e) => { e.target.src = '/mangalam_logo.png'; }}
                            />
                        </div>
                        <div className="admin-login-badge">
                            <ShieldCheck size={14} className="text-emerald-300" />
                            <span>ENTERPRISE CONTROL CENTER</span>
                        </div>
                    </div>

                    {/* Main Narrative */}
                    <div className="admin-login-hero-body">
                        <h1 className="admin-login-hero-title">
                            Manage & Grow <br />
                            <span className="admin-login-hero-title-accent">Mangalam Healthy Foods</span>
                        </h1>
                        <p className="admin-login-hero-desc">
                            Welcome to the unified store administrative suite. Oversee live orders, 
                            product inventory, customer inquiries, marketing banners, and store branding with enterprise reliability.
                        </p>

                        {/* Feature Pillar Badges */}
                        <div className="admin-login-pillars">
                            <div className="admin-login-pillar-card">
                                <div className="admin-login-pillar-icon">
                                    <Package size={20} />
                                </div>
                                <div className="admin-login-pillar-text">
                                    <h4>Catalog & Inventory</h4>
                                    <p>Multi-size variants, stock control & dynamic pricing</p>
                                </div>
                            </div>

                            <div className="admin-login-pillar-card">
                                <div className="admin-login-pillar-icon">
                                    <Zap size={20} />
                                </div>
                                <div className="admin-login-pillar-text">
                                    <h4>Real-Time Operations</h4>
                                    <p>Instant order fulfillment, WhatsApp alerts & tracking</p>
                                </div>
                            </div>

                            <div className="admin-login-pillar-card">
                                <div className="admin-login-pillar-icon">
                                    <ShieldCheck size={20} />
                                </div>
                                <div className="admin-login-pillar-text">
                                    <h4>Encrypted Security</h4>
                                    <p>OWASP protected 7-day token sessions & audit logging</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Hero Footer */}
                    <div className="admin-login-hero-footer">
                        <span>© {new Date().getFullYear()} {branding?.site_title || 'Mangalam Healthy Foods'}. All rights reserved.</span>
                        <span>v2.4 Enterprise</span>
                    </div>
                </div>
            </div>

            {/* Right Authentication Form Panel */}
            <div className="admin-login-form-panel">
                <div className="admin-login-card">
                    {/* Mobile Brand Header (only visible on small screens) */}
                    <div className="admin-login-mobile-brand">
                        <img
                            src={branding?.logo_full || '/mangalam_logo.png'}
                            alt={branding?.site_title || 'Mangalam Healthy Foods'}
                            className="admin-login-mobile-logo"
                            onError={(e) => { e.target.src = '/mangalam_logo.png'; }}
                        />
                    </div>

                    <div className="admin-login-card-header">
                        <div className="admin-login-card-icon">
                            <KeyRound size={22} />
                        </div>
                        <h2 className="admin-login-card-title">Sign In to Admin Portal</h2>
                        <p className="admin-login-card-subtitle">
                            Enter your administrator credentials to securely access your store dashboard.
                        </p>
                    </div>

                    {errorMessage && (
                        <div className="admin-login-error-alert" role="alert">
                            <AlertCircle size={18} className="admin-login-error-icon" />
                            <div className="admin-login-error-text">
                                <strong>Authentication Failed</strong>
                                <span>{errorMessage}</span>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="admin-login-form" noValidate>
                        {/* Email / Username Field */}
                        <div className="admin-login-field">
                            <label className="admin-login-label" htmlFor="admin-email">
                                Email Address / Username
                            </label>
                            <div className="admin-login-input-group">
                                <span className="admin-login-input-prefix">
                                    <Mail size={18} />
                                </span>
                                <input
                                    id="admin-email"
                                    type="text"
                                    className="admin-login-input"
                                    placeholder="admin@mangalam.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    autoComplete="username"
                                    autoFocus
                                    disabled={isSubmitting}
                                    required
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div className="admin-login-field">
                            <div className="admin-login-label-row">
                                <label className="admin-login-label" htmlFor="admin-password">
                                    Password
                                </label>
                            </div>
                            <div className="admin-login-input-group">
                                <span className="admin-login-input-prefix">
                                    <Lock size={18} />
                                </span>
                                <input
                                    id="admin-password"
                                    type={showPassword ? 'text' : 'password'}
                                    className="admin-login-input with-suffix"
                                    placeholder="Enter your admin password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    autoComplete="current-password"
                                    disabled={isSubmitting}
                                    required
                                />
                                <button
                                    type="button"
                                    className="admin-login-input-suffix-btn"
                                    onClick={() => setShowPassword(!showPassword)}
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                    tabIndex={-1}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        {/* Remember Me Checkbox */}
                        <div className="admin-login-options">
                            <label className="admin-login-remember">
                                <input
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                    className="admin-login-checkbox"
                                />
                                <span>Remember session on this device</span>
                            </label>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            className="admin-login-submit-btn"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 size={18} className="admin-spin" />
                                    <span>Verifying Credentials...</span>
                                </>
                            ) : (
                                <>
                                    <span>Sign In to Dashboard</span>
                                    <ArrowRight size={18} />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Security Badge Footer */}
                    <div className="admin-login-security-footer">
                        <ShieldCheck size={14} />
                        <span>256-Bit Encrypted Admin Session • OWASP Compliant</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
