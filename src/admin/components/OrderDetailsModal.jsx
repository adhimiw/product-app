import React from 'react';
import { StatusBadge, PaymentStatusBadge } from './StatusBadge';

export default function OrderDetailsModal({ order, onClose }) {
    if (!order) return null;

    const formatDate = (dateString) => {
        try {
            return new Date(dateString).toLocaleString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            });
        } catch {
            return dateString;
        }
    };

    const formatCurrency = (val) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(val || 0);
    };

    const address = order.address || {};
    const items = order.items || [];

    return (
        <div className="admin-modal-backdrop" onClick={onClose}>
            <div 
                className="admin-modal-card admin-modal-container" 
                onClick={(e) => e.stopPropagation()} 
                style={{ maxWidth: '780px', width: '92%', borderRadius: '18px' }}
            >
                {/* Header */}
                <div className="admin-modal-header" style={{ padding: '18px 24px', background: '#FAFAF9', borderBottom: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ background: '#e0e7ff', color: '#4338ca', padding: '8px', borderRadius: '10px', display: 'flex' }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                <circle cx="12" cy="12" r="3"></circle>
                            </svg>
                        </div>
                        <div>
                            <h3 className="admin-modal-title" style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>
                                Order Details
                            </h3>
                            <span style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>
                                Order <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#334155' }}>#{order.id}</span> • {formatDate(order.createdAt)}
                            </span>
                        </div>
                    </div>
                    <button 
                        className="admin-modal-close" 
                        onClick={onClose} 
                        style={{ width: '32px', height: '32px', borderRadius: '8px' }}
                    >
                        ✕
                    </button>
                </div>

                {/* Body */}
                <div className="admin-modal-dialog-body" style={{ padding: '24px', overflowY: 'auto', maxHeight: '72vh', gap: '20px' }}>
                    {/* Status Overview Banner Cards */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '14px' }}>
                        <div style={{ background: '#f8fafc', padding: '14px 18px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                            <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 800, letterSpacing: '0.05em', display: 'block', marginBottom: '8px' }}>
                                Order Status
                            </span>
                            <StatusBadge status={order.orderStatus} />
                        </div>
                        <div style={{ background: '#f8fafc', padding: '14px 18px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                            <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 800, letterSpacing: '0.05em', display: 'block', marginBottom: '8px' }}>
                                Payment Status
                            </span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <PaymentStatusBadge status={order.paymentStatus} />
                                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#475569', background: '#e2e8f0', padding: '2px 8px', borderRadius: '6px' }}>
                                    {order.paymentMethod || 'COD'}
                                </span>
                            </div>
                        </div>
                        <div style={{ background: '#f8fafc', padding: '14px 18px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                            <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 800, letterSpacing: '0.05em', display: 'block', marginBottom: '6px' }}>
                                Total Amount
                            </span>
                            <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1e3a29' }}>
                                {formatCurrency(order.totalAmount)}
                            </span>
                        </div>
                    </div>

                    {/* Customer & Address Details */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
                        {/* Customer Info Card */}
                        <div style={{ background: '#ffffff', padding: '18px', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                            <h4 style={{ margin: '0 0 14px 0', fontSize: '0.92rem', color: '#0f172a', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                    <circle cx="12" cy="7" r="4"></circle>
                                </svg>
                                Customer Information
                            </h4>
                            <div style={{ fontSize: '0.86rem', color: '#334155', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                <div><strong style={{ color: '#64748b' }}>Name:</strong> <span style={{ fontWeight: 700, color: '#0f172a' }}>{order.customer?.name || 'Valued Customer'}</span></div>
                                <div><strong style={{ color: '#64748b' }}>Email:</strong> {order.customer?.email || 'N/A'}</div>
                                {order.customer?.phone && (
                                    <div><strong style={{ color: '#64748b' }}>Phone:</strong> {order.customer.phone}</div>
                                )}
                            </div>
                        </div>

                        {/* Delivery Address Card */}
                        <div style={{ background: '#ffffff', padding: '18px', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                            <h4 style={{ margin: '0 0 14px 0', fontSize: '0.92rem', color: '#0f172a', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                                    <polyline points="9 22 9 12 15 12 15 22"></polyline>
                                </svg>
                                Delivery Address
                            </h4>
                            {address.address_line1 || address.city ? (
                                <div style={{ fontSize: '0.86rem', color: '#334155', lineHeight: '1.5', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    <span style={{ fontWeight: 700, color: '#0f172a' }}>{address.full_name || order.customer?.name}</span>
                                    <span>{address.address_line1}</span>
                                    {address.address_line2 && <span>{address.address_line2}</span>}
                                    <span>{address.city}, {address.state} - {address.pincode}</span>
                                    {address.phone_number && <span style={{ color: '#64748b', fontSize: '0.82rem', marginTop: '4px' }}>📞 {address.phone_number}</span>}
                                </div>
                            ) : (
                                <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: 0 }}>No saved delivery address details recorded.</p>
                            )}
                        </div>
                    </div>

                    {/* Order Products List */}
                    <div>
                        <h4 style={{ margin: '0 0 12px 0', fontSize: '0.92rem', color: '#0f172a', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                            </svg>
                            Purchased Products ({items.length})
                        </h4>
                        <div className="admin-table-responsive" style={{ border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
                            <table className="admin-table" style={{ margin: 0 }}>
                                <thead>
                                    <tr>
                                        <th style={{ paddingLeft: '16px' }}>Item Details</th>
                                        <th>Package</th>
                                        <th>Price</th>
                                        <th>Qty</th>
                                        <th style={{ textAlign: 'right', paddingRight: '16px' }}>Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" style={{ textAlign: 'center', color: '#94a3b8', padding: '20px' }}>
                                                No item details recorded for this order.
                                            </td>
                                        </tr>
                                    ) : (
                                        items.map((item, idx) => (
                                            <tr key={idx}>
                                                <td style={{ paddingLeft: '16px' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                        <img 
                                                            src="/assets/images/300g_amutham/amutham-01.jpg" 
                                                            alt={item.product_name} 
                                                            style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover', border: '1px solid #e2e8f0' }} 
                                                        />
                                                        <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.88rem' }}>{item.product_name}</span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span style={{ fontSize: '0.78rem', background: '#f1f5f9', color: '#475569', padding: '3px 8px', borderRadius: '6px', fontWeight: 700 }}>
                                                        {item.package_size || '300g'}
                                                    </span>
                                                </td>
                                                <td style={{ fontSize: '0.85rem', color: '#475569' }}>{formatCurrency(item.unit_price)}</td>
                                                <td style={{ fontWeight: 800, fontSize: '0.9rem', color: '#0f172a' }}>x{item.quantity}</td>
                                                <td style={{ textAlign: 'right', fontWeight: 800, color: '#1e3a29', paddingRight: '16px', fontSize: '0.92rem' }}>
                                                    {formatCurrency(item.total_price)}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Financial Summary */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>
                        <div style={{ width: '290px', background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.85rem', color: '#64748b' }}>
                                <span>Items Subtotal:</span>
                                <span style={{ fontWeight: 600, color: '#334155' }}>{formatCurrency(order.subtotal || order.totalAmount)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.85rem', color: '#64748b' }}>
                                <span>Shipping Fee:</span>
                                <span style={{ fontWeight: 600, color: order.shippingFee > 0 ? '#334155' : '#16a34a' }}>
                                    {order.shippingFee > 0 ? formatCurrency(order.shippingFee) : 'FREE'}
                                </span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '10px', borderTop: '1px solid #cbd5e1', fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>
                                <span>Grand Total:</span>
                                <span style={{ color: '#1e3a29' }}>{formatCurrency(order.totalAmount)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="admin-modal-footer" style={{ padding: '14px 24px', background: '#FAFAF9', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end' }}>
                    <button 
                        type="button" 
                        className="admin-btn admin-btn-secondary" 
                        onClick={onClose}
                        style={{ padding: '8px 20px', borderRadius: '8px', fontWeight: 700 }}
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
