import React from 'react';
import { StatusBadge, PaymentStatusBadge } from './StatusBadge';

export default function OrderTable({ 
    orders = [], 
    isLoading = false,
    onViewOrderClick,
    onUpdateStatusClick, 
    onDeleteOrderClick 
}) {
    const formatDate = (dateString) => {
        try {
            const d = new Date(dateString);
            return d.toLocaleDateString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
            });
        } catch {
            return dateString;
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount || 0);
    };

    if (isLoading) {
        return (
            <div className="admin-table-loading-wrapper" style={{ padding: '60px 0', textAlign: 'center' }}>
                <div className="admin-circle-spinner">
                    <svg viewBox="0 0 50 50" className="admin-spinner-svg">
                        <circle
                            className="admin-spinner-path"
                            cx="25"
                            cy="25"
                            r="20"
                            fill="none"
                            strokeWidth="4"
                        />
                    </svg>
                </div>
                <span className="admin-loading-label" style={{ marginTop: '12px', display: 'block', color: '#64748b', fontWeight: 600 }}>
                    Loading orders...
                </span>
            </div>
        );
    }

    if (orders.length === 0) {
        return (
            <div className="admin-empty-state" style={{ padding: '60px 20px', textAlign: 'center' }}>
                <div className="admin-empty-icon" style={{ fontSize: '3rem', marginBottom: '12px' }}>📦</div>
                <p style={{ color: '#64748b', fontSize: '1rem', fontWeight: 600 }}>No orders found matching your criteria.</p>
            </div>
        );
    }

    return (
        <div className="admin-table-responsive">
            <table className="admin-table">
                <thead>
                    <tr>
                        <th style={{ paddingLeft: '16px' }}>Order ID</th>
                        <th>Customer</th>
                        <th>Date</th>
                        <th>Total Amount</th>
                        <th>Payment</th>
                        <th>Order Status</th>
                        <th style={{ textAlign: 'center', paddingRight: '16px' }}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {orders.map(order => (
                        <tr key={order.id || order.rawId}>
                            <td style={{ paddingLeft: '16px' }}>
                                <span style={{ 
                                    fontFamily: 'monospace', 
                                    fontWeight: 700, 
                                    fontSize: '0.85rem',
                                    color: '#0f172a',
                                    background: '#f1f5f9',
                                    padding: '4px 8px',
                                    borderRadius: '6px',
                                    border: '1px solid #e2e8f0',
                                    display: 'inline-block'
                                }}>
                                    {order.id}
                                </span>
                            </td>
                            <td>
                                <div className="admin-customer-cell" style={{ display: 'flex', flexDirection: 'column' }}>
                                    <span style={{ fontWeight: 700, color: '#1e293b', fontSize: '0.9rem' }}>
                                        {order.customer?.name || 'Valued Customer'}
                                    </span>
                                    <span style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>
                                        {order.customer?.email || 'N/A'}
                                    </span>
                                </div>
                            </td>
                            <td>
                                <span style={{ fontSize: '0.825rem', color: '#64748b', fontWeight: 600 }}>
                                    {formatDate(order.createdAt)}
                                </span>
                            </td>
                            <td>
                                <span style={{ fontWeight: 800, color: '#1e3a29', fontSize: '0.95rem' }}>
                                    {formatCurrency(order.totalAmount)}
                                </span>
                            </td>
                            <td>
                                <PaymentStatusBadge status={order.paymentStatus} />
                            </td>
                            <td>
                                <StatusBadge status={order.orderStatus} />
                            </td>
                            <td style={{ textAlign: 'center', paddingRight: '16px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                    {/* View Product Details Button */}
                                    <button
                                        type="button"
                                        onClick={() => onViewOrderClick && onViewOrderClick(order)}
                                        title="View Product & Order Details"
                                        style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '5px',
                                            background: '#f8fafc',
                                            color: '#334155',
                                            border: '1px solid #cbd5e1',
                                            borderRadius: '8px',
                                            padding: '6px 12px',
                                            fontSize: '0.8rem',
                                            fontWeight: 700,
                                            cursor: 'pointer',
                                            transition: 'all 0.15s ease'
                                        }}
                                        onMouseEnter={(e) => { e.currentTarget.style.background = '#e2e8f0'; }}
                                        onMouseLeave={(e) => { e.currentTarget.style.background = '#f8fafc'; }}
                                    >
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                            <circle cx="12" cy="12" r="3"></circle>
                                        </svg>
                                        View
                                    </button>

                                    {/* Edit Status Button */}
                                    <button
                                        type="button"
                                        onClick={() => onUpdateStatusClick && onUpdateStatusClick(order)}
                                        title="Update Status"
                                        style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '5px',
                                            background: '#1e3a29',
                                            color: '#ffffff',
                                            border: '1px solid #1e3a29',
                                            borderRadius: '8px',
                                            padding: '6px 12px',
                                            fontSize: '0.8rem',
                                            fontWeight: 700,
                                            cursor: 'pointer',
                                            transition: 'all 0.15s ease'
                                        }}
                                        onMouseEnter={(e) => { e.currentTarget.style.background = '#14281c'; }}
                                        onMouseLeave={(e) => { e.currentTarget.style.background = '#1e3a29'; }}
                                    >
                                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                        </svg>
                                        Status
                                    </button>

                                    {/* Delete Button */}
                                    <button
                                        type="button"
                                        onClick={() => onDeleteOrderClick && onDeleteOrderClick(order)}
                                        title="Delete Order"
                                        style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '5px',
                                            background: '#fef2f2',
                                            color: '#dc2626',
                                            border: '1px solid #fecaca',
                                            borderRadius: '8px',
                                            padding: '6px 12px',
                                            fontSize: '0.8rem',
                                            fontWeight: 700,
                                            cursor: 'pointer',
                                            transition: 'all 0.15s ease'
                                        }}
                                        onMouseEnter={(e) => { e.currentTarget.style.background = '#fee2e2'; e.currentTarget.style.borderColor = '#fca5a5'; }}
                                        onMouseLeave={(e) => { e.currentTarget.style.background = '#fef2f2'; e.currentTarget.style.borderColor = '#fecaca'; }}
                                    >
                                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="3 6 5 6 21 6"></polyline>
                                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                        </svg>
                                        Delete
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
