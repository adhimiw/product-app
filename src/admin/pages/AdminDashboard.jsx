import { useEffect, useState } from 'react';
import StatCard from '../components/StatCard';
import OrderTimelineChart from '../components/charts/OrderTimelineChart';
import OrderStatusPieChart from '../components/charts/OrderStatusPieChart';
import OrderPerformanceBarChart from '../components/charts/OrderPerformanceBarChart';
import RevenueTimelineChart from '../components/charts/RevenueTimelineChart';
import { adminOrderService } from '../services/adminOrderService';

export default function AdminDashboard() {
    const [stats, setStats] = useState({
        totalOrders: 0,
        pendingOrders: 0,
        processingOrders: 0,
        completedOrders: 0,
        cancelledOrders: 0,
        totalRevenue: 0
    });

    useEffect(() => {
        let isMounted = true;
        adminOrderService.getOrderStats().then(statsRes => {
            if (isMounted && statsRes.success) {
                setStats(statsRes.stats);
            }
        });
        return () => { isMounted = false; };
    }, []);

    return (
        <div>
            {/* 1. Summary Cards */}
            <div className="admin-stats-grid">
                <StatCard
                    title="Total Orders"
                    value={stats.totalOrders}
                    subtext="All-time recorded orders"
                    icon="📦"
                    iconBg="rgba(27, 59, 43, 0.08)"
                    iconColor="var(--color-primary)"
                />
                <StatCard
                    title="Pending Orders"
                    value={stats.pendingOrders}
                    subtext="Awaiting confirmation"
                    icon="⏳"
                    iconBg="rgba(234, 179, 8, 0.12)"
                    iconColor="#a16207"
                />
                <StatCard
                    title="Processing Orders"
                    value={stats.processingOrders}
                    subtext="Being packed & prepared"
                    icon="⚙️"
                    iconBg="rgba(168, 85, 247, 0.12)"
                    iconColor="#6b21a8"
                />
                <StatCard
                    title="Completed Orders"
                    value={stats.completedOrders}
                    subtext="Successfully delivered"
                    icon="✅"
                    iconBg="rgba(34, 197, 94, 0.12)"
                    iconColor="#14532d"
                />
                <StatCard
                    title="Cancelled Orders"
                    value={stats.cancelledOrders}
                    subtext="Voided transactions"
                    icon="🚫"
                    iconBg="rgba(239, 68, 68, 0.12)"
                    iconColor="#991b1b"
                />
            </div>

            {/* 2. Main Order Timeline Visualization (Primary & Largest) */}
            <div className="admin-primary-chart-wrapper">
                <OrderTimelineChart />
            </div>

            {/* 3. Secondary Analytics Charts Grid */}
            <div className="admin-secondary-charts-grid">
                <OrderStatusPieChart />
                <OrderPerformanceBarChart />
            </div>

            {/* 4. Revenue Timeline Chart */}
            <div className="admin-primary-chart-wrapper">
                <RevenueTimelineChart />
            </div>
        </div>
    );
}
