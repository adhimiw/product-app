import React, { useState } from 'react';
import { 
    X, 
    Pencil, 
    Package, 
    Layers, 
    Tag, 
    Percent, 
    Boxes, 
    ExternalLink, 
    Sparkles, 
    CheckCircle2, 
    XCircle,
    ShoppingBag
} from 'lucide-react';
import { getBadgeLabel } from '../services/adminProductService';
import { sanitizeHtml } from '../../utils/sanitizeHtml';

export default function ProductDetailsModal({ product, onClose, onEdit }) {
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);

    if (!product) return null;

    const images = Array.isArray(product.images) && product.images.length > 0
        ? product.images
        : ['/assets/images/categories/organic-food-ingredients.png'];

    const currentImage = images[selectedImageIndex] || images[0];

    const packageSizes = Array.isArray(product.package_sizes) ? product.package_sizes : [];
    const tags = Array.isArray(product.tags) ? product.tags : [];
    const badgeName = getBadgeLabel(product.badge);

    const formatCurrency = (val) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(val || 0);
    };

    return (
        <div className="admin-modal-backdrop" onClick={onClose}>
            <div 
                className="admin-modal-card" 
                onClick={(e) => e.stopPropagation()}
                style={{ maxWidth: '780px', width: '92%', maxHeight: '90vh' }}
            >
                {/* Header */}
                <div className="admin-modal-header" style={{ padding: '14px 20px', background: 'var(--admin-surface-subtle)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
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
                            <Package size={18} />
                        </div>
                        <div style={{ minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <h3 className="admin-modal-title" style={{ fontSize: '1.05rem', margin: 0, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                                    {product.name}
                                </h3>
                                <span className={`admin-badge ${Number(product.status) === 1 ? 'admin-badge-success' : 'admin-badge-neutral'}`} style={{ fontSize: '0.68rem', padding: '1px 6px' }}>
                                    <span className="admin-badge-dot" />
                                    {Number(product.status) === 1 ? 'Active' : 'Inactive'}
                                </span>
                            </div>
                            <span style={{ fontSize: '0.74rem', color: 'var(--admin-text-muted)', fontFamily: 'monospace' }}>
                                ID: #{product.id} • SKU: {product.slug || `prod-${product.id}`}
                            </span>
                        </div>
                    </div>

                    <button 
                        type="button"
                        className="admin-modal-close" 
                        onClick={onClose}
                        title="Close modal"
                    >
                        <X size={15} />
                    </button>
                </div>

                {/* Modal Body */}
                <div className="admin-modal-body" style={{ padding: '18px 20px', gap: '18px', overflowY: 'auto' }}>
                    
                    {/* Top Overview: Gallery + Key Highlights */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: '170px 1fr',
                        gap: '16px',
                        background: 'var(--admin-card-bg)',
                        border: '1px solid var(--admin-border-color)',
                        borderRadius: 'var(--admin-radius-lg)',
                        padding: '14px'
                    }}>
                        {/* Gallery */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <div style={{
                                width: '170px',
                                height: '170px',
                                borderRadius: 'var(--admin-radius-md)',
                                border: '1px solid var(--admin-border-color)',
                                background: 'var(--admin-surface-subtle)',
                                overflow: 'hidden',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <img
                                    src={currentImage}
                                    alt={product.name}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = '/assets/images/categories/organic-food-ingredients.png';
                                    }}
                                />
                            </div>

                            {/* Thumbnail strip if multiple images */}
                            {images.length > 1 && (
                                <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '2px' }}>
                                    {images.map((img, idx) => (
                                        <button
                                            key={idx}
                                            type="button"
                                            onClick={() => setSelectedImageIndex(idx)}
                                            style={{
                                                width: '36px',
                                                height: '36px',
                                                borderRadius: '4px',
                                                border: selectedImageIndex === idx ? '2px solid var(--admin-primary)' : '1px solid var(--admin-border-color)',
                                                padding: 0,
                                                background: 'var(--admin-surface-subtle)',
                                                cursor: 'pointer',
                                                overflow: 'hidden',
                                                flexShrink: 0
                                            }}
                                        >
                                            <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Specs Grid */}
                        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '10px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                                {/* Category */}
                                <div style={{ background: 'var(--admin-surface-subtle)', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--admin-border-color)' }}>
                                    <div style={{ fontSize: '0.68rem', color: 'var(--admin-text-muted)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}>
                                        <Layers size={12} /> CATEGORY
                                    </div>
                                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--admin-text-main)' }}>
                                        {product.category || 'Uncategorized'}
                                    </div>
                                </div>

                                {/* Stock Units */}
                                <div style={{ background: 'var(--admin-surface-subtle)', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--admin-border-color)' }}>
                                    <div style={{ fontSize: '0.68rem', color: 'var(--admin-text-muted)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}>
                                        <Boxes size={12} /> INVENTORY
                                    </div>
                                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: product.stock > 10 ? 'var(--admin-success-text)' : 'var(--admin-danger-text)' }}>
                                        {product.stock !== null && product.stock !== undefined ? `${product.stock} units in stock` : 'Unlimited'}
                                    </div>
                                </div>

                                {/* Base Price */}
                                <div style={{ background: 'var(--admin-surface-subtle)', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--admin-border-color)' }}>
                                    <div style={{ fontSize: '0.68rem', color: 'var(--admin-text-muted)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}>
                                        <Tag size={12} /> SALE PRICE
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                                        <span style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--admin-text-main)' }}>
                                            ₹{product.actual_price}
                                        </span>
                                        {product.regular_price && Number(product.regular_price) > Number(product.actual_price) && (
                                            <span style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)', textDecoration: 'line-through' }}>
                                                ₹{product.regular_price}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Discount */}
                                <div style={{ background: 'var(--admin-surface-subtle)', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--admin-border-color)' }}>
                                    <div style={{ fontSize: '0.68rem', color: 'var(--admin-text-muted)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}>
                                        <Percent size={12} /> DISCOUNT
                                    </div>
                                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: product.discount ? 'var(--admin-success-text)' : 'var(--admin-text-muted)' }}>
                                        {product.discount || 'No Discount'}
                                    </div>
                                </div>
                            </div>

                            {/* Badges & Tags */}
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
                                {badgeName && (
                                    <span style={{
                                        fontSize: '0.72rem',
                                        fontWeight: 700,
                                        background: 'rgba(245, 158, 11, 0.12)',
                                        color: '#d97706',
                                        border: '1px solid rgba(245, 158, 11, 0.3)',
                                        padding: '2px 8px',
                                        borderRadius: '4px',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '4px'
                                    }}>
                                        <Sparkles size={11} /> {badgeName}
                                    </span>
                                )}

                                {tags.map((t, idx) => (
                                    <span key={idx} style={{
                                        fontSize: '0.7rem',
                                        fontWeight: 600,
                                        background: 'var(--admin-surface-subtle)',
                                        color: 'var(--admin-text-secondary)',
                                        border: '1px solid var(--admin-border-color)',
                                        padding: '2px 7px',
                                        borderRadius: '4px'
                                    }}>
                                        #{t}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Package Sizes / Variants Table */}
                    <div>
                        <h4 style={{ fontSize: '0.84rem', fontWeight: 800, color: 'var(--admin-text-main)', margin: '0 0 8px 0' }}>
                            Available Package Sizes & Weight Variants ({packageSizes.length})
                        </h4>

                        {packageSizes.length === 0 ? (
                            <div style={{ padding: '12px', background: 'var(--admin-surface-subtle)', borderRadius: '6px', fontSize: '0.78rem', color: 'var(--admin-text-muted)' }}>
                                Standard Single Unit packaging.
                            </div>
                        ) : (
                            <div className="admin-table-responsive" style={{ border: '1px solid var(--admin-border-color)', borderRadius: 'var(--admin-radius-md)' }}>
                                <table className="admin-table">
                                    <thead>
                                        <tr>
                                            <th style={{ padding: '6px 12px' }}>Package Weight</th>
                                            <th style={{ padding: '6px 12px' }}>Price</th>
                                            <th style={{ padding: '6px 12px' }}>Discount</th>
                                            <th style={{ padding: '6px 12px' }}>Stock</th>
                                            <th style={{ padding: '6px 12px' }}>Variant Badge</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {packageSizes.map((ps, idx) => (
                                            <tr key={idx}>
                                                <td style={{ fontWeight: 700, padding: '8px 12px' }}>
                                                    {ps.size_number} {ps.size_unit}
                                                </td>
                                                <td style={{ fontWeight: 800, color: 'var(--admin-primary)', padding: '8px 12px' }}>
                                                    ₹{ps.variant_price}
                                                </td>
                                                <td style={{ padding: '8px 12px', color: 'var(--admin-text-muted)' }}>
                                                    {ps.discount || 'Standard'}
                                                </td>
                                                <td style={{ padding: '8px 12px' }}>
                                                    <span style={{ fontWeight: 600, color: ps.stock > 0 ? 'var(--admin-success-text)' : 'var(--admin-danger-text)' }}>
                                                        {ps.stock !== undefined ? `${ps.stock} units` : 'In Stock'}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '8px 12px' }}>
                                                    {getBadgeLabel(ps.badge) ? (
                                                        <span style={{ fontSize: '0.68rem', background: 'rgba(59, 130, 246, 0.1)', color: '#2563eb', padding: '1px 6px', borderRadius: '4px', fontWeight: 600 }}>
                                                            {getBadgeLabel(ps.badge)}
                                                        </span>
                                                    ) : '—'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* Product Description */}
                    {product.description && (
                        <div>
                            <h4 style={{ fontSize: '0.84rem', fontWeight: 800, color: 'var(--admin-text-main)', margin: '0 0 6px 0' }}>
                                Product Description & Details
                            </h4>
                            <div 
                                style={{
                                    padding: '12px 14px',
                                    background: 'var(--admin-surface-subtle)',
                                    border: '1px solid var(--admin-border-color)',
                                    borderRadius: 'var(--admin-radius-md)',
                                    fontSize: '0.8rem',
                                    lineHeight: '1.6',
                                    color: 'var(--admin-text-secondary)',
                                    maxHeight: '140px',
                                    overflowY: 'auto'
                                }}
                                dangerouslySetInnerHTML={{ __html: sanitizeHtml(product.description) }}
                            />
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="admin-modal-footer" style={{ padding: '12px 20px', background: 'var(--admin-surface-subtle)' }}>
                    <button 
                        type="button" 
                        className="admin-btn admin-btn-secondary" 
                        onClick={onClose}
                    >
                        Close
                    </button>

                    <button 
                        type="button" 
                        className="admin-btn admin-btn-primary"
                        onClick={() => {
                            onClose();
                            if (onEdit) onEdit(product);
                        }}
                    >
                        <Pencil size={13} />
                        <span>Edit Product</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
