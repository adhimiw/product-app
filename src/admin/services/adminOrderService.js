/**
 * Admin Order Service - 100% Dynamic API Integration
 * Connects with Laravel Backend (http://127.0.0.1:8000/api/admin/orders)
 */

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '/api') + '/admin/orders';
const FALLBACK_USER_ORDERS_URL = (import.meta.env.VITE_API_BASE_URL || '/api') + '/user/orders';

function getHeaders() {
    let token = null;
    try {
        const session = JSON.parse(localStorage.getItem('mangalam_admin_session') || '{}');
        token = session.token || null;
    } catch (e) {
        token = null;
    }

    const headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
}

/**
 * Normalizes backend order models for uniform Admin UI rendering.
 */
export function normalizeOrder(raw) {
    if (!raw) return null;
    const user = raw.user || {};
    const address = raw.address_snapshot || raw.address || {};
    
    const customerName = user.full_name || user.name || address.full_name || raw.customer?.name || 'Valued Customer';
    const customerEmail = user.email || raw.customer?.email || (address.phone_number ? `Phone: ${address.phone_number}` : 'N/A');
    const customerPhone = user.whatsapp_number || user.contact_number || user.phone || address.phone_number || raw.customer?.phone || '';

    // Standardize status casing (e.g. 'pending' -> 'Pending')
    const rawStatus = raw.status || raw.orderStatus || 'Pending';
    const normalizedStatus = rawStatus.charAt(0).toUpperCase() + rawStatus.slice(1).toLowerCase();

    const rawPayment = raw.payment_status || raw.paymentStatus || 'Pending';
    const normalizedPayment = rawPayment.charAt(0).toUpperCase() + rawPayment.slice(1).toLowerCase();

    return {
        id: raw.order_number || (raw.id ? `ORD-${raw.id}` : `ORD-${Date.now()}`),
        rawId: raw.id || raw.order_number,
        order_number: raw.order_number || raw.id,
        createdAt: raw.created_at || raw.createdAt || new Date().toISOString(),
        customer: {
            name: customerName,
            email: customerEmail,
            phone: customerPhone
        },
        user: user,
        address: address,
        totalAmount: Number(raw.total_amount || raw.totalAmount || raw.subtotal || 0),
        subtotal: Number(raw.subtotal || raw.total_amount || 0),
        shippingFee: Number(raw.shipping_fee || raw.shippingFee || 0),
        paymentStatus: normalizedPayment,
        orderStatus: normalizedStatus,
        paymentMethod: raw.payment_method || raw.paymentMethod || 'COD',
        items: (raw.items || []).map(i => ({
            id: i.id || i.product_id,
            product_name: i.product_name || i.name || 'Amutham Health Mix',
            package_size: i.package_size || '300g',
            unit_price: Number(i.unit_price || i.price || 0),
            quantity: Number(i.quantity || 1),
            total_price: Number(i.total_price || (Number(i.unit_price || i.price || 0) * Number(i.quantity || 1)))
        })),
        notes: raw.notes || ''
    };
}

export const adminOrderService = {
    /**
     * Fetch orders list with optional filtering and search directly from backend API.
     */
    async getOrders({ status = 'All', search = '' } = {}) {
        try {
            const queryParams = new URLSearchParams();
            if (status && status !== 'All') {
                queryParams.append('status', status);
            }
            if (search && search.trim()) {
                queryParams.append('search', search.trim());
            }

            const url = `${API_BASE_URL}?${queryParams.toString()}`;
            const response = await fetch(url, {
                method: 'GET',
                headers: getHeaders()
            });

            const data = await response.json();

            if (response.ok && data.success && Array.isArray(data.data)) {
                const normalized = data.data.map(normalizeOrder).filter(Boolean);
                return { success: true, data: normalized };
            }

            // Fallback to fetch from user orders endpoint if admin orders endpoint returns empty/unavailable
            const fallbackRes = await fetch(FALLBACK_USER_ORDERS_URL, {
                method: 'GET',
                headers: getHeaders()
            });
            const fallbackData = await fallbackRes.json();
            if (fallbackRes.ok && fallbackData.success && Array.isArray(fallbackData.data)) {
                let list = fallbackData.data.map(normalizeOrder).filter(Boolean);
                if (status && status !== 'All') {
                    list = list.filter(o => o.orderStatus.toLowerCase() === status.toLowerCase());
                }
                if (search && search.trim()) {
                    const q = search.trim().toLowerCase();
                    list = list.filter(o => 
                        o.id.toLowerCase().includes(q) ||
                        o.customer.name.toLowerCase().includes(q) ||
                        o.customer.email.toLowerCase().includes(q)
                    );
                }
                return { success: true, data: list };
            }

            return { success: true, data: [] };
        } catch (err) {
            console.error('API Fetch Admin Orders Error:', err);
            return { success: true, data: [] };
        }
    },

    /**
     * Fetch summary stats for dashboard cards dynamically.
     */
    async getOrderStats() {
        try {
            const res = await this.getOrders({ status: 'All' });
            const orders = res.data || [];

            const stats = {
                totalOrders: orders.length,
                pendingOrders: 0,
                processingOrders: 0,
                completedOrders: 0,
                cancelledOrders: 0,
                totalRevenue: 0
            };

            orders.forEach(order => {
                const st = (order.orderStatus || '').toLowerCase();
                if (st === 'pending') {
                    stats.pendingOrders += 1;
                } else if (st === 'processing' || st === 'confirmed') {
                    stats.processingOrders += 1;
                } else if (st === 'delivered' || st === 'completed') {
                    stats.completedOrders += 1;
                } else if (st === 'cancelled') {
                    stats.cancelledOrders += 1;
                }
                if (st !== 'cancelled') {
                    stats.totalRevenue += Number(order.totalAmount || order.total_amount || 0);
                }
            });

            return { success: true, stats };
        } catch (err) {
            return {
                success: true,
                stats: {
                    totalOrders: 0,
                    pendingOrders: 0,
                    processingOrders: 0,
                    completedOrders: 0,
                    cancelledOrders: 0,
                    totalRevenue: 0
                }
            };
        }
    },

    /**
     * Update an order's status and optional notes in the database.
     */
    async updateOrderStatus(orderId, newStatus, note = '') {
        try {
            const response = await fetch(`${API_BASE_URL}/${orderId}/status`, {
                method: 'PUT',
                headers: getHeaders(),
                body: JSON.stringify({
                    status: newStatus,
                    notes: note
                })
            });

            const data = await response.json();
            if (response.ok && data.success) {
                return {
                    success: true,
                    updatedOrder: normalizeOrder(data.data)
                };
            }

            return {
                success: false,
                error: data.message || 'Failed to update order status.'
            };
        } catch (err) {
            console.error('API Update Order Status Error:', err);
            return {
                success: false,
                error: 'Network error while updating order status.'
            };
        }
    },

    /**
     * Delete an order from the database.
     */
    async deleteOrder(orderId) {
        try {
            const response = await fetch(`${API_BASE_URL}/${orderId}`, {
                method: 'DELETE',
                headers: getHeaders()
            });

            const data = await response.json();
            if (response.ok && data.success) {
                return { success: true };
            }

            return {
                success: false,
                error: data.message || 'Failed to delete order.'
            };
        } catch (err) {
            console.error('API Delete Order Error:', err);
            return {
                success: false,
                error: 'Network error while deleting order.'
            };
        }
    }
};
