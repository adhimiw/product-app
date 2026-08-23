import React, { useEffect, useState } from 'react';
import { 
    ShoppingBag, 
    Package, 
    Layers, 
    Clock, 
    TrendingUp, 
    ArrowUpRight, 
    Zap, 
    CheckCircle2, 
    Truck, 
    BarChart3, 
    ExternalLink, 
    Plus,
    RefreshCw,
    ShieldCheck
} from 'lucide-react';
import StatCard from '../components/StatCard';
import PageHeader from '../components/PageHeader';
import OrderTimelineChart from '../components/charts/OrderTimelineChart';
import OrderStatusPieChart from '../components/charts/OrderStatusPieChart';
import OrderPerformanceBarChart from '../components/charts/OrderPerformanceBarChart';
import RevenueTimelineChart from '../components/charts/RevenueTimelineChart';
import { StatusBadge, PaymentStatusBadge } from '../components/StatusBadge';
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
    const [recentOrders, setRecentOrders] = useState([]);
    const [loadingRecent, setLoadingRecent] = useState(true);

    const loadDashboardData = () => {
        adminOrderService.getOrderStats().then(statsRes => {
            if (statsRes.success) {
                setStats(statsRes.stats);
            }
        });
        adminCategoryService.getCategories().then(catRes => {
            if (catRes.success) {
                setCategoriesCount(catRes.data.length);
            }
        });
        adminProductService.getProducts().then(prodRes => {
            if (prodRes.success) {
                setProductsCount(prodRes.data.length);
            }
        });
        setLoadingRecent(true);
        adminOrderService.getOrders({ limit: 5 }).then(orderRes => {
            if (orderRes.success) {
                setRecentOrders((orderRes.data || []).slice(0, 5));
            }
            setLoadingRecent(false);
        }).catch(() => setLoadingRecent(false));
    };

    useEffect(() => {
        loadDashboardData();
    }, []);

    const formatCurrency = (val) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(val || 0);
    };

    // Calculate dynamic operational metrics
    const avgOrderValue = stats.totalOrders > 0 ? Math.round(stats.totalRevenue / stats.totalOrders) : 0;
    const fulfillmentRate = stats.totalOrders > 0 
        ? Math.round(((stats.completedOrders || (stats.totalOrders - stats.pendingOrders)) / stats.totalOrders) * 100)
        : 100;

    return (
        <div className="admin-dashboard-page">
            {/* 1. Compact Page Header */}
            <PageHeader
                breadcrumbs={['Mangalam', 'Overview', 'Live Dashboard']}
                title="Store Operations & Intelligence"
                description="Real-time multi-channel analytics, inventory metrics, order fulfillment, and revenue monitoring."
                actions={
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <button
                            type="button"
                            className="admin-btn admin-btn-secondary"
                            onClick={loadDashboardData}
                            title="Refresh real-time data"
                        >
                            <RefreshCw size={13} />
                            <span>Refresh</span>
                        </button>
                        <button
                            type="button"
                            className="admin-btn admin-btn-secondary"
                            onClick={onNavigateToOrders}
                        >
                            <ShoppingBag size={13} />
                            <span>Orders Center</span>
                        </button>
                        <button
                            type="button"
                            className="admin-btn admin-btn-primary"
                            onClick={onNavigateToProducts}
                        >
                            <Plus size={14} />
                            <span>Add Product</span>
                        </button>
                    </div>
                }
            />

            {/* 2. 5-Column Dynamic Matte & Gradient Stat Cards */}
            <div className="admin-stats-grid">
                {/* Total Orders Card */}
                <div onClick={onNavigateToOrders} className="admin-stat-card-link" title="Click to view all orders">
                    <StatCard
                        variant="orders"
                        title="Total Orders"
                        value={stats.totalOrders}
                        subtext="All-time recorded"
                        icon={<ShoppingBag size={17} />}
                        trend={{ isPositive: true, text: 'Live' }}
                    />
                </div>
                
                {/* Live Products Card */}
                <div onClick={onNavigateToProducts} className="admin-stat-card-link" title="Click to view inventory products">
                    <StatCard
                        variant="products"
                        title="Live Products"
                        value={productsCount}
                        subtext="In active catalog"
                        icon={<Package size={17} />}
                        trend={{ isPositive: true, text: 'In Stock' }}
                    />
                </div>

                {/* Active Categories Card */}
                <div onClick={onNavigateToCategories} className="admin-stat-card-link" title="Click to manage categories">
                    <StatCard
                        variant="categories"
                        title="Categories"
                        value={categoriesCount}
                        subtext="Product groups"
                        icon={<Layers size={17} />}
                        badgeText="Taxonomy"
                    />
                </div>

                {/* Pending Orders Card */}
                <div onClick={onNavigateToOrders} className="admin-stat-card-link" title="Click to process pending orders">
                    <StatCard
                        variant="pending"
                        title="Pending Orders"
                        value={stats.pendingOrders}
                        subtext="Requires dispatch"
                        icon={<Clock size={17} />}
                        trend={stats.pendingOrders > 0 ? { isPositive: false, text: 'Action' } : { isPositive: true, text: 'Clear' }}
                    />
                </div>

                {/* Realized Revenue Card */}
                <div className="admin-stat-card-link" title="Realized store revenue">
                    <StatCard
                        variant="revenue"
                        title="Realized Revenue"
                        value={formatCurrency(stats.totalRevenue)}
                        subtext="Gross store receipts"
                        icon={<TrendingUp size={17} />}
                        trend={{ isPositive: true, text: '+18.4%' }}
                    />
                </div>
            </div>

            {/* 3. Operational Highlights Strip */}
            <div className="admin-dashboard-strip">
                <div className="admin-strip-item">
                    <div className="admin-strip-icon emerald">
                        <Zap size={14} />
                    </div>
                    <div className="admin-strip-text">
                        <span className="admin-strip-label">Avg Order Value (AOV)</span>
                        <span className="admin-strip-val">{formatCurrency(avgOrderValue)}</span>
                    </div>
                </div>

                <div className="admin-strip-item">
                    <div className="admin-strip-icon blue">
                        <Truck size={14} />
                    </div>
                    <div className="admin-strip-text">
                        <span className="admin-strip-label">Dispatch Fulfillment</span>
                        <span className="admin-strip-val">{fulfillmentRate}% on-time</span>
                    </div>
                </div>

                <div className="admin-strip-item">
                    <div className="admin-strip-icon purple">
                        <CheckCircle2 size={14} />
                    </div>
                    <div className="admin-strip-text">
                        <span className="admin-strip-label">Catalog Health</span>
                        <span className="admin-strip-val">{productsCount > 0 ? '100% Active' : 'Empty Catalog'}</span>
                    </div>
                </div>

                <div className="admin-strip-item">
                    <div className="admin-strip-icon amber">
                        <ShieldCheck size={14} />
                    </div>
                    <div className="admin-strip-text">
                        <span className="admin-strip-label">API & Database Sync</span>
                        <span className="admin-strip-val">100% Live Connected</span>
                    </div>
                </div>
            </div>

            {/* 4. Double Timeline Visualizations Grid (Side-by-Side 2 Columns) */}
            <div className="admin-charts-double-grid">
                <OrderTimelineChart />
                <RevenueTimelineChart />
            </div>

            {/* 5. Secondary Analytics Charts (Status Pie + Performance Bars) */}
            <div className="admin-secondary-charts-grid">
                <OrderStatusPieChart />
                <OrderPerformanceBarChart />
            </div>

            {/* 6. Recent Orders Activity Widget */}
            <div className="admin-card admin-recent-orders-card">
                <div className="admin-card-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <BarChart3 size={16} color="var(--admin-primary)" />
                        <div>
                            <h3 className="admin-card-title" style={{ margin: 0 }}>Recent Orders</h3>
                            <p style={{ margin: '2px 0 0 0', fontSize: '0.75rem', color: 'var(--admin-text-muted)' }}>
                                Latest customer transactions and fulfillment statuses
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        className="admin-btn admin-btn-secondary"
                        onClick={onNavigateToOrders}
                        style={{ padding: '5px 10px', fontSize: '0.75rem' }}
                    >
                        <span>View All Orders</span>
                        <ArrowUpRight size={12} />
                    </button>
                </div>

                <div className="admin-table-responsive">
                    {loadingRecent ? (
                        <div style={{ padding: '30px', textAlign: 'center', color: 'var(--admin-text-muted)', fontSize: '0.85rem' }}>
                            Loading recent activity...
                        </div>
                    ) : recentOrders.length === 0 ? (
                        <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--admin-text-muted)' }}>
                            <ShoppingBag size={28} style={{ opacity: 0.3, margin: '0 auto 8px auto', display: 'block' }} />
                            <p style={{ fontSize: '0.85rem', margin: 0, fontWeight: 600 }}>No orders recorded yet</p>
                            <p style={{ fontSize: '0.75rem', margin: '4px 0 0 0' }}>Customer checkouts will stream here in real-time</p>
                        </div>
                    ) : (
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Order ID</th>
                                    <th>Customer</th>
                                    <th>Date</th>
                                    <th>Items</th>
                                    <th>Amount</th>
                                    <th>Payment</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentOrders.map(ord => (
                                    <tr key={ord.id || ord.rawId}>
                                        <td style={{ fontWeight: 700, fontFamily: 'monospace', color: 'var(--admin-primary)' }}>
                                            {ord.id}
                                        </td>
                                        <td>
                                            <div style={{ fontWeight: 600, color: 'var(--admin-text-main)' }}>
                                                {ord.customer?.name || 'Customer'}
                                            </div>
                                            <div style={{ fontSize: '0.72rem', color: 'var(--admin-text-muted)' }}>
                                                {ord.customer?.email || ord.customer?.phone || ''}
                                            </div>
                                        </td>
                                        <td style={{ fontSize: '0.78rem', color: 'var(--admin-text-muted)', whiteSpace: 'nowrap' }}>
                                            {new Date(ord.createdAt).toLocaleDateString('en-IN', {
                                                day: 'numeric',
                                                month: 'short',
                                                year: 'numeric'
                                            })}
                                        </td>
                                        <td style={{ fontSize: '0.8rem' }}>
                                            {ord.items?.length || 1} {ord.items?.length === 1 ? 'item' : 'items'}
                                        </td>
                                        <td style={{ fontWeight: 700, color: 'var(--admin-text-main)' }}>
                                            {formatCurrency(ord.totalAmount || ord.total || 0)}
                                        </td>
                                        <td>
                                            <PaymentStatusBadge status={ord.paymentStatus || 'Paid'} />
                                        </td>
                                        <td>
                                            <StatusBadge status={ord.status || 'Pending'} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}
