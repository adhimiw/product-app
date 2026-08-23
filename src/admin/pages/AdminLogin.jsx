import { useState } from 'react';

export default function AdminLogin({ onLoginSuccess }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
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
            const result = await onLoginSuccess(email, password);
            if (!result.success) {
                setErrorMessage(result.error || 'Authentication failed.');
            }
        } catch {
            setErrorMessage('An unexpected error occurred. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="admin-login-wrapper">
            <div className="admin-login-card">
                <div className="admin-login-header">
                    <img 
                        src="/mangalam_logo.png" 
                        alt="Mangalam Healthy Foods Logo" 
                        style={{ height: '44px', objectFit: 'contain', marginBottom: '12px', display: 'inline-block' }} 
                    />
                    <div className="admin-brand-badge">
                        <span>Admin Control Center</span>
                    </div>
                    <h1 className="admin-login-title">Control Center Sign In</h1>
                    <p className="admin-login-subtitle">
                        Enter your Super Admin credentials to access store operations
                    </p>
                </div>

                {errorMessage && (
                    <div className="admin-badge admin-badge-danger" style={{ width: '100%', padding: '10px 14px', marginBottom: '20px', borderRadius: '8px', fontSize: '0.82rem', display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10"/>
                            <line x1="12" y1="8" x2="12" y2="12"/>
                            <line x1="12" y1="16" x2="12.01" y2="16"/>
                        </svg>
                        <span>{errorMessage}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="admin-form-group" style={{ marginBottom: '16px' }}>
                        <label className="admin-label" htmlFor="admin-email">
                            Email Address or Username
                        </label>
                        <div className="admin-input-wrapper">
                            <input
                                id="admin-email"
                                type="text"
                                className="admin-input"
                                placeholder="superadmin@mangalam.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                autoComplete="username"
                                disabled={isSubmitting}
                            />
                        </div>
                    </div>

                    <div className="admin-form-group" style={{ marginBottom: '20px' }}>
                        <label className="admin-label" htmlFor="admin-password">
                            Account Password
                        </label>
                        <div className="admin-input-wrapper">
                            <input
                                id="admin-password"
                                type={showPassword ? 'text' : 'password'}
                                className="admin-input admin-input-has-toggle"
                                placeholder="••••••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                autoComplete="current-password"
                                disabled={isSubmitting}
                            />
                            <button
                                type="button"
                                className="admin-pwd-toggle"
                                onClick={() => setShowPassword(!showPassword)}
                                aria-label={showPassword ? "Hide password" : "Show password"}
                                tabIndex="-1"
                            >
                                {showPassword ? (
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                                        <line x1="1" y1="1" x2="23" y2="23"/>
                                    </svg>
                                ) : (
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                        <circle cx="12" cy="12" r="3"/>
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="admin-btn admin-btn-primary"
                        disabled={isSubmitting}
                        style={{ width: '100%', padding: '11px', fontSize: '0.92rem' }}
                    >
                        {isSubmitting ? (
                            <span>Authenticating Session...</span>
                        ) : (
                            <>
                                <span>Sign In to Dashboard</span>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="5" y1="12" x2="19" y2="12"/>
                                    <polyline points="12 5 19 12 12 19"/>
                                </svg>
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
