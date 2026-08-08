/**
 * Admin Analytics Service
 * Provides mock data for dashboard charts based on selected time ranges:
 * - '7D'  (Last 7 Days)
 * - '30D' (Last 30 Days)
 * - '3M'  (Last 3 Months)
 * - '6M'  (Last 6 Months)
 * - '1Y'  (Last 1 Year)
 * 
 * Ready for future Laravel REST API Integration:
 * - GET /api/admin/analytics/timeline?period={7D|30D|3M|6M|1Y}
 * - GET /api/admin/analytics/status-distribution
 * - GET /api/admin/analytics/performance?period={7D|30D|3M|6M|1Y}
 * - GET /api/admin/analytics/revenue?period={7D|30D|3M|6M|1Y}
 */

import { ORDER_STATUSES, STATUS_CONFIG } from '../constants/orderStatuses';

export const TIME_PERIODS = [
    { id: '7D', label: '7 Days' },
    { id: '30D', label: '30 Days' },
    { id: '3M', label: '3 Months' },
    { id: '6M', label: '6 Months' },
    { id: '1Y', label: '1 Year' }
];

export const adminAnalyticsService = {
    /**
     * Get Order Timeline data for line/area chart.
     * @param {string} period '7D' | '30D' | '3M' | '6M' | '1Y'
     * @returns {Promise<{success: boolean, data: Array<{label: string, orders: number}>}>}
     */
    async getOrderTimeline(period = '30D') {
        await new Promise(resolve => setTimeout(resolve, 150));

        let data = [];
        if (period === '7D') {
            data = [
                { label: 'Mon', orders: 14 },
                { label: 'Tue', orders: 22 },
                { label: 'Wed', orders: 18 },
                { label: 'Thu', orders: 29 },
                { label: 'Fri', orders: 35 },
                { label: 'Sat', orders: 42 },
                { label: 'Sun', orders: 38 }
            ];
        } else if (period === '30D') {
            data = [
                { label: 'Week 1', orders: 112 },
                { label: 'Week 2', orders: 145 },
                { label: 'Week 3', orders: 188 },
                { label: 'Week 4', orders: 210 }
            ];
        } else if (period === '3M') {
            data = [
                { label: 'Jun', orders: 480 },
                { label: 'Jul', orders: 620 },
                { label: 'Aug', orders: 755 }
            ];
        } else if (period === '6M') {
            data = [
                { label: 'Mar', orders: 320 },
                { label: 'Apr', orders: 390 },
                { label: 'May', orders: 430 },
                { label: 'Jun', orders: 480 },
                { label: 'Jul', orders: 620 },
                { label: 'Aug', orders: 755 }
            ];
        } else if (period === '1Y') {
            data = [
                { label: 'Sep', orders: 240 },
                { label: 'Oct', orders: 280 },
                { label: 'Nov', orders: 310 },
                { label: 'Dec', orders: 450 },
                { label: 'Jan', orders: 380 },
                { label: 'Feb', orders: 290 },
                { label: 'Mar', orders: 320 },
                { label: 'Apr', orders: 390 },
                { label: 'May', orders: 430 },
                { label: 'Jun', orders: 480 },
                { label: 'Jul', orders: 620 },
                { label: 'Aug', orders: 755 }
            ];
        }

        return { success: true, data };
    },

    /**
     * Get Orders by Status distribution for donut/pie chart.
     * @returns {Promise<{success: boolean, data: Array<{status: string, label: string, count: number, percentage: number, color: string}>}>}
     */
    async getOrdersByStatus() {
        await new Promise(resolve => setTimeout(resolve, 120));

        const counts = {
            [ORDER_STATUSES.PENDING]: 12,
            [ORDER_STATUSES.PROCESSING]: 24,
            [ORDER_STATUSES.SHIPPED]: 38,
            [ORDER_STATUSES.DELIVERED]: 165,
            [ORDER_STATUSES.CANCELLED]: 8
        };

        const total = Object.values(counts).reduce((a, b) => a + b, 0);

        const data = Object.entries(counts).map(([status, count]) => {
            const cfg = STATUS_CONFIG[status] || {};
            return {
                status,
                label: cfg.label || status,
                count,
                percentage: Math.round((count / total) * 100),
                color: cfg.dotColor || '#64748b'
            };
        });

        return { success: true, total, data };
    },

    /**
     * Get Order Performance bar chart data.
     * @param {string} period '7D' | '30D' | '3M' | '6M' | '1Y'
     * @returns {Promise<{success: boolean, data: Array<{label: string, value: number}>}>}
     */
    async getOrderPerformance(period = '30D') {
        await new Promise(resolve => setTimeout(resolve, 140));

        let data = [];
        if (period === '7D') {
            data = [
                { label: 'Mon', value: 14 },
                { label: 'Tue', value: 22 },
                { label: 'Wed', value: 18 },
                { label: 'Thu', value: 29 },
                { label: 'Fri', value: 35 },
                { label: 'Sat', value: 42 },
                { label: 'Sun', value: 38 }
            ];
        } else if (period === '30D') {
            data = [
                { label: 'Days 1-7', value: 112 },
                { label: 'Days 8-14', value: 145 },
                { label: 'Days 15-21', value: 188 },
                { label: 'Days 22-30', value: 210 }
            ];
        } else {
            data = [
                { label: 'Q1', value: 990 },
                { label: 'Q2', value: 1300 },
                { label: 'Q3', value: 1855 },
                { label: 'Q4', value: 2400 }
            ];
        }

        return { success: true, data };
    },

    /**
     * Get Revenue Timeline data for line/area chart.
     * @param {string} period '7D' | '30D' | '3M' | '6M' | '1Y'
     * @returns {Promise<{success: boolean, data: Array<{label: string, revenue: number}>}>}
     */
    async getRevenueTimeline(period = '30D') {
        await new Promise(resolve => setTimeout(resolve, 150));

        let data;
        if (period === '7D') {
            data = [
                { label: 'Mon', revenue: 12400 },
                { label: 'Tue', revenue: 19800 },
                { label: 'Wed', revenue: 15600 },
                { label: 'Thu', revenue: 26100 },
                { label: 'Fri', revenue: 32500 },
                { label: 'Sat', revenue: 41200 },
                { label: 'Sun', revenue: 36800 }
            ];
        } else if (period === '30D') {
            data = [
                { label: 'Week 1', revenue: 98400 },
                { label: 'Week 2', revenue: 132000 },
                { label: 'Week 3', revenue: 174500 },
                { label: 'Week 4', revenue: 196800 }
            ];
        } else if (period === '3M') {
            data = [
                { label: 'Jun', revenue: 440000 },
                { label: 'Jul', revenue: 580000 },
                { label: 'Aug', revenue: 710000 }
            ];
        } else if (period === '6M') {
            data = [
                { label: 'Mar', revenue: 290000 },
                { label: 'Apr', revenue: 350000 },
                { label: 'May', revenue: 395000 },
                { label: 'Jun', revenue: 440000 },
                { label: 'Jul', revenue: 580000 },
                { label: 'Aug', revenue: 710000 }
            ];
        } else if (period === '1Y') {
            data = [
                { label: 'Sep', revenue: 210000 },
                { label: 'Oct', revenue: 255000 },
                { label: 'Nov', revenue: 280000 },
                { label: 'Dec', revenue: 410000 },
                { label: 'Jan', revenue: 345000 },
                { label: 'Feb', revenue: 265000 },
                { label: 'Mar', revenue: 290000 },
                { label: 'Apr', revenue: 350000 },
                { label: 'May', revenue: 395000 },
                { label: 'Jun', revenue: 440000 },
                { label: 'Jul', revenue: 580000 },
                { label: 'Aug', revenue: 710000 }
            ];
        }

        return { success: true, data };
    }
};
