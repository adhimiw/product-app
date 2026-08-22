import React, { useState, useEffect, useMemo, useRef } from 'react';
import { adminProductService, BADGE_OPTIONS, getBadgeLabel } from '../services/adminProductService';
import { fetchCategoriesApi } from '../../services/api';
import PageHeader from '../components/PageHeader';
import TableSkeleton from '../components/TableSkeleton';
import EmptyState from '../components/EmptyState';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import { Pencil, Trash2 } from 'lucide-react';

function RichTextEditor({ value, onChange, placeholder, minHeight = '120px' }) {
    const editorRef = useRef(null);

    useEffect(() => {
        if (editorRef.current && editorRef.current.innerHTML !== (value || '')) {
            editorRef.current.innerHTML = value || '';
        }
    }, [value]);

    const execCommand = (cmd, arg = null) => {
        document.execCommand(cmd, false, arg);
        if (editorRef.current) {
            onChange(editorRef.current.innerHTML);
        }
    };

    return (
        <div className="rich-editor-wrapper">
            <div className="rich-editor-toolbar">
                <button type="button" className="rich-toolbar-btn" onClick={() => execCommand('bold')} title="Bold (Ctrl+B)"><b>B</b></button>
                <button type="button" className="rich-toolbar-btn" onClick={() => execCommand('italic')} title="Italic (Ctrl+I)"><i>I</i></button>
                <button type="button" className="rich-toolbar-btn" onClick={() => execCommand('underline')} title="Underline (Ctrl+U)"><u>U</u></button>
                <button type="button" className="rich-toolbar-btn" onClick={() => execCommand('strikeThrough')} title="Strikethrough"><s>S</s></button>
                <span className="rich-toolbar-sep">|</span>
                <button type="button" className="rich-toolbar-btn" onClick={() => execCommand('formatBlock', '<h3>')} title="Heading 3"><b>H3</b></button>
                <button type="button" className="rich-toolbar-btn" onClick={() => execCommand('formatBlock', '<p>')} title="Normal Text">P</button>
                <span className="rich-toolbar-sep">|</span>
                <button type="button" className="rich-toolbar-btn" onClick={() => execCommand('insertUnorderedList')} title="Bullet List">• Bullet List</button>
                <button type="button" className="rich-toolbar-btn" onClick={() => execCommand('insertOrderedList')} title="Numbered List">1. Numbered List</button>
                <span className="rich-toolbar-sep">|</span>
                <button type="button" className="rich-toolbar-btn" onClick={() => execCommand('removeFormat')} title="Clear Formatting">🧹 Clear</button>
            </div>
            <div
                ref={editorRef}
                className="rich-editor-content"
                contentEditable
                style={{ minHeight }}
                onInput={(e) => onChange(e.currentTarget.innerHTML)}
                onBlur={(e) => onChange(e.currentTarget.innerHTML)}
                placeholder={placeholder}
            />
        </div>
    );
}

