import React, { useState, useEffect, useRef } from 'react';
import {
    ArrowLeft,
    Save,
    Check,
    AlertCircle,
    Upload,
    X,
    Plus,
    Trash2,
    Package,
    Tag as TagIcon,
    FileText,
    Sparkles,
    CheckCircle2,
    Eye,
    Layers,
    Info,
    ChevronRight,
    ChevronDown,
    Bold,
    Italic,
    Underline,
    Strikethrough,
    List,
    ListOrdered,
    Heading3,
    Type,
    Eraser
} from 'lucide-react';
import {
    adminProductService,
    PRODUCT_BADGE_OPTIONS,
    BADGE_OPTIONS,
    PACKAGE_SIZE_OPTIONS,
    VARIANT_STATUS_OPTIONS,
    formatVariantSize,
    getBadgeLabel
} from '../services/adminProductService';
import { fetchCategoriesApi } from '../../services/api';

/**
 * Custom Rich Text Editor with format buttons
 */
function RichTextEditor({ value, onChange, placeholder = 'Type details here...', minHeight = '140px' }) {
    const editorRef = useRef(null);
    const [activeFormats, setActiveFormats] = useState({
        bold: false,
        italic: false,
        underline: false,
        strikeThrough: false,
        insertUnorderedList: false,
        insertOrderedList: false
    });

    useEffect(() => {
        if (editorRef.current && editorRef.current.innerHTML !== (value || '')) {
            editorRef.current.innerHTML = value || '';
        }
    }, [value]);

    const checkCommandStates = () => {
        try {
            setActiveFormats({
                bold: document.queryCommandState('bold'),
                italic: document.queryCommandState('italic'),
                underline: document.queryCommandState('underline'),
                strikeThrough: document.queryCommandState('strikeThrough'),
                insertUnorderedList: document.queryCommandState('insertUnorderedList'),
                insertOrderedList: document.queryCommandState('insertOrderedList')
            });
        } catch (err) {}
    };

    const execCommand = (cmd, arg = null) => {
        document.execCommand(cmd, false, arg);
        if (editorRef.current) {
            onChange(editorRef.current.innerHTML);
        }
        checkCommandStates();
    };

    return (
        <div className="rich-editor-wrapper">
            <div className="rich-editor-toolbar">
                <button
                    type="button"
                    className={`rich-toolbar-btn ${activeFormats.bold ? 'active' : ''}`}
                    onClick={() => execCommand('bold')}
                    title="Bold"
                >
                    <Bold size={14} />
                    <span>Bold</span>
                </button>
                <button
                    type="button"
                    className={`rich-toolbar-btn ${activeFormats.italic ? 'active' : ''}`}
                    onClick={() => execCommand('italic')}
                    title="Italic"
                >
                    <Italic size={14} />
                    <span>Italic</span>
                </button>
                <button
                    type="button"
                    className={`rich-toolbar-btn ${activeFormats.underline ? 'active' : ''}`}
                    onClick={() => execCommand('underline')}
                    title="Underline"
                >
                    <Underline size={14} />
                    <span>Underline</span>
                </button>
                <button
                    type="button"
                    className={`rich-toolbar-btn ${activeFormats.strikeThrough ? 'active' : ''}`}
                    onClick={() => execCommand('strikeThrough')}
                    title="Strikethrough"
                >
                    <Strikethrough size={14} />
                    <span>Strike</span>
                </button>

                <span className="rich-toolbar-sep" />

                <button
                    type="button"
                    className="rich-toolbar-btn"
                    onClick={() => execCommand('formatBlock', '<h3>')}
                    title="Heading 3"
                >
                    <Heading3 size={14} />
                    <span>H3 Heading</span>
                </button>
                <button
                    type="button"
                    className="rich-toolbar-btn"
                    onClick={() => execCommand('formatBlock', '<p>')}
                    title="Paragraph"
                >
                    <Type size={14} />
                    <span>Paragraph</span>
                </button>

                <span className="rich-toolbar-sep" />

                <button
                    type="button"
                    className={`rich-toolbar-btn ${activeFormats.insertUnorderedList ? 'active' : ''}`}
                    onClick={() => execCommand('insertUnorderedList')}
                    title="Bullet List"
                >
                    <List size={14} />
                    <span>Bullets</span>
                </button>
                <button
                    type="button"
                    className={`rich-toolbar-btn ${activeFormats.insertOrderedList ? 'active' : ''}`}
                    onClick={() => execCommand('insertOrderedList')}
                    title="Numbered List"
                >
                    <ListOrdered size={14} />
                    <span>Numbers</span>
                </button>

                <span className="rich-toolbar-sep" />

                <button
                    type="button"
                    className="rich-toolbar-btn clear"
                    onClick={() => execCommand('removeFormat')}
                    title="Clear Formatting"
                >
                    <Eraser size={14} />
                    <span>Clear</span>
                </button>
            </div>
            <div
                ref={editorRef}
                className="rich-editor-content"
                contentEditable
                style={{ minHeight }}
                onInput={(e) => {
                    onChange(e.currentTarget.innerHTML);
                    checkCommandStates();
                }}
                onKeyUp={checkCommandStates}
                onMouseUp={checkCommandStates}
                onBlur={(e) => onChange(e.currentTarget.innerHTML)}
                placeholder={placeholder}
            />
        </div>
    );
}

