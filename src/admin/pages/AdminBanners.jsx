import React, { useState, useEffect } from 'react';
import { adminBannerService } from '../services/adminBannerService';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import TableSkeleton from '../components/TableSkeleton';
import { 
    Plus, 
    Search, 
    RefreshCw, 
    Pencil, 
    Trash2, 
    Check, 
    X, 
    Image as ImageIcon, 
    ArrowUp, 
    ArrowDown, 
    ExternalLink, 
    UploadCloud,
    CheckCircle2,
    Link as LinkIcon,
    Sliders
} from 'lucide-react';

export default function AdminBanners() {
    const [banners, setBanners] = useState([]);
    const [counts, setCounts] = useState({ all: 0, active: 0, inactive: 0 });
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    // Modals
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedBannerForDelete, setSelectedBannerForDelete] = useState(null);
    const [editingBanner, setEditingBanner] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // Form state (Simple: Image + Click URL + Active/Sort)
    const [formData, setFormData] = useState({
        title: '',
        button_link: '/shop',
        image_url: '',
        is_active: true,
        sort_order: 1
    });
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('');

    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 4000);
    };

    const loadBanners = async (isManualRefresh = false) => {
        if (isManualRefresh) setRefreshing(true);
        else setLoading(true);

        const res = await adminBannerService.getBanners(searchTerm, statusFilter);
        if (res.success) {
            setBanners(res.data);
            setCounts(res.counts);
        } else {
            showToast(res.message || 'Failed to load banners', 'error');
        }

        setLoading(false);
        setRefreshing(false);
    };

    useEffect(() => {
        loadBanners();
    }, [statusFilter]);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        loadBanners();
    };

    const handleOpenCreateModal = () => {
        setEditingBanner(null);
        setFormData({
            title: '',
            button_link: '/shop',
            image_url: '',
            is_active: true,
            sort_order: (banners.length + 1)
        });
        setImageFile(null);
        setImagePreview('');
        setIsEditModalOpen(true);
    };

    const handleOpenEditModal = (banner) => {
        setEditingBanner(banner);
        setFormData({
            title: banner.title || '',
            button_link: banner.button_link || '/shop',
            image_url: banner.image_url || '',
            is_active: Boolean(banner.is_active),
            sort_order: banner.sort_order || 1
        });
        setImageFile(null);
        setImagePreview(banner.image_url || '');
        setIsEditModalOpen(true);
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleToggleStatus = async (id) => {
        const res = await adminBannerService.toggleStatus(id);
        if (res.success) {
            showToast(res.message || 'Banner status updated', 'success');
            setBanners(prev => prev.map(b => b.id === id ? { ...b, is_active: !b.is_active } : b));
            const countRes = await adminBannerService.getBanners('', statusFilter);
            if (countRes.success) setCounts(countRes.counts);
        } else {
            showToast(res.message || 'Failed to update status', 'error');
        }
    };

    const handleMoveOrder = async (index, direction) => {
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= banners.length) return;

        const newBanners = [...banners];
        const [movedItem] = newBanners.splice(index, 1);
        newBanners.splice(targetIndex, 0, movedItem);

        const ordersPayload = newBanners.map((b, idx) => ({
            id: b.id,
            sort_order: idx + 1
        }));

        setBanners(newBanners.map((b, idx) => ({ ...b, sort_order: idx + 1 })));

        const res = await adminBannerService.reorderBanners(ordersPayload);
        if (res.success) {
            showToast('Banner sequence updated', 'success');
        } else {
            showToast(res.message || 'Failed to update banner order', 'error');
            loadBanners();
        }
    };

    const handleSubmitForm = async (e) => {
        e.preventDefault();
        if (!imageFile && !formData.image_url) {
            showToast('Please upload a banner image or provide an image URL', 'error');
            return;
        }

        setIsSaving(true);

        const payload = new FormData();
        payload.append('title', formData.title || 'Store Banner');
        payload.append('button_link', formData.button_link || '/shop');
        payload.append('is_active', formData.is_active ? '1' : '0');
        payload.append('sort_order', formData.sort_order);

        if (imageFile) {
            payload.append('image', imageFile);
        } else if (formData.image_url) {
            payload.append('image_url', formData.image_url);
        }

        let res;
        if (editingBanner) {
            res = await adminBannerService.updateBanner(editingBanner.id, payload);
        } else {
            res = await adminBannerService.createBanner(payload);
        }

        setIsSaving(false);

        if (res.success) {
            showToast(res.message || (editingBanner ? 'Banner updated successfully' : 'Banner created successfully'), 'success');
            setIsEditModalOpen(false);
            loadBanners();
        } else {
            showToast(res.message || 'Failed to save banner', 'error');
        }
    };

    const handleConfirmDelete = async () => {
        if (!selectedBannerForDelete) return;
        setIsDeleting(true);
        const res = await adminBannerService.deleteBanner(selectedBannerForDelete.id);
        setIsDeleting(false);

        if (res.success) {
            showToast('Banner deleted successfully', 'success');
            setSelectedBannerForDelete(null);
            loadBanners();
        } else {
            showToast(res.message || 'Failed to delete banner', 'error');
        }
    };

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
                Admin / Marketing / <span style={{ color: 'var(--admin-text-main)' }}>Hero Banners</span>
            </div>

            {/* Page Header */}
            <div className="admin-page-header">
                <div>
                    <h1 className="admin-page-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        Hero Banner Images
                    </h1>
                    <p className="admin-page-subtitle">
                        Upload full-width graphic banners for your homepage carousel with clickable destination links.
                    </p>
                </div>
                <div className="admin-page-header-actions" style={{ display: 'flex', gap: '10px' }}>
                    <button
                        className="admin-btn admin-btn-secondary"
                        onClick={() => loadBanners(true)}
                        disabled={refreshing}
                    >
                        <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
                        <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
                    </button>
                    <button
                        className="admin-btn admin-btn-primary"
                        onClick={handleOpenCreateModal}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                    >
                        <Plus size={15} />
                        <span>Upload New Banner</span>
                    </button>
                </div>
            </div>

            {/* KPI Stats Cards */}
            <div className="admin-stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', marginBottom: '20px' }}>
                <div 
                    className="admin-stat-card" 
                    style={{ cursor: 'pointer', border: statusFilter === 'all' ? '1.5px solid var(--admin-primary)' : '1px solid var(--admin-border-color)' }}
                    onClick={() => setStatusFilter('all')}
                >
                    <div className="admin-stat-label">Total Banners</div>
                    <div className="admin-stat-value">{counts.all}</div>
                </div>

                <div 
                    className="admin-stat-card" 
                    style={{ cursor: 'pointer', border: statusFilter === 'true' ? '1.5px solid #10b981' : '1px solid var(--admin-border-color)' }}
                    onClick={() => setStatusFilter('true')}
                >
                    <div className="admin-stat-label" style={{ color: '#059669', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <CheckCircle2 size={12} /> Active on Storefront
                    </div>
                    <div className="admin-stat-value" style={{ color: '#059669' }}>{counts.active}</div>
                </div>

                <div 
                    className="admin-stat-card" 
                    style={{ cursor: 'pointer', border: statusFilter === 'false' ? '1.5px solid #6b7280' : '1px solid var(--admin-border-color)' }}
                    onClick={() => setStatusFilter('false')}
                >
                    <div className="admin-stat-label" style={{ color: '#4b5563' }}>
                        Inactive / Hidden
                    </div>
                    <div className="admin-stat-value" style={{ color: '#4b5563' }}>{counts.inactive}</div>
                </div>
            </div>

            {/* Main Content Card */}
            <div className="admin-card">
                {/* Search & Filter Toolbar */}
                <div className="admin-card-header">
                    <form onSubmit={handleSearchSubmit} className="admin-search-box">
                        <Search size={15} className="admin-search-icon" />
                        <input
                            type="text"
                            placeholder="Search link, name..."
                            className="admin-search-input"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </form>

                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        <select
                            className="admin-select"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            style={{ width: 'auto', minWidth: '150px' }}
                        >
                            <option value="all">All Banners ({counts.all})</option>
                            <option value="true">Active ({counts.active})</option>
                            <option value="false">Inactive ({counts.inactive})</option>
                        </select>
                    </div>
                </div>

                {/* Table or Empty State */}
                {loading ? (
                    <TableSkeleton rows={4} cols={5} />
                ) : banners.length === 0 ? (
                    <div className="admin-empty-state" style={{ padding: '60px 20px', textAlign: 'center' }}>
                        <div style={{
                            width: '60px',
                            height: '60px',
                            borderRadius: '50%',
                            background: 'var(--admin-surface-subtle)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 16px auto',
                            color: 'var(--admin-text-muted)'
                        }}>
                            <ImageIcon size={28} />
                        </div>
                        <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: '0 0 6px 0', color: 'var(--admin-text-main)' }}>
                            No Hero Banners Uploaded Yet
                        </h3>
                        <p style={{ fontSize: '0.84rem', color: 'var(--admin-text-muted)', margin: '0 0 18px 0', maxWidth: '420px', marginLeft: 'auto', marginRight: 'auto' }}>
                            Upload high-resolution full-width promotional banner images and set where visitors go when clicking them.
                        </p>
                        <button className="admin-btn admin-btn-primary" onClick={handleOpenCreateModal}>
                            <Plus size={14} /> Upload First Banner
                        </button>
                    </div>
                ) : (
                    <div className="admin-table-responsive">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th style={{ width: '60px', textAlign: 'center' }}>ORDER</th>
                                    <th style={{ width: '280px' }}>BANNER IMAGE PREVIEW</th>
                                    <th>DESTINATION / CLICK URL</th>
                                    <th>LABEL / TITLE</th>
                                    <th>STATUS</th>
                                    <th style={{ textAlign: 'right', paddingRight: '16px' }}>ACTIONS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {banners.map((b, idx) => (
                                    <tr key={b.id}>
                                        {/* Sort Reorder Buttons */}
                                        <td style={{ textAlign: 'center' }}>
                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                                                <button
                                                    type="button"
                                                    disabled={idx === 0}
                                                    onClick={() => handleMoveOrder(idx, 'up')}
                                                    style={{
                                                        border: 'none',
                                                        background: 'none',
                                                        cursor: idx === 0 ? 'not-allowed' : 'pointer',
                                                        opacity: idx === 0 ? 0.3 : 1,
                                                        color: 'var(--admin-text-muted)',
                                                        padding: '2px'
                                                    }}
                                                    title="Move Up"
                                                >
                                                    <ArrowUp size={13} />
                                                </button>
                                                <span style={{ fontSize: '0.74rem', fontWeight: 800, color: 'var(--admin-text-main)' }}>
                                                    #{idx + 1}
                                                </span>
                                                <button
                                                    type="button"
                                                    disabled={idx === banners.length - 1}
                                                    onClick={() => handleMoveOrder(idx, 'down')}
                                                    style={{
                                                        border: 'none',
                                                        background: 'none',
                                                        cursor: idx === banners.length - 1 ? 'not-allowed' : 'pointer',
                                                        opacity: idx === banners.length - 1 ? 0.3 : 1,
                                                        color: 'var(--admin-text-muted)',
                                                        padding: '2px'
                                                    }}
                                                    title="Move Down"
                                                >
                                                    <ArrowDown size={13} />
                                                </button>
                                            </div>
                                        </td>

                                        {/* Banner Image Preview */}
                                        <td>
                                            <div style={{
                                                width: '260px',
                                                height: '95px',
                                                borderRadius: '8px',
                                                background: 'var(--admin-surface-subtle)',
                                                border: '1px solid var(--admin-border-color)',
                                                overflow: 'hidden',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                boxShadow: 'var(--admin-shadow-xs)'
                                            }}>
                                                {b.image_url ? (
                                                    <img
                                                        src={b.image_url}
                                                        alt={b.title || 'Banner'}
                                                        style={{
                                                            width: '100%',
                                                            height: '100%',
                                                            objectFit: 'cover'
                                                        }}
                                                        onError={(e) => {
                                                            e.target.onerror = null;
                                                            e.target.src = '/assets/images/300g_amutham/amutham-01.jpg';
                                                        }}
                                                    />
                                                ) : (
                                                    <div style={{ color: 'var(--admin-text-muted)', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.74rem' }}>
                                                        <ImageIcon size={18} /> No Image
                                                    </div>
                                                )}
                                            </div>
                                        </td>

                                        {/* Destination / Click URL */}
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <LinkIcon size={13} style={{ color: 'var(--admin-primary)', flexShrink: 0 }} />
                                                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--admin-text-main)', fontFamily: 'monospace' }}>
                                                    {b.button_link || '/shop'}
                                                </span>
                                            </div>
                                            <div style={{ fontSize: '0.72rem', color: 'var(--admin-text-muted)', marginTop: '2px' }}>
                                                Clicks on this banner redirect to this page
                                            </div>
                                        </td>

                                        {/* Optional Title / Label */}
                                        <td>
                                            <div style={{ fontWeight: 700, color: 'var(--admin-text-main)', fontSize: '0.84rem' }}>
                                                {b.title || 'Storefront Banner'}
                                            </div>
                                            <div style={{ fontSize: '0.72rem', color: 'var(--admin-text-muted)', marginTop: '2px' }}>
                                                ID: #{b.id}
                                            </div>
                                        </td>

                                        {/* Status Toggle */}
                                        <td>
                                            <button
                                                type="button"
                                                onClick={() => handleToggleStatus(b.id)}
                                                className={`admin-badge ${b.is_active ? 'admin-badge-success' : 'admin-badge-neutral'}`}
                                                style={{ cursor: 'pointer', border: 'none' }}
                                                title="Click to toggle active status"
                                            >
                                                <span className="admin-badge-dot" />
                                                {b.is_active ? 'Active' : 'Hidden'}
                                            </button>
                                        </td>

                                        {/* Actions */}
                                        <td style={{ textAlign: 'right', paddingRight: '16px' }}>
                                            <div style={{ display: 'inline-flex', gap: '6px', alignItems: 'center' }}>
                                                <button
                                                    type="button"
                                                    className="admin-btn-icon"
                                                    title="Edit Banner"
                                                    onClick={() => handleOpenEditModal(b)}
                                                    style={{ width: '28px', height: '28px', color: 'var(--admin-primary)', background: 'rgba(27, 59, 43, 0.08)', borderColor: 'rgba(27, 59, 43, 0.2)' }}
                                                >
                                                    <Pencil size={13} />
                                                </button>
                                                <button
                                                    type="button"
                                                    className="admin-btn-icon"
                                                    title="Delete Banner"
                                                    onClick={() => setSelectedBannerForDelete(b)}
                                                    style={{ width: '28px', height: '28px', color: 'var(--admin-danger-text)', background: 'rgba(239, 68, 68, 0.08)', borderColor: 'rgba(239, 68, 68, 0.2)' }}
                                                >
                                                    <Trash2 size={13} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* ========================================================= */}
            {/* UPLOAD / EDIT HERO BANNER MODAL                           */}
            {/* ========================================================= */}
            {isEditModalOpen && (
                <div className="admin-modal-backdrop" onClick={() => !isSaving && setIsEditModalOpen(false)}>
                    <div 
                        className="admin-modal-card" 
                        onClick={(e) => e.stopPropagation()}
                        style={{ maxWidth: '620px', width: '92%' }}
                    >
                        {/* Header */}
                        <div className="admin-modal-header">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{
                                    width: '34px',
                                    height: '34px',
                                    borderRadius: '8px',
                                    background: 'rgba(16, 185, 129, 0.12)',
                                    color: 'var(--admin-primary)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0
                                }}>
                                    <ImageIcon size={18} />
                                </div>
                                <div>
                                    <h3 className="admin-modal-title">
                                        {editingBanner ? 'Edit Banner Image' : 'Upload New Banner'}
                                    </h3>
                                    <span style={{ fontSize: '0.74rem', color: 'var(--admin-text-muted)' }}>
                                        Upload your graphic banner and configure its click destination URL.
                                    </span>
                                </div>
                            </div>
                            <button
                                type="button"
                                className="admin-modal-close"
                                onClick={() => setIsEditModalOpen(false)}
                                disabled={isSaving}
                            >
                                <X size={15} />
                            </button>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmitForm}>
                            <div className="admin-modal-body" style={{ maxHeight: '72vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                
                                {/* Image Upload & Live Preview Card */}
                                <div>
                                    <label className="admin-label" style={{ marginBottom: '6px' }}>
                                        Banner Graphic Image *
                                    </label>

                                    {/* Preview container */}
                                    <div style={{
                                        width: '100%',
                                        minHeight: '160px',
                                        maxHeight: '220px',
                                        borderRadius: '10px',
                                        border: '1.5px dashed var(--admin-border-color)',
                                        background: 'var(--admin-surface-subtle)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        overflow: 'hidden',
                                        marginBottom: '10px',
                                        position: 'relative'
                                    }}>
                                        {imagePreview ? (
                                            <img
                                                src={imagePreview}
                                                alt="Banner preview"
                                                style={{
                                                    width: '100%',
                                                    height: '100%',
                                                    objectFit: 'contain'
                                                }}
                                            />
                                        ) : (
                                            <div style={{ textAlign: 'center', padding: '24px', color: 'var(--admin-text-muted)' }}>
                                                <UploadCloud size={36} style={{ margin: '0 auto 8px auto', display: 'block', color: 'var(--admin-primary)' }} />
                                                <div style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--admin-text-main)' }}>
                                                    Upload Banner Image
                                                </div>
                                                <div style={{ fontSize: '0.74rem', marginTop: '2px' }}>
                                                    Recommended size: 1920x600px or full width aspect ratio
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* File Input & URL inputs */}
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                        <div>
                                            <div style={{ fontSize: '0.72rem', color: 'var(--admin-text-muted)', marginBottom: '3px', fontWeight: 600 }}>
                                                Upload file:
                                            </div>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleImageChange}
                                                className="admin-input"
                                                style={{ padding: '6px' }}
                                            />
                                        </div>

                                        <div>
                                            <div style={{ fontSize: '0.72rem', color: 'var(--admin-text-muted)', marginBottom: '3px', fontWeight: 600 }}>
                                                Or image URL path:
                                            </div>
                                            <input
                                                type="text"
                                                placeholder="/assets/images/... or https://..."
                                                className="admin-input"
                                                value={formData.image_url}
                                                onChange={(e) => {
                                                    setFormData({ ...formData, image_url: e.target.value });
                                                    if (!imageFile) setImagePreview(e.target.value);
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Click Destination URL */}
                                <div>
                                    <label className="admin-label">
                                        <LinkIcon size={12} /> Click Destination URL / Route *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. /shop, /science, /about, /product/1, or external link"
                                        className="admin-input"
                                        style={{ fontFamily: 'monospace', fontSize: '0.84rem' }}
                                        value={formData.button_link}
                                        onChange={(e) => setFormData({ ...formData, button_link: e.target.value })}
                                    />
                                    <div style={{ fontSize: '0.72rem', color: 'var(--admin-text-muted)', marginTop: '4px' }}>
                                        When customers click on this banner, they will be navigated to this page.
                                    </div>
                                </div>

                                {/* Optional Internal Title / Label */}
                                <div>
                                    <label className="admin-label">
                                        Banner Title / Internal Label (Optional)
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g., Summer Special Harvest Banner"
                                        className="admin-input"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    />
                                </div>

                                {/* Status & Sort Order */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', alignItems: 'center' }}>
                                    <div>
                                        <label className="admin-label">
                                            Display Sort Order
                                        </label>
                                        <input
                                            type="number"
                                            min="1"
                                            className="admin-input"
                                            value={formData.sort_order}
                                            onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 1 })}
                                        />
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '18px' }}>
                                        <input
                                            type="checkbox"
                                            id="is_active_banner"
                                            checked={formData.is_active}
                                            onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                            style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                                        />
                                        <label htmlFor="is_active_banner" style={{ fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', color: 'var(--admin-text-main)' }}>
                                            Active on storefront carousel
                                        </label>
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="admin-modal-footer">
                                <button
                                    type="button"
                                    className="admin-btn admin-btn-secondary"
                                    onClick={() => setIsEditModalOpen(false)}
                                    disabled={isSaving}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="admin-btn admin-btn-primary"
                                    disabled={isSaving}
                                    style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                                >
                                    <Check size={14} />
                                    <span>{isSaving ? 'Saving...' : (editingBanner ? 'Update Banner' : 'Upload Banner')}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ========================================================= */}
            {/* DELETE CONFIRMATION MODAL                                 */}
            {/* ========================================================= */}
            <ConfirmDeleteModal
                isOpen={!!selectedBannerForDelete}
                title="Delete Hero Banner"
                itemName={selectedBannerForDelete ? (selectedBannerForDelete.title || `Banner #${selectedBannerForDelete.id}`) : ''}
                warningText="This action cannot be undone and will remove this banner image from your storefront carousel."
                onConfirm={handleConfirmDelete}
                onCancel={() => setSelectedBannerForDelete(null)}
                isDeleting={isDeleting}
            />
        </div>
    );
}
