import { useEffect, useState } from 'react';
import StatCard from '../components/StatCard';
import PageHeader from '../components/PageHeader';
import OrderTimelineChart from '../components/charts/OrderTimelineChart';
import OrderStatusPieChart from '../components/charts/OrderStatusPieChart';
import OrderPerformanceBarChart from '../components/charts/OrderPerformanceBarChart';
import RevenueTimelineChart from '../components/charts/RevenueTimelineChart';
import { adminOrderService } from '../services/adminOrderService';
import { adminCategoryService } from '../services/adminCategoryService';
import { adminProductService } from '../services/adminProductService';

export default function AdminDashboard({ onNavigateToCategories, onNavigateToOrders, onNavigateToProducts }) {
    const [stats, setStats] = useState({
        totalOrders: 0,
        pendingOrders: 0,
        processingOrders: 0,
        completedOrders: 0,
        cancelledOrders: 0,
        totalRevenue: 0
    });
    const [categoriesCount, setCategoriesCount] = useState(0);
    const [productsCount, setProductsCount] = useState(0);

    useEffect(() => {
        let isMounted = true;
        adminOrderService.getOrderStats().then(statsRes => {
            if (isMounted && statsRes.success) {
                setStats(statsRes.stats);
            }
        });
        adminCategoryService.getCategories().then(catRes => {
            if (isMounted && catRes.success) {
                setCategoriesCount(catRes.data.length);
            }
        });
        adminProductService.getProducts().then(prodRes => {
            if (isMounted && prodRes.success) {
                setProductsCount(prodRes.data.length);
            }
        });
        return () => { isMounted = false; };
    }, []);

    const formatCurrency = (val) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(val || 0);
    };

    return (
        <div>
            {/* Standard Page Header */}
            <PageHeader
                breadcrumbs={['Admin', 'Overview', 'Dashboard']}
                title="Store Operations & Metrics"
                description="Live performance monitoring, order processing status, and revenue analytics."
                actions={
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                            type="button"
                            className="admin-btn admin-btn-secondary"
                            onClick={onNavigateToOrders}
                        >
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M16 16v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v1"/>
                                <path d="M18 8h4a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1h-4"/>
                                <circle cx="5.5" cy="18.5" r="2.5"/>
                                <circle cx="18.5" cy="18.5" r="2.5"/>
                            </svg>
                            <span>Manage Orders</span>
                        </button>
                        <button
                            type="button"
                            className="admin-btn admin-btn-primary"
                            onClick={onNavigateToProducts}
                        >
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="12" y1="5" x2="12" y2="19"></line>
                                <line x1="5" y1="12" x2="19" y2="12"></line>
                            </svg>
                            <span>Catalog Inventory</span>
                        </button>
                    </div>
                }
            />

            {/* 1. Summary Metrics Cards */}
            <div className="admin-stats-grid">
                <div onClick={onNavigateToOrders} style={{ cursor: 'pointer' }} title="Click to view all orders">
                    <StatCard
                        title="Total Orders"
                        value={stats.totalOrders}
                        subtext="All-time recorded orders"
                        icon="📦"
                        trend={{ isPositive: true, text: 'Active' }}
                    />
                </div>
                
                <div onClick={onNavigateToProducts} style={{ cursor: 'pointer' }} title="Click to view products">
                    <StatCard
                        title="Live Products"
                        value={productsCount}
                        subtext="Store catalog items"
                        icon="🌿"
                        iconBg="rgba(16, 185, 129, 0.12)"
                        iconColor="#10b981"
                        trend={{ isPositive: true, text: 'In Stock' }}
                    />
                </div>

                <div onClick={onNavigateToCategories} style={{ cursor: 'pointer' }} title="Click to manage store categories">
                    <StatCard
                        title="Active Categories"
                        value={categoriesCount}
                        subtext="Product taxonomy"
                        icon="📁"
                        iconBg="rgba(79, 70, 229, 0.12)"
                        iconColor="#4f46e5"
                    />
                </div>

                <div onClick={onNavigateToOrders} style={{ cursor: 'pointer' }} title="Click to view pending orders">
                    <StatCard
                        title="Pending Orders"
                        value={stats.pendingOrders}
                        subtext="Awaiting dispatch action"
                        icon="⏳"
                        iconBg="rgba(245, 158, 11, 0.12)"
                        iconColor="#d97706"
                    />
                </div>

                <StatCard
                    title="Realized Revenue"
                    value={formatCurrency(stats.totalRevenue)}
                    subtext="Delivered order receipts"
                    icon="💰"
                    iconBg="rgba(16, 185, 129, 0.15)"
                    iconColor="#059669"
                    trend={{ isPositive: true, text: '+14%' }}
                />
            </div>

            {/* 2. Primary Timeline Visualization */}
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