export default function AdminProducts() {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('All');
    const [selectedStatusFilter, setSelectedStatusFilter] = useState('All');

    // Selection & Modal States
    const [selectedProductIds, setSelectedProductIds] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [modalActiveTab, setModalActiveTab] = useState('basic');
    const [previewImageModal, setPreviewImageModal] = useState(null);
    const [productToDelete, setProductToDelete] = useState(null);
    const [isDeletingProduct, setIsDeletingProduct] = useState(false);

    // Form State
    const [tagInput, setTagInput] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        category: '',
        category_id: 1,
        tags: [],
        description: '',
        actual_price: '',
        discount_type: 1, // 1: Percentage %, 2: Fixed Amount ₹
        discount_value: '',
        discount: '',
        stock: '50',
        is_unlimited_stock: false,
        status: 1,
        images: [], // Preview URLs
        image_files: [], // Actual binary File objects for FormData
        package_sizes: [
            {
                id: 'pkg-1',
                size_number: 300,
                size_unit: 'g',
                variant_price: '110',
                variant_badge: 0,
                discount_value: '20',
                discount_type: 1,
                stock: '50',
                is_unlimited_stock: false,
                variant_images: [],
                variant_image_files: []
            }
        ],
        how_to_use: '',
        benefits: '',
        ingredients: ''
    });

    const [formErrors, setFormErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [notification, setNotification] = useState(null);

    useEffect(() => {
        loadProducts();
        loadCategories();
    }, []);

    const loadProducts = async () => {
        setLoading(true);
        try {
            const data = await adminProductService.getAllProducts();
            setProducts(data || []);
        } catch (err) {
            console.error('Failed to load products:', err);
        } finally {
            setLoading(false);
        }
    };

    const loadCategories = async () => {
        const res = await fetchCategoriesApi();
        if (res.success && res.data && res.data.length > 0) {
            setCategories(res.data);
            if (!formData.category) {
                setFormData(prev => ({
                    ...prev,
                    category: res.data[0].name,
                    category_id: res.data[0].id
                }));
            }
        } else {
            setCategories([
                { id: 1, name: 'Ancestral Health Mixes' },
                { id: 2, name: 'Heritage Mappillai Rice' },
                { id: 3, name: 'Soak-Sprouted Millets' },
                { id: 4, name: 'Sethiyathope Artisanal Blends' }
            ]);
        }
    };

    const showToast = (message, type = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    const filteredProducts = useMemo(() => {
        return products.filter(p => {
            const matchesSearch =
                p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (Array.isArray(p.tags) && p.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()))) ||
                (p.category && p.category.toLowerCase().includes(searchTerm.toLowerCase()));

            const matchesCategory =
                selectedCategoryFilter === 'All' || p.category === selectedCategoryFilter;

            const matchesStatus =
                selectedStatusFilter === 'All' ||
                (selectedStatusFilter === 'Active' && Number(p.status) === 1) ||
                (selectedStatusFilter === 'Inactive' && Number(p.status) === 0);

            return matchesSearch && matchesCategory && matchesStatus;
        });
    }, [products, searchTerm, selectedCategoryFilter, selectedStatusFilter]);

    const handleOpenAddModal = () => {
        setEditingProduct(null);
        setModalActiveTab('basic');
        setTagInput('');
        setFormData({
            name: '',
            category: categories.length > 0 ? categories[0].name : 'Ancestral Health Mixes',
            category_id: categories.length > 0 ? categories[0].id : 1,
            tags: [],
            description: '',
            actual_price: '',
            discount_type: 1,
            discount_value: '0',
            discount: '',
            stock: '100',
            is_unlimited_stock: false,
            status: 1,
            images: [],
            image_files: [],
            package_sizes: [
                {
                    id: 'pkg-' + Date.now(),
                    size_number: 300,
                    size_unit: 'g',
                    variant_price: '',
                    variant_badge: 0,
                    discount_value: '0',
                    discount_type: 1,
                    stock: '100',
                    is_unlimited_stock: false,
                    variant_images: [],
                    variant_image_files: []
                }
            ],
            how_to_use: '',
            benefits: '',
            ingredients: ''
        });
        setFormErrors({});
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (product) => {
        setEditingProduct(product);
        setModalActiveTab('basic');
        setTagInput('');
        
        const normalizedPackages = Array.isArray(product.package_sizes) && product.package_sizes.length > 0
            ? product.package_sizes.map(p => {
                const imgs = Array.isArray(p.variant_images)
                    ? p.variant_images
                    : (p.variant_image ? [p.variant_image] : []);
                return {
                    ...p,
                    variant_badge: p.variant_badge !== undefined ? Number(p.variant_badge) : 0,
                    discount_value: p.discount_value !== undefined ? String(p.discount_value) : (product.discount_value ? String(product.discount_value) : ''),
                    discount_type: p.discount_type !== undefined ? Number(p.discount_type) : (product.discount_type ? Number(product.discount_type) : 1),
                    stock: p.stock !== null && p.stock !== undefined ? String(p.stock) : (product.stock !== null && product.stock !== undefined ? String(product.stock) : '50'),
                    is_unlimited_stock: p.is_unlimited_stock !== undefined ? p.is_unlimited_stock : (p.stock === null || p.stock === undefined),
                    variant_images: imgs,
                    variant_image_files: Array.isArray(p.variant_image_files) ? p.variant_image_files : imgs
                };
            })
            : [
                {
                    id: 'pkg-1',
                    size_number: 300,
                    size_unit: 'g',
                    variant_price: product.actual_price || '110',
                    variant_badge: 0,
                    discount_value: product.discount_value ? String(product.discount_value) : '20',
                    discount_type: product.discount_type ? Number(product.discount_type) : 1,
                    stock: product.stock !== null && product.stock !== undefined ? String(product.stock) : '50',
                    is_unlimited_stock: product.stock === null || product.stock === undefined,
                    variant_images: [],
                    variant_image_files: []
                }
            ];

        const galImages = Array.isArray(product.images) ? product.images : [];

        setFormData({
            name: product.name || '',
            category: product.category || (categories.length > 0 ? categories[0].name : ''),
            category_id: product.category_id || 1,
            tags: Array.isArray(product.tags) ? product.tags : [],
            description: product.description || '',
            actual_price: product.actual_price ? String(product.actual_price) : '',
            discount_type: product.discount_type ? Number(product.discount_type) : 1,
            discount_value: product.discount_value ? String(product.discount_value) : '',
            discount: product.discount || '',
            stock: product.stock !== null && product.stock !== undefined ? String(product.stock) : '',
            is_unlimited_stock: product.stock === null || product.stock === undefined,
            status: Number(product.status),
            images: galImages,
            image_files: Array.isArray(product.image_files) ? product.image_files : galImages,
            package_sizes: normalizedPackages,
            how_to_use: product.how_to_use || '',
            benefits: product.benefits || '',
            ingredients: product.ingredients || ''
        });
        setFormErrors({});
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingProduct(null);
    };

    const handlePricingChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleAddTag = (e) => {
        if (e) e.preventDefault();
        const trimmed = tagInput.trim();
        if (trimmed && !formData.tags.includes(trimmed)) {
            setFormData(prev => ({
                ...prev,
                tags: [...prev.tags, trimmed]
            }));
            setTagInput('');
        }
    };

    const handleRemoveTag = (tagToRemove) => {
        setFormData(prev => ({
            ...prev,
            tags: prev.tags.filter(t => t !== tagToRemove)
        }));
    };

    const handleAddPackageSize = () => {
        const newPkg = {
            id: 'pkg-' + Date.now(),
            size_number: 500,
            size_unit: 'g',
            variant_price: '',
            variant_badge: 0,
            discount_value: '',
            discount_type: 1,
            stock: '50',
            is_unlimited_stock: false,
            variant_images: [],
            variant_image_files: []
        };
        setFormData(prev => ({
            ...prev,
            package_sizes: [...prev.package_sizes, newPkg]
        }));
    };

    const handleRemovePackageSize = (id) => {
        if (formData.package_sizes.length <= 1) {
            alert('A product must have at least one package size.');
            return;
        }
        setFormData(prev => ({
            ...prev,
            package_sizes: prev.package_sizes.filter(p => p.id !== id)
        }));
    };

    const handlePackageChange = (id, field, value) => {
        setFormData(prev => ({
            ...prev,
            package_sizes: prev.package_sizes.map(p =>
                p.id === id ? { ...p, [field]: value } : p
            )
        }));
    };

    // Store actual binary File objects in variant_image_files array for FormData
    const handleAddPackageVariantImages = (pkgId, e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            const newPreviews = files.map(file => URL.createObjectURL(file));
            setFormData(prev => ({
                ...prev,
                package_sizes: prev.package_sizes.map(p => {
                    if (p.id === pkgId) {
                        const existingPreviews = Array.isArray(p.variant_images) ? p.variant_images : [];
                        const existingFiles = Array.isArray(p.variant_image_files) ? p.variant_image_files : [];
                        return {
                            ...p,
                            variant_images: [...existingPreviews, ...newPreviews],
                            variant_image_files: [...existingFiles, ...files]
                        };
                    }
                    return p;
                })
            }));
        }
    };

    const handleRemovePackageVariantImage = (pkgId, imgIndex) => {
        setFormData(prev => ({
            ...prev,
            package_sizes: prev.package_sizes.map(p => {
                if (p.id === pkgId) {
                    const currentImages = Array.isArray(p.variant_images) ? p.variant_images : [];
                    const currentFiles = Array.isArray(p.variant_image_files) ? p.variant_image_files : [];
                    return {
                        ...p,
                        variant_images: currentImages.filter((_, i) => i !== imgIndex),
                        variant_image_files: currentFiles.filter((_, i) => i !== imgIndex)
                    };
                }
                return p;
            })
        }));
    };

    const handleMovePackageVariantImage = (pkgId, fromIndex, toIndex) => {
        setFormData(prev => ({
            ...prev,
            package_sizes: prev.package_sizes.map(p => {
                if (p.id === pkgId) {
                    const images = [...(Array.isArray(p.variant_images) ? p.variant_images : [])];
                    const files = [...(Array.isArray(p.variant_image_files) ? p.variant_image_files : [])];

                    if (toIndex < 0 || toIndex >= images.length) return p;

                    const [movedImg] = images.splice(fromIndex, 1);
                    images.splice(toIndex, 0, movedImg);

                    if (files.length > fromIndex) {
                        const [movedFile] = files.splice(fromIndex, 1);
                        files.splice(toIndex, 0, movedFile);
                    }

                    return {
                        ...p,
                        variant_images: images,
                        variant_image_files: files
                    };
                }
                return p;
            })
        }));
    };

    const handleReplacePackageVariantImage = (pkgId, imgIndex, file) => {
        if (!file) return;
        const newPreviewUrl = URL.createObjectURL(file);
        setFormData(prev => ({
            ...prev,
            package_sizes: prev.package_sizes.map(p => {
                if (p.id === pkgId) {
                    const images = [...(Array.isArray(p.variant_images) ? p.variant_images : [])];
                    const files = [...(Array.isArray(p.variant_image_files) ? p.variant_image_files : [])];

                    images[imgIndex] = newPreviewUrl;
                    files[imgIndex] = file;

                    return {
                        ...p,
                        variant_images: images,
                        variant_image_files: files
                    };
                }
                return p;
            })
        }));
    };

    // Store actual binary File objects in image_files array for FormData
    const handleMultipleImagesUpload = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            const newPreviews = files.map(file => URL.createObjectURL(file));
            setFormData(prev => ({
                ...prev,
                images: [...prev.images, ...newPreviews],
                image_files: [...(prev.image_files || []), ...files]
            }));
        }
    };

    const handleRemoveGalleryImage = (index) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index),
            image_files: (prev.image_files || []).filter((_, i) => i !== index)
        }));
    };

    const handleMoveGalleryImage = (fromIndex, toIndex) => {
        setFormData(prev => {
            const images = [...prev.images];
            const files = [...(prev.image_files || [])];

            if (toIndex < 0 || toIndex >= images.length) return prev;

            const [movedImg] = images.splice(fromIndex, 1);
            images.splice(toIndex, 0, movedImg);

            if (files.length > fromIndex) {
                const [movedFile] = files.splice(fromIndex, 1);
                files.splice(toIndex, 0, movedFile);
            }

            return {
                ...prev,
                images,
                image_files: files
            };
        });
    };

    const handleSubmitForm = async (e) => {
        e.preventDefault();
        const errors = {};

        const primaryPrice = formData.actual_price || (formData.package_sizes && formData.package_sizes[0] ? formData.package_sizes[0].variant_price : '');

        if (!formData.name.trim()) errors.name = 'Product Name is required.';
        if (!primaryPrice || Number(primaryPrice) <= 0) {
            errors.actual_price = 'Valid price is required in package variant.';
        }

        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            if (errors.name) setModalActiveTab('basic');
            else if (errors.actual_price) setModalActiveTab('packages');
            return;
        }

        setIsSubmitting(true);

        const payload = {
            id: editingProduct ? editingProduct.id : undefined,
            name: formData.name.trim(),
            category: formData.category,
            category_id: formData.category_id,
            tags: formData.tags,
            description: formData.description.trim(),
            actual_price: primaryPrice,
            discount_type: Number(formData.discount_type),
            discount_value: formData.discount_value,
            discount: formData.discount,
            stock: formData.is_unlimited_stock ? null : (formData.stock !== '' ? formData.stock : null),
            status: Number(formData.status),
            images: formData.images,
            image_files: formData.image_files, // Binary files array
            package_sizes: formData.package_sizes,
            how_to_use: formData.how_to_use.trim(),
            benefits: formData.benefits.trim(),
            ingredients: formData.ingredients.trim()
        };

        const res = await adminProductService.saveProduct(payload);
        setIsSubmitting(false);

        if (res.success) {
            showToast(editingProduct ? 'Product updated successfully' : 'New product created successfully');
            await loadProducts();
            handleCloseModal();
        }
    };

    const handleDeleteProduct = (product) => {
        setProductToDelete(product);
    };

    const handleConfirmDeleteProduct = async () => {
        if (!productToDelete) return;
        setIsDeletingProduct(true);
        try {
            await adminProductService.deleteProduct(productToDelete.id);
            showToast(`Product "${productToDelete.name}" deleted`);
            setProductToDelete(null);
            await loadProducts();
        } catch (err) {
            console.error('Failed to delete product:', err);
        } finally {
            setIsDeletingProduct(false);
        }
    };

    const handleToggleStatus = async (id) => {
        await adminProductService.toggleProductStatus(id);
        await loadProducts();
        showToast('Product status updated');
    };

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedProductIds(filteredProducts.map(p => p.id));
        } else {
            setSelectedProductIds([]);
        }
    };

    const handleSelectOne = (id) => {
        setSelectedProductIds(prev =>
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    return (
        <div>
            {/* Standard Page Header */}
            <PageHeader
                breadcrumbs={['Admin', 'Catalog', 'Products']}
                title="Products & Inventory Catalog"
                description="Manage product variants, discount configurations, pricing, and binary media assets."
                actions={
                    <button
                        type="button"
                        className="admin-btn admin-btn-primary"
                        onClick={handleOpenAddModal}
                    >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="12" y1="5" x2="12" y2="19"/>
                            <line x1="5" y1="12" x2="19" y2="12"/>
                        </svg>
                        <span>Add Product</span>
                    </button>
                }
            />

            {/* Toast Notification */}
            {notification && (
                <div className="admin-badge admin-badge-success" style={{ width: '100%', padding: '10px 16px', marginBottom: '16px', borderRadius: '8px', fontSize: '0.85rem' }}>
                    ✓ {notification.message}
                </div>
            )}

            <div className="admin-card">
                {/* Search & Filter Bar */}
                <div className="admin-card-header">
                    <div className="admin-search-box">
                        <span className="admin-search-icon">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="11" cy="11" r="8"/>
                                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                            </svg>
                        </span>
                        <input
                            type="text"
                            placeholder="Search by product name, tags, category..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="admin-search-input"
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        <select
                            className="admin-select"
                            value={selectedCategoryFilter}
                            onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                            style={{ width: 'auto', minWidth: '160px' }}
                        >
                            <option value="All">All Categories</option>
                            {categories.map(c => (
                                <option key={c.id} value={c.name}>{c.name}</option>
                            ))}
                        </select>

                        <select
                            className="admin-select"
                            value={selectedStatusFilter}
                            onChange={(e) => setSelectedStatusFilter(e.target.value)}
                            style={{ width: 'auto', minWidth: '140px' }}
                        >
                            <option value="All">All Status</option>
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                        </select>
                    </div>
                </div>

                {/* Table / Skeleton / Empty State */}
                {loading ? (
                    <TableSkeleton columns={9} rows={6} />
                ) : filteredProducts.length === 0 ? (
                    <EmptyState
                        icon="🌿"
                        title="No products found"
                        description={searchTerm ? `No products matched "${searchTerm}".` : "No products available in this category. Click below to add one."}
                        actionLabel="+ Add New Product"
                        onAction={handleOpenAddModal}
                    />
                ) : (
                    <div className="admin-table-responsive">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th style={{ width: '36px', textAlign: 'center', paddingLeft: '16px' }}>
                                        <input
                                            type="checkbox"
                                            onChange={handleSelectAll}
                                            checked={filteredProducts.length > 0 && selectedProductIds.length === filteredProducts.length}
                                        />
                                    </th>
                                    <th style={{ width: '50px' }}>Media</th>
                                    <th>Product Name</th>
                                    <th>Category</th>
                                    <th>Package Sizes</th>
                                    <th>Pricing & Discount</th>
                                    <th>Stock</th>
                                    <th>Status</th>
                                    <th style={{ textAlign: 'right', paddingRight: '16px' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredProducts.map((prod) => (
                                    <tr key={prod.id} className={selectedProductIds.includes(prod.id) ? 'selected' : ''}>
                                        <td style={{ textAlign: 'center', width: '38px', paddingLeft: '16px' }}>
                                            <input
                                                type="checkbox"
                                                checked={selectedProductIds.includes(prod.id)}
                                                onChange={() => handleSelectOne(prod.id)}
                                            />
                                        </td>
                                        <td>
                                            <div style={{ width: '38px', height: '38px', borderRadius: '8px', border: '1px solid var(--admin-border-color)', background: 'var(--admin-surface-subtle)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <img
                                                    src={(Array.isArray(prod.images) && prod.images[0]) || '/assets/images/categories/organic-food-ingredients.png'}
                                                    alt={prod.name}
                                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                    onError={(e) => {
                                                        e.target.onerror = null;
                                                        e.target.src = '/assets/images/categories/organic-food-ingredients.png';
                                                    }}
                                                />
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ fontWeight: 700, color: 'var(--admin-text-main)', fontSize: '0.88rem', lineHeight: '1.3' }}>
                                                {prod.name}
                                            </div>
                                            {Array.isArray(prod.tags) && prod.tags.length > 0 && (
                                                <div style={{ display: 'flex', gap: '4px', marginTop: '4px', flexWrap: 'wrap' }}>
                                                    {prod.tags.slice(0, 3).map((t, idx) => (
                                                        <span key={idx} style={{ fontSize: '0.7rem', color: 'var(--admin-text-muted)', background: 'var(--admin-surface-subtle)', padding: '1px 6px', borderRadius: '4px' }}>
                                                            #{t}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </td>
                                        <td>
                                            <span style={{ background: 'var(--admin-surface-subtle)', color: 'var(--admin-text-secondary)', fontSize: '0.75rem', fontWeight: 700, padding: '3px 8px', borderRadius: '6px', border: '1px solid var(--admin-border-color)' }}>
                                                {prod.category}
                                            </span>
                                        </td>
                                        <td>
                                            {Array.isArray(prod.package_sizes) && prod.package_sizes.length > 0 ? (
                                                <div style={{ fontSize: '0.78rem', color: 'var(--admin-text-secondary)', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                                    {prod.package_sizes.map((ps, psIdx) => (
                                                        <span key={psIdx}>
                                                            {ps.size_number}{ps.size_unit} (<strong style={{ fontWeight: 800, color: 'var(--admin-text-main)' }}>₹{ps.variant_price}</strong>)
                                                        </span>
                                                    ))}
                                                </div>
                                            ) : (
                                                <span style={{ color: 'var(--admin-text-muted)', fontSize: '0.78rem' }}>Standard</span>
                                            )}
                                        </td>
                                        <td>
                                            <div style={{ fontWeight: 800, color: 'var(--admin-text-main)', fontSize: '0.9rem' }}>
                                                ₹{prod.actual_price}
                                            </div>
                                            {prod.regular_price && Number(prod.regular_price) > Number(prod.actual_price) && (
                                                <div style={{ fontSize: '0.72rem', color: 'var(--admin-text-muted)', textDecoration: 'line-through' }}>
                                                    ₹{prod.regular_price}
                                                </div>
                                            )}
                                            {prod.discount && (
                                                <span className="admin-badge admin-badge-success" style={{ fontSize: '0.68rem', padding: '1px 6px', marginTop: '2px' }}>
                                                    {prod.discount}
                                                </span>
                                            )}
                                        </td>
                                        <td style={{ fontSize: '0.8rem', color: prod.stock !== null ? (prod.stock > 10 ? 'var(--admin-success-text)' : 'var(--admin-danger-text)') : 'var(--admin-text-muted)', fontWeight: 700 }}>
                                            {prod.stock !== null && prod.stock !== undefined ? `${prod.stock} units` : 'Unlimited'}
                                        </td>
                                        <td>
                                            <button
                                                type="button"
                                                className={`admin-badge ${Number(prod.status) === 1 ? 'admin-badge-success' : 'admin-badge-neutral'}`}
                                                onClick={() => handleToggleStatus(prod.id)}
                                                style={{ cursor: 'pointer', border: 'none' }}
                                                title="Click to toggle status"
                                            >
                                                <span className="admin-badge-dot" />
                                                {Number(prod.status) === 1 ? 'Active' : 'Inactive'}
                                            </button>
                                        </td>
                                        <td style={{ textAlign: 'right', paddingRight: '16px' }}>
                                            <div style={{ display: 'inline-flex', gap: '6px' }}>
                                                <button
                                                    type="button"
                                                    className="admin-btn-icon"
                                                    title="Edit product"
                                                    onClick={() => handleOpenEditModal(prod)}
                                                    style={{ width: '32px', height: '32px' }}
                                                >
                                                    <Pencil size={14} strokeWidth={2} />
                                                </button>
                                                <button
                                                    type="button"
                                                    className="admin-btn-icon"
                                                    title="Delete product"
                                                    onClick={() => handleDeleteProduct(prod)}
                                                    style={{ width: '32px', height: '32px', color: 'var(--admin-danger-text)' }}
                                                >
                                                    <Trash2 size={14} strokeWidth={2} />
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

            {/* Popup Modal Dialog Box Overlay */}
            {isModalOpen && (
                <div className="admin-modal-overlay">
                    <div className="admin-modal-dialog-box" style={{ maxWidth: '1060px', width: '100%', maxHeight: '92vh' }}>
                        
                        {/* Modal Header */}
                        <div className="admin-modal-header" style={{ padding: '16px 24px', background: '#FAFAF9' }}>
                            <div>
                                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#18181B' }}>
                                    {editingProduct ? 'Edit Product Configuration' : 'Add New Product'}
                                </h3>
                                <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#71717A' }}>
                                    Configure package size variants, binary image uploads, rich text content, pricing, and tags
                                </p>
                            </div>
                            <button className="admin-modal-close-btn" onClick={handleCloseModal} aria-label="Close dialog">
                                ✕
                            </button>
                        </div>

                        {/* Modal Navigation Step Tabs */}
                        <div className="admin-modal-tabs-wrapper">
                            <button
                                type="button"
                                className={`admin-modal-tab-pill ${modalActiveTab === 'basic' ? 'active' : ''}`}
                                onClick={() => setModalActiveTab('basic')}
                            >
                                <span className="admin-tab-step-badge">1</span>
                                <span>Basic Info & Tags</span>
                            </button>
                            <button
                                type="button"
                                className={`admin-modal-tab-pill ${modalActiveTab === 'packages' ? 'active' : ''}`}
                                onClick={() => setModalActiveTab('packages')}
                            >
                                <span className="admin-tab-step-badge">2</span>
                                <span>Package Sizes & Variant Badges</span>
                            </button>
                            <button
                                type="button"
                                className={`admin-modal-tab-pill ${modalActiveTab === 'content' ? 'active' : ''}`}
                                onClick={() => setModalActiveTab('content')}
                            >
                                <span className="admin-tab-step-badge">3</span>
                                <span>Usage & Details</span>
                            </button>
                        </div>

                        {/* Modal Body Scrollable Container */}
                        <form onSubmit={handleSubmitForm} style={{ padding: '24px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            
                            {/* TAB 1: BASIC INFO & TAGS */}
                            {modalActiveTab === 'basic' && (
                                <>
                                    <div className="admin-form-group">
                                        <label className="admin-label">Product Name *</label>
                                        <input
                                            type="text"
                                            className={`admin-input ${formErrors.name ? 'error' : ''}`}
                                            placeholder="e.g. Amutham Sprouted Health Mix"
                                            value={formData.name}
                                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                        />
                                        {formErrors.name && <span className="admin-form-error">{formErrors.name}</span>}
                                    </div>

                                    <div className="admin-form-group">
                                        <label className="admin-label">Category Selection *</label>
                                        <select
                                            className="admin-input"
                                            value={formData.category}
                                            onChange={(e) => {
                                                const catName = e.target.value;
                                                const found = categories.find(c => c.name === catName);
                                                setFormData(prev => ({
                                                    ...prev,
                                                    category: catName,
                                                    category_id: found ? found.id : 1
                                                }));
                                            }}
                                        >
                                            {categories.map(cat => (
                                                <option key={cat.id} value={cat.name}>{cat.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="admin-form-group">
                                        <label className="admin-label">Product Tags (Multiple Tags Array)</label>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <input
                                                type="text"
                                                className="admin-input"
                                                placeholder="e.g. Digestion, Immunity, Energy"
                                                value={tagInput}
                                                onChange={(e) => setTagInput(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        e.preventDefault();
                                                        handleAddTag();
                                                    }
                                                }}
                                            />
                                            <button
                                                type="button"
                                                className="admin-btn-secondary"
                                                onClick={handleAddTag}
                                                style={{ whiteSpace: 'nowrap' }}
                                            >
                                                + Add Tag
                                            </button>
                                        </div>

                                        {formData.tags.length > 0 && (
                                            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '8px' }}>
                                                {formData.tags.map((tag, idx) => (
                                                    <span key={idx} style={{ background: '#18181B', color: '#FFFFFF', padding: '4px 10px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                                        <span>✓ {tag}</span>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveTag(tag)}
                                                            style={{ background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer', fontSize: '11px', padding: 0 }}
                                                        >
                                                            ✕
                                                        </button>
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div className="admin-form-group">
                                        <label className="admin-label">Product Overview / Description (Rich Text Editor)</label>
                                        <RichTextEditor
                                            value={formData.description}
                                            onChange={(val) => setFormData(prev => ({ ...prev, description: val }))}
                                            placeholder="Enter comprehensive high level product overview..."
                                            minHeight="120px"
                                        />
                                    </div>
                                </>
                            )}

                            {/* TAB 2: MULTIPLE PACKAGE SIZES & BINARY VARIANT IMAGES */}
                            {modalActiveTab === 'packages' && (
                                <>
                                    <div className="admin-form-group">
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                            <label className="admin-label" style={{ margin: 0, fontSize: '0.95rem' }}>
                                                Package Sizes & Variant Badges Dropdown
                                            </label>
                                            <button
                                                type="button"
                                                className="admin-btn-secondary"
                                                onClick={handleAddPackageSize}
                                                style={{ fontSize: '0.8rem', padding: '6px 12px' }}
                                            >
                                                + Add Size Variant
                                            </button>
                                        </div>

                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                            {formData.package_sizes.map((pkg, index) => {
                                                const variantImagesList = Array.isArray(pkg.variant_images)
                                                    ? pkg.variant_images
                                                    : (pkg.variant_image ? [pkg.variant_image] : []);

                                                return (
                                                    <div
                                                        key={pkg.id || index}
                                                        style={{
                                                            border: '1px solid #E4E4E7',
                                                            borderRadius: '16px',
                                                            background: '#FAFAF9',
                                                            padding: '16px 18px',
                                                            display: 'flex',
                                                            flexDirection: 'column',
                                                            gap: '14px',
                                                            boxShadow: '0 2px 6px rgba(0, 0, 0, 0.02)'
                                                        }}
                                                    >
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                            <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#18181B' }}>
                                                                Package Variant #{index + 1} ({pkg.size_number || 0}{pkg.size_unit})
                                                            </span>
                                                            {formData.package_sizes.length > 1 && (
                                                                <button
                                                                    type="button"
                                                                    className="admin-btn-compact-icon danger"
                                                                    onClick={() => handleRemovePackageSize(pkg.id)}
                                                                    title="Delete this package variant"
                                                                >
                                                                    ✕ Remove Variant
                                                                </button>
                                                            )}
                                                        </div>

                                                        {/* Row 1: Size Number, Unit, Variant Price, Badge Tag Dropdown */}
                                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1.2fr', gap: '12px' }}>
                                                            <div>
                                                                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#71717A' }}>Size Number</label>
                                                                <input
                                                                    type="number"
                                                                    className="admin-input"
                                                                    placeholder="e.g. 300"
                                                                    value={pkg.size_number}
                                                                    onChange={(e) => handlePackageChange(pkg.id, 'size_number', e.target.value)}
                                                                />
                                                            </div>

                                                            <div>
                                                                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#71717A' }}>Unit (Gram/Kilo)</label>
                                                                <select
                                                                    className="admin-input"
                                                                    value={pkg.size_unit}
                                                                    onChange={(e) => handlePackageChange(pkg.id, 'size_unit', e.target.value)}
                                                                >
                                                                    <option value="g">g (Gram)</option>
                                                                    <option value="kg">kg (Kilo)</option>
                                                                    <option value="ml">ml (Milliliter)</option>
                                                                    <option value="l">l (Liter)</option>
                                                                </select>
                                                            </div>

                                                            <div>
                                                                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#71717A' }}>Variant Price (₹)</label>
                                                                <input
                                                                    type="number"
                                                                    className="admin-input"
                                                                    placeholder="110"
                                                                    value={pkg.variant_price}
                                                                    onChange={(e) => handlePackageChange(pkg.id, 'variant_price', e.target.value)}
                                                                />
                                                            </div>

                                                            <div>
                                                                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#71717A' }}>Badge Tag Dropdown</label>
                                                                <select
                                                                    className="admin-input"
                                                                    value={pkg.variant_badge !== undefined ? pkg.variant_badge : 0}
                                                                    onChange={(e) => handlePackageChange(pkg.id, 'variant_badge', Number(e.target.value))}
                                                                >
                                                                    {BADGE_OPTIONS.map(opt => (
                                                                        <option key={opt.value} value={opt.value}>
                                                                            {opt.value === 0 ? opt.label : `${opt.label} (${opt.value})`}
                                                                        </option>
                                                                    ))}
                                                                </select>
                                                            </div>
                                                        </div>

                                                        {/* Row 2: Per-Variant Discount & Stock Count */}
                                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr 1.6fr', gap: '12px', background: '#FFFFFF', padding: '12px 14px', border: '1px solid #E4E4E7', borderRadius: '12px' }}>
                                                            <div>
                                                                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#71717A' }}>Discount Value</label>
                                                                <input
                                                                    type="number"
                                                                    className="admin-input"
                                                                    placeholder="e.g. 20"
                                                                    value={pkg.discount_value !== undefined ? pkg.discount_value : ''}
                                                                    onChange={(e) => handlePackageChange(pkg.id, 'discount_value', e.target.value)}
                                                                />
                                                            </div>

                                                            <div>
                                                                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#71717A' }}>Discount Type Dropdown</label>
                                                                <select
                                                                    className="admin-input"
                                                                    value={pkg.discount_type || 1}
                                                                    onChange={(e) => handlePackageChange(pkg.id, 'discount_type', Number(e.target.value))}
                                                                >
                                                                    <option value={1}>1 - Percentage (%)</option>
                                                                    <option value={2}>2 - Fixed Amount (₹)</option>
                                                                </select>
                                                            </div>

                                                            <div>
                                                                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#71717A' }}>Stock Count (Nullable / Optional)</label>
                                                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                                    <input
                                                                        type="number"
                                                                        className="admin-input"
                                                                        placeholder="50"
                                                                        disabled={pkg.is_unlimited_stock}
                                                                        value={pkg.stock !== undefined ? pkg.stock : ''}
                                                                        onChange={(e) => handlePackageChange(pkg.id, 'stock', e.target.value)}
                                                                        style={{ flex: 1 }}
                                                                    />
                                                                    <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', fontSize: '0.78rem', whiteSpace: 'nowrap' }}>
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={!!pkg.is_unlimited_stock}
                                                                            onChange={(e) => handlePackageChange(pkg.id, 'is_unlimited_stock', e.target.checked)}
                                                                        />
                                                                        <span>Unlimited / Nullable</span>
                                                                    </label>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Binary Image Uploads for Variant with Clean Hover Actions */}
                                                        <div style={{ borderTop: '1px solid #E4E4E7', paddingTop: '12px' }}>
                                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                                                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#18181B' }}>
                                                                    Binary Image Uploads for Variant ({variantImagesList.length} uploaded)
                                                                </label>
                                                                <div>
                                                                    <input
                                                                        type="file"
                                                                        multiple
                                                                        accept="image/*"
                                                                        id={`pkg-multi-img-${pkg.id}`}
                                                                        style={{ display: 'none' }}
                                                                        onChange={(e) => handleAddPackageVariantImages(pkg.id, e)}
                                                                    />
                                                                    <label
                                                                        htmlFor={`pkg-multi-img-${pkg.id}`}
                                                                        className="admin-btn-secondary"
                                                                        style={{ cursor: 'pointer', padding: '6px 12px', fontSize: '0.78rem' }}
                                                                    >
                                                                        + Upload Variant Images (Binary)
                                                                    </label>
                                                                </div>
                                                            </div>

                                                            {variantImagesList.length > 0 ? (
                                                                <div className="admin-image-grid-container">
                                                                    {variantImagesList.map((imgUrl, imgIdx) => (
                                                                        <div key={imgIdx} className="admin-image-card-item">
                                                                            <img
                                                                                src={imgUrl}
                                                                                alt={`Variant ${pkg.size_number}${pkg.size_unit} #${imgIdx + 1}`}
                                                                            />
                                                                            <div className="admin-image-card-overlay">
                                                                                {imgIdx > 0 && (
                                                                                    <button
                                                                                        type="button"
                                                                                        className="admin-img-action-icon"
                                                                                        title="Move Image Left"
                                                                                        onClick={() => handleMovePackageVariantImage(pkg.id, imgIdx, imgIdx - 1)}
                                                                                    >
                                                                                        ←
                                                                                    </button>
                                                                                )}
                                                                                {imgIdx < variantImagesList.length - 1 && (
                                                                                    <button
                                                                                        type="button"
                                                                                        className="admin-img-action-icon"
                                                                                        title="Move Image Right"
                                                                                        onClick={() => handleMovePackageVariantImage(pkg.id, imgIdx, imgIdx + 1)}
                                                                                    >
                                                                                        →
                                                                                    </button>
                                                                                )}
                                                                                <button
                                                                                    type="button"
                                                                                    className="admin-img-action-icon"
                                                                                    title="View Full Image"
                                                                                    onClick={() => setPreviewImageModal(imgUrl)}
                                                                                >
                                                                                    👁️
                                                                                </button>
                                                                                <label
                                                                                    htmlFor={`replace-img-${pkg.id}-${imgIdx}`}
                                                                                    className="admin-img-action-icon"
                                                                                    title="Replace Image"
                                                                                    style={{ cursor: 'pointer' }}
                                                                                >
                                                                                    ✏️
                                                                                    <input
                                                                                        type="file"
                                                                                        id={`replace-img-${pkg.id}-${imgIdx}`}
                                                                                        accept="image/*"
                                                                                        style={{ display: 'none' }}
                                                                                        onChange={(e) => {
                                                                                            if (e.target.files && e.target.files[0]) {
                                                                                                handleReplacePackageVariantImage(pkg.id, imgIdx, e.target.files[0]);
                                                                                            }
                                                                                        }}
                                                                                    />
                                                                                </label>
                                                                                <button
                                                                                    type="button"
                                                                                    className="admin-img-action-icon delete"
                                                                                    title="Remove Image"
                                                                                    onClick={() => handleRemovePackageVariantImage(pkg.id, imgIdx)}
                                                                                >
                                                                                    🗑️
                                                                                </button>
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            ) : (
                                                                <div style={{ fontSize: '0.75rem', color: '#71717A', fontStyle: 'italic', marginTop: '4px' }}>
                                                                    No separate images uploaded for this variant yet.
                                                                </div>
                                                            )}
                                                        </div>

                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Overall Product Status Section */}
                                    <div style={{ borderTop: '1px solid #E4E4E7', paddingTop: '16px', marginTop: '10px' }}>
                                        <div className="admin-form-group">
                                            <label className="admin-label">Product Status</label>
                                            <div style={{ display: 'flex', gap: '20px', alignItems: 'center', height: '38px' }}>
                                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.88rem' }}>
                                                    <input
                                                        type="radio"
                                                        name="product-status"
                                                        checked={Number(formData.status) === 1}
                                                        onChange={() => setFormData(prev => ({ ...prev, status: 1 }))}
                                                    />
                                                    <span>Active (Visible on Store)</span>
                                                </label>
                                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.88rem' }}>
                                                    <input
                                                        type="radio"
                                                        name="product-status"
                                                        checked={Number(formData.status) === 0}
                                                        onChange={() => setFormData(prev => ({ ...prev, status: 0 }))}
                                                    />
                                                    <span>Inactive (Hidden)</span>
                                                </label>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Main Product Gallery Binary Multi-Upload */}
                                    <div className="admin-form-group" style={{ marginTop: '16px', borderTop: '1px solid #E4E4E7', paddingTop: '16px' }}>
                                        <label className="admin-label">Main Product Gallery (Binary Image File Uploads)</label>
                                        <div style={{ border: '1.5px dashed #D4D4D8', borderRadius: '12px', background: '#FAFAF9', padding: '20px', textAlign: 'center' }}>
                                            <input
                                                type="file"
                                                multiple
                                                accept="image/*"
                                                id="gallery-images-upload"
                                                style={{ display: 'none' }}
                                                onChange={handleMultipleImagesUpload}
                                            />
                                            <label
                                                htmlFor="gallery-images-upload"
                                                className="admin-btn-primary"
                                                style={{ cursor: 'pointer', display: 'inline-block', padding: '10px 20px', borderRadius: '10px' }}
                                            >
                                                + Select Image Files from System (Binary)
                                            </label>
                                        </div>

                                        {formData.images.length > 0 && (
                                            <div className="admin-image-grid-container" style={{ marginTop: '14px' }}>
                                                {formData.images.map((imgUrl, index) => (
                                                    <div key={index} className="admin-image-card-item" style={{ width: '90px', height: '90px' }}>
                                                        <img
                                                            src={imgUrl}
                                                            alt={`Gallery ${index}`}
                                                        />
                                                        <div className="admin-image-card-overlay">
                                                            <button
                                                                type="button"
                                                                className="admin-img-action-icon"
                                                                title="View Full Image"
                                                                onClick={() => setPreviewImageModal(imgUrl)}
                                                            >
                                                                👁️
                                                            </button>
                                                            <button
                                                                type="button"
                                                                className="admin-img-action-icon delete"
                                                                title="Remove Image"
                                                                onClick={() => handleRemoveGalleryImage(index)}
                                                            >
                                                                🗑️
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}

                            {/* TAB 3: HOW TO USE, BENEFITS, INGREDIENTS WITH RICH TEXT EDITORS */}
                            {modalActiveTab === 'content' && (
                                <>
                                    <div className="admin-form-group">
                                        <label className="admin-label">How to Use & Preparation Steps (Rich Text Editor)</label>
                                        <RichTextEditor
                                            value={formData.how_to_use}
                                            onChange={(val) => setFormData(prev => ({ ...prev, how_to_use: val }))}
                                            placeholder="Dissolve 2 tablespoons in 200ml clean water without lumps. Boil on medium heat for 5-6 minutes..."
                                            minHeight="120px"
                                        />
                                    </div>

                                    <div className="admin-form-group">
                                        <label className="admin-label">Health Benefits & Key Highlights (Rich Text Editor)</label>
                                        <RichTextEditor
                                            value={formData.benefits}
                                            onChange={(val) => setFormData(prev => ({ ...prev, benefits: val }))}
                                            placeholder="• Greengram: Rich in Vitamin C and antioxidants that boost immunity..."
                                            minHeight="120px"
                                        />
                                    </div>

                                    <div className="admin-form-group">
                                        <label className="admin-label">Ingredients List (Rich Text Editor)</label>
                                        <RichTextEditor
                                            value={formData.ingredients}
                                            onChange={(val) => setFormData(prev => ({ ...prev, ingredients: val }))}
                                            placeholder="Sprouted Greengram, Sprouted Blackgram, Sprouted Ragi, Natural Green Cardamom..."
                                            minHeight="120px"
                                        />
                                    </div>
                                </>
                            )}

                            {/* Modal Footer Actions */}
                            <div className="admin-modal-footer" style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '18px', borderTop: '1px solid #E4E4E7' }}>
                                <button type="button" className="admin-btn-secondary" onClick={handleCloseModal}>
                                    Cancel
                                </button>
                                
                                <div style={{ display: 'flex', gap: '12px' }}>
                                    {modalActiveTab !== 'content' && (
                                        <button
                                            type="button"
                                            className="admin-btn-secondary"
                                            onClick={() => {
                                                if (modalActiveTab === 'basic') setModalActiveTab('packages');
                                                else if (modalActiveTab === 'packages') setModalActiveTab('content');
                                            }}
                                        >
                                            Next Step →
                                        </button>
                                    )}

                                    <button type="submit" className="admin-btn-primary" disabled={isSubmitting}>
                                        {isSubmitting ? 'Saving Configuration...' : (editingProduct ? 'Update Product' : 'Save & Publish Product')}
                                    </button>
                                </div>
                            </div>

                        </form>
                    </div>
                </div>
            )}

            {/* Full-Screen Image Lightbox Preview Modal */}
            {previewImageModal && (
                <div
                    className="admin-modal-overlay"
                    style={{ zIndex: 9999, background: 'rgba(0, 0, 0, 0.85)', backdropFilter: 'blur(8px)' }}
                    onClick={() => setPreviewImageModal(null)}
                >
                    <div
                        style={{
                            position: 'relative',
                            maxWidth: '85vw',
                            maxHeight: '85vh',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            type="button"
                            onClick={() => setPreviewImageModal(null)}
                            style={{
                                position: 'absolute',
                                top: '-18px',
                                right: '-18px',
                                background: '#FFFFFF',
                                color: '#18181B',
                                border: 'none',
                                borderRadius: '50%',
                                width: '36px',
                                height: '36px',
                                cursor: 'pointer',
                                fontSize: '16px',
                                fontWeight: 800,
                                boxShadow: '0 4px 14px rgba(0,0,0,0.4)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            ✕
                        </button>
                        <img
                            src={previewImageModal}
                            alt="Full Size Preview"
                            style={{
                                maxWidth: '100%',
                                maxHeight: '82vh',
                                objectFit: 'contain',
                                borderRadius: '16px',
                                boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
                                background: '#FFFFFF'
                            }}
                        />
                    </div>
                </div>
            )}

            {/* Reusable Confirm Delete Modal */}
            <ConfirmDeleteModal
                isOpen={!!productToDelete}
                title="Delete Product"
                itemName={productToDelete?.name || 'this product'}
                warningText="This action will permanently delete this product and all associated variant packages from the database."
                onConfirm={handleConfirmDeleteProduct}
                onCancel={() => setProductToDelete(null)}
                isDeleting={isDeletingProduct}
            />
        </div>
    );
}
