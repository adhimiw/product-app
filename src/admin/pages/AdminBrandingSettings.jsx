import React, { useState, useEffect, useRef } from 'react';
import { useBranding } from '../../context/BrandingContext';

export default function AdminBrandingSettings() {
    const { branding, updateBranding, deleteLogo, resetBranding, loading } = useBranding();

    // Local form state for previews & text fields
    const [previews, setPreviews] = useState({
        logo_full: null,
        logo_small: null,
        logo_dark: null,
        favicon: null,
    });

    const [files, setFiles] = useState({
        logo_full: null,
        logo_small: null,
        logo_dark: null,
        favicon: null,
    });

    const [formData, setFormData] = useState({
        site_title: '',
        tagline: '',
        footer_text: '',
    });

    const [saving, setSaving] = useState(false);
    const [feedback, setFeedback] = useState(null); // { type: 'success' | 'error', message: string }

    const fileInputRefs = {
        logo_full: useRef(null),
        logo_small: useRef(null),
        logo_dark: useRef(null),
        favicon: useRef(null),
    };

    // Populate existing values
    useEffect(() => {
        if (branding) {
            setFormData({
                site_title: branding.site_title || 'Mangalam Healthy Foods',
                tagline: branding.tagline || 'Traditional & Heritage Wellness Foods',
                footer_text: branding.footer_text || '© 2026 Mangalam Healthy Foods. All rights reserved.',
            });
        }
    }, [branding]);

    // Handle File Selection
    const handleFileChange = (key, e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validation
        if (file.size > 2 * 1024 * 1024) {
            setFeedback({
                type: 'error',
                message: `File size exceeds 2MB limit. Please upload an optimized file.`
            });
            return;
        }

        const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/svg+xml', 'image/x-icon', 'image/vnd.microsoft.icon'];
        if (!validTypes.includes(file.type) && !file.name.endsWith('.ico')) {
            setFeedback({
                type: 'error',
                message: `Invalid file type. Please upload a PNG, JPG, WebP, SVG, or ICO image.`
            });
            return;
        }

        const previewUrl = URL.createObjectURL(file);
        setPreviews(prev => ({ ...prev, [key]: previewUrl }));
        setFiles(prev => ({ ...prev, [key]: file }));
        setFeedback(null);
    };

    // Remove / Reset single logo
    const handleRemoveLogo = async (key) => {
        if (files[key] || previews[key]) {
            // Just clear uncommitted preview
            setPreviews(prev => ({ ...prev, [key]: null }));
            setFiles(prev => ({ ...prev, [key]: null }));
            if (fileInputRefs[key].current) {
                fileInputRefs[key].current.value = '';
            }
            return;
        }

        if (window.confirm(`Reset ${key.replace('_', ' ')} back to default?`)) {
            setSaving(true);
            const res = await deleteLogo(key);
            setSaving(false);
            if (res.success) {
                setFeedback({ type: 'success', message: `${key.replace('_', ' ')} reset to default.` });
            } else {
                setFeedback({ type: 'error', message: res.message || 'Failed to delete logo' });
            }
        }
    };

    // Save All Changes
    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        setFeedback(null);

        const payload = new FormData();
        payload.append('site_title', formData.site_title);
        payload.append('tagline', formData.tagline);
        payload.append('footer_text', formData.footer_text);

        // Append modified files
        Object.entries(files).forEach(([key, file]) => {
            if (file instanceof File) {
                payload.append(key, file, file.name);
            }
        });

        const res = await updateBranding(payload);
        setSaving(false);

        if (res.success) {
            setFeedback({ type: 'success', message: 'Branding and logo settings saved successfully!' });
            // Clear temporary local files
            setFiles({ logo_full: null, logo_small: null, logo_dark: null, favicon: null });
            setPreviews({ logo_full: null, logo_small: null, logo_dark: null, favicon: null });
        } else {
            setFeedback({ type: 'error', message: res.message || 'Failed to save branding settings' });
        }
    };

    // Factory Reset
    const handleResetAll = async () => {
        if (window.confirm('Are you sure you want to reset ALL logos and branding settings back to defaults?')) {
            setSaving(true);
            const res = await resetBranding();
            setSaving(false);
            if (res.success) {
                setPreviews({ logo_full: null, logo_small: null, logo_dark: null, favicon: null });
                setFiles({ logo_full: null, logo_small: null, logo_dark: null, favicon: null });
                setFeedback({ type: 'success', message: 'All branding settings reset to factory defaults.' });
            }
        }
    };

    return (
        <div className="admin-page-container branding-settings-page">
            {/* Header */}
            <div className="admin-page-header-flex">
                <div>
                    <h1 className="admin-page-title">Logo & Branding Settings</h1>
                    <p className="admin-page-subtitle">
                        Configure brand identity, storefront logo, dark theme assets, and browser favicon across the entire site.
                    </p>
                </div>
                <div className="admin-header-actions-group">
                    <button
                        type="button"
                        className="admin-btn admin-btn-secondary"
                        onClick={handleResetAll}
                        disabled={saving || loading}
                    >
                        Reset Defaults
                    </button>
                    <button
                        type="button"
                        className="admin-btn admin-btn-primary"
                        onClick={handleSave}
                        disabled={saving || loading}
                    >
                        {saving ? (
                            <>
                                <span className="admin-btn-spinner"></span>
                                Saving...
                            </>
                        ) : (
                            <>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                                    <polyline points="17 21 17 13 7 13 7 21"></polyline>
                                    <polyline points="7 3 7 8 15 8"></polyline>
                                </svg>
                                Save Changes
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Notification Banner */}
            {feedback && (
                <div className={`admin-alert ${feedback.type === 'success' ? 'admin-alert-success' : 'admin-alert-error'}`}>
                    <div className="admin-alert-icon">
                        {feedback.type === 'success' ? (
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                        ) : (
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <circle cx="12" cy="12" r="10"></circle>
                                <line x1="12" y1="8" x2="12" y2="12"></line>
                                <line x1="12" y1="16" x2="12.01" y2="16"></line>
                            </svg>
                        )}
                    </div>
                    <span>{feedback.message}</span>
                </div>
            )}

            {/* Logo Slots Grid */}
            <div className="branding-cards-grid">
                
                {/* 1. FULL LOGO */}
                <div className="branding-card">
                    <div className="branding-card-header">
                        <div className="branding-card-title-group">
                            <span className="branding-card-badge">Storefront & Header</span>
                            <h3>Full Logo</h3>
                            <p>Primary horizontal logo displayed on main website header, navigation, and auth modals.</p>
                        </div>
                    </div>

                    {/* Wide Horizontal Logo-shaped Preview Container */}
                    <div className="logo-preview-box horizontal-box light-backdrop">
                        <img
                            src={previews.logo_full || branding.logo_full || '/mangalam_logo.png'}
                            alt="Full Logo Preview"
                            className="preview-img-full"
                            onError={(e) => { e.target.src = '/mangalam_logo.png'; }}
                        />
                        {previews.logo_full && <span className="preview-tag">New Preview</span>}
                    </div>

                    <div className="branding-card-meta">
                        <span className="spec-item">Recommended: <strong>500 × 140 px</strong></span>
                        <span className="spec-item">Formats: <strong>PNG, SVG, WebP</strong></span>
                    </div>

                    <div className="branding-card-actions">
                        <input
                            type="file"
                            ref={fileInputRefs.logo_full}
                            style={{ display: 'none' }}
                            accept="image/png,image/jpeg,image/webp,image/svg+xml"
                            onChange={(e) => handleFileChange('logo_full', e)}
                        />
                        <button
                            type="button"
                            className="admin-btn admin-btn-outline"
                            onClick={() => fileInputRefs.logo_full.current?.click()}
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                <polyline points="17 8 12 3 7 8"></polyline>
                                <line x1="12" y1="3" x2="12" y2="15"></line>
                            </svg>
                            {previews.logo_full ? 'Change File' : 'Upload / Replace'}
                        </button>
                        <button
                            type="button"
                            className="admin-btn-icon-danger"
                            onClick={() => handleRemoveLogo('logo_full')}
                            title="Reset to Default"
                        >
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="3 6 5 6 21 6"></polyline>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            </svg>
                        </button>
                    </div>
                </div>

                {/* 2. SMALL / SIDEBAR LOGO */}
                <div className="branding-card">
                    <div className="branding-card-header">
                        <div className="branding-card-title-group">
                            <span className="branding-card-badge">Sidebar & Mobile</span>
                            <h3>Small Logo / Crest Icon</h3>
                            <p>Compact icon mark used when admin sidebar is collapsed and in compact mobile bars.</p>
                        </div>
                    </div>

                    {/* Square Compact Logo-shaped Preview */}
                    <div className="logo-preview-box square-box light-backdrop">
                        <img
                            src={previews.logo_small || branding.logo_small || '/mangalam_logo.png'}
                            alt="Small Logo Preview"
                            className="preview-img-small"
                            onError={(e) => { e.target.src = '/mangalam_logo.png'; }}
                        />
                        {previews.logo_small && <span className="preview-tag">New Preview</span>}
                    </div>

                    <div className="branding-card-meta">
                        <span className="spec-item">Recommended: <strong>120 × 120 px (1:1)</strong></span>
                        <span className="spec-item">Formats: <strong>PNG, SVG, WebP</strong></span>
                    </div>

                    <div className="branding-card-actions">
                        <input
                            type="file"
                            ref={fileInputRefs.logo_small}
                            style={{ display: 'none' }}
                            accept="image/png,image/jpeg,image/webp,image/svg+xml,image/x-icon"
                            onChange={(e) => handleFileChange('logo_small', e)}
                        />
                        <button
                            type="button"
                            className="admin-btn admin-btn-outline"
                            onClick={() => fileInputRefs.logo_small.current?.click()}
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                <polyline points="17 8 12 3 7 8"></polyline>
                                <line x1="12" y1="3" x2="12" y2="15"></line>
                            </svg>
                            {previews.logo_small ? 'Change File' : 'Upload / Replace'}
                        </button>
                        <button
                            type="button"
                            className="admin-btn-icon-danger"
                            onClick={() => handleRemoveLogo('logo_small')}
                            title="Reset to Default"
                        >
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="3 6 5 6 21 6"></polyline>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            </svg>
                        </button>
                    </div>
                </div>

                {/* 3. DARK THEME LOGO */}
                <div className="branding-card">
                    <div className="branding-card-header">
                        <div className="branding-card-title-group">
                            <span className="branding-card-badge">Dark Theme & Footer</span>
                            <h3>Dark Background Logo</h3>
                            <p>Light artwork variant rendered on dark navy footers and dark-mode themes.</p>
                        </div>
                    </div>

                    {/* Wide Horizontal Logo-shaped Preview Container on Dark Theme */}
                    <div className="logo-preview-box horizontal-box dark-backdrop">
                        <img
                            src={previews.logo_dark || branding.logo_dark || '/mangalam_logo.png'}
                            alt="Dark Logo Preview"
                            className="preview-img-dark"
                            onError={(e) => { e.target.src = '/mangalam_logo.png'; }}
                        />
                        {previews.logo_dark && <span className="preview-tag">New Preview</span>}
                    </div>

                    <div className="branding-card-meta">
                        <span className="spec-item">Recommended: <strong>500 × 140 px (White/Light)</strong></span>
                        <span className="spec-item">Formats: <strong>PNG, SVG (Transparent)</strong></span>
                    </div>

                    <div className="branding-card-actions">
                        <input
                            type="file"
                            ref={fileInputRefs.logo_dark}
                            style={{ display: 'none' }}
                            accept="image/png,image/jpeg,image/webp,image/svg+xml"
                            onChange={(e) => handleFileChange('logo_dark', e)}
                        />
                        <button
                            type="button"
                            className="admin-btn admin-btn-outline"
                            onClick={() => fileInputRefs.logo_dark.current?.click()}
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                <polyline points="17 8 12 3 7 8"></polyline>
                                <line x1="12" y1="3" x2="12" y2="15"></line>
                            </svg>
                            {previews.logo_dark ? 'Change File' : 'Upload / Replace'}
                        </button>
                        <button
                            type="button"
                            className="admin-btn-icon-danger"
                            onClick={() => handleRemoveLogo('logo_dark')}
                            title="Reset to Default"
                        >
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="3 6 5 6 21 6"></polyline>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            </svg>
                        </button>
                    </div>
                </div>

                {/* 4. FAVICON */}
                <div className="branding-card">
                    <div className="branding-card-header">
                        <div className="branding-card-title-group">
                            <span className="branding-card-badge">Browser Tab</span>
                            <h3>Website Favicon</h3>
                            <p>Icon shown on browser tabs, bookmarks bar, and shortcut icons.</p>
                        </div>
                    </div>

                    {/* Mock Browser Tab Preview */}
                    <div className="favicon-mock-tab-container">
                        <div className="mock-browser-tab">
                            <img
                                src={previews.favicon || branding.favicon || '/mangalam_logo.png'}
                                alt="Favicon"
                                className="mock-tab-favicon"
                                onError={(e) => { e.target.src = '/mangalam_logo.png'; }}
                            />
                            <span className="mock-tab-title">{formData.site_title || 'Mangalam Healthy Foods'}</span>
                            <span className="mock-tab-close">×</span>
                        </div>
                        <div className="mock-tab-body">
                            <div className="favicon-large-view">
                                <img
                                    src={previews.favicon || branding.favicon || '/mangalam_logo.png'}
                                    alt="Favicon Large"
                                    onError={(e) => { e.target.src = '/mangalam_logo.png'; }}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="branding-card-meta">
                        <span className="spec-item">Recommended: <strong>64 × 64 px or 32 × 32 px</strong></span>
                        <span className="spec-item">Formats: <strong>ICO, PNG, SVG</strong></span>
                    </div>

                    <div className="branding-card-actions">
                        <input
                            type="file"
                            ref={fileInputRefs.favicon}
                            style={{ display: 'none' }}
                            accept="image/x-icon,image/vnd.microsoft.icon,image/png,image/svg+xml,image/webp"
                            onChange={(e) => handleFileChange('favicon', e)}
                        />
                        <button
                            type="button"
                            className="admin-btn admin-btn-outline"
                            onClick={() => fileInputRefs.favicon.current?.click()}
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                <polyline points="17 8 12 3 7 8"></polyline>
                                <line x1="12" y1="3" x2="12" y2="15"></line>
                            </svg>
                            {previews.favicon ? 'Change File' : 'Upload / Replace'}
                        </button>
                        <button
                            type="button"
                            className="admin-btn-icon-danger"
                            onClick={() => handleRemoveLogo('favicon')}
                            title="Reset to Default"
                        >
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="3 6 5 6 21 6"></polyline>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            </svg>
                        </button>
                    </div>
                </div>

            </div>

            {/* Brand Meta Details Form */}
            <div className="branding-meta-card">
                <h3 className="branding-meta-title">Store Identity & Typography</h3>
                <p className="branding-meta-subtitle">General store title and footer copyright configured across the app.</p>

                <div className="branding-meta-grid">
                    <div className="admin-form-group">
                        <label className="admin-form-label">Site Title</label>
                        <input
                            type="text"
                            className="admin-form-input"
                            value={formData.site_title}
                            onChange={(e) => setFormData(prev => ({ ...prev, site_title: e.target.value }))}
                            placeholder="e.g. Mangalam Healthy Foods"
                        />
                    </div>

                    <div className="admin-form-group">
                        <label className="admin-form-label">Brand Tagline</label>
                        <input
                            type="text"
                            className="admin-form-input"
                            value={formData.tagline}
                            onChange={(e) => setFormData(prev => ({ ...prev, tagline: e.target.value }))}
                            placeholder="e.g. Traditional & Heritage Wellness Foods"
                        />
                    </div>

                    <div className="admin-form-group full-col">
                        <label className="admin-form-label">Footer Copyright Notice</label>
                        <input
                            type="text"
                            className="admin-form-input"
                            value={formData.footer_text}
                            onChange={(e) => setFormData(prev => ({ ...prev, footer_text: e.target.value }))}
                            placeholder="e.g. © 2026 Mangalam Healthy Foods. All rights reserved."
                        />
                    </div>
                </div>

                <div className="branding-save-footer">
                    <button
                        type="button"
                        className="admin-btn admin-btn-primary"
                        onClick={handleSave}
                        disabled={saving || loading}
                    >
                        {saving ? 'Saving...' : 'Save Branding Settings'}
                    </button>
                </div>
            </div>
        </div>
    );
}
