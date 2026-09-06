import React, { useState, useEffect, useMemo } from 'react';
import { adminMarqueeService } from '../services/adminMarqueeService';
import PageHeader from '../components/PageHeader';
import TableSkeleton from '../components/TableSkeleton';
import EmptyState from '../components/EmptyState';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import { 
    Megaphone, 
    Pencil, 
    Trash2, 
    Check, 
    X, 
    Star, 
    ExternalLink, 
    Eye, 
    EyeOff, 
    Sparkles, 
    ArrowUpDown,
    CheckCircle2,
    AlertCircle,
    SlidersHorizontal,
    Plus,
    Search
} from 'lucide-react';

export default function AdminMarquee() {
    const [marquees, setMarquees] = useState([]);
    const [isGlobalEnabled, setIsGlobalEnabled] = useState(true);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);

    // Form state (Must initialize empty per design invariants)
    const [formData, setFormData] = useState({
        text: '',
        icon: '🚚',
        link_url: '',
        badge_text: '',
        show_first: false,
        is_active: true,
        sort_order: 0
    });

    const [fieldErrors, setFieldErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [togglingGlobal, setTogglingGlobal] = useState(false);

    // Delete Modal state
    const [deleteModalItem, setDeleteModalItem] = useState(null);
    const [deleting, setDeleting] = useState(false);

    // Quick emoji suggestions
    const emojiSuggestions = ['🚚', '🎉', '🌱', '⭐', '🔥', '✨', '🌿', '🌾', '❤️', '🏷️'];

    useEffect(() => {
        fetchMarquees();
    }, [search, statusFilter]);

    const fetchMarquees = async () => {
        setLoading(true);
        const res = await adminMarqueeService.getMarquees(search, statusFilter);
        if (res.success) {
            setMarquees(res.data || []);
            setIsGlobalEnabled(res.is_enabled);
            setErrorMsg('');
        } else {
            setErrorMsg(res.message || 'Failed to fetch marquee items');
        }
        setLoading(false);
    };

    const handleOpenAddModal = () => {
        setEditingItem(null);
        setFormData({
            text: '',
            icon: '🚚',
            link_url: '',
            badge_text: '',
            show_first: false,
            is_active: true,
            sort_order: marquees.length + 1
        });
        setFieldErrors({});
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (item) => {
        setEditingItem(item);
        setFormData({
            text: item.text || '',
            icon: item.icon || '🚚',
            link_url: item.link_url || '',
            badge_text: item.badge_text || '',
            show_first: Boolean(item.show_first),
            is_active: Boolean(item.is_active),
            sort_order: item.sort_order ?? 0
        });
        setFieldErrors({});
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingItem(null);
        setFieldErrors({});
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setFieldErrors({});

        if (!formData.text.trim()) {
            setFieldErrors({ text: ['Announcement text is required.'] });
            return;
        }

        setSubmitting(true);

        const payload = {
            text: formData.text.trim(),
            icon: formData.icon ? formData.icon.trim() : null,
            link_url: formData.link_url ? formData.link_url.trim() : null,
            badge_text: formData.badge_text ? formData.badge_text.trim() : null,
            show_first: Boolean(formData.show_first),
            is_active: Boolean(formData.is_active),
            sort_order: Number(formData.sort_order) || 0
        };

        let res;
        if (editingItem) {
            res = await adminMarqueeService.updateMarquee(editingItem.id, payload);
        } else {
            res = await adminMarqueeService.createMarquee(payload);
        }

        setSubmitting(false);

        if (res.success) {
            setSuccessMsg(editingItem ? 'Marquee announcement updated!' : 'Marquee announcement created!');
            handleCloseModal();
            fetchMarquees();
            setTimeout(() => setSuccessMsg(''), 4000);
        } else {
            if (res.errors) {
                setFieldErrors(res.errors);
            } else {
                setErrorMsg(res.message || 'Failed to save marquee announcement');
                setTimeout(() => setErrorMsg(''), 4000);
            }
        }
    };

    const handleToggleStatus = async (item) => {
        const res = await adminMarqueeService.toggleStatus(item.id);
        if (res.success) {
            setMarquees(prev => prev.map(m => m.id === item.id ? { ...m, is_active: !m.is_active } : m));
            setSuccessMsg(`Announcement ${item.is_active ? 'hidden' : 'activated'} successfully`);
            setTimeout(() => setSuccessMsg(''), 3000);
        } else {
            setErrorMsg(res.message || 'Failed to toggle status');
            setTimeout(() => setErrorMsg(''), 3000);
        }
    };

    const handleToggleGlobalVisibility = async () => {
        setTogglingGlobal(true);
        const nextState = !isGlobalEnabled;
        const res = await adminMarqueeService.toggleGlobalVisibility(nextState);
        setTogglingGlobal(false);

        if (res.success) {
            setIsGlobalEnabled(nextState);
            setSuccessMsg(nextState ? 'Marquee announcement bar is now visible on storefront' : 'Marquee announcement bar hidden from storefront');
            setTimeout(() => setSuccessMsg(''), 3000);
        } else {
            setErrorMsg(res.message || 'Failed to update global visibility');
            setTimeout(() => setErrorMsg(''), 3000);
        }
    };

    const handleDeleteClick = (item) => {
        setDeleteModalItem(item);
    };

    const handleConfirmDelete = async () => {
        if (!deleteModalItem) return;
        setDeleting(true);
        const res = await adminMarqueeService.deleteMarquee(deleteModalItem.id);
        setDeleting(false);

        if (res.success) {
            setSuccessMsg('Marquee announcement deleted successfully');
            setDeleteModalItem(null);
            fetchMarquees();
            setTimeout(() => setSuccessMsg(''), 3000);
        } else {
            setErrorMsg(res.message || 'Failed to delete announcement');
            setTimeout(() => setErrorMsg(''), 3000);
        }
    };

    const activeCount = useMemo(() => {
        return marquees.filter(m => m.is_active).length;
    }, [marquees]);

    return (
        <div className="admin-page-container">
            {/* Page Header */}
            <PageHeader
                title="Marquee Announcements"
                subtitle="Manage top scrolling promotional tickers, badges, links, and display order"
                actionButtonText="+ Add Marquee Item"
                onActionClick={handleOpenAddModal}
            />

            {/* Success Alert */}
            {successMsg && (
                <div className="admin-alert admin-alert-success" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                    <CheckCircle2 size={18} />
                    <span>{successMsg}</span>
                </div>
            )}

            {/* Error Alert */}
            {errorMsg && (
                <div className="admin-alert admin-alert-danger" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                    <AlertCircle size={18} />
                    <span>{errorMsg}</span>
                </div>
            )}

            {/* Master Marquee Bar Controller & Live Preview */}
            <div className="admin-card" style={{ marginBottom: '24px', padding: '20px 24px', borderRadius: '16px', background: 'var(--color-bg-card, #ffffff)', border: '1px solid rgba(7, 56, 32, 0.08)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '14px' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Megaphone size={20} style={{ color: 'var(--color-primary)' }} />
                            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: 'var(--color-text-main, #1a2e22)' }}>
                                Storefront Top Announcement Bar
                            </h3>
                            <span 
                                style={{
                                    fontSize: '0.72rem',
                                    fontWeight: 700,
                                    padding: '3px 10px',
                                    borderRadius: '12px',
                                    background: isGlobalEnabled ? '#eaf4ee' : '#fdf0ee',
                                    color: isGlobalEnabled ? '#16a34a' : '#dc2626'
                                }}
                            >
                                {isGlobalEnabled ? '● Active Live' : '○ Hidden'}
                            </span>
                        </div>
                        <p style={{ fontSize: '0.82rem', color: '#64746b', margin: '4px 0 0 30px' }}>
                            {isGlobalEnabled 
                                ? `Displaying ${activeCount} active announcement(s) in an infinite smooth running marquee ticker.` 
                                : 'The announcement bar is currently turned off and hidden from all website visitors.'}
                        </p>
                    </div>

                    <button
                        type="button"
                        className={`admin-btn ${isGlobalEnabled ? 'admin-btn-secondary' : 'admin-btn-primary'}`}
                        onClick={handleToggleGlobalVisibility}
                        disabled={togglingGlobal}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '9px 18px', fontSize: '0.84rem' }}
                    >
                        {isGlobalEnabled ? (
                            <>
                                <EyeOff size={15} />
                                <span>{togglingGlobal ? 'Updating...' : 'Hide Marquee Bar'}</span>
                            </>
                        ) : (
                            <>
                                <Eye size={15} />
                                <span>{togglingGlobal ? 'Updating...' : 'Enable Marquee Bar'}</span>
                            </>
                        )}
                    </button>
                </div>

                {/* Live Ticker Preview Box */}
                {isGlobalEnabled && marquees.filter(m => m.is_active).length > 0 && (
                    <div style={{ marginTop: '12px', borderRadius: '10px', overflow: 'hidden', border: '1px solid rgba(7, 56, 32, 0.15)' }}>
                        <div style={{ background: '#0a3821', color: '#ffffff', padding: '9px 16px', fontSize: '0.78rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '16px', letterSpacing: '0.04em', overflowX: 'auto', whiteSpace: 'nowrap' }}>
                            <span style={{ color: '#e5cd77', textTransform: 'uppercase', fontSize: '0.7rem', background: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: '6px' }}>
                                Live Preview
                            </span>
                            {marquees.filter(m => m.is_active).map((item, idx) => (
                                <React.Fragment key={item.id || idx}>
                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                        {item.icon && <span>{item.icon}</span>}
                                        <span>{item.text}</span>
                                        {item.badge_text && (
                                            <span style={{ background: '#e8ab10', color: '#073820', fontSize: '0.62rem', fontWeight: 800, padding: '1px 6px', borderRadius: '4px' }}>
                                                {item.badge_text}
                                            </span>
                                        )}
                                    </span>
                                    <span style={{ color: '#e5cd77' }}>•</span>
                                </React.Fragment>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Filter & Search Toolbar (Matching Categories / Products Design) */}
            <div className="admin-toolbar-row">
                <div className="admin-search-wrapper">
                    <span className="admin-search-icon">
                        <Search size={15} />
                    </span>
                    <input
                        type="text"
                        className="admin-input"
                        placeholder="Search announcements by text, badge..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <div className="admin-filter-tabs-group">
                    <button
                        type="button"
                        className={`admin-filter-tab-btn ${statusFilter === 'all' ? 'active' : ''}`}
                        onClick={() => setStatusFilter('all')}
                    >
                        <span>All</span>
                        <span className="admin-filter-tab-count">{marquees.length}</span>
                    </button>
                    <button
                        type="button"
                        className={`admin-filter-tab-btn ${statusFilter === 'active' ? 'active' : ''}`}
                        onClick={() => setStatusFilter('active')}
                    >
                        <span>Active</span>
                        <span className="admin-filter-tab-count">{marquees.filter(m => m.is_active).length}</span>
                    </button>
                    <button
                        type="button"
                        className={`admin-filter-tab-btn ${statusFilter === 'inactive' ? 'active' : ''}`}
                        onClick={() => setStatusFilter('inactive')}
                    >
                        <span>Inactive</span>
                        <span className="admin-filter-tab-count">{marquees.filter(m => !m.is_active).length}</span>
                    </button>
                </div>
            </div>

            {/* Marquee Table */}
            <div className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>
                {loading ? (
                    <div style={{ padding: '24px' }}>
                        <TableSkeleton rows={4} columns={6} hasImage={true} />
                    </div>
                ) : marquees.length === 0 ? (
                    <EmptyState
                        title="No Marquee Announcements Found"
                        description={search ? 'No announcements match your search query.' : 'Create your first announcement ticker item to display at the top of your website.'}
                        actionText="+ Add Marquee Item"
                        onAction={handleOpenAddModal}
                    />
                ) : (
                    <div className="admin-table-responsive">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th style={{ width: '60px', paddingLeft: '20px' }}>Order</th>
                                    <th style={{ width: '64px' }}>Icon</th>
                                    <th>Announcement Text &amp; Link</th>
                                    <th style={{ width: '130px' }}>Badge</th>
                                    <th style={{ width: '140px' }}>Priority</th>
                                    <th style={{ width: '110px' }}>Status</th>
                                    <th style={{ width: '110px', textAlign: 'right', paddingRight: '20px' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {marquees.map((item, index) => (
                                    <tr key={item.id}>
                                        <td style={{ fontWeight: 800, color: 'var(--admin-primary)', paddingLeft: '20px' }}>
                                            #{item.sort_order ?? index + 1}
                                        </td>
                                        <td>
                                            <div style={{
                                                width: '36px',
                                                height: '36px',
                                                borderRadius: '8px',
                                                background: 'var(--admin-surface-subtle)',
                                                border: '1px solid var(--admin-border-color)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '1.25rem'
                                            }}>
                                                {item.icon || '—'}
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ fontWeight: 700, color: 'var(--admin-text-main)', fontSize: '0.88rem' }}>
                                                {item.text}
                                            </div>
                                            {item.link_url && (
                                                <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px', fontFamily: 'monospace' }}>
                                                    <ExternalLink size={11} />
                                                    <span>{item.link_url}</span>
                                                </div>
                                            )}
                                        </td>
                                        <td>
                                            {item.badge_text ? (
                                                <span className="admin-badge admin-badge-warning" style={{ fontWeight: 800 }}>
                                                    {item.badge_text}
                                                </span>
                                            ) : (
                                                <span style={{ color: 'var(--admin-text-faint)', fontSize: '0.78rem' }}>—</span>
                                            )}
                                        </td>
                                        <td>
                                            {item.show_first ? (
                                                <span className="admin-badge admin-badge-info" style={{ fontWeight: 700, gap: '4px' }}>
                                                    <Star size={11} fill="currentColor" />
                                                    <span>Show First</span>
                                                </span>
                                            ) : (
                                                <span style={{ color: 'var(--admin-text-muted)', fontSize: '0.78rem' }}>Standard</span>
                                            )}
                                        </td>
                                        <td>
                                            <button
                                                type="button"
                                                onClick={() => handleToggleStatus(item)}
                                                className={`admin-badge ${item.is_active ? 'admin-badge-success' : 'admin-badge-neutral'}`}
                                                style={{ border: 'none', cursor: 'pointer', outline: 'none' }}
                                                title="Click to toggle status"
                                            >
                                                <span className="admin-badge-dot" />
                                                {item.is_active ? 'Active' : 'Inactive'}
                                            </button>
                                        </td>
                                        <td style={{ textAlign: 'right', paddingRight: '20px' }}>
                                            <div className="admin-table-actions">
                                                <button
                                                    type="button"
                                                    className="admin-btn-action admin-action-edit"
                                                    onClick={() => handleOpenEditModal(item)}
                                                    title="Edit Announcement"
                                                >
                                                    <Pencil size={14} />
                                                </button>
                                                <button
                                                    type="button"
                                                    className="admin-btn-action admin-action-delete"
                                                    onClick={() => handleDeleteClick(item)}
                                                    title="Delete Announcement"
                                                >
                                                    <Trash2 size={14} />
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

            {/* Modal: Add / Edit Marquee Announcement */}
            {isModalOpen && (
                <div className="admin-modal-backdrop" onClick={handleCloseModal}>
                    <div className="admin-modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '560px' }}>
                        <div className="admin-modal-header">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{
                                    width: '34px',
                                    height: '34px',
                                    borderRadius: '8px',
                                    background: 'var(--admin-primary-faint)',
                                    color: 'var(--admin-primary)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0
                                }}>
                                    <Megaphone size={17} />
                                </div>
                                <div>
                                    <h3 className="admin-modal-title">
                                        {editingItem ? 'Edit Marquee Announcement' : 'Add Marquee Announcement'}
                                    </h3>
                                    <p className="admin-modal-desc">
                                        Configure ticker message, icon, badge tag, destination route, and display priority
                                    </p>
                                </div>
                            </div>
                            <button type="button" className="admin-modal-close" onClick={handleCloseModal} title="Close dialog">
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleFormSubmit} noValidate className="admin-modal-body">
                            {/* Text Input */}
                            <div className="admin-form-group">
                                <label className="admin-label">
                                    Announcement Text <span style={{ color: 'var(--admin-danger-text)' }}>*</span>
                                </label>
                                <input
                                    type="text"
                                    className={`admin-input ${fieldErrors.text ? 'input-error' : ''}`}
                                    placeholder="e.g. FREE SHIPPING ON ORDERS OVER ₹999 / $40"
                                    value={formData.text}
                                    onChange={(e) => {
                                        setFormData({ ...formData, text: e.target.value });
                                        if (fieldErrors.text) setFieldErrors({ ...fieldErrors, text: null });
                                    }}
                                    required
                                    autoFocus
                                />
                                {fieldErrors.text && (
                                    <span className="admin-form-error">⚠️ {fieldErrors.text[0]}</span>
                                )}
                            </div>

                            {/* Icon / Emoji Selector */}
                            <div className="admin-form-group">
                                <label className="admin-label">
                                    Icon / Emoji
                                </label>
                                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                    <input
                                        type="text"
                                        className="admin-input"
                                        placeholder="🚚"
                                        value={formData.icon}
                                        onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                                        style={{ width: '68px', textAlign: 'center', fontSize: '1.25rem', height: '40px' }}
                                    />
                                    <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', alignItems: 'center' }}>
                                        {emojiSuggestions.map(em => (
                                            <button
                                                key={em}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, icon: em })}
                                                style={{
                                                    background: formData.icon === em ? 'var(--admin-primary)' : 'var(--admin-surface-subtle)',
                                                    color: formData.icon === em ? '#ffffff' : 'inherit',
                                                    border: '1px solid var(--admin-border-color)',
                                                    borderRadius: '8px',
                                                    padding: '5px 9px',
                                                    fontSize: '1rem',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.15s ease'
                                                }}
                                            >
                                                {em}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Badge Tag & Sort Order */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '14px' }}>
                                <div className="admin-form-group">
                                    <label className="admin-label">
                                        Badge Tag (Optional)
                                    </label>
                                    <input
                                        type="text"
                                        className="admin-input"
                                        placeholder="e.g. OFFER, DEAL, PURE"
                                        value={formData.badge_text}
                                        onChange={(e) => setFormData({ ...formData, badge_text: e.target.value })}
                                    />
                                </div>

                                <div className="admin-form-group">
                                    <label className="admin-label">
                                        Sort Order Sequence
                                    </label>
                                    <input
                                        type="number"
                                        className="admin-input"
                                        placeholder="1"
                                        min={0}
                                        value={formData.sort_order}
                                        onChange={(e) => setFormData({ ...formData, sort_order: e.target.value })}
                                    />
                                </div>
                            </div>

                            {/* Destination Link URL */}
                            <div className="admin-form-group">
                                <label className="admin-label">
                                    Destination Link / Route (Optional)
                                </label>
                                <input
                                    type="text"
                                    className="admin-input"
                                    placeholder="e.g. /shop, /science, /about, or https://..."
                                    value={formData.link_url}
                                    onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
                                />
                            </div>

                            {/* Options Card: Show First & Active */}
                            <div style={{ background: 'var(--admin-surface-subtle)', padding: '14px 16px', borderRadius: '12px', border: '1px solid var(--admin-border-color)', marginTop: '4px' }}>
                                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer', marginBottom: '12px' }}>
                                    <input
                                        type="checkbox"
                                        checked={formData.show_first}
                                        onChange={(e) => setFormData({ ...formData, show_first: e.target.checked })}
                                        style={{ marginTop: '3px', accentColor: 'var(--admin-primary)', width: '16px', height: '16px' }}
                                    />
                                    <div>
                                        <div style={{ fontWeight: 700, fontSize: '0.84rem', color: 'var(--admin-text-main)' }}>
                                            ⭐ Show First (Pin to front)
                                        </div>
                                        <div style={{ fontSize: '0.74rem', color: 'var(--admin-text-muted)' }}>
                                            Places this announcement at the beginning of the marquee sequence.
                                        </div>
                                    </div>
                                </label>

                                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer' }}>
                                    <input
                                        type="checkbox"
                                        checked={formData.is_active}
                                        onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                        style={{ marginTop: '3px', accentColor: 'var(--admin-primary)', width: '16px', height: '16px' }}
                                    />
                                    <div>
                                        <div style={{ fontWeight: 700, fontSize: '0.84rem', color: 'var(--admin-text-main)' }}>
                                            Active Announcement
                                        </div>
                                        <div style={{ fontSize: '0.74rem', color: 'var(--admin-text-muted)' }}>
                                            Visible and running in the live storefront marquee ticker.
                                        </div>
                                    </div>
                                </label>
                            </div>

                            {/* Modal Actions */}
                            <div className="admin-modal-footer" style={{ margin: '14px -22px -20px -22px' }}>
                                <button
                                    type="button"
                                    className="admin-btn admin-btn-secondary"
                                    onClick={handleCloseModal}
                                    disabled={submitting}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="admin-btn admin-btn-primary"
                                    disabled={submitting}
                                >
                                    {submitting ? 'Saving...' : editingItem ? 'Update Announcement' : 'Save Announcement'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Confirm Delete Modal */}
            <ConfirmDeleteModal
                isOpen={Boolean(deleteModalItem)}
                onClose={() => setDeleteModalItem(null)}
                onConfirm={handleConfirmDelete}
                title="Delete Marquee Announcement"
                message={`Are you sure you want to permanently delete the announcement "${deleteModalItem?.text}"?`}
                isDeleting={deleting}
            />
        </div>
    );
}
