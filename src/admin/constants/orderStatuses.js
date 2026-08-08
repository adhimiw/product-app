export const ORDER_STATUSES = {
    PENDING: 'Pending',
    CONFIRMED: 'Confirmed',
    PROCESSING: 'Processing',
    SHIPPED: 'Shipped',
    DELIVERED: 'Delivered',
    CANCELLED: 'Cancelled'
};

export const PAYMENT_STATUSES = {
    PAID: 'Paid',
    PENDING: 'Pending',
    FAILED: 'Failed',
    REFUNDED: 'Refunded'
};

export const STATUS_CONFIG = {
    [ORDER_STATUSES.PENDING]: {
        label: 'Pending',
        bg: 'rgba(234, 179, 8, 0.12)',
        color: '#854d0e',
        borderColor: 'rgba(202, 138, 4, 0.25)',
        dotColor: '#ca8a04',
        description: 'Order received and awaiting confirmation'
    },
    [ORDER_STATUSES.CONFIRMED]: {
        label: 'Confirmed',
        bg: 'rgba(59, 130, 246, 0.12)',
        color: '#1e40af',
        borderColor: 'rgba(37, 99, 235, 0.25)',
        dotColor: '#2563eb',
        description: 'Order confirmed and queued for fulfillment'
    },
    [ORDER_STATUSES.PROCESSING]: {
        label: 'Processing',
        bg: 'rgba(168, 85, 247, 0.12)',
        color: '#6b21a8',
        borderColor: 'rgba(147, 51, 234, 0.25)',
        dotColor: '#9333ea',
        description: 'Items are being packed and prepared for shipment'
    },
    [ORDER_STATUSES.SHIPPED]: {
        label: 'Shipped',
        bg: 'rgba(14, 165, 233, 0.12)',
        color: '#0369a1',
        borderColor: 'rgba(2, 132, 199, 0.25)',
        dotColor: '#0284c7',
        description: 'Order dispatched with courier service'
    },
    [ORDER_STATUSES.DELIVERED]: {
        label: 'Delivered',
        bg: 'rgba(34, 197, 94, 0.12)',
        color: '#14532d',
        borderColor: 'rgba(22, 163, 74, 0.25)',
        dotColor: '#16a34a',
        description: 'Order successfully delivered to customer'
    },
    [ORDER_STATUSES.CANCELLED]: {
        label: 'Cancelled',
        bg: 'rgba(239, 68, 68, 0.12)',
        color: '#991b1b',
        borderColor: 'rgba(220, 38, 38, 0.25)',
        dotColor: '#dc2626',
        description: 'Order was cancelled and stock restored'
    }
};

export const PAYMENT_STATUS_CONFIG = {
    [PAYMENT_STATUSES.PAID]: {
        label: 'Paid',
        bg: 'rgba(34, 197, 94, 0.1)',
        color: '#15803d'
    },
    [PAYMENT_STATUSES.PENDING]: {
        label: 'Pending',
        bg: 'rgba(234, 179, 8, 0.1)',
        color: '#a16207'
    },
    [PAYMENT_STATUSES.FAILED]: {
        label: 'Failed',
        bg: 'rgba(239, 68, 68, 0.1)',
        color: '#b91c1c'
    },
    [PAYMENT_STATUSES.REFUNDED]: {
        label: 'Refunded',
        bg: 'rgba(100, 116, 139, 0.1)',
        color: '#475569'
    }
};
