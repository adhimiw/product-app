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
    Flame,
    CheckCircle2, 
    Clock,
    HeartPulse,
    Leaf,
    Calendar,
    FileText,
    Info
} from 'lucide-react';
import { getBadgeLabel } from '../services/adminProductService';

export default function ProductDetailsModal({ product, onClose, onEdit }) {
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);

    if (!product) return null;

    // Genuine images array from product table
    const rawImages = Array.isArray(product.images) ? product.images.filter(Boolean) : [];
    const images = rawImages.length > 0
        ? rawImages
        : ['/assets/images/categories/organic-food-ingredients.png'];

    const currentImage = images[selectedImageIndex] || images[0];
    const packageSizes = Array.isArray(product.package_sizes) ? product.package_sizes : [];
    const tags = Array.isArray(product.tags) ? product.tags : [];
    
    // Product-level badge: 1 = New Launched, 2 = Popular
    const badgeVal = Number(product.product_badge ?? product.badge ?? 0);

    // Calculate dynamic price range from variants or fallback to actual price
    const hasSizes = packageSizes.length > 0;
    const variantPrices = packageSizes.map(s => Number(s.variant_price) || 0).filter(p => p > 0);
    const displayPriceRange = variantPrices.length > 0
        ? (variantPrices.length === 1
            ? `₹${variantPrices[0]}`
            : `₹${Math.min(...variantPrices)} - ₹${Math.max(...variantPrices)}`)
        : (product.actual_price ? `₹${product.actual_price}` : '₹0');

    // Clean text helper to strip html for empty check
    const hasContent = (str) => {
        if (!str) return false;
        const textOnly = str.replace(/<[^>]*>/g, '').trim();
        return textOnly.length > 0;
    };

    const formatDate = (isoString) => {
        if (!isoString) return null;
        try {
            return new Date(isoString).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
            });
        } catch {
            return null;
        }
    };

    return (
        <div className="admin-modal-backdrop" onClick={onClose} style={{ zIndex: 9999 }}>
            <div 
                className="admin-modal-card pdm-card" 
                onClick={(e) => e.stopPropagation()}
                style={{ maxWidth: '880px', width: '94vw', maxHeight: '90vh' }}
            >
                {/* 1. Modal Header */}
                <div className="admin-modal-header" style={{ padding: '16px 24px', background: 'var(--admin-surface-subtle)', borderBottom: '1px solid var(--admin-border-color)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0, flex: 1 }}>
                        <div style={{
                            width: '38px',
                            height: '38px',
                            borderRadius: '10px',
                            background: 'rgba(16, 185, 129, 0.14)',
                            color: 'var(--admin-primary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                        }}>
                            <Package size={20} />
                        </div>
                        <div style={{ minWidth: 0, flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                <h3 className="admin-modal-title" style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: 'var(--admin-text-main)' }}>
                                    {product.name}
                                </h3>

                                {/* Status Badge */}
                                <span className={`admin-badge ${Number(product.status) === 1 ? 'admin-badge-success' : 'admin-badge-neutral'}`} style={{ fontSize: '0.7rem', padding: '2px 8px' }}>
                                    <span className="admin-badge-dot" />
                                    {Number(product.status) === 1 ? 'Active' : 'Inactive'}
                                </span>

                                {/* Product Badge Tag (1 = New Launched, 2 = Popular) */}
                                {badgeVal === 1 && (
                                    <span style={{
                                        fontSize: '0.7rem',
                                        fontWeight: 700,
                                        background: 'rgba(245, 158, 11, 0.12)',
                                        color: '#d97706',
                                        border: '1px solid rgba(245, 158, 11, 0.35)',
                                        padding: '2px 8px',
                                        borderRadius: '6px',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '4px'
                                    }}>
                                        <Sparkles size={12} /> New Launched
                                    </span>
                                )}

                                {badgeVal === 2 && (
                                    <span style={{
                                        fontSize: '0.7rem',
                                        fontWeight: 700,
                                        background: 'rgba(16, 185, 129, 0.12)',
                                        color: '#059669',
                                        border: '1px solid rgba(16, 185, 129, 0.35)',
                                        padding: '2px 8px',
                                        borderRadius: '6px',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '4px'
                                    }}>
                                        <Flame size={12} /> Popular
                                    </span>
                                )}

                                {/* Category Pill */}
                                {product.category && (
                                    <span className="admin-category-pill" style={{ fontSize: '0.7rem', padding: '2px 8px' }}>
                                        {product.category}
                                    </span>
                                )}
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '3px', fontSize: '0.74rem', color: 'var(--admin-text-muted)' }}>
                                <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>ID: #{product.id}</span>
                                <span>•</span>
                                <span>SKU: {product.slug || `prod-${product.id}`}</span>
                                {product.created_at && (
                                    <>
                                        <span>•</span>
                                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                            <Calendar size={12} /> Added {formatDate(product.created_at)}
                                        </span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {/* Storefront Link */}
                        <a 
                            href={`/product-details/${product.slug || product.id}`} 
                            target="_blank" 
                            rel="noreferrer"
                            className="admin-btn admin-btn-secondary"
                            style={{ fontSize: '0.78rem', padding: '6px 12px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                            title="Preview product on live storefront"
                        >
                            <ExternalLink size={13} />
                            <span>Storefront</span>
                        </a>

                        <button 
                            type="button"
                            className="admin-modal-close" 
                            onClick={onClose}
                            title="Close modal"
                            style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                            <X size={16} />
                        </button>
                    </div>
                </div>

                {/* 2. Modal Body */}
                <div className="admin-modal-body" style={{ padding: '22px 24px', gap: '20px', overflowY: 'auto' }}>
                    
                    {/* Top Overview: Genuine Media Gallery + Accurate Specs Grid */}
                    <div className="pdm-hero-grid">
                        {/* Gallery Showcase */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <div className="pdm-main-image-box">
                                <img
                                    src={currentImage}
                                    alt={product.name}
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = '/assets/images/categories/organic-food-ingredients.png';
                                    }}
                                />
                                {images.length > 1 && (
                                    <span style={{
                                        position: 'absolute',
                                        bottom: '8px',
                                        right: '8px',
                                        background: 'rgba(0, 0, 0, 0.65)',
                                        color: '#FFFFFF',
                                        fontSize: '0.68rem',
                                        fontWeight: 700,
                                        padding: '2px 7px',
                                        borderRadius: '12px'
                                    }}>
                                        {selectedImageIndex + 1} / {images.length}
                                    </span>
                                )}
                            </div>

                            {/* Multi-image interactive thumbnail strip */}
                            {images.length > 1 && (
                                <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '2px' }}>
                                    {images.map((img, idx) => (
                                        <button
                                            key={idx}
                                            type="button"
                                            onClick={() => setSelectedImageIndex(idx)}
                                            style={{
                                                width: '44px',
                                                height: '44px',
                                                borderRadius: '6px',
                                                border: selectedImageIndex === idx ? '2px solid var(--admin-primary)' : '1px solid var(--admin-border-color)',
                                                padding: 0,
                                                background: 'var(--admin-surface-subtle)',
                                                cursor: 'pointer',
                                                overflow: 'hidden',
                                                flexShrink: 0,
                                                boxShadow: selectedImageIndex === idx ? '0 0 0 2px rgba(16, 185, 129, 0.2)' : 'none'
                                            }}
                                            title={`View photo ${idx + 1}`}
                                        >
                                            <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Accurate Metrics Grid */}
                        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '14px' }}>
                            <div className="pdm-metrics-grid">
                                {/* Total Units / Stock */}
                                <div className="pdm-metric-tile">
                                    <div className="pdm-metric-label">
                                        <Boxes size={13} style={{ color: 'var(--admin-primary)' }} /> Total Inventory
                                    </div>
                                    <div className="pdm-metric-value" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <span style={{
                                            width: '8px',
                                            height: '8px',
                                            borderRadius: '50%',
                                            background: (product.stock !== null && product.stock > 10) ? '#10B981' : ((product.stock !== null && product.stock > 0) ? '#F59E0B' : '#EF4444')
                                        }} />
                                        <span>
                                            {product.stock !== null && product.stock !== undefined ? `${product.stock} units` : 'Unlimited'}
                                        </span>
                                    </div>
                                    <span style={{ fontSize: '0.72rem', color: 'var(--admin-text-muted)', marginTop: '2px' }}>
                                        {(product.stock !== null && product.stock > 10) ? 'Available in stock' : ((product.stock !== null && product.stock > 0) ? 'Low inventory reserve' : 'Out of stock')}
                                    </span>
                                </div>

                                {/* Category */}
                                <div className="pdm-metric-tile">
                                    <div className="pdm-metric-label">
                                        <Layers size={13} style={{ color: '#3B82F6' }} /> Category
                                    </div>
                                    <div className="pdm-metric-value">
                                        {product.category || 'Organic Sweeteners & Foods'}
                                    </div>
                                    <span style={{ fontSize: '0.72rem', color: 'var(--admin-text-muted)', marginTop: '2px' }}>
                                        Catalog Classification
                                    </span>
                                </div>

                                {/* Price / Price Range */}
                                <div className="pdm-metric-tile">
                                    <div className="pdm-metric-label">
                                        <Tag size={13} style={{ color: '#10B981' }} /> {hasSizes && packageSizes.length > 1 ? 'Price Range' : 'Selling Price'}
                                    </div>
                                    <div className="pdm-metric-value" style={{ color: 'var(--admin-primary)' }}>
                                        {displayPriceRange}
                                    </div>
                                    <span style={{ fontSize: '0.72rem', color: 'var(--admin-text-muted)', marginTop: '2px' }}>
                                        {product.actual_price ? `Base MRP: ₹${product.actual_price}` : `${packageSizes.length} package size options`}
                                    </span>
                                </div>

                                {/* Discount */}
                                <div className="pdm-metric-tile">
                                    <div className="pdm-metric-label">
                                        <Percent size={13} style={{ color: '#F59E0B' }} /> Active Discount
                                    </div>
                                    <div className="pdm-metric-value">
                                        {product.discount || 'Standard Pricing'}
                                    </div>
                                    <span style={{ fontSize: '0.72rem', color: 'var(--admin-text-muted)', marginTop: '2px' }}>
                                        {product.discount_value ? `${product.discount_type === 2 ? `₹${product.discount_value} flat` : `${product.discount_value}% percentage`} reduction` : 'No store campaign active'}
                                    </span>
                                </div>
                            </div>

                            {/* Tags Array Chips */}
                            {tags.length > 0 && (
                                <div style={{ background: 'var(--admin-surface-subtle)', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--admin-border-color)' }}>
                                    <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--admin-text-muted)', marginBottom: '6px' }}>
                                        Product Search Tags ({tags.length})
                                    </div>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                        {tags.map((t, idx) => (
                                            <span key={idx} className="admin-product-tag-chip" style={{ fontSize: '0.72rem', padding: '3px 8px' }}>
                                                #{t}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Package Sizes & Weight Variants Table */}
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                            <h4 style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--admin-text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Boxes size={15} style={{ color: 'var(--admin-primary)' }} />
                                Package Sizes & Weight Variants ({packageSizes.length})
                            </h4>
                        </div>

                        {packageSizes.length === 0 ? (
                            <div style={{ padding: '14px', background: 'var(--admin-surface-subtle)', border: '1px solid var(--admin-border-color)', borderRadius: '8px', fontSize: '0.82rem', color: 'var(--admin-text-muted)' }}>
                                Single unit packaging configured with base stock of {product.stock || 0} units.
                            </div>
                        ) : (
                            <div className="admin-table-responsive" style={{ border: '1px solid var(--admin-border-color)', borderRadius: '10px', overflow: 'hidden' }}>
                                <table className="admin-table">
                                    <thead>
                                        <tr>
                                            <th style={{ padding: '8px 14px' }}>Package Weight</th>
                                            <th style={{ padding: '8px 14px' }}>Selling Price</th>
                                            <th style={{ padding: '8px 14px' }}>Discount</th>
                                            <th style={{ padding: '8px 14px' }}>Stock Units</th>
                                            <th style={{ padding: '8px 14px' }}>Variant Badge</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {packageSizes.map((ps, idx) => {
                                            const vBadge = getBadgeLabel(ps.variant_badge || ps.badge);
                                            return (
                                                <tr key={idx}>
                                                    <td style={{ fontWeight: 700, padding: '10px 14px', color: 'var(--admin-text-main)' }}>
                                                        {ps.size_number} {ps.size_unit}
                                                    </td>
                                                    <td style={{ fontWeight: 800, color: 'var(--admin-primary)', padding: '10px 14px', fontSize: '0.9rem' }}>
                                                        ₹{ps.variant_price}
                                                    </td>
                                                    <td style={{ padding: '10px 14px', color: ps.discount ? 'var(--admin-success-text)' : 'var(--admin-text-muted)', fontWeight: 600 }}>
                                                        {ps.discount || 'Standard'}
                                                    </td>
                                                    <td style={{ padding: '10px 14px' }}>
                                                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                                            <span style={{
                                                                width: '6px',
                                                                height: '6px',
                                                                borderRadius: '50%',
                                                                background: Number(ps.stock) > 0 ? '#10B981' : '#EF4444'
                                                            }} />
                                                            <span style={{ fontWeight: 700, color: Number(ps.stock) > 0 ? 'var(--admin-text-main)' : 'var(--admin-danger-text)' }}>
                                                                {ps.stock !== undefined && ps.stock !== null ? `${ps.stock} units` : 'In Stock'}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td style={{ padding: '10px 14px' }}>
                                                        {vBadge ? (
                                                            <span style={{
                                                                fontSize: '0.7rem',
                                                                background: 'rgba(59, 130, 246, 0.1)',
                                                                color: '#2563eb',
                                                                border: '1px solid rgba(59, 130, 246, 0.25)',
                                                                padding: '2px 8px',
                                                                borderRadius: '5px',
                                                                fontWeight: 700
                                                            }}>
                                                                {vBadge}
                                                            </span>
                                                        ) : (
                                                            <span style={{ color: 'var(--admin-text-faint)' }}>—</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* Authentic Product Content Sections (Only displayed if data exists) */}
                    {hasContent(product.description) && (
                        <div className="pdm-info-card">
                            <div className="pdm-info-card-header">
                                <FileText size={15} style={{ color: 'var(--admin-primary)' }} />
                                <span>Product Description</span>
                            </div>
                            <div 
                                style={{
                                    fontSize: '0.84rem',
                                    lineHeight: '1.65',
                                    color: 'var(--admin-text-secondary)'
                                }}
                                dangerouslySetInnerHTML={{ __html: product.description }}
                            />
                        </div>
                    )}

                    {/* How to Use / Preparation Rituals */}
                    {hasContent(product.how_to_use) && (
                        <div className="pdm-info-card">
                            <div className="pdm-info-card-header">
                                <Sparkles size={15} style={{ color: '#F59E0B' }} />
                                <span>How to Use & Preparation Ritual</span>
                            </div>
                            <div 
                                style={{
                                    fontSize: '0.84rem',
                                    lineHeight: '1.65',
                                    color: 'var(--admin-text-secondary)'
                                }}
                                dangerouslySetInnerHTML={{ __html: product.how_to_use }}
                            />
                        </div>
                    )}

                    {/* Health Benefits */}
                    {hasContent(product.benefits) && (
                        <div className="pdm-info-card">
                            <div className="pdm-info-card-header">
                                <HeartPulse size={15} style={{ color: '#EC4899' }} />
                                <span>Health & Wellness Benefits</span>
                            </div>
                            <div 
                                style={{
                                    fontSize: '0.84rem',
                                    lineHeight: '1.65',
                                    color: 'var(--admin-text-secondary)'
                                }}
                                dangerouslySetInnerHTML={{ __html: product.benefits }}
                            />
                        </div>
                    )}

                    {/* Natural Ingredients */}
                    {hasContent(product.ingredients) && (
                        <div className="pdm-info-card">
                            <div className="pdm-info-card-header">
                                <Leaf size={15} style={{ color: 'var(--admin-primary)' }} />
                                <span>Pure & Natural Ingredients</span>
                            </div>
                            <div 
                                style={{
                                    fontSize: '0.84rem',
                                    lineHeight: '1.65',
                                    color: 'var(--admin-text-secondary)'
                                }}
                                dangerouslySetInnerHTML={{ __html: product.ingredients }}
                            />
                        </div>
                    )}
                </div>

                {/* 3. Modal Footer Actions */}
                <div className="admin-modal-footer" style={{ padding: '14px 24px', background: 'var(--admin-surface-subtle)', borderTop: '1px solid var(--admin-border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <button 
                        type="button" 
                        className="admin-btn admin-btn-secondary" 
                        onClick={onClose}
                    >
                        Close
                    </button>

                    <div style={{ display: 'flex', gap: '10px' }}>
                        <a
                            href={`/product-details/${product.slug || product.id}`}
                            target="_blank"
                            rel="noreferrer"
                            className="admin-btn admin-btn-secondary"
                            style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                        >
                            <ExternalLink size={14} />
                            <span>View in Store</span>
                        </a>

                        <button 
                            type="button" 
                            className="admin-btn admin-btn-primary"
                            onClick={() => {
                                onClose();
                                if (onEdit) onEdit(product);
                            }}
                        >
                            <Pencil size={14} />
                            <span>Edit Product</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
