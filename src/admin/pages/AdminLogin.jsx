import React, { useState } from 'react';

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
        <div className="admin-split-auth-container">
            {/* Left Side: Lush, Impressive Sprouted Grains & Grassy Meadow Artwork */}
            <div className="admin-split-left-pane">
                <div className="admin-art-illustration-full" aria-hidden="true">
                    <svg viewBox="0 0 960 900" fill="none" xmlns="http://www.w3.org/2000/svg" className="admin-art-svg-full">
                        <defs>
                            <linearGradient id="sunGlow" x1="50%" y1="0%" x2="50%" y2="100%">
                                <stop offset="0%" stopColor="#fef3c7" stopOpacity="0.85" />
                                <stop offset="100%" stopColor="#fef9c3" stopOpacity="0" />
                            </linearGradient>
                            <linearGradient id="hillGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#e8f6ec" />
                                <stop offset="100%" stopColor="#d4ebd9" />
                            </linearGradient>
                            <linearGradient id="hillGrad2" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="#d9f0de" />
                                <stop offset="100%" stopColor="#c5e6cc" />
                            </linearGradient>
                            <linearGradient id="milletGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#fff9e6" />
                                <stop offset="100%" stopColor="#faecd0" />
                            </linearGradient>
                            <linearGradient id="paddyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#fef6dc" />
                                <stop offset="100%" stopColor="#f7e1b5" />
                            </linearGradient>
                            <linearGradient id="bowlGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#fff7f2" />
                                <stop offset="100%" stopColor="#f5ddd0" />
                            </linearGradient>
                        </defs>

                        {/* --- Layer 1: Ambient Sun Glow & Birds --- */}
                        <circle cx="480" cy="300" r="260" fill="url(#sunGlow)" />
                        
                        {/* Birds in the sky */}
                        <path d="M220 180 Q235 165 250 180 Q265 165 280 180" stroke="#183e2e" strokeWidth="3" strokeLinecap="round" fill="none"/>
                        <path d="M290 140 Q302 128 315 140 Q328 128 340 140" stroke="#183e2e" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
                        <path d="M680 160 Q695 145 710 160 Q725 145 740 160" stroke="#183e2e" strokeWidth="3" strokeLinecap="round" fill="none"/>

                        {/* --- Layer 2: Rolling Grassy Meadow Contours --- */}
                        <path d="M0 640 Q240 520 540 600 T960 560 L960 900 L0 900 Z" fill="url(#hillGrad1)" stroke="#183e2e" strokeWidth="4" />
                        <path d="M0 720 Q320 640 680 700 T960 670 L960 900 L0 900 Z" fill="url(#hillGrad2)" stroke="#183e2e" strokeWidth="4" />

                        {/* --- Layer 3: Tall Ancestral Millet & Rice Sheaves (Background Stalks) --- */}
                        {/* Far Left Pearl Millet Stalk */}
                        <g>
                            <path d="M120 900 C130 650 160 420 180 200" stroke="#183e2e" strokeWidth="5" strokeLinecap="round"/>
                            <path d="M180 200 C170 120 200 40 220 10 C245 45 250 120 230 200 Z" fill="url(#milletGrad)" stroke="#183e2e" strokeWidth="4.5" strokeLinejoin="round"/>
                            <line x1="195" y1="160" x2="225" y2="150" stroke="#e07a38" strokeWidth="3"/>
                            <line x1="192" y1="125" x2="232" y2="115" stroke="#e07a38" strokeWidth="3"/>
                            <line x1="198" y1="90" x2="235" y2="80" stroke="#e07a38" strokeWidth="3"/>
                            <line x1="205" y1="55" x2="230" y2="45" stroke="#e07a38" strokeWidth="3"/>
                            {/* Graceful Millet Leaves */}
                            <path d="M150 480 C70 420 20 450 -30 520 C30 465 100 475 160 510" fill="#eaf5ed" stroke="#183e2e" strokeWidth="4" strokeLinejoin="round"/>
                            <path d="M165 340 C250 280 340 310 400 370 C330 320 240 330 175 365" fill="#eaf5ed" stroke="#183e2e" strokeWidth="4" strokeLinejoin="round"/>
                        </g>

                        {/* Center-Left Ragi (Finger Millet) 5-Finger Ear Head */}
                        <g>
                            <path d="M300 900 C320 680 300 500 270 320" stroke="#183e2e" strokeWidth="4.5" strokeLinecap="round"/>
                            <path d="M270 320 C230 275 190 285 170 320 C205 325 240 335 270 320" fill="#fbe8df" stroke="#183e2e" strokeWidth="4"/>
                            <path d="M270 320 C250 255 225 235 200 255 C225 280 245 305 270 320" fill="#fbe8df" stroke="#183e2e" strokeWidth="4"/>
                            <path d="M270 320 C280 235 300 220 320 240 C310 270 290 305 270 320" fill="#fbe8df" stroke="#183e2e" strokeWidth="4"/>
                            <path d="M270 320 C320 260 350 280 345 315 C320 310 295 315 270 320" fill="#fbe8df" stroke="#183e2e" strokeWidth="4"/>
                            <path d="M270 320 C300 350 330 365 340 395 C315 375 290 355 270 320" fill="#fbe8df" stroke="#183e2e" strokeWidth="4"/>
                        </g>

                        {/* Tall Majestic Golden Paddy / Rice Sheaf (Center-Right) */}
                        <g>
                            <path d="M520 900 C500 600 530 350 630 140" stroke="#183e2e" strokeWidth="5.5" strokeLinecap="round"/>
                            {/* Drooping Golden Rice Plumes */}
                            <path d="M630 140 C680 130 750 160 790 230 C810 280 795 340 765 390" stroke="#183e2e" strokeWidth="4.5" strokeLinecap="round"/>
                            <ellipse cx="665" cy="138" rx="16" ry="9" transform="rotate(18 665 138)" fill="url(#paddyGrad)" stroke="#183e2e" strokeWidth="3.5"/>
                            <ellipse cx="705" cy="155" rx="16" ry="9" transform="rotate(40 705 155)" fill="url(#paddyGrad)" stroke="#183e2e" strokeWidth="3.5"/>
                            <ellipse cx="745" cy="190" rx="16" ry="9" transform="rotate(60 745 190)" fill="url(#paddyGrad)" stroke="#183e2e" strokeWidth="3.5"/>
                            <ellipse cx="775" cy="235" rx="16" ry="9" transform="rotate(80 775 235)" fill="url(#paddyGrad)" stroke="#183e2e" strokeWidth="3.5"/>
                            <ellipse cx="790" cy="285" rx="16" ry="9" transform="rotate(95 790 285)" fill="url(#paddyGrad)" stroke="#183e2e" strokeWidth="3.5"/>
                            <ellipse cx="780" cy="335" rx="16" ry="9" transform="rotate(110 780 335)" fill="url(#paddyGrad)" stroke="#183e2e" strokeWidth="3.5"/>
                            <ellipse cx="755" cy="380" rx="16" ry="9" transform="rotate(125 755 380)" fill="url(#paddyGrad)" stroke="#183e2e" strokeWidth="3.5"/>

                            {/* Secondary side drooping branch */}
                            <path d="M580 230 C540 240 500 280 480 330" stroke="#183e2e" strokeWidth="3.5" strokeLinecap="round"/>
                            <ellipse cx="490" cy="320" rx="14" ry="8" transform="rotate(-30 490 320)" fill="url(#paddyGrad)" stroke="#183e2e" strokeWidth="3.5"/>
                            <ellipse cx="520" cy="290" rx="14" ry="8" transform="rotate(-38 520 290)" fill="url(#paddyGrad)" stroke="#183e2e" strokeWidth="3.5"/>
                            <ellipse cx="550" cy="265" rx="14" ry="8" transform="rotate(-45 550 265)" fill="url(#paddyGrad)" stroke="#183e2e" strokeWidth="3.5"/>
                        </g>

                        {/* Tall Pearl Millet Cob (Far Right) */}
                        <g>
                            <path d="M800 900 C810 650 830 460 840 240" stroke="#183e2e" strokeWidth="5" strokeLinecap="round"/>
                            <path d="M840 240 C830 150 860 70 885 25 C915 65 925 150 900 240 Z" fill="url(#milletGrad)" stroke="#183e2e" strokeWidth="4.5" strokeLinejoin="round"/>
                            <line x1="855" y1="195" x2="890" y2="185" stroke="#e07a38" strokeWidth="3.5"/>
                            <line x1="852" y1="155" x2="898" y2="145" stroke="#e07a38" strokeWidth="3.5"/>
                            <line x1="858" y1="115" x2="902" y2="105" stroke="#e07a38" strokeWidth="3.5"/>
                            <line x1="868" y1="75" x2="900" y2="65" stroke="#e07a38" strokeWidth="3.5"/>
                            {/* Live green sprouting roots from top */}
                            <path d="M885 25 C870 -5 845 5 850 25" stroke="#22c55e" strokeWidth="3.5" strokeLinecap="round"/>
                            <path d="M885 25 C900 -10 925 0 915 30" stroke="#22c55e" strokeWidth="3.5" strokeLinecap="round"/>
                        </g>

                        {/* --- Layer 4: Dense Foreground Grass Blades & Wheat Ear Sprays --- */}
                        {/* Dense Grass Tuft (Left) */}
                        <g>
                            <path d="M40 900 C50 780 10 700 -20 640 C40 710 80 770 90 900" fill="#c3e8cc" stroke="#183e2e" strokeWidth="4"/>
                            <path d="M80 900 C110 750 160 670 210 610 C160 690 130 780 120 900" fill="#d9f2df" stroke="#183e2e" strokeWidth="4"/>
                            <path d="M130 900 C150 780 200 700 260 660 C200 730 170 810 160 900" fill="#bce5c6" stroke="#183e2e" strokeWidth="3.5"/>
                        </g>

                        {/* Dense Grass Tuft (Right) */}
                        <g>
                            <path d="M820 900 C810 770 840 690 890 620 C850 700 840 790 850 900" fill="#c3e8cc" stroke="#183e2e" strokeWidth="4"/>
                            <path d="M870 900 C890 760 930 680 980 630 C940 710 920 800 910 900" fill="#d9f2df" stroke="#183e2e" strokeWidth="4"/>
                            <path d="M760 900 C770 790 800 720 850 680 C810 740 790 820 780 900" fill="#bce5c6" stroke="#183e2e" strokeWidth="3.5"/>
                        </g>

                        {/* --- Layer 5: Traditional Grain Mixing Bowl & Fresh Active Sprouting Seeds --- */}
                        <g>
                            {/* Bowl Body */}
                            <path d="M260 660 C260 570 700 570 700 660 C700 790 600 870 480 870 C360 870 260 790 260 660 Z" fill="url(#bowlGrad)" stroke="#183e2e" strokeWidth="5.5" strokeLinejoin="round"/>
                            {/* Bowl Rim Oval */}
                            <ellipse cx="480" cy="660" rx="220" ry="46" fill="#ffffff" stroke="#183e2e" strokeWidth="4.5"/>

                            {/* Traditional Terracotta Accent Stripes on Bowl */}
                            <line x1="320" y1="710" x2="640" y2="710" stroke="#e07a38" strokeWidth="3.5" strokeDasharray="12 10"/>
                            <line x1="360" y1="760" x2="600" y2="760" stroke="#183e2e" strokeWidth="3" strokeDasharray="8 8"/>
                            <line x1="400" y1="805" x2="560" y2="805" stroke="#e07a38" strokeWidth="2.5" strokeDasharray="6 6"/>

                            {/* Sprouting Green Shoots Emerging from Bowl */}
                            {/* Main Twin Sprout Shoots */}
                            <path d="M480 660 C465 590 435 540 395 500 C445 520 475 560 485 620" fill="#bbf7d0" stroke="#183e2e" strokeWidth="4.5"/>
                            <path d="M480 620 C500 565 545 535 585 520 C545 560 520 600 500 650" fill="#bbf7d0" stroke="#183e2e" strokeWidth="4.5"/>

                            {/* Active Sprouted Grains with Fresh Shoots & Rootlets */}
                            <g transform="translate(390, 640)">
                                <ellipse cx="0" cy="0" rx="16" ry="10" transform="rotate(-15)" fill="#fef6dc" stroke="#183e2e" strokeWidth="3.5"/>
                                <path d="M-12 -2 C-22 -15 -12 -28 -2 -24" stroke="#22c55e" strokeWidth="3.5" strokeLinecap="round" fill="none"/>
                            </g>

                            <g transform="translate(460, 670)">
                                <ellipse cx="0" cy="0" rx="18" ry="11" transform="rotate(25)" fill="#fbe8df" stroke="#183e2e" strokeWidth="3.5"/>
                                <path d="M12 2 C26 -6 30 -22 18 -28" stroke="#22c55e" strokeWidth="3.5" strokeLinecap="round" fill="none"/>
                            </g>

                            <g transform="translate(540, 650)">
                                <ellipse cx="0" cy="0" rx="17" ry="10" transform="rotate(-30)" fill="#fef6dc" stroke="#183e2e" strokeWidth="3.5"/>
                                <path d="M-8 -6 C-18 -20 -8 -32 2 -26" stroke="#22c55e" strokeWidth="3.5" strokeLinecap="round" fill="none"/>
                            </g>

                            <g transform="translate(510, 635)">
                                <ellipse cx="0" cy="0" rx="15" ry="9" transform="rotate(10)" fill="#ffffff" stroke="#183e2e" strokeWidth="3.5"/>
                                <path d="M8 -4 C18 -18 28 -14 24 2" stroke="#22c55e" strokeWidth="3.5" strokeLinecap="round" fill="none"/>
                            </g>
                        </g>

                        {/* --- Layer 6: Floating Botanical Sprout Particles & Spores --- */}
                        <g>
                            <path d="M180 280 C155 250 175 220 205 230 C215 260 195 290 180 280 Z" fill="#d4ebd9" stroke="#183e2e" strokeWidth="3.5"/>
                            <path d="M780 430 C805 410 830 430 820 455 C795 465 775 450 780 430 Z" fill="#d4ebd9" stroke="#183e2e" strokeWidth="3.5"/>
                            <ellipse cx="360" cy="200" rx="12" ry="8" transform="rotate(35 360 200)" fill="#fbe8df" stroke="#183e2e" strokeWidth="3"/>
                            <ellipse cx="620" cy="460" rx="14" ry="9" transform="rotate(-25 620 460)" fill="#fef6dc" stroke="#183e2e" strokeWidth="3"/>
                        </g>
                    </svg>
                </div>
            </div>

            {/* Right Side: Clean, Center-Aligned Admin Sign In Form */}
            <div className="admin-split-right-pane">
                <div className="admin-auth-form-box">
                    <div className="admin-auth-headings">
                        <h1 className="admin-auth-main-title">Sign In</h1>
                        <p className="admin-auth-main-sub">
                            Welcome back! Please enter your admin details to continue
                        </p>
                    </div>

                    {errorMessage && (
                        <div className="admin-auth-alert-error" role="alert">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10"/>
                                <line x1="12" y1="8" x2="12" y2="12"/>
                                <line x1="12" y1="16" x2="12.01" y2="16"/>
                            </svg>
                            <span>{errorMessage}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="admin-auth-form">
                        {/* Email Input Field */}
                        <div className="admin-auth-field-group">
                            <label className="admin-auth-field-label" htmlFor="admin-email">
                                Email *
                            </label>
                            <div className="admin-auth-input-wrapper">
                                <span className="admin-auth-input-icon">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <rect width="20" height="16" x="2" y="4" rx="2"/>
                                        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                                    </svg>
                                </span>
                                <input
                                    id="admin-email"
                                    type="text"
                                    className="admin-auth-input"
                                    placeholder="superadmin@mangalam.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    autoComplete="username"
                                    disabled={isSubmitting}
                                    required
                                />
                            </div>
                        </div>

                        {/* Password Input Field with Toggle (No Forgot Password link) */}
                        <div className="admin-auth-field-group">
                            <label className="admin-auth-field-label" htmlFor="admin-password">
                                Password *
                            </label>
                            <div className="admin-auth-input-wrapper">
                                <span className="admin-auth-input-icon">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
                                        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                                    </svg>
                                </span>
                                <input
                                    id="admin-password"
                                    type={showPassword ? 'text' : 'password'}
                                    className="admin-auth-input with-toggle"
                                    placeholder="Enter password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    autoComplete="current-password"
                                    disabled={isSubmitting}
                                    required
                                />
                                <button
                                    type="button"
                                    className="admin-auth-eye-toggle"
                                    onClick={() => setShowPassword(!showPassword)}
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                    tabIndex="-1"
                                >
                                    {showPassword ? (
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                                            <line x1="1" y1="1" x2="23" y2="23"/>
                                        </svg>
                                    ) : (
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                            <circle cx="12" cy="12" r="3"/>
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            className="admin-auth-submit-btn"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <span className="admin-auth-btn-loading">
                                    <span className="admin-auth-spinner"></span>
                                    <span>Verifying Credentials...</span>
                                </span>
                            ) : (
                                <span>Sign In</span>
                            )}
                        </button>
                    </form>

                    <div className="admin-auth-portal-badge">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                        </svg>
                        <span>Protected Admin Console • Mangalam Healthy Foods</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
