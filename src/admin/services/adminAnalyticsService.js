/**
 * Admin Analytics Service - 100% Dynamic Real-Time Analytics
 * Integrates directly with Laravel REST API endpoints:
 * - GET /api/admin/analytics/timeline?period={7D|30D|3M|6M|1Y}
 * - GET /api/admin/analytics/revenue?period={7D|30D|3M|6M|1Y}
 * - GET /api/admin/analytics/status-distribution
 * - GET /api/admin/analytics/performance?period={7D|30D|3M|6M|1Y}
 */

import { ORDER_STATUSES, STATUS_CONFIG } from '../constants/orderStatuses';
import { adminOrderService } from './adminOrderService';

const API_BASE = '/api/admin/analytics';

export const TIME_PERIODS = [
    { id: '7D', label: '7 Days' },
    { id: '30D', label: '30 Days' },
    { id: '3M', label: '3 Months' },
    { id: '6M', label: '6 Months' },
    { id: '1Y', label: '1 Year' }
];

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

export const adminAnalyticsService = {
    /**
     * Get Order Timeline data for line/area chart.
     * @param {string} period '7D' | '30D' | '3M' | '6M' | '1Y'
     */
    async getOrderTimeline(period = '30D') {
        try {
            const res = await fetch(`${API_BASE}/timeline?period=${period}`, {
                method: 'GET',
                headers: getHeaders()
            });
            if (res.ok) {
                const data = await res.json();
                if (data.success && Array.isArray(data.data)) {
                    return { success: true, data: data.data };
                }
            }
        } catch (e) {
            console.warn('Analytics API timeline fallback to local orders computation', e);
        }

        // Dynamic Client-side Fallback Computation from Real Orders
        const ordersRes = await adminOrderService.getOrders({ status: 'All' });
        const orders = ordersRes.data || [];
        const computed = this._computeTimelineFromOrders(orders, period);
        return { success: true, data: computed.orders };
    },

    /**
     * Get Revenue Trajectory timeline.
     * @param {string} period '7D' | '30D' | '3M' | '6M' | '1Y'
     */
    async getRevenueTimeline(period = '30D') {
        try {
            const res = await fetch(`${API_BASE}/revenue?period=${period}`, {
                method: 'GET',
                headers: getHeaders()
            });
            if (res.ok) {
                const data = await res.json();
                if (data.success && Array.isArray(data.data)) {
                    return { success: true, data: data.data };
                }
            }
        } catch (e) {
            console.warn('Analytics API revenue fallback to local orders computation', e);
        }

        // Dynamic Client-side Fallback Computation from Real Orders
        const ordersRes = await adminOrderService.getOrders({ status: 'All' });
        const orders = ordersRes.data || [];
        const computed = this._computeTimelineFromOrders(orders, period);
        return { success: true, data: computed.revenue };
    },

    /**
     * Get Orders by Status distribution for donut/pie chart.
     */
    async getOrdersByStatus() {
        try {
            const res = await fetch(`${API_BASE}/status-distribution`, {
                method: 'GET',
                headers: getHeaders()
            });
            if (res.ok) {
                const data = await res.json();
                if (data.success && Array.isArray(data.data)) {
                    return { success: true, total: data.total, data: data.data };
                }
            }
        } catch (e) {
            console.warn('Analytics API status-distribution fallback to local orders computation', e);
        }

        // Dynamic Client-side Fallback Computation from Real Orders
        const ordersRes = await adminOrderService.getOrders({ status: 'All' });
        const orders = ordersRes.data || [];

        const counts = {
            [ORDER_STATUSES.PENDING]: 0,
            [ORDER_STATUSES.PROCESSING]: 0,
            [ORDER_STATUSES.SHIPPED]: 0,
            [ORDER_STATUSES.DELIVERED]: 0,
            [ORDER_STATUSES.CANCELLED]: 0
        };

        orders.forEach(o => {
            const st = (o.orderStatus || o.status || 'Pending').toLowerCase();
            if (st === 'pending') counts[ORDER_STATUSES.PENDING]++;
            else if (st === 'processing' || st === 'confirmed') counts[ORDER_STATUSES.PROCESSING]++;
            else if (st === 'shipped') counts[ORDER_STATUSES.SHIPPED]++;
            else if (st === 'delivered' || st === 'completed') counts[ORDER_STATUSES.DELIVERED]++;
            else if (st === 'cancelled') counts[ORDER_STATUSES.CANCELLED]++;
        });

        const total = Object.values(counts).reduce((a, b) => a + b, 0);

        const data = Object.entries(counts).map(([status, count]) => {
            const cfg = STATUS_CONFIG[status] || {};
            return {
                status,
                label: cfg.label || status,
                count,
                percentage: total > 0 ? Math.round((count / total) * 100) : 0,
                color: cfg.dotColor || '#64748b'
            };
        });

        return { success: true, total, data };
    },

    /**
     * Get Order Performance bar chart data.
     * @param {string} period '7D' | '30D' | '3M' | '6M' | '1Y'
     */
    async getOrderPerformance(period = '30D') {
        try {
            const res = await fetch(`${API_BASE}/performance?period=${period}`, {
                method: 'GET',
                headers: getHeaders()
            });
            if (res.ok) {
                const data = await res.json();
                if (data.success && Array.isArray(data.data)) {
                    return { success: true, data: data.data };
                }
            }
        } catch (e) {
            console.warn('Analytics API performance fallback to local orders computation', e);
        }

        // Dynamic Client-side Fallback Computation from Real Orders
        const ordersRes = await adminOrderService.getOrders({ status: 'All' });
        const orders = ordersRes.data || [];
        const timeline = this._computeTimelineFromOrders(orders, period);
        
        const data = timeline.orders.map(item => ({
            label: item.label,
            value: item.orders
        }));

        return { success: true, data };
    },

    /**
     * Internal helper to compute real time-bucketed orders & revenues from order list.
     */
    _computeTimelineFromOrders(orders, period) {
        const now = new Date();
        const ordersTimeline = [];
        const revenueTimeline = [];

        if (period === '7D') {
            const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            for (let i = 6; i >= 0; i--) {
                const d = new Date(now.getTime() - i * 86400000);
                const dayLabel = days[d.getDay()];
                const dayDateStr = d.toISOString().slice(0, 10);

                const dayOrders = orders.filter(o => {
                    const rawDate = o.createdAt || o.date || o.created_at || '';
                    return rawDate.startsWith(dayDateStr);
                });

                const count = dayOrders.length;
                const rev = dayOrders.reduce((sum, o) => sum + (Number(o.totalAmount || o.total_amount) || 0), 0);

                ordersTimeline.push({ label: dayLabel, orders: count });
                revenueTimeline.push({ label: dayLabel, revenue: rev });
            }
        } else if (period === '30D') {
            for (let i = 3; i >= 0; i--) {
                const start = new Date(now.getTime() - (i + 1) * 7 * 86400000);
                const end = new Date(now.getTime() - i * 7 * 86400000);
                const label = `Week ${4 - i}`;

                const weekOrders = orders.filter(o => {
                    const oDate = new Date(o.createdAt || o.date || o.created_at || 0);
                    return oDate >= start && oDate <= end;
                });

                const count = weekOrders.length;
                const rev = weekOrders.reduce((sum, o) => sum + (Number(o.totalAmount || o.total_amount) || 0), 0);

                ordersTimeline.push({ label, orders: count });
                revenueTimeline.push({ label, revenue: rev });
            }
        } else if (period === '3M') {
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            for (let i = 2; i >= 0; i--) {
                const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
                const monthLabel = months[d.getMonth()];
                const targetYear = d.getFullYear();
                const targetMonth = d.getMonth();

                const mOrders = orders.filter(o => {
                    const oDate = new Date(o.createdAt || o.date || o.created_at || 0);
                    return oDate.getFullYear() === targetYear && oDate.getMonth() === targetMonth;
                });

                const count = mOrders.length;
                const rev = mOrders.reduce((sum, o) => sum + (Number(o.totalAmount || o.total_amount) || 0), 0);

                ordersTimeline.push({ label: monthLabel, orders: count });
                revenueTimeline.push({ label: monthLabel, revenue: rev });
            }
        } else if (period === '6M') {
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            for (let i = 5; i >= 0; i--) {
                const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
                const monthLabel = months[d.getMonth()];
                const targetYear = d.getFullYear();
                const targetMonth = d.getMonth();

                const mOrders = orders.filter(o => {
                    const oDate = new Date(o.createdAt || o.date || o.created_at || 0);
                    return oDate.getFullYear() === targetYear && oDate.getMonth() === targetMonth;
                });

                const count = mOrders.length;
                const rev = mOrders.reduce((sum, o) => sum + (Number(o.totalAmount || o.total_amount) || 0), 0);

                ordersTimeline.push({ label: monthLabel, orders: count });
                revenueTimeline.push({ label: monthLabel, revenue: rev });
            }
        } else {
            // 1 Year (12 months)
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            for (let i = 11; i >= 0; i--) {
                const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
                const monthLabel = months[d.getMonth()];
                const targetYear = d.getFullYear();
                const targetMonth = d.getMonth();

                const mOrders = orders.filter(o => {
                    const oDate = new Date(o.createdAt || o.date || o.created_at || 0);
                    return oDate.getFullYear() === targetYear && oDate.getMonth() === targetMonth;
                });

                const count = mOrders.length;
                const rev = mOrders.reduce((sum, o) => sum + (Number(o.totalAmount || o.total_amount) || 0), 0);

                ordersTimeline.push({ label: monthLabel, orders: count });
                revenueTimeline.push({ label: monthLabel, revenue: rev });
            }
        }

        return { orders: ordersTimeline, revenue: revenueTimeline };
    }
};
