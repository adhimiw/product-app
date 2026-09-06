import React, { useState, useEffect, useRef } from 'react';
import { 
    User, 
    Mail, 
    Phone, 
    MessageSquare, 
    Lock, 
    Eye, 
    EyeOff, 
    Camera, 
    Trash2, 
    ShieldCheck, 
    Key, 
    Save, 
    Loader2, 
    CheckCircle2, 
    AlertCircle, 
    RefreshCw,
    Shield
} from 'lucide-react';
import { adminAuthService } from '../services/adminAuthService';

export default function AdminProfile({ onProfileUpdated }) {
    const fileInputRef = useRef(null);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const [profile, setProfile] = useState({
        id: null,
        full_name: '',
        email: '',
        contact_number: '',
        whatsapp_number: '',
        role: 1,
        role_label: 'Super Administrator',
        user_profile: null,
        created_at: null,
        updated_at: null
    });

    const [previewImage, setPreviewImage] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [removeImage, setRemoveImage] = useState(false);

    // Password change fields
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    // Fetch profile on mount
    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        setLoading(true);
        setErrorMessage('');
        try {
            const res = await adminAuthService.getProfile();
            if (res.success && res.data) {
                const data = res.data;
                setProfile({
                    id: data.id,
                    full_name: data.full_name || '',
                    email: data.email || '',
                    contact_number: data.contact_number || '',
                    whatsapp_number: data.whatsapp_number || '',
                    role: data.role || 1,
                    role_label: data.role_label || 'Super Administrator',
                    user_profile: data.user_profile || null,
                    created_at: data.created_at || null,
                    updated_at: data.updated_at || null
                });
                setPreviewImage(data.user_profile || null);
            } else {
                setErrorMessage(res.error || 'Failed to load administrator profile.');
            }
        } catch (err) {
            setErrorMessage('Network error while loading profile.');
        } finally {
            setLoading(false);
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            setErrorMessage('Please select a valid image file (PNG, JPG, WEBP).');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setErrorMessage('Image size exceeds 5MB limit.');
            return;
        }

        setSelectedFile(file);
        setRemoveImage(false);

        const reader = new FileReader();
        reader.onloadend = () => {
            setPreviewImage(reader.result);
        };
        reader.readAsDataURL(file);
    };

    const handleRemoveImage = () => {
        setSelectedFile(null);
        setPreviewImage(null);
        setRemoveImage(true);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSuccessMessage('');
        setErrorMessage('');

        if (!profile.full_name.trim()) {
            setErrorMessage('Full name is required.');
            return;
        }

        if (!profile.email.trim()) {
            setErrorMessage('Email address is required.');
            return;
        }

        if (password && password.length < 6) {
            setErrorMessage('New password must be at least 6 characters long.');
            return;
        }

        if (password && password !== passwordConfirmation) {
            setErrorMessage('Password confirmation does not match new password.');
            return;
        }

        setSaving(true);
        try {
            const formData = new FormData();
            formData.append('full_name', profile.full_name.trim());
            formData.append('email', profile.email.trim());
            formData.append('contact_number', profile.contact_number.trim());
            formData.append('whatsapp_number', profile.whatsapp_number.trim());

            if (password) {
                formData.append('password', password);
            }

            if (selectedFile) {
                formData.append('user_profile', selectedFile);
            } else if (removeImage) {
                formData.append('remove_profile_image', '1');
            }

            const res = await adminAuthService.updateProfile(formData);

            if (res.success) {
                setSuccessMessage('Administrator profile updated successfully!');
                setPassword('');
                setPasswordConfirmation('');
                setSelectedFile(null);
                setRemoveImage(false);

                if (res.data) {
                    setProfile(prev => ({
                        ...prev,
                        ...res.data
                    }));
                    setPreviewImage(res.data.user_profile || null);
                }

                if (onProfileUpdated && res.user) {
                    onProfileUpdated(res.user);
                }
            } else {
                setErrorMessage(res.error || 'Failed to update administrator profile.');
            }
        } catch (err) {
            setErrorMessage('An unexpected error occurred while saving profile.');
        } finally {
            setSaving(false);
        }
    };

    const getInitials = (name) => {
        if (!name) return 'SA';
        const parts = name.trim().split(' ');
        if (parts.length >= 2) {
            return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    };

    if (loading) {
        return (
            <div className="admin-page-container">
                <div className="admin-loading-state">
                    <Loader2 size={32} className="admin-spin text-emerald-600" />
                    <p>Loading administrator profile details...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-page-container">
            {/* Header / Breadcrumb */}
            <div className="admin-page-header">
                <div>
                    <div className="admin-breadcrumb">
                        <span>Admin</span>
                        <span className="separator">/</span>
                        <span className="current">Administrator Profile</span>
                    </div>
                    <h1 className="admin-page-title">Admin Profile & Credentials</h1>
                    <p className="admin-page-subtitle">
                        Manage your super admin account details, contact numbers, profile photo, and security password.
                    </p>
                </div>
                <div className="admin-header-actions">
                    <button
                        type="button"
                        className="admin-btn admin-btn-secondary"
                        onClick={loadProfile}
                        disabled={loading || saving}
                    >
                        <RefreshCw size={15} />
                        <span>Refresh</span>
                    </button>
                </div>
            </div>

            {/* Notifications */}
            {successMessage && (
                <div className="admin-alert admin-alert-success" role="alert">
                    <CheckCircle2 size={18} />
                    <span>{successMessage}</span>
                </div>
            )}

            {errorMessage && (
                <div className="admin-alert admin-alert-danger" role="alert">
                    <AlertCircle size={18} />
                    <span>{errorMessage}</span>
                </div>
            )}

            {/* Main Profile Grid */}
            <div className="admin-profile-grid">
                {/* Left Column: Avatar & Summary Card */}
                <div className="admin-profile-sidebar">
                    <div className="admin-card admin-profile-card">
                        <div className="admin-profile-avatar-section">
                            <div className="admin-profile-avatar-wrap">
                                {previewImage ? (
                                    <img
                                        src={previewImage}
                                        alt={profile.full_name}
                                        className="admin-profile-avatar-img"
                                        onError={() => setPreviewImage(null)}
                                    />
                                ) : (
                                    <div className="admin-profile-avatar-placeholder">
                                        {getInitials(profile.full_name)}
                                    </div>
                                )}

                                <label
                                    htmlFor="admin-avatar-upload"
                                    className="admin-profile-avatar-btn"
                                    title="Upload new photo"
                                >
                                    <Camera size={16} />
                                    <input
                                        id="admin-avatar-upload"
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/png,image/jpeg,image/webp,image/svg+xml"
                                        className="admin-file-hidden"
                                        onChange={handleImageChange}
                                    />
                                </label>
                            </div>

                            <h3 className="admin-profile-name">{profile.full_name || 'Super Admin'}</h3>
                            <p className="admin-profile-email">{profile.email}</p>

                            <div className="admin-profile-badge">
                                <Shield size={13} />
                                <span>Super Administrator (Role 1)</span>
                            </div>

                            {previewImage && (
                                <button
                                    type="button"
                                    className="admin-btn-text-danger admin-profile-remove-photo"
                                    onClick={handleRemoveImage}
                                >
                                    <Trash2 size={14} />
                                    <span>Remove Photo</span>
                                </button>
                            )}
                        </div>

                        <hr className="admin-divider" />

                        {/* Security Badges List */}
                        <div className="admin-profile-info-list">
                            <div className="admin-profile-info-item">
                                <ShieldCheck size={16} className="text-emerald-500" />
                                <div>
                                    <strong>Access Control</strong>
                                    <span>Full Root Store Privileges</span>
                                </div>
                            </div>

                            <div className="admin-profile-info-item">
                                <Key size={16} className="text-amber-500" />
                                <div>
                                    <strong>Session Token</strong>
                                    <span>7-Day Sanctum Persistence</span>
                                </div>
                            </div>

                            {profile.created_at && (
                                <div className="admin-profile-info-item">
                                    <User size={16} className="text-blue-500" />
                                    <div>
                                        <strong>Account Created</strong>
                                        <span>{new Date(profile.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column: Profile Edit Form */}
                <div className="admin-profile-main">
                    <form onSubmit={handleSubmit} className="admin-card admin-profile-form-card">
                        <div className="admin-card-header">
                            <h2 className="admin-card-title">Personal Information</h2>
                            <p className="admin-card-subtitle">
                                Update the primary contact details associated with your administrator account.
                            </p>
                        </div>

                        <div className="admin-form-body">
                            <div className="admin-form-row">
                                <div className="admin-form-group">
                                    <label className="admin-form-label" htmlFor="profile-fullname">
                                        Full Name <span className="required">*</span>
                                    </label>
                                    <div className="admin-input-icon-wrap">
                                        <User size={17} className="admin-input-icon" />
                                        <input
                                            id="profile-fullname"
                                            type="text"
                                            className="admin-input"
                                            placeholder="Enter your full name"
                                            value={profile.full_name}
                                            onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="admin-form-group">
                                    <label className="admin-form-label" htmlFor="profile-email">
                                        Email Address <span className="required">*</span>
                                    </label>
                                    <div className="admin-input-icon-wrap">
                                        <Mail size={17} className="admin-input-icon" />
                                        <input
                                            id="profile-email"
                                            type="email"
                                            className="admin-input"
                                            placeholder="admin@mangalam.com"
                                            value={profile.email}
                                            onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="admin-form-row">
                                <div className="admin-form-group">
                                    <label className="admin-form-label" htmlFor="profile-contact">
                                        Contact Phone Number
                                    </label>
                                    <div className="admin-input-icon-wrap">
                                        <Phone size={17} className="admin-input-icon" />
                                        <input
                                            id="profile-contact"
                                            type="tel"
                                            className="admin-input"
                                            placeholder="e.g. +91 98765 43210"
                                            value={profile.contact_number}
                                            onChange={(e) => setProfile({ ...profile, contact_number: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="admin-form-group">
                                    <label className="admin-form-label" htmlFor="profile-whatsapp">
                                        WhatsApp Business Number
                                    </label>
                                    <div className="admin-input-icon-wrap">
                                        <MessageSquare size={17} className="admin-input-icon" />
                                        <input
                                            id="profile-whatsapp"
                                            type="tel"
                                            className="admin-input"
                                            placeholder="e.g. +91 98765 43210"
                                            value={profile.whatsapp_number}
                                            onChange={(e) => setProfile({ ...profile, whatsapp_number: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            <hr className="admin-divider" />

                            {/* Security / Change Password */}
                            <div className="admin-card-header" style={{ padding: 0, marginBottom: '16px' }}>
                                <h2 className="admin-card-title">Security & Password</h2>
                                <p className="admin-card-subtitle">
                                    Leave fields empty if you do not wish to change your login password.
                                </p>
                            </div>

                            <div className="admin-form-row">
                                <div className="admin-form-group">
                                    <label className="admin-form-label" htmlFor="profile-password">
                                        New Password
                                    </label>
                                    <div className="admin-input-icon-wrap">
                                        <Lock size={17} className="admin-input-icon" />
                                        <input
                                            id="profile-password"
                                            type={showPassword ? 'text' : 'password'}
                                            className="admin-input with-toggle"
                                            placeholder="Enter new password (min. 6 chars)"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            autoComplete="new-password"
                                        />
                                        <button
                                            type="button"
                                            className="admin-input-toggle-btn"
                                            onClick={() => setShowPassword(!showPassword)}
                                            tabIndex={-1}
                                        >
                                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                </div>

                                <div className="admin-form-group">
                                    <label className="admin-form-label" htmlFor="profile-confirm-password">
                                        Confirm New Password
                                    </label>
                                    <div className="admin-input-icon-wrap">
                                        <Lock size={17} className="admin-input-icon" />
                                        <input
                                            id="profile-confirm-password"
                                            type={showPassword ? 'text' : 'password'}
                                            className="admin-input"
                                            placeholder="Re-enter new password"
                                            value={passwordConfirmation}
                                            onChange={(e) => setPasswordConfirmation(e.target.value)}
                                            autoComplete="new-password"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="admin-card-footer">
                            <button
                                type="submit"
                                className="admin-btn admin-btn-primary"
                                disabled={saving}
                            >
                                {saving ? (
                                    <>
                                        <Loader2 size={16} className="admin-spin" />
                                        <span>Saving Changes...</span>
                                    </>
                                ) : (
                                    <>
                                        <Save size={16} />
                                        <span>Save Profile Changes</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
