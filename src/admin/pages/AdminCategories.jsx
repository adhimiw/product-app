import React, { useState, useEffect, useMemo } from 'react';
import { adminCategoryService } from '../services/adminCategoryService';
import PageHeader from '../components/PageHeader';
import TableSkeleton from '../components/TableSkeleton';
import EmptyState from '../components/EmptyState';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import { Pencil, Trash2 } from 'lucide-react';

export default function AdminCategories() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    // Modal dialog state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        description: '',
        iconFile: null,
        iconPreview: '',
        iconFileName: '',
        imageFile: null,
        imagePreview: '',
        imageFileName: '',
        is_active: true
    });

    const [autoSlug, setAutoSlug] = useState(true);
    const [fieldErrors, setFieldErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);

    // Delete Modal state
    const [deleteModalCat, setDeleteModalCat] = useState(null);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        fetchCategories();
    }, [search]);

    const fetchCategories = async () => {
        setLoading(true);
        const res = await adminCategoryService.getCategories(search);
        if (res.success) {
            setCategories(res.data || []);
            setErrorMsg('');
        } else {
            setErrorMsg(res.message || 'Failed to fetch categories');
        }
        setLoading(false);
    };

    // Filtered Categories
    const filteredCategories = useMemo(() => {
        let list = [...categories];

        if (statusFilter === 'active') {
            list = list.filter(c => c.is_active || c.status === 1);
        } else if (statusFilter === 'inactive') {
            list = list.filter(c => !c.is_active && c.status === 0);
        }

        return list;
    }, [categories, statusFilter]);

    // Auto Slugify Helper
    const slugify = (text) => {
        return (text || '')
            .toString()
            .toLowerCase()
            .trim()
            .replace(/\s+/g, '-')
            .replace(/&/g, '-and-')
            .replace(/[^\w\-]+/g, '')
            .replace(/\-\-+/g, '-')
            .replace(/^-+/, '')
            .replace(/-+$/, '');
    };

    const handleNameChange = (e) => {
        const val = e.target.value;
        const updated = { ...formData, name: val };
        if (autoSlug) {
            updated.slug = slugify(val);
        }
        setFormData(updated);

        if (fieldErrors.name) {
            setFieldErrors(prev => ({ ...prev, name: null }));
        }
    };

    const handleSlugChange = (e) => {
        setAutoSlug(false);
        setFormData({ ...formData, slug: e.target.value });
        if (fieldErrors.slug) {
            setFieldErrors(prev => ({ ...prev, slug: null }));
        }
    };

    // System File Picker for Icon
    const handleIconFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                setFieldErrors(prev => ({ ...prev, icon: ['Please select an image file (PNG, JPG, SVG, WEBP).'] }));
                return;
            }
            const previewUrl = URL.createObjectURL(file);
            const sizeKb = Math.round(file.size / 1024);
            setFormData(prev => ({
                ...prev,
                iconFile: file,
                iconPreview: previewUrl,
                iconFileName: `${file.name} (${sizeKb} KB)`
            }));
            if (fieldErrors.icon) setFieldErrors(prev => ({ ...prev, icon: null }));
        }
    };

    // System File Picker for Cover Image
    const handleImageFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                setFieldErrors(prev => ({ ...prev, image: ['Please select an image file (PNG, JPG, WEBP).'] }));
                return;
            }
            const previewUrl = URL.createObjectURL(file);
            const sizeKb = Math.round(file.size / 1024);
            setFormData(prev => ({
                ...prev,
                imageFile: file,
                imagePreview: previewUrl,
                imageFileName: `${file.name} (${sizeKb} KB)`
            }));
            if (fieldErrors.image) setFieldErrors(prev => ({ ...prev, image: null }));
        }
    };

    const handleOpenCreateModal = () => {
        setEditingCategory(null);
        setFormData({
            name: '',
            slug: '',
            description: '',
            iconFile: null,
            iconPreview: '',
            iconFileName: '',
            imageFile: null,
            imagePreview: '',
            imageFileName: '',
            is_active: true
        });
        setAutoSlug(true);
        setFieldErrors({});
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (cat) => {
        setEditingCategory(cat);
        const iconUrl = cat.icon_url || (typeof cat.icon === 'string' ? cat.icon : '');
        const imageUrl = cat.image_url || (typeof cat.image === 'string' ? cat.image : '');

        setFormData({
            name: cat.name || '',
            slug: cat.slug || '',
            description: cat.description || '',
            iconFile: null,
            iconPreview: iconUrl,
            iconFileName: iconUrl ? 'Current Server Icon' : '',
            imageFile: null,
            imagePreview: imageUrl,
            imageFileName: imageUrl ? 'Current Server Cover Image' : '',
            is_active: cat.is_active !== undefined ? Boolean(cat.is_active) : (cat.status === 1)
        });
        setAutoSlug(false);
        setFieldErrors({});
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFieldErrors({});

        // Client validation
        const errors = {};
        if (!formData.name.trim()) errors.name = ['Category name is required.'];
        if (!formData.slug.trim()) errors.slug = ['Slug is required.'];

        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            return;
        }

        setSubmitting(true);

        const payload = {
            name: formData.name.trim(),
            slug: formData.slug.trim(),
            description: formData.description.trim(),
            is_active: formData.is_active,
            status: formData.is_active ? 1 : 0
        };

        if (formData.iconFile) {
            payload.icon = formData.iconFile;
        }
        if (formData.imageFile) {
            payload.image = formData.imageFile;
        }

        let res;
        if (editingCategory) {
            res = await adminCategoryService.updateCategory(editingCategory.id, payload);
        } else {
            res = await adminCategoryService.createCategory(payload);
        }

        setSubmitting(false);

        if (res.success) {
            setIsModalOpen(false);
            setSuccessMsg(editingCategory ? 'Category updated successfully!' : 'Category created successfully!');
            fetchCategories();
            setTimeout(() => setSuccessMsg(''), 3500);
        } else {
            if (res.errors) {
                setFieldErrors(res.errors);
            } else {
                setErrorMsg(res.message || 'Operation failed.');
                setTimeout(() => setErrorMsg(''), 3500);
            }
        }
    };

    const handleConfirmDelete = async () => {
        if (!deleteModalCat) return;
        setDeleting(true);
        const res = await adminCategoryService.deleteCategory(deleteModalCat.id, true);
        setDeleting(false);
        setDeleteModalCat(null);

        if (res.success) {
            setSuccessMsg('Category deleted successfully');
            fetchCategories();
            setTimeout(() => setSuccessMsg(''), 3000);
        } else {
            setErrorMsg(res.message || 'Failed to delete category.');
            setTimeout(() => setErrorMsg(''), 3000);
        }
    };

    const handleToggleStatus = async (cat) => {
        const newStatus = cat.is_active || cat.status === 1 ? 0 : 1;
        const res = await adminCategoryService.updateCategory(cat.id, { status: newStatus, is_active: newStatus === 1 });
        if (res.success) {
            setCategories(prev => prev.map(item => item.id === cat.id ? { ...item, status: newStatus, is_active: newStatus === 1 } : item));
        } else {
            setErrorMsg('Failed to update status.');
            setTimeout(() => setErrorMsg(''), 3000);
        }
    };

    return (
        <div>
            {/* Standard Page Header */}
            <PageHeader
                breadcrumbs={['Admin', 'Catalog', 'Categories']}
                title="Categories Management"
                description="Organize your store taxonomy, upload media, and manage visibility across the storefront."
                actions={
                    <button
                        type="button"
                        className="admin-btn admin-btn-primary"
                        onClick={handleOpenCreateModal}
                    >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="12" y1="5" x2="12" y2="19"/>
                            <line x1="5" y1="12" x2="19" y2="12"/>
                        </svg>
                        <span>Add Category</span>
                    </button>
                }
            />

            {/* Notifications */}
            {successMsg && (
                <div className="admin-badge admin-badge-success" style={{ width: '100%', padding: '10px 16px', marginBottom: '16px', borderRadius: '8px', fontSize: '0.85rem' }}>
                    ✓ {successMsg}
                </div>
            )}
            {errorMsg && (
                <div className="admin-badge admin-badge-danger" style={{ width: '100%', padding: '10px 16px', marginBottom: '16px', borderRadius: '8px', fontSize: '0.85rem' }}>
                    ⚠️ {errorMsg}
                </div>
            )}

            <div className="admin-card">
                {/* Search & Filter Bar */}
                <div className="admin-card-header">
                    <div className="admin-search-box">
                        <span className="admin-search-icon">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="11" cy="11" r="8"></circle>
                                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                            </svg>
                        </span>
                        <input
                            type="text"
                            placeholder="Search by category name, slug..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="admin-search-input"
                        />
                    </div>

                    <div className="admin-tabs">
                        <button 
                            type="button"
                            className={`admin-tab-btn ${statusFilter === 'all' ? 'active' : ''}`}
                            onClick={() => setStatusFilter('all')}
                        >
                            All ({categories.length})
                        </button>
                        <button 
                            type="button"
                            className={`admin-tab-btn ${statusFilter === 'active' ? 'active' : ''}`}
                            onClick={() => setStatusFilter('active')}
                        >
                            Active ({categories.filter(c => c.is_active || c.status === 1).length})
                        </button>
                        <button 
                            type="button"
                            className={`admin-tab-btn ${statusFilter === 'inactive' ? 'active' : ''}`}
                            onClick={() => setStatusFilter('inactive')}
                        >
                            Inactive ({categories.filter(c => !c.is_active && c.status === 0).length})
                        </button>
                    </div>
                </div>

                {/* Categories Table / Loading / Empty State */}
                {loading ? (
                    <TableSkeleton columns={5} rows={5} />
                ) : filteredCategories.length === 0 ? (
                    <EmptyState
                        icon="📁"
                        title="No categories found"
                        description={search ? `No categories matched "${search}".` : "No categories created yet. Click below to add your first category."}
                        actionLabel="+ Add New Category"
                        onAction={handleOpenCreateModal}
                    />
                ) : (
                    <div className="admin-table-responsive">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th style={{ width: '56px', paddingLeft: '20px' }}>Icon</th>
                                    <th>Category Name</th>
                                    <th>Description</th>
                                    <th>Status</th>
                                    <th style={{ textAlign: 'right', paddingRight: '20px' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredCategories.map(cat => {
                                    const iconSrc = cat.icon_url || (typeof cat.icon === 'string' ? cat.icon : null);
                                    const isActive = cat.is_active || cat.status === 1;

                                    return (
                                        <tr key={cat.id}>
                                            <td style={{ paddingLeft: '20px' }}>
                                                <div style={{
                                                    width: '36px',
                                                    height: '36px',
                                                    borderRadius: '8px',
                                                    background: 'var(--admin-surface-subtle)',
                                                    border: '1px solid var(--admin-border-color)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    overflow: 'hidden'
                                                }}>
                                                    {iconSrc ? (
                                                        <img src={iconSrc} alt="Icon" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                    ) : (
                                                        <span style={{ fontSize: '1.1rem' }}>📁</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td>
                                                <div style={{ fontWeight: 700, color: 'var(--admin-text-main)', fontSize: '0.9rem' }}>
                                                    {cat.name}
                                                </div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)', fontFamily: 'monospace', marginTop: '2px' }}>
                                                    /{cat.slug || slugify(cat.name)}
                                                </div>
                                            </td>
                                            <td>
                                                <div style={{ fontSize: '0.85rem', color: 'var(--admin-text-muted)', maxWidth: '340px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                    {cat.description || '—'}
                                                </div>
                                            </td>
                                            <td>
                                                <button 
                                                    type="button"
                                                    onClick={() => handleToggleStatus(cat)}
                                                    className={`admin-badge ${isActive ? 'admin-badge-success' : 'admin-badge-neutral'}`}
                                                    style={{ cursor: 'pointer', border: 'none' }}
                                                    title="Click to toggle status"
                                                >
                                                    <span className="admin-badge-dot" />
                                                    {isActive ? 'Active' : 'Inactive'}
                                                </button>
                                            </td>
                                            <td style={{ textAlign: 'right', paddingRight: '20px' }}>
                                                <div style={{ display: 'inline-flex', gap: '6px' }}>
                                                    <button 
                                                        type="button"
                                                        className="admin-btn-icon"
                                                        title="Edit category"
                                                        onClick={() => handleOpenEditModal(cat)}
                                                        style={{ width: '32px', height: '32px' }}
                                                    >
                                                        <Pencil size={14} strokeWidth={2} />
                                                    </button>
                                                    <button 
                                                        type="button"
                                                        className="admin-btn-icon"
                                                        title="Delete category"
                                                        onClick={() => setDeleteModalCat(cat)}
                                                        style={{ width: '32px', height: '32px', color: 'var(--admin-danger-text)' }}
                                                    >
                                                        <Trash2 size={14} strokeWidth={2} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* ADD / EDIT POPUP MODAL DIALOG */}
            {isModalOpen && (
                <div className="admin-modal-backdrop" onClick={() => setIsModalOpen(false)}>
                    <div className="admin-modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '540px' }}>
                        <div className="admin-modal-header">
                            <div>
                                <h3 className="admin-modal-title">
                                    {editingCategory ? 'Edit Category' : 'Add New Category'}
                                </h3>
                                <span style={{ fontSize: '0.78rem', color: 'var(--admin-text-muted)' }}>
                                    Upload icon/cover files and specify URL slug.
                                </span>
                            </div>
                            <button className="admin-modal-close" onClick={() => setIsModalOpen(false)} title="Close">✕</button>
                        </div>

                        <form onSubmit={handleSubmit} noValidate className="admin-modal-body">
                            {/* Category Name */}
                            <div className="admin-form-group">
                                <label className="admin-label">
                                    Category Name <span style={{ color: 'var(--admin-danger-text)' }}>*</span>
                                </label>
                                <input 
                                    type="text"
                                    value={formData.name}
                                    onChange={handleNameChange}
                                    className="admin-input"
                                    placeholder="e.g. Sprouted Grain Mixes"
                                    maxLength={60}
                                    required
                                />
                                {fieldErrors.name && (
                                    <span style={{ fontSize: '0.75rem', color: 'var(--admin-danger-text)', fontWeight: 600 }}>
                                        ⚠️ {fieldErrors.name[0]}
                                    </span>
                                )}
                            </div>

                            {/* Slug Input */}
                            <div className="admin-form-group">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <label className="admin-label">
                                        URL Slug <span style={{ color: 'var(--admin-danger-text)' }}>*</span>
                                    </label>
                                    <button 
                                        type="button"
                                        onClick={() => {
                                            const s = slugify(formData.name);
                                            setFormData(prev => ({ ...prev, slug: s }));
                                            setAutoSlug(true);
                                        }}
                                        style={{ background: 'none', border: 'none', color: 'var(--admin-primary)', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                                    >
                                        Auto-generate
                                    </button>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <span style={{
                                        background: 'var(--admin-surface-subtle)',
                                        border: '1px solid var(--admin-border-color)',
                                        borderRight: 'none',
                                        padding: '9px 12px',
                                        fontSize: '0.85rem',
                                        color: 'var(--admin-text-muted)',
                                        borderRadius: 'var(--admin-radius-md) 0 0 var(--admin-radius-md)'
                                    }}>
                                        /category/
                                    </span>
                                    <input 
                                        type="text"
                                        value={formData.slug}
                                        onChange={handleSlugChange}
                                        className="admin-input"
                                        style={{ borderRadius: '0 var(--admin-radius-md) var(--admin-radius-md) 0' }}
                                        placeholder="category-slug"
                                    />
                                </div>
                                {fieldErrors.slug && (
                                    <span style={{ fontSize: '0.75rem', color: 'var(--admin-danger-text)', fontWeight: 600 }}>
                                        ⚠️ {fieldErrors.slug[0]}
                                    </span>
                                )}
                            </div>

                            {/* System Icon File Upload */}
                            <div className="admin-form-group">
                                <label className="admin-label">Icon Image (Optional)</label>
                                <input 
                                    type="file" 
                                    accept="image/*"
                                    id="cat-icon-file-input"
                                    onChange={handleIconFileChange}
                                    style={{ display: 'none' }}
                                />
                                {formData.iconPreview ? (
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                        padding: '10px',
                                        background: 'var(--admin-surface-subtle)',
                                        border: '1px solid var(--admin-border-color)',
                                        borderRadius: 'var(--admin-radius-md)'
                                    }}>
                                        <img src={formData.iconPreview} alt="Icon Preview" style={{ width: '38px', height: '38px', borderRadius: '6px', objectFit: 'cover' }} />
                                        <span style={{ flex: 1, fontSize: '0.82rem', color: 'var(--admin-text-main)', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {formData.iconFileName || 'Icon Selected'}
                                        </span>
                                        <button 
                                            type="button" 
                                            onClick={() => setFormData(prev => ({ ...prev, iconFile: null, iconPreview: '', iconFileName: '' }))}
                                            style={{ background: 'transparent', border: 'none', color: 'var(--admin-danger-text)', cursor: 'pointer', fontWeight: 800 }}
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ) : (
                                    <label htmlFor="cat-icon-file-input" style={{
                                        border: '2px dashed var(--admin-border-color)',
                                        borderRadius: 'var(--admin-radius-md)',
                                        padding: '16px',
                                        textAlign: 'center',
                                        cursor: 'pointer',
                                        display: 'block',
                                        background: 'var(--admin-surface-hover)'
                                    }}>
                                        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--admin-text-main)' }}>+ Select Icon File</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)', marginTop: '2px' }}>PNG, SVG, WEBP up to 2MB</div>
                                    </label>
                                )}
                            </div>

                            {/* Description */}
                            <div className="admin-form-group">
                                <label className="admin-label">Description (Optional)</label>
                                <textarea 
                                    rows="2"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="admin-textarea"
                                    placeholder="Brief category description..."
                                />
                            </div>

                            {/* Active Switch */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0' }}>
                                <div>
                                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--admin-text-main)', display: 'block' }}>Storefront Visibility</span>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)' }}>Publish this category on the public website</span>
                                </div>
                                <input 
                                    type="checkbox"
                                    checked={formData.is_active}
                                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                    style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--admin-primary)' }}
                                />
                            </div>

                            {/* Modal Footer */}
                            <div className="admin-modal-footer" style={{ margin: '0 -24px -24px -24px' }}>
                                <button type="button" className="admin-btn admin-btn-secondary" onClick={() => setIsModalOpen(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="admin-btn admin-btn-primary" disabled={submitting}>
                                    {submitting ? 'Saving...' : (editingCategory ? 'Save Changes' : 'Create Category')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* DELETE CONFIRMATION MODAL */}
            <ConfirmDeleteModal
                isOpen={!!deleteModalCat}
                title="Delete Category"
                itemName={deleteModalCat?.name || 'this category'}
                warningText="This action will permanently delete this category from the database. Any associated products may lose their category taxonomy."
                onConfirm={handleConfirmDelete}
                onCancel={() => setDeleteModalCat(null)}
                isDeleting={deleting}
            />
        </div>
    );
}
