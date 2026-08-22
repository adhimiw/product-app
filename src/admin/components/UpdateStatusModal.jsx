import React, { useState } from 'react';
import { ORDER_STATUSES, STATUS_CONFIG } from '../constants/orderStatuses';
import { StatusBadge } from './StatusBadge';

export default function UpdateStatusModal({ order, onClose, onSave }) {
    const [selectedStatus, setSelectedStatus] = useState(order?.orderStatus || ORDER_STATUSES.PENDING);
    const [note, setNote] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!order) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        await onSave(order.id, selectedStatus, note);
        setIsSubmitting(false);
    };

    const statusOptions = Object.values(ORDER_STATUSES);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount);
    };

    return (
        <div className="admin-modal-backdrop" onClick={onClose}>
            <div className="admin-modal-card" onClick={e => e.stopPropagation()}>
                <div className="admin-modal-header">
                    <div>
                        <h3 className="admin-modal-title">Update Order Status</h3>
                        <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontFamily: 'monospace' }}>
                            {order.id}
                        </span>
                    </div>
                    <button className="admin-modal-close" onClick={onClose} aria-label="Close modal">
                        ✕
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="admin-modal-body">
                        {/* Order Quick Summary */}
                        <div className="admin-order-summary-box">
                            <div className="admin-summary-row">
                                <span className="admin-summary-label">Customer:</span>
                                <span className="admin-summary-value">{order.customer.name}</span>
                            </div>
                            <div className="admin-summary-row">
                                <span className="admin-summary-label">Current Status:</span>
                                <StatusBadge status={order.orderStatus} />
                            </div>
                            <div className="admin-summary-row">
                                <span className="admin-summary-label">Total Amount:</span>
                                <span className="admin-summary-value" style={{ color: 'var(--color-primary)' }}>
                                    {formatCurrency(order.totalAmount)}
                                </span>
                            </div>
                            <div className="admin-summary-row" style={{ marginTop: '4px' }}>
                                <span className="admin-summary-label">Items:</span>
                                <span className="admin-summary-value" style={{ fontSize: '0.8rem' }}>
                                    {order.items?.map(i => `${i.product_name || i.name || 'Health Mix'} (x${i.quantity})`).join(', ') || 'Health Mix (x1)'}
                                </span>
                            </div>
                        </div>

                        {/* Status Radio Options Grid */}
                        <div>
                            <label className="admin-label">Select New Order Status</label>
                            <div className="admin-status-select-grid">
                                {statusOptions.map(statusKey => {
                                    const cfg = STATUS_CONFIG[statusKey];
                                    const isSelected = selectedStatus === statusKey;

                                    return (
                                        <div
                                            key={statusKey}
                                            className={`admin-status-option-card ${isSelected ? 'selected' : ''}`}
                                            onClick={() => setSelectedStatus(statusKey)}
                                        >
                                            <input
                                                type="radio"
                                                name="orderStatus"
                                                className="admin-status-option-radio"
                                                checked={isSelected}
                                                onChange={() => setSelectedStatus(statusKey)}
                                            />
                                            <div>
                                                <div style={{ fontWeight: 600, fontSize: '0.85rem', color: isSelected ? 'var(--color-primary)' : 'var(--color-text-main)' }}>
                                                    {cfg.label}
                                                </div>
                                                <div style={{ fontSize: '0.725rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                                                    {cfg.description}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Additional Note Input */}
                        <div>
                            <label className="admin-label">Status Update Note (Optional)</label>
                            <textarea
                                className="admin-textarea"
                                placeholder="Add tracking number, courier details, or reason for status update..."
                                value={note}
                                onChange={e => setNote(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="admin-modal-footer">
                        <button
                            type="button"
                            className="admin-btn admin-btn-secondary"
                            onClick={onClose}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="admin-btn admin-btn-primary"
                            style={{ width: 'auto', padding: '9px 20px' }}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Updating...' : 'Save Status Update'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
