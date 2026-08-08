import React from 'react';
import { STATUS_CONFIG, PAYMENT_STATUS_CONFIG } from '../constants/orderStatuses';

export function StatusBadge({ status }) {
    const config = STATUS_CONFIG[status] || {
        label: status,
        bg: 'rgba(100, 116, 139, 0.1)',
        color: '#475569',
        borderColor: 'rgba(100, 116, 139, 0.2)',
        dotColor: '#64748b'
    };

    return (
        <span 
            className="admin-badge"
            style={{
                backgroundColor: config.bg,
                color: config.color,
                borderColor: config.borderColor
            }}
        >
            <span 
                className="admin-badge-dot" 
                style={{ backgroundColor: config.dotColor }}
            />
            {config.label}
        </span>
    );
}

export function PaymentStatusBadge({ status }) {
    const config = PAYMENT_STATUS_CONFIG[status] || {
        label: status,
        bg: 'rgba(100, 116, 139, 0.1)',
        color: '#475569'
    };

    return (
        <span 
            className="admin-badge"
            style={{
                backgroundColor: config.bg,
                color: config.color,
                padding: '3px 8px',
                fontSize: '0.725rem'
            }}
        >
            {config.label}
        </span>
    );
}
