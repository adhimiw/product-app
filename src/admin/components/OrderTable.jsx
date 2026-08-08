import React from 'react';
import { StatusBadge, PaymentStatusBadge } from './StatusBadge';

export default function OrderTable({ orders = [], onUpdateStatusClick, isLoading = false }) {
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
        }).format(amount);
    };

    if (isLoading) {
        return (
            <div className="admin-empty-state">
                <div className="admin-empty-icon">⏳</div>
                <p>Loading orders data...</p>
            </div>
        );
    }

    if (orders.length === 0) {
        return (
            <div className="admin-empty-state">
                <div className="admin-empty-icon">📦</div>
                <p>No orders found matching your criteria.</p>
            </div>
        );
    }

    return (
        <div className="admin-table-responsive">
            <table className="admin-table">
                <thead>
                    <tr>
                        <th>Order ID</th>
                        <th>Customer</th>
                        <th>Date</th>
                        <th>Total Amount</th>
                        <th>Payment</th>
                        <th>Order Status</th>
                        <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {orders.map(order => (
                        <tr key={order.id}>
                            <td>
                                <span className="admin-order-id">{order.id}</span>
                            </td>
                            <td>
                                <div className="admin-customer-cell">
                                    <span className="admin-customer-name">{order.customer.name}</span>
                                    <span className="admin-customer-email">{order.customer.email}</span>
                                </div>
                            </td>
                            <td>
                                <span style={{ fontSize: '0.825rem', color: 'var(--color-text-muted)' }}>
                                    {formatDate(order.createdAt)}
                                </span>
                            </td>
                            <td>
                                <span className="admin-amount">{formatCurrency(order.totalAmount)}</span>
                            </td>
                            <td>
                                <PaymentStatusBadge status={order.paymentStatus} />
                            </td>
                            <td>
                                <StatusBadge status={order.orderStatus} />
                            </td>
                            <td style={{ textAlign: 'right' }}>
                                <button
                                    className="admin-action-btn"
                                    onClick={() => onUpdateStatusClick(order)}
                                >
                                    Update Status
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
