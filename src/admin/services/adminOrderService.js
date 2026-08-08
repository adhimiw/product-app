/**
 * Admin Order Service
 * Isolated data layer that simulates REST API operations.
 * Future Laravel REST API Integration:
 * - replace `getOrders` with GET /api/admin/orders
 * - replace `updateOrderStatus` with PUT /api/admin/orders/{id}/status
 * - replace `getOrderStats` with GET /api/admin/orders/statistics
 */

import { MOCK_ORDERS } from '../data/mockOrders';
import { ORDER_STATUSES } from '../constants/orderStatuses';

const ORDERS_STORAGE_KEY = 'mangalam_admin_orders_store';

function loadStoredOrders() {
    try {
        const stored = localStorage.getItem(ORDERS_STORAGE_KEY);
        if (stored) {
            return JSON.parse(stored);
        }
    } catch (e) {
        console.error('Failed to load orders from local storage', e);
    }
    // Default to initial mock dataset
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(MOCK_ORDERS));
    return [...MOCK_ORDERS];
}

function saveOrdersToStorage(orders) {
    try {
        localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
    } catch (e) {
        console.error('Failed to save orders to local storage', e);
    }
}

export const adminOrderService = {
    /**
     * Fetch orders list with optional filtering and search.
     * @param {object} params
     * @param {string} [params.status] Filter by order status ('All' or specific status)
     * @param {string} [params.search] Search term (order id, customer name, email, phone)
     * @returns {Promise<{success: boolean, data: Array}>}
     */
    async getOrders({ status = 'All', search = '' } = {}) {
        await new Promise(resolve => setTimeout(resolve, 200));

        let orders = loadStoredOrders();

        // Apply status filter
        if (status && status !== 'All') {
            orders = orders.filter(o => o.orderStatus === status);
        }

        // Apply search filter
        const query = search.trim().toLowerCase();
        if (query) {
            orders = orders.filter(o => 
                o.id.toLowerCase().includes(query) ||
                o.customer.name.toLowerCase().includes(query) ||
                o.customer.email.toLowerCase().includes(query) ||
                (o.customer.phone && o.customer.phone.includes(query))
            );
        }

        // Sort by date descending (newest first)
        orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        return {
            success: true,
            data: orders
        };
    },

    /**
     * Fetch summary stats for dashboard cards.
     * @returns {Promise<{success: boolean, stats: object}>}
     */
    async getOrderStats() {
        await new Promise(resolve => setTimeout(resolve, 150));

        const orders = loadStoredOrders();

        const stats = {
            totalOrders: orders.length,
            pendingOrders: 0,
            processingOrders: 0,
            completedOrders: 0,
            cancelledOrders: 0,
            totalRevenue: 0
        };

        orders.forEach(order => {
            if (order.orderStatus === ORDER_STATUSES.PENDING) {
                stats.pendingOrders += 1;
            } else if (order.orderStatus === ORDER_STATUSES.PROCESSING) {
                stats.processingOrders += 1;
            } else if (order.orderStatus === ORDER_STATUSES.DELIVERED) {
                stats.completedOrders += 1;
                stats.totalRevenue += order.totalAmount;
            } else if (order.orderStatus === ORDER_STATUSES.CANCELLED) {
                stats.cancelledOrders += 1;
            }
        });

        return {
            success: true,
            stats
        };
    },

    /**
     * Update an order's status and add optional notes.
     * @param {string} orderId 
     * @param {string} newStatus 
     * @param {string} [note]
     * @returns {Promise<{success: boolean, updatedOrder?: object, error?: string}>}
     */
    async updateOrderStatus(orderId, newStatus, note = '') {
        await new Promise(resolve => setTimeout(resolve, 300));

        const orders = loadStoredOrders();
        const index = orders.findIndex(o => o.id === orderId);

        if (index === -1) {
            return {
                success: false,
                error: `Order with ID ${orderId} not found.`
            };
        }

        const currentOrder = orders[index];
        const updatedNotes = note.trim() 
            ? (currentOrder.notes ? `${currentOrder.notes} | Status updated to ${newStatus}: ${note.trim()}` : `Status updated to ${newStatus}: ${note.trim()}`)
            : currentOrder.notes;

        const updatedOrder = {
            ...currentOrder,
            orderStatus: newStatus,
            notes: updatedNotes,
            updatedAt: new Date().toISOString()
        };

        orders[index] = updatedOrder;
        saveOrdersToStorage(orders);

        return {
            success: true,
            updatedOrder
        };
    },

    /**
     * Resets orders mock data back to default state.
     */
    async resetData() {
        localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(MOCK_ORDERS));
        return { success: true, data: MOCK_ORDERS };
    }
};
