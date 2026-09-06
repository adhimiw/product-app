import React, { useState, useEffect, useRef } from 'react';
import { useBranding } from '../../context/BrandingContext';
import { 
    Upload, 
    Trash2, 
    RotateCcw, 
    Check, 
    Image as ImageIcon, 
    Sparkles, 
    Globe, 
    FileText,
    CheckCircle2,
    AlertCircle
} from 'lucide-react';

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
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    const fileInputRefs = {
        logo_full: useRef(null),
        logo_small: useRef(null),
        logo_dark: useRef(null),
        favicon: useRef(null),
    };

    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 4000);
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
            showToast('File size exceeds 2MB limit. Please upload an optimized file.', 'error');
            return;
        }

        const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/svg+xml', 'image/x-icon', 'image/vnd.microsoft.icon'];
        if (!validTypes.includes(file.type) && !file.name.endsWith('.ico')) {
            showToast('Invalid file type. Please upload PNG, JPG, WebP, SVG, or ICO image.', 'error');
            return;
        }

        const previewUrl = URL.createObjectURL(file);
        setPreviews(prev => ({ ...prev, [key]: previewUrl }));
        setFiles(prev => ({ ...prev, [key]: file }));
        showToast('New asset selected. Click "Save Changes" to apply.', 'success');
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
                showToast(`${key.replace('_', ' ')} reset to default.`);
            } else {
                showToast(res.message || 'Failed to delete logo', 'error');
            }
        }
    };

    // Save All Changes
    const handleSave = async (e) => {
        if (e) e.preventDefault();
        setSaving(true);

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
            showToast('Branding and logo settings saved successfully!');
            setFiles({ logo_full: null, logo_small: null, logo_dark: null, favicon: null });
            setPreviews({ logo_full: null, logo_small: null, logo_dark: null, favicon: null });
        } else {
            showToast(res.message || 'Failed to save branding settings', 'error');
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
                showToast('All branding settings reset to factory defaults.');
            }
        }
    };

    const hasPendingChanges = Object.values(files).some(f => f !== null);

    return (
        <div className="admin-page-container">
            {/* Toast Notification */}
            {toast.show && (
                <div style={{
                    position: 'fixed',
                    top: '24px',
                    right: '24px',
                    zIndex: 99999,
                    background: toast.type === 'error' ? '#ef4444' : '#10b981',
                    color: '#ffffff',
                    padding: '12px 20px',
                    borderRadius: 'var(--admin-radius-md)',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    fontSize: '0.86rem',
                    fontWeight: 600,
                    animation: 'fadeIn 0.2s ease-out'
                }}>
                    <span>{toast.message}</span>
                </div>
            )}

            {/* Breadcrumbs */}
            <div className="admin-breadcrumbs" style={{ fontSize: '0.78rem', color: 'var(--admin-text-muted)', marginBottom: '4px', fontWeight: 600 }}>
                Admin / Settings / <span style={{ color: 'var(--admin-text-main)' }}>Logo & Branding</span>
            </div>

            {/* Page Header */}
            <div className="admin-page-header" style={{ marginBottom: '20px' }}>
                <div>
                    <h1 className="admin-page-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        Logo & Branding Settings
                    </h1>
                    <p className="admin-page-subtitle">
                        Configure brand identity, storefront logo, dark theme assets, and browser favicon across the entire site.
                    </p>
                </div>
                <div className="admin-page-header-actions" style={{ display: 'flex', gap: '10px' }}>
                    <button
                        type="button"
                        className="admin-btn admin-btn-secondary"
                        onClick={handleResetAll}
                        disabled={saving || loading}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                    >
                        <RotateCcw size={14} />
                        <span>Reset Defaults</span>
                    </button>
                    <button
                        type="button"
                        className="admin-btn admin-btn-primary"
                        onClick={handleSave}
                        disabled={saving || loading}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                    >
                        <Check size={15} />
                        <span>{saving ? 'Saving...' : (hasPendingChanges ? 'Save Changes *' : 'Save Changes')}</span>
                    </button>
                </div>
            </div>

            {/* 4 Core Brand Assets Cards Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: '18px',
                marginBottom: '24px'
            }}>
                
                {/* 1. FULL LOGO */}
                <div className="admin-card" style={{ padding: '18px', display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{
                            fontSize: '0.70rem',
                            fontWeight: 700,
                            letterSpacing: '0.04em',
                            textTransform: 'uppercase',
                            color: 'var(--admin-primary)',
                            background: 'rgba(27, 59, 43, 0.08)',
                            padding: '3px 8px',
                            borderRadius: '4px'
                        }}>
                            Storefront & Header
                        </span>
                        {previews.logo_full && (
                            <span className="admin-badge admin-badge-success" style={{ fontSize: '0.68rem', padding: '1px 6px' }}>
                                Preview Ready
                            </span>
                        )}
                    </div>
                    <h3 style={{ fontSize: '0.96rem', fontWeight: 800, margin: '0 0 4px 0', color: 'var(--admin-text-main)' }}>
                        Full Horizontal Logo
                    </h3>
                    <p style={{ fontSize: '0.76rem', color: 'var(--admin-text-muted)', margin: '0 0 14px 0', lineHeight: 1.4 }}>
                        Primary horizontal logo displayed on storefront navigation, header, and auth modals.
                    </p>

                    {/* Preview Box */}
                    <div style={{
                        width: '100%',
                        height: '110px',
                        borderRadius: '8px',
                        border: '1.5px dashed var(--admin-border-color)',
                        background: '#FAFBFC',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '12px',
                        marginBottom: '12px',
                        overflow: 'hidden'
                    }}>
                        <img
                            src={previews.logo_full || branding.logo_full || '/mangalam_logo.png'}
                            alt="Full Logo Preview"
                            style={{
                                maxHeight: '52px',
                                maxWidth: '240px',
                                width: 'auto',
                                height: 'auto',
                                objectFit: 'contain'
                            }}
                            onError={(e) => { e.target.src = '/mangalam_logo.png'; }}
                        />
                    </div>

                    {/* Specs Row */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontSize: '0.72rem',
                        color: 'var(--admin-text-muted)',
                        marginBottom: '14px',
                        padding: '0 2px'
                    }}>
                        <span>Recommended: <strong style={{ color: 'var(--admin-text-main)' }}>500 × 140 px</strong></span>
                        <span>Formats: <strong style={{ color: 'var(--admin-text-main)' }}>PNG, SVG, WebP</strong></span>
                    </div>

                    {/* Actions */}
                    <div style={{ marginTop: 'auto', display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <input
                            type="file"
                            ref={fileInputRefs.logo_full}
                            style={{ display: 'none' }}
                            accept="image/png,image/jpeg,image/webp,image/svg+xml"
                            onChange={(e) => handleFileChange('logo_full', e)}
                        />
                        <button
                            type="button"
                            className="admin-btn admin-btn-secondary"
                            onClick={() => fileInputRefs.logo_full.current?.click()}
                            style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.78rem', padding: '6px 12px' }}
                        >
                            <Upload size={13} />
                            <span>{previews.logo_full ? 'Change Image' : 'Upload / Replace'}</span>
                        </button>
                        <button
                            type="button"
                            className="admin-btn-icon"
                            onClick={() => handleRemoveLogo('logo_full')}
                            title="Reset to Default"
                            style={{ width: '32px', height: '32px', color: 'var(--admin-danger-text)' }}
                        >
                            <Trash2 size={13} />
                        </button>
                    </div>
                </div>

                {/* 2. SMALL / SIDEBAR LOGO */}
                <div className="admin-card" style={{ padding: '18px', display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{
                            fontSize: '0.70rem',
                            fontWeight: 700,
                            letterSpacing: '0.04em',
                            textTransform: 'uppercase',
                            color: 'var(--admin-primary)',
                            background: 'rgba(27, 59, 43, 0.08)',
                            padding: '3px 8px',
                            borderRadius: '4px'
                        }}>
                            Sidebar & Mobile
                        </span>
                        {previews.logo_small && (
                            <span className="admin-badge admin-badge-success" style={{ fontSize: '0.68rem', padding: '1px 6px' }}>
                                Preview Ready
                            </span>
                        )}
                    </div>
                    <h3 style={{ fontSize: '0.96rem', fontWeight: 800, margin: '0 0 4px 0', color: 'var(--admin-text-main)' }}>
                        Small Crest / Icon Logo
                    </h3>
                    <p style={{ fontSize: '0.76rem', color: 'var(--admin-text-muted)', margin: '0 0 14px 0', lineHeight: 1.4 }}>
                        Compact emblem icon used when the admin sidebar is collapsed and in compact mobile bars.
                    </p>

                    {/* Preview Box */}
                    <div style={{
                        width: '100%',
                        height: '110px',
                        borderRadius: '8px',
                        border: '1.5px dashed var(--admin-border-color)',
                        background: '#FAFBFC',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '12px',
                        marginBottom: '12px',
                        overflow: 'hidden'
                    }}>
                        <img
                            src={previews.logo_small || branding.logo_small || '/sprout-mascot-badge.png'}
                            alt="Small Logo Preview"
                            style={{
                                maxHeight: '56px',
                                maxWidth: '56px',
                                width: 'auto',
                                height: 'auto',
                                objectFit: 'contain'
                            }}
                            onError={(e) => { e.target.src = '/sprout-mascot-badge.png'; }}
                        />
                    </div>

                    {/* Specs Row */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontSize: '0.72rem',
                        color: 'var(--admin-text-muted)',
                        marginBottom: '14px',
                        padding: '0 2px'
                    }}>
                        <span>Recommended: <strong style={{ color: 'var(--admin-text-main)' }}>120 × 120 px (1:1)</strong></span>
                        <span>Formats: <strong style={{ color: 'var(--admin-text-main)' }}>PNG, SVG, WebP</strong></span>
                    </div>

                    {/* Actions */}
                    <div style={{ marginTop: 'auto', display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <input
                            type="file"
                            ref={fileInputRefs.logo_small}
                            style={{ display: 'none' }}
                            accept="image/png,image/jpeg,image/webp,image/svg+xml,image/x-icon"
                            onChange={(e) => handleFileChange('logo_small', e)}
                        />
                        <button
                            type="button"
                            className="admin-btn admin-btn-secondary"
                            onClick={() => fileInputRefs.logo_small.current?.click()}
                            style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.78rem', padding: '6px 12px' }}
                        >
                            <Upload size={13} />
                            <span>{previews.logo_small ? 'Change Image' : 'Upload / Replace'}</span>
                        </button>
                        <button
                            type="button"
                            className="admin-btn-icon"
                            onClick={() => handleRemoveLogo('logo_small')}
                            title="Reset to Default"
                            style={{ width: '32px', height: '32px', color: 'var(--admin-danger-text)' }}
                        >
                            <Trash2 size={13} />
                        </button>
                    </div>
                </div>

                {/* 3. DARK THEME LOGO */}
                <div className="admin-card" style={{ padding: '18px', display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{
                            fontSize: '0.70rem',
                            fontWeight: 700,
                            letterSpacing: '0.04em',
                            textTransform: 'uppercase',
                            color: '#10b981',
                            background: 'rgba(16, 185, 129, 0.12)',
                            padding: '3px 8px',
                            borderRadius: '4px'
                        }}>
                            Dark Theme & Footer
                        </span>
                        {previews.logo_dark && (
                            <span className="admin-badge admin-badge-success" style={{ fontSize: '0.68rem', padding: '1px 6px' }}>
                                Preview Ready
                            </span>
                        )}
                    </div>
                    <h3 style={{ fontSize: '0.96rem', fontWeight: 800, margin: '0 0 4px 0', color: 'var(--admin-text-main)' }}>
                        Dark Background Logo
                    </h3>
                    <p style={{ fontSize: '0.76rem', color: 'var(--admin-text-muted)', margin: '0 0 14px 0', lineHeight: 1.4 }}>
                        Light artwork variant rendered on dark navy footers and dark-mode themes.
                    </p>

                    {/* Preview Box */}
                    <div style={{
                        width: '100%',
                        height: '110px',
                        borderRadius: '8px',
                        border: '1.5px dashed #334155',
                        background: '#073820',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '12px',
                        marginBottom: '12px',
                        overflow: 'hidden'
                    }}>
                        <img
                            src={previews.logo_dark || branding.logo_dark || '/mangalam_logo.png'}
                            alt="Dark Logo Preview"
                            style={{
                                maxHeight: '52px',
                                maxWidth: '240px',
                                width: 'auto',
                                height: 'auto',
                                objectFit: 'contain'
                            }}
                            onError={(e) => { e.target.src = '/mangalam_logo.png'; }}
                        />
                    </div>

                    {/* Specs Row */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontSize: '0.72rem',
                        color: 'var(--admin-text-muted)',
                        marginBottom: '14px',
                        padding: '0 2px'
                    }}>
                        <span>Recommended: <strong style={{ color: 'var(--admin-text-main)' }}>500 × 140 px</strong></span>
                        <span>Formats: <strong style={{ color: 'var(--admin-text-main)' }}>PNG, SVG (Light)</strong></span>
                    </div>

                    {/* Actions */}
                    <div style={{ marginTop: 'auto', display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <input
                            type="file"
                            ref={fileInputRefs.logo_dark}
                            style={{ display: 'none' }}
                            accept="image/png,image/jpeg,image/webp,image/svg+xml"
                            onChange={(e) => handleFileChange('logo_dark', e)}
                        />
                        <button
                            type="button"
                            className="admin-btn admin-btn-secondary"
                            onClick={() => fileInputRefs.logo_dark.current?.click()}
                            style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.78rem', padding: '6px 12px' }}
                        >
                            <Upload size={13} />
                            <span>{previews.logo_dark ? 'Change Image' : 'Upload / Replace'}</span>
                        </button>
                        <button
                            type="button"
                            className="admin-btn-icon"
                            onClick={() => handleRemoveLogo('logo_dark')}
                            title="Reset to Default"
                            style={{ width: '32px', height: '32px', color: 'var(--admin-danger-text)' }}
                        >
                            <Trash2 size={13} />
                        </button>
                    </div>
                </div>

                {/* 4. FAVICON */}
                <div className="admin-card" style={{ padding: '18px', display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{
                            fontSize: '0.70rem',
                            fontWeight: 700,
                            letterSpacing: '0.04em',
                            textTransform: 'uppercase',
                            color: '#3b82f6',
                            background: 'rgba(59, 130, 246, 0.12)',
                            padding: '3px 8px',
                            borderRadius: '4px'
                        }}>
                            Browser Tab & Bookmark
                        </span>
                        {previews.favicon && (
                            <span className="admin-badge admin-badge-success" style={{ fontSize: '0.68rem', padding: '1px 6px' }}>
                                Preview Ready
                            </span>
                        )}
                    </div>
                    <h3 style={{ fontSize: '0.96rem', fontWeight: 800, margin: '0 0 4px 0', color: 'var(--admin-text-main)' }}>
                        Website Favicon Icon
                    </h3>
                    <p style={{ fontSize: '0.76rem', color: 'var(--admin-text-muted)', margin: '0 0 14px 0', lineHeight: 1.4 }}>
                        Square icon displayed on browser tabs, bookmarks bar, and shortcut icons.
                    </p>

                    {/* Clean Mock Browser Tab Preview Box */}
                    <div style={{
                        width: '100%',
                        height: '110px',
                        borderRadius: '8px',
                        border: '1.5px dashed var(--admin-border-color)',
                        background: '#FAFBFC',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '10px 14px',
                        marginBottom: '12px',
                        position: 'relative'
                    }}>
                        {/* Mock Tab Strip */}
                        <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            background: '#e2e8f0',
                            padding: '4px 10px',
                            borderRadius: '6px',
                            maxWidth: '220px',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.06)'
                        }}>
                            <img
                                src={previews.favicon || branding.favicon || '/sprout-mascot-badge.png'}
                                alt="Favicon"
                                style={{ width: '16px', height: '16px', borderRadius: '3px', objectFit: 'contain' }}
                                onError={(e) => { e.target.src = '/sprout-mascot-badge.png'; }}
                            />
                            <span style={{
                                fontSize: '0.72rem',
                                fontWeight: 600,
                                color: '#1e293b',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                maxWidth: '140px'
                            }}>
                                {formData.site_title || 'Mangalam Store'}
                            </span>
                        </div>

                        {/* Centered Favicon Large Badge */}
                        <div style={{
                            marginTop: '8px',
                            width: '32px',
                            height: '32px',
                            borderRadius: '6px',
                            background: '#ffffff',
                            border: '1px solid var(--admin-border-color)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: 'var(--admin-shadow-xs)'
                        }}>
                            <img
                                src={previews.favicon || branding.favicon || '/sprout-mascot-badge.png'}
                                alt="Favicon Preview"
                                style={{ width: '22px', height: '22px', objectFit: 'contain' }}
                                onError={(e) => { e.target.src = '/sprout-mascot-badge.png'; }}
                            />
                        </div>
                    </div>

                    {/* Specs Row */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontSize: '0.72rem',
                        color: 'var(--admin-text-muted)',
                        marginBottom: '14px',
                        padding: '0 2px'
                    }}>
                        <span>Recommended: <strong style={{ color: 'var(--admin-text-main)' }}>32 × 32 px</strong></span>
                        <span>Formats: <strong style={{ color: 'var(--admin-text-main)' }}>ICO, PNG, SVG</strong></span>
                    </div>

                    {/* Actions */}
                    <div style={{ marginTop: 'auto', display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <input
                            type="file"
                            ref={fileInputRefs.favicon}
                            style={{ display: 'none' }}
                            accept="image/x-icon,image/vnd.microsoft.icon,image/png,image/svg+xml,image/webp"
                            onChange={(e) => handleFileChange('favicon', e)}
                        />
                        <button
                            type="button"
                            className="admin-btn admin-btn-secondary"
                            onClick={() => fileInputRefs.favicon.current?.click()}
                            style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.78rem', padding: '6px 12px' }}
                        >
                            <Upload size={13} />
                            <span>{previews.favicon ? 'Change Image' : 'Upload / Replace'}</span>
                        </button>
                        <button
                            type="button"
                            className="admin-btn-icon"
                            onClick={() => handleRemoveLogo('favicon')}
                            title="Reset to Default"
                            style={{ width: '32px', height: '32px', color: 'var(--admin-danger-text)' }}
                        >
                            <Trash2 size={13} />
                        </button>
                    </div>
                </div>

            </div>

            {/* Brand Meta Details Form Card */}
            <div className="admin-card" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <Globe size={18} style={{ color: 'var(--admin-primary)' }} />
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0, color: 'var(--admin-text-main)' }}>
                        Store Identity & Typography
                    </h3>
                </div>
                <p style={{ fontSize: '0.80rem', color: 'var(--admin-text-muted)', margin: '0 0 20px 0' }}>
                    General store title, brand tagline, and footer copyright notice configured across the entire website.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                    <div>
                        <label className="admin-label" style={{ marginBottom: '6px' }}>
                            Site Title
                        </label>
                        <input
                            type="text"
                            className="admin-input"
                            value={formData.site_title}
                            onChange={(e) => setFormData(prev => ({ ...prev, site_title: e.target.value }))}
                            placeholder="e.g., Mangalam Healthy Foods"
                        />
                    </div>

                    <div>
                        <label className="admin-label" style={{ marginBottom: '6px' }}>
                            Brand Tagline
                        </label>
                        <input
                            type="text"
                            className="admin-input"
                            value={formData.tagline}
                            onChange={(e) => setFormData(prev => ({ ...prev, tagline: e.target.value }))}
                            placeholder="e.g., Traditional & Heritage Wellness Foods"
                        />
                    </div>
                </div>

                <div style={{ marginBottom: '20px' }}>
                    <label className="admin-label" style={{ marginBottom: '6px' }}>
                        Footer Copyright Notice
                    </label>
                    <input
                        type="text"
                        className="admin-input"
                        value={formData.footer_text}
                        onChange={(e) => setFormData(prev => ({ ...prev, footer_text: e.target.value }))}
                        placeholder="e.g., © 2026 Mangalam Healthy Foods. All rights reserved."
                    />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                        type="button"
                        className="admin-btn admin-btn-primary"
                        onClick={handleSave}
                        disabled={saving || loading}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 20px' }}
                    >
                        <Check size={15} />
                        <span>{saving ? 'Saving...' : 'Save Branding Settings'}</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