export default function AdminProductForm({ mode = 'add', productId = null, onCancel, onSuccess }) {
    const isEditMode = mode === 'edit' && Boolean(productId);

    const [categories, setCategories] = useState([]);
    const [loadingProduct, setLoadingProduct] = useState(isEditMode);
    const [activeTab, setActiveTab] = useState('basic');
    const [tagInput, setTagInput] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [notification, setNotification] = useState(null);
    const [formErrors, setFormErrors] = useState({});

    const [formData, setFormData] = useState({
        name: '',
        category: '',
        category_id: 1,
        tags: [],
        description: '',
        actual_price: '',
        discount_type: 1,
        discount_value: '',
        discount: '',
        stock: '50',
        is_unlimited_stock: false,
        status: 1,
        product_badge: 0,
        images: [],
        image_files: [],
        package_sizes: [
            {
                id: 'pkg-1',
                size_number: 300,
                size_unit: 'g',
                package_size: '',
                status: 1,
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

    const loadCategories = async () => {
        const res = await fetchCategoriesApi();
        if (res.success && res.data && res.data.length > 0) {
            setCategories(res.data);
            if (!formData.category && !isEditMode) {
                setFormData(prev => ({
                    ...prev,
                    category: res.data[0].name,
                    category_id: res.data[0].id
                }));
            }
        } else {
            const defaults = [
                { id: 1, name: 'Ancestral Health Mixes' },
                { id: 2, name: 'Heritage Mappillai Rice' },
                { id: 3, name: 'Soak-Sprouted Millets' },
                { id: 4, name: 'Sethiyathope Artisanal Blends' }
            ];
            setCategories(defaults);
            if (!formData.category && !isEditMode) {
                setFormData(prev => ({
                    ...prev,
                    category: defaults[0].name,
                    category_id: defaults[0].id
                }));
            }
        }
    };

    const loadProductData = async () => {
        setLoadingProduct(true);
        try {
            const allProducts = await adminProductService.getAllProducts();
            const product = allProducts.find(p => String(p.id) === String(productId));

            if (product) {
                const normalizedPackages = Array.isArray(product.package_sizes) && product.package_sizes.length > 0
                    ? product.package_sizes.map(p => ({
                        id: p.id || p.db_id || `pkg-${Math.random()}`,
                        size_number: p.size_number !== undefined ? p.size_number : (p.size_key ? parseFloat(p.size_key) || 300 : 300),
                        size_unit: p.size_unit || (p.size_key ? p.size_key.replace(/[0-9.]/g, '') || 'g' : 'g'),
                        pieces_count: p.pieces_count || null,
                        package_size: p.package_size || '',
                        status: p.status !== undefined && p.status !== null ? Number(p.status) : 1,
                        variant_price: p.variant_price !== undefined ? String(p.variant_price) : String(product.actual_price || 110),
                        variant_badge: p.variant_badge !== undefined ? Number(p.variant_badge) : 0,
                        discount_value: p.discount_value !== undefined ? String(p.discount_value) : '',
                        discount_type: p.discount_type !== undefined ? Number(p.discount_type) : 1,
                        stock: p.stock !== undefined ? String(p.stock) : '50',
                        is_unlimited_stock: p.stock === -1 || p.is_unlimited_stock || false,
                        variant_images: Array.isArray(p.variant_images) && p.variant_images.length > 0
                            ? p.variant_images
                            : (Array.isArray(p.images) ? p.images : []),
                        variant_image_files: Array.isArray(p.variant_images) && p.variant_images.length > 0
                            ? p.variant_images
                            : (Array.isArray(p.images) ? p.images : [])
                    }))
                    : [
                        {
                            id: 'pkg-1',
                            size_number: 300,
                            size_unit: 'g',
                            package_size: '',
                            status: 1,
                            variant_price: String(product.actual_price || 110),
                            variant_badge: 0,
                            discount_value: '',
                            discount_type: 1,
                            stock: String(product.stock || 50),
                            is_unlimited_stock: product.stock === -1,
                            variant_images: Array.isArray(product.images) ? product.images : [],
                            variant_image_files: Array.isArray(product.images) ? product.images : []
                        }
                    ];

                const existingTags = Array.isArray(product.tags)
                    ? product.tags
                    : (typeof product.tags === 'string' ? product.tags.split(',').map(t => t.trim()).filter(Boolean) : []);

                setFormData({
                    id: product.id,
                    name: product.name || '',
                    category: product.category || '',
                    category_id: product.category_id || 1,
                    tags: existingTags,
                    description: product.description || '',
                    actual_price: product.actual_price ? String(product.actual_price) : '',
                    discount_type: product.discount_type || 1,
                    discount_value: product.discount_value ? String(product.discount_value) : '',
                    discount: product.discount || '',
                    stock: product.stock !== undefined ? String(product.stock) : '50',
                    is_unlimited_stock: product.stock === -1,
                    status: product.status !== undefined ? Number(product.status) : 1,
                    product_badge: product.product_badge !== undefined ? Number(product.product_badge) : (product.badge || 0),
                    images: Array.isArray(product.images) ? product.images : [],
                    image_files: Array.isArray(product.images) ? product.images : [],
                    package_sizes: normalizedPackages,
                    how_to_use: product.how_to_use || '',
                    benefits: product.benefits || '',
                    ingredients: product.ingredients || ''
                });
            }
        } catch (err) {
            console.error('Failed to load product details:', err);
            setNotification({ type: 'error', message: 'Failed to load product data.' });
        } finally {
            setLoadingProduct(false);
        }
    };

    useEffect(() => {
        loadCategories();
        if (isEditMode) {
            loadProductData();
        }
    }, [mode, productId]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        if (formErrors[name]) {
            setFormErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const handleCategoryChange = (e) => {
        const selectedId = Number(e.target.value);
        const catObj = categories.find(c => c.id === selectedId);
        setFormData(prev => ({
            ...prev,
            category_id: selectedId,
            category: catObj ? catObj.name : prev.category
        }));
    };

    const handleAddTag = () => {
        const trimmed = tagInput.trim();
        if (trimmed && !formData.tags.includes(trimmed)) {
            setFormData(prev => ({ ...prev, tags: [...prev.tags, trimmed] }));
            setTagInput('');
        }
    };

    const handleRemoveTag = (tagToRemove) => {
        setFormData(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tagToRemove) }));
    };

    const handleMainImagesUpload = (e) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;
        const newPreviews = files.map(file => URL.createObjectURL(file));
        setFormData(prev => ({
            ...prev,
            images: [...prev.images, ...newPreviews],
            image_files: [...prev.image_files, ...files]
        }));
    };

    const handleRemoveMainImage = (indexToRemove) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, idx) => idx !== indexToRemove),
            image_files: prev.image_files.filter((_, idx) => idx !== indexToRemove)
        }));
    };

    const handleAddPackageSize = () => {
        const newId = `pkg-${Date.now()}`;
        const newPkg = {
            id: newId,
            size_number: 500,
            size_unit: 'g',
            package_size: '',
            status: 1,
            variant_price: formData.actual_price || '150',
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
            alert('A product must have at least one package size variant.');
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

    const handleVariantImagesUpload = (pkgId, e) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;
        const newPreviews = files.map(file => URL.createObjectURL(file));
        setFormData(prev => ({
            ...prev,
            package_sizes: prev.package_sizes.map(p => {
                if (p.id === pkgId) {
                    return {
                        ...p,
                        variant_images: [...(p.variant_images || []), ...newPreviews],
                        variant_image_files: [...(p.variant_image_files || []), ...files]
                    };
                }
                return p;
            })
        }));
    };

    const handleRemoveVariantImage = (pkgId, imgIdxToRemove) => {
        setFormData(prev => ({
            ...prev,
            package_sizes: prev.package_sizes.map(p => {
                if (p.id === pkgId) {
                    return {
                        ...p,
                        variant_images: (p.variant_images || []).filter((_, idx) => idx !== imgIdxToRemove),
                        variant_image_files: (p.variant_image_files || []).filter((_, idx) => idx !== imgIdxToRemove)
                    };
                }
                return p;
            })
        }));
    };

    const validateForm = () => {
        const errors = {};
        if (!formData.name.trim()) errors.name = 'Product name is required';
        if (!formData.category) errors.category = 'Category is required';

        if (!formData.package_sizes || formData.package_sizes.length === 0) {
            errors.package_sizes = 'At least one package size is required';
        } else {
            formData.package_sizes.forEach((pkg, index) => {
                if (!pkg.variant_price || parseFloat(pkg.variant_price) <= 0) {
                    errors[`pkg_price_${index}`] = 'Price required';
                }
            });
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        if (!validateForm()) {
            setNotification({ type: 'error', message: 'Please correct highlighted errors in the form before saving.' });
            return;
        }

        setIsSubmitting(true);
        setNotification(null);

        try {
            const primaryPrice = formData.actual_price || (formData.package_sizes && formData.package_sizes[0] ? formData.package_sizes[0].variant_price : '0');

            const payload = {
                ...formData,
                id: isEditMode ? productId : undefined,
                actual_price: primaryPrice,
                price: primaryPrice,
                package_sizes: formData.package_sizes
            };

            const res = await adminProductService.saveProduct(payload, isEditMode);

            if (res.success) {
                setNotification({
                    type: 'success',
                    message: isEditMode ? 'Product updated successfully!' : 'New product created and published successfully!'
                });
                setTimeout(() => {
                    if (onSuccess) onSuccess(res.product);
                }, 800);
            } else {
                setNotification({ type: 'error', message: res.error || 'Failed to save product.' });
            }
        } catch (err) {
            console.error('Save product error:', err);
            setNotification({ type: 'error', message: 'An unexpected error occurred while saving product.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loadingProduct) {
        return (
            <div className="admin-page-container">
                <div className="admin-loading-center" style={{ minHeight: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
                    <div className="admin-spinner" />
                    <p style={{ color: 'var(--admin-text-secondary)', fontWeight: 600 }}>Loading product details...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-page-container admin-product-form-page">
            <div className="admin-form-header-bar">
                <div className="admin-form-header-left">
                    <button
                        type="button"
                        className="admin-btn-back"
                        onClick={onCancel}
                        title="Back to Products"
                    >
                        <ArrowLeft size={18} />
                    </button>
                    <div>
                        <div className="admin-breadcrumb">
                            <span>Admin</span>
                            <ChevronRight size={14} />
                            <span className="clickable" onClick={onCancel}>Products</span>
                            <ChevronRight size={14} />
                            <span className="active">{isEditMode ? 'Edit Product' : 'Add New Product'}</span>
                        </div>
                        <h1 className="admin-form-title">
                            {isEditMode ? `Edit: ${formData.name || 'Product'}` : 'Create New Product'}
                        </h1>
                    </div>
                </div>

                <div className="admin-form-header-actions">
                    <button
                        type="button"
                        className="admin-btn admin-btn-secondary"
                        onClick={onCancel}
                        disabled={isSubmitting}
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        className="admin-btn admin-btn-primary"
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <>
                                <span className="admin-spinner-sm" />
                                <span>Saving...</span>
                            </>
                        ) : (
                            <>
                                <Save size={18} />
                                <span>{isEditMode ? 'Save Changes' : 'Save & Publish Product'}</span>
                            </>
                        )}
                    </button>
                </div>
            </div>

            {notification && (
                <div className={`admin-alert ${notification.type === 'success' ? 'admin-alert-success' : 'admin-alert-danger'}`}>
                    {notification.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                    <span>{notification.message}</span>
                </div>
            )}

            <div className="admin-form-steps-card">
                <div className="admin-form-steps-nav">
                    <button
                        type="button"
                        className={`admin-step-btn ${activeTab === 'basic' ? 'active' : ''}`}
                        onClick={() => setActiveTab('basic')}
                    >
                        <div className="admin-step-num">1</div>
                        <div className="admin-step-info">
                            <span className="admin-step-title">Basic Info & Media</span>
                            <span className="admin-step-subtitle">Title, Category, Tags & Images</span>
                        </div>
                    </button>

                    <div className="admin-step-divider" />

                    <button
                        type="button"
                        className={`admin-step-btn ${activeTab === 'variants' ? 'active' : ''}`}
                        onClick={() => setActiveTab('variants')}
                    >
                        <div className="admin-step-num">2</div>
                        <div className="admin-step-info">
                            <span className="admin-step-title">Package Sizes & Pricing</span>
                            <span className="admin-step-subtitle">Variants, Size Badges & Status</span>
                        </div>
                    </button>

                    <div className="admin-step-divider" />

                    <button
                        type="button"
                        className={`admin-step-btn ${activeTab === 'details' ? 'active' : ''}`}
                        onClick={() => setActiveTab('details')}
                    >
                        <div className="admin-step-num">3</div>
                        <div className="admin-step-info">
                            <span className="admin-step-title">Usage & Details</span>
                            <span className="admin-step-subtitle">How to Use, Benefits & Ingredients</span>
                        </div>
                    </button>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="admin-form-body">
                {activeTab === 'basic' && (
                    <div className="admin-form-section-grid">
                        <div className="admin-card admin-form-card">
                            <h2 className="admin-card-title">
                                <Package size={20} className="admin-card-icon" />
                                Product Overview & Info
                            </h2>

                            <div className="admin-form-group">
                                <label className="admin-form-label">
                                    Product Name <span className="req">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    className={`admin-input ${formErrors.name ? 'error' : ''}`}
                                    placeholder="e.g. Traditional Country Sugar (Nattu Sakkarai)"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                />
                                {formErrors.name && <span className="admin-form-error">{formErrors.name}</span>}
                            </div>

                            <div className="admin-form-row-2">
                                <div className="admin-form-group">
                                    <label className="admin-form-label">Category Selection <span className="req">*</span></label>
                                    <select
                                        className="admin-select"
                                        value={formData.category_id}
                                        onChange={handleCategoryChange}
                                    >
                                        {categories.map(cat => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="admin-form-group">
                                    <label className="admin-form-label">Product Badge Highlight</label>
                                    <select
                                        name="product_badge"
                                        className="admin-select"
                                        value={formData.product_badge}
                                        onChange={handleInputChange}
                                    >
                                        {PRODUCT_BADGE_OPTIONS.map(opt => (
                                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="admin-form-group">
                                <label className="admin-form-label">Overall Product Status</label>
                                <select
                                    name="status"
                                    className="admin-select"
                                    value={formData.status}
                                    onChange={handleInputChange}
                                >
                                    <option value={1}>Active (Published on Storefront)</option>
                                    <option value={0}>Disabled / Draft (Hidden from Store)</option>
                                </select>
                            </div>

                            <div className="admin-form-group">
                                <label className="admin-form-label">
                                    <TagIcon size={14} style={{ marginRight: '6px' }} />
                                    Product Tags (Keywords Array)
                                </label>
                                <div className="admin-tag-input-row">
                                    <input
                                        type="text"
                                        className="admin-input"
                                        placeholder="Type tag name and click Add (e.g. organic, country-sugar)"
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
                                        className="admin-btn admin-btn-secondary"
                                        onClick={handleAddTag}
                                    >
                                        + Add Tag
                                    </button>
                                </div>

                                {formData.tags.length > 0 && (
                                    <div className="admin-tags-chips-list">
                                        {formData.tags.map(tag => (
                                            <span key={tag} className="admin-tag-chip">
                                                <span>{tag}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveTag(tag)}
                                                    title="Remove tag"
                                                >
                                                    <X size={12} />
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="admin-form-group">
                                <label className="admin-form-label">Product Overview / Description</label>
                                <RichTextEditor
                                    value={formData.description}
                                    onChange={(val) => setFormData(prev => ({ ...prev, description: val }))}
                                    placeholder="Write rich description about sourcing, taste, and quality..."
                                    minHeight="140px"
                                />
                            </div>
                        </div>

                        <div className="admin-card admin-form-card">
                            <h2 className="admin-card-title">
                                <Upload size={20} className="admin-card-icon" />
                                Main Product Images Gallery
                            </h2>

                            <div className="admin-image-dropzone">
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={handleMainImagesUpload}
                                    id="main-image-input"
                                    className="admin-file-hidden"
                                />
                                <label htmlFor="main-image-input" className="admin-dropzone-label">
                                    <Upload size={32} className="admin-dropzone-icon" />
                                    <span className="admin-dropzone-text">Click or Drag & Drop Images Here</span>
                                    <span className="admin-dropzone-sub">PNG, WEBP, JPG up to 5MB</span>
                                </label>
                            </div>

                            {formData.images.length > 0 ? (
                                <div className="admin-gallery-grid">
                                    {formData.images.map((imgUrl, idx) => (
                                        <div key={idx} className="admin-gallery-thumb-card">
                                            <img src={imgUrl} alt={`Product ${idx + 1}`} />
                                            {idx === 0 && <span className="admin-primary-badge">Cover Image</span>}
                                            <button
                                                type="button"
                                                className="admin-thumb-remove-btn"
                                                onClick={() => handleRemoveMainImage(idx)}
                                                title="Remove Image"
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="admin-empty-gallery-note">
                                    <Info size={16} />
                                    <span>No images uploaded yet. Primary cover image will be displayed on product cards.</span>
                                </div>
                            )}
                        </div>
                    </div>
                )}
                {activeTab === 'variants' && (
                    <div className="admin-card admin-form-card">
                        <div className="admin-card-header-flex">
                            <div>
                                <h2 className="admin-card-title">
                                    <Layers size={20} className="admin-card-icon" />
                                    Package Size Variants & Pricing Configuration
                                </h2>
                                <p className="admin-card-subtitle">
                                    Define available weight/volume packages, formatted package sizes (XXS, XS, S, M, L, XL, XXL, XXXL), and custom variant badges.
                                </p>
                            </div>

                            <button
                                type="button"
                                className="admin-btn admin-btn-secondary"
                                onClick={handleAddPackageSize}
                            >
                                <Plus size={16} />
                                <span>Add Variant</span>
                            </button>
                        </div>

                        <div className="admin-variants-list">
                            {formData.package_sizes.map((pkg, index) => {
                                const formattedLabel = formatVariantSize(pkg.size_number || 0, pkg.size_unit, pkg.pieces_count, pkg.package_size);
                                const isPkgDisabled = pkg.status === 0 || pkg.status === '0';

                                return (
                                    <div key={pkg.id} className={`admin-variant-card ${isPkgDisabled ? 'variant-disabled' : ''}`}>
                                        <div className="admin-variant-header">
                                            <div className="admin-variant-title-wrap">
                                                <span className="admin-variant-badge-num">#{index + 1}</span>
                                                <h3 className="admin-variant-title">{formattedLabel}</h3>
                                                {pkg.package_size && (
                                                    <span className="admin-pkg-size-pill">{pkg.package_size}</span>
                                                )}
                                                {isPkgDisabled && (
                                                    <span className="admin-disabled-status-badge" title="Will be updated">
                                                        Disabled (Will be updated)
                                                    </span>
                                                )}
                                            </div>

                                            {formData.package_sizes.length > 1 && (
                                                <button
                                                    type="button"
                                                    className="admin-btn-icon-danger"
                                                    onClick={() => handleRemovePackageSize(pkg.id)}
                                                    title="Delete this variant"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                        </div>

                                        <div className="admin-variant-body-grid">
                                            <div className="admin-form-group">
                                                <label className="admin-form-label">
                                                    Package Size (Standard Tag)
                                                </label>
                                                <select
                                                    className="admin-select"
                                                    value={pkg.package_size || ''}
                                                    onChange={(e) => handlePackageChange(pkg.id, 'package_size', e.target.value)}
                                                >
                                                                                                        {PACKAGE_SIZE_OPTIONS.map(opt => (
                                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div className="admin-form-group">
                                                <label className="admin-form-label">Variant Status</label>
                                                <select
                                                    className={`admin-select ${isPkgDisabled ? 'select-warning' : ''}`}
                                                    value={pkg.status !== undefined && pkg.status !== null ? pkg.status : 1}
                                                    onChange={(e) => handlePackageChange(pkg.id, 'status', Number(e.target.value))}
                                                >
                                                    {VARIANT_STATUS_OPTIONS.map(opt => (
                                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div className="admin-form-group">
                                                <label className="admin-form-label">Size Quantity Number <span className="req">*</span></label>
                                                <input
                                                    type="number"
                                                    step="any"
                                                    className="admin-input"
                                                    placeholder="e.g. 500"
                                                    value={pkg.size_number !== undefined ? pkg.size_number : ''}
                                                    onChange={(e) => handlePackageChange(pkg.id, 'size_number', e.target.value)}
                                                />
                                            </div>

                                            <div className="admin-form-group">
                                                <label className="admin-form-label">Unit <span className="req">*</span></label>
                                                <select
                                                    className="admin-select"
                                                    value={pkg.size_unit || 'g'}
                                                    onChange={(e) => handlePackageChange(pkg.id, 'size_unit', e.target.value)}
                                                >
                                                    <option value="g">g (Grams)</option>
                                                    <option value="kg">kg (Kilograms)</option>
                                                    <option value="ml">ml (Milliliters)</option>
                                                    <option value="L">L (Liters)</option>
                                                    <option value="box">Box</option>
                                                    <option value="pack">Pack</option>
                                                    <option value="pcs">Pieces</option>
                                                </select>
                                            </div>

                                            {(pkg.size_unit === 'box' || pkg.size_unit === 'pack' || pkg.size_unit === 'pcs') && (
                                                <div className="admin-form-group">
                                                    <label className="admin-form-label">Pieces Count in Pack</label>
                                                    <input
                                                        type="number"
                                                        className="admin-input"
                                                        placeholder="e.g. 6"
                                                        value={pkg.pieces_count || ''}
                                                        onChange={(e) => handlePackageChange(pkg.id, 'pieces_count', e.target.value)}
                                                    />
                                                </div>
                                            )}

                                            <div className="admin-form-group">
                                                <label className="admin-form-label">Variant Price (₹) <span className="req">*</span></label>
                                                <input
                                                    type="number"
                                                    className={`admin-input ${formErrors[`pkg_price_${index}`] ? 'error' : ''}`}
                                                    placeholder="e.g. 190"
                                                    value={pkg.variant_price !== undefined ? pkg.variant_price : ''}
                                                    onChange={(e) => handlePackageChange(pkg.id, 'variant_price', e.target.value)}
                                                />
                                            </div>

                                            <div className="admin-form-group">
                                                <label className="admin-form-label">Variant Badge Highlight</label>
                                                <select
                                                    className="admin-select"
                                                    value={pkg.variant_badge !== undefined ? pkg.variant_badge : 0}
                                                    onChange={(e) => handlePackageChange(pkg.id, 'variant_badge', Number(e.target.value))}
                                                >
                                                    {BADGE_OPTIONS.map(opt => (
                                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div className="admin-form-group full-width">
                                                <label className="admin-form-label">Variant Specific Images (Optional)</label>
                                                <div className="admin-variant-images-row">
                                                    <input
                                                        type="file"
                                                        multiple
                                                        accept="image/*"
                                                        id={`variant-img-input-${pkg.id}`}
                                                        className="admin-file-hidden"
                                                        onChange={(e) => handleVariantImagesUpload(pkg.id, e)}
                                                    />
                                                    <label htmlFor={`variant-img-input-${pkg.id}`} className="admin-btn admin-btn-secondary admin-btn-sm">
                                                        <Upload size={14} />
                                                        <span>Upload Variant Images</span>
                                                    </label>

                                                    {Array.isArray(pkg.variant_images) && pkg.variant_images.length > 0 && (
                                                        <div className="admin-variant-thumbs-list">
                                                            {pkg.variant_images.map((vUrl, vIdx) => (
                                                                <div key={vIdx} className="admin-variant-thumb-item">
                                                                    <img src={vUrl} alt={`Variant ${vIdx + 1}`} />
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleRemoveVariantImage(pkg.id, vIdx)}
                                                                        title="Remove image"
                                                                    >
                                                                        <X size={12} />
                                                                    </button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
                {activeTab === 'details' && (
                    <div className="admin-card admin-form-card">
                        <h2 className="admin-card-title">
                            <FileText size={20} className="admin-card-icon" />
                            Usage Instructions, Health Benefits & Ingredients
                        </h2>

                        <div className="admin-form-group">
                            <label className="admin-form-label">How to Use / Preparation Steps</label>
                            <RichTextEditor
                                value={formData.how_to_use}
                                onChange={(val) => setFormData(prev => ({ ...prev, how_to_use: val }))}
                                placeholder="e.g. Mix 2 tablespoons of powder with 200ml of water..."
                                minHeight="140px"
                            />
                        </div>

                        <div className="admin-form-group">
                            <label className="admin-form-label">Key Health Benefits & Highlights</label>
                            <RichTextEditor
                                value={formData.benefits}
                                onChange={(val) => setFormData(prev => ({ ...prev, benefits: val }))}
                                placeholder="e.g. • 100% Sulfur-free • Rich in natural iron & calcium..."
                                minHeight="140px"
                            />
                        </div>

                        <div className="admin-form-group">
                            <label className="admin-form-label">Ingredients & Sourcing Information</label>
                            <RichTextEditor
                                value={formData.ingredients}
                                onChange={(val) => setFormData(prev => ({ ...prev, ingredients: val }))}
                                placeholder="e.g. 100% Organically Cultivated Sugarcane Juice..."
                                minHeight="120px"
                            />
                        </div>
                    </div>
                )}

                <div className="admin-form-footer-bar">
                    <div className="admin-form-footer-left">
                        {activeTab !== 'basic' && (
                            <button
                                type="button"
                                className="admin-btn admin-btn-secondary"
                                onClick={() => {
                                    if (activeTab === 'variants') setActiveTab('basic');
                                    if (activeTab === 'details') setActiveTab('variants');
                                }}
                            >
                                ← Previous Step
                            </button>
                        )}
                    </div>

                    <div className="admin-form-footer-right">
                        {activeTab !== 'details' ? (
                            <button
                                type="button"
                                className="admin-btn admin-btn-primary"
                                onClick={() => {
                                    if (activeTab === 'basic') setActiveTab('variants');
                                    if (activeTab === 'variants') setActiveTab('details');
                                }}
                            >
                                <span>Next Step</span>
                                <ChevronRight size={16} />
                            </button>
                        ) : (
                            <button
                                type="submit"
                                className="admin-btn admin-btn-success"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <>
                                        <span className="admin-spinner-sm" />
                                        <span>Publishing...</span>
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle2 size={18} />
                                        <span>{isEditMode ? 'Save & Update Product' : 'Save & Publish Product'}</span>
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>

            </form>
        </div>
    );
}
