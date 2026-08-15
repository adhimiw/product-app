import { useEffect, useState, useCallback } from 'react';
import PageHeader from '../components/PageHeader';
import OrderTable from '../components/OrderTable';
import TableSkeleton from '../components/TableSkeleton';
import EmptyState from '../components/EmptyState';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import UpdateStatusModal from '../components/UpdateStatusModal';
import OrderDetailsModal from '../components/OrderDetailsModal';
import { adminOrderService } from '../services/adminOrderService';

export default function AdminOrders() {
    const [orders, setOrders] = useState([]);
    const [statusFilter, setStatusFilter] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    
    // Modal states
    const [selectedOrderForStatus, setSelectedOrderForStatus] = useState(null);
    const [selectedOrderForView, setSelectedOrderForView] = useState(null);
    const [orderToDelete, setOrderToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const loadOrders = useCallback(async () => {
        setLoading(true);
        try {
            const res = await adminOrderService.getOrders({
                status: statusFilter,
                search: searchQuery
            });
            if (res.success) {
                setOrders(res.data || []);
            }
        } catch (err) {
            console.error('Failed to load orders', err);
        } finally {
            setLoading(false);
        }
    }, [statusFilter, searchQuery]);

    useEffect(() => {
        loadOrders();
    }, [loadOrders]);

    const handleSaveStatus = async (orderId, newStatus, note) => {
        const targetId = selectedOrderForStatus?.rawId || orderId;
        const res = await adminOrderService.updateOrderStatus(targetId, newStatus, note);
        if (res.success) {
            setSelectedOrderForStatus(null);
            await loadOrders();
        } else {
            alert(res.error || 'Failed to update order status.');
        }
    };

    const handleConfirmDelete = async () => {
        if (!orderToDelete) return;
        setIsDeleting(true);
        try {
            const targetId = orderToDelete.rawId || orderToDelete.id || orderToDelete.order_number;
            const res = await adminOrderService.deleteOrder(targetId);
            if (res.success) {
                setOrderToDelete(null);
                await loadOrders();
            } else {
                alert(res.error || 'Failed to delete order from database.');
            }
        } catch (err) {
            console.error('Failed to delete order', err);
        } finally {
            setIsDeleting(false);
        }
    };

    const filterTabs = [
        { id: 'All', label: 'All Orders' },
        { id: 'Pending', label: 'Pending' },
        { id: 'Confirmed', label: 'Confirmed' },
        { id: 'Processing', label: 'Processing' },
        { id: 'Shipped', label: 'Shipped' },
        { id: 'Delivered', label: 'Delivered' },
        { id: 'Cancelled', label: 'Cancelled' }
    ];

    return (
        <div>
            {/* Standard Page Header */}
            <PageHeader
                breadcrumbs={['Admin', 'Sales', 'Orders']}
                title="Customer Orders Management"
                description="View real-time customer orders, dispatch status, tracking notes, and details."
                actions={
                    <button
                        type="button"
                        className="admin-btn admin-btn-secondary"
                        onClick={loadOrders}
                        title="Refresh order records"
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="23 4 23 10 17 10"></polyline>
                            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
                        </svg>
                        <span>Refresh List</span>
                    </button>
                }
            />

            <div className="admin-card">
                {/* Search & Status Filter Controls */}
                <div className="admin-card-header">
                    <div className="admin-search-box">
                        <span className="admin-search-icon">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="11" cy="11" r="8"></circle>
                                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                            </svg>
                        </span>
                        <input
                            type="text"
                            className="admin-search-input"
                            placeholder="Search by Order ID, customer name, email..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="admin-tabs">
                        {filterTabs.map(tab => (
                            <button
                                key={tab.id}
                                type="button"
                                className={`admin-tab-btn ${statusFilter === tab.id ? 'active' : ''}`}
                                onClick={() => setStatusFilter(tab.id)}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Orders Data Table / Skeleton / Empty State */}
                {loading ? (
                    <TableSkeleton columns={7} rows={6} />
                ) : orders.length === 0 ? (
                    <EmptyState
                        icon="📦"
                        title="No orders found"
                        description={searchQuery ? `No order records matched "${searchQuery}".` : "There are currently no orders in this status category."}
                        actionLabel={searchQuery || statusFilter !== 'All' ? "Clear Filters" : undefined}
                        onAction={() => {
                            setSearchQuery('');
                            setStatusFilter('All');
                        }}
                    />
                ) : (
                    <OrderTable
                        orders={orders}
                        isLoading={false}
                        onViewOrderClick={(order) => setSelectedOrderForView(order)}
                        onUpdateStatusClick={(order) => setSelectedOrderForStatus(order)}
                        onDeleteOrderClick={(order) => setOrderToDelete(order)}
                    />
                )}
            </div>

            {/* View Product & Order Info Modal */}
            {selectedOrderForView && (
                <OrderDetailsModal
                    order={selectedOrderForView}
                    onClose={() => setSelectedOrderForView(null)}
                />
            )}

            {/* Status Update Modal */}
            {selectedOrderForStatus && (
                <UpdateStatusModal
                    order={selectedOrderForStatus}
                    onClose={() => setSelectedOrderForStatus(null)}
                    onSave={handleSaveStatus}
                />
            )}

            {/* Reusable Confirm Delete Modal */}
            <ConfirmDeleteModal
                isOpen={!!orderToDelete}
                title="Delete Order"
                itemName={`Order #${orderToDelete?.id || orderToDelete?.order_number}`}
                warningText="This action will permanently delete this customer order record and its items from the database."
                onConfirm={handleConfirmDelete}
                onCancel={() => setOrderToDelete(null)}
                isDeleting={isDeleting}
            />
        </div>
    );
}
