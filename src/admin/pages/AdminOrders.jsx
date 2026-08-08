import { useEffect, useState, useCallback } from 'react';
import OrderTable from '../components/OrderTable';
import UpdateStatusModal from '../components/UpdateStatusModal';
import { adminOrderService } from '../services/adminOrderService';

export default function AdminOrders() {
    const [orders, setOrders] = useState([]);
    const [statusFilter, setStatusFilter] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [selectedOrderForStatus, setSelectedOrderForStatus] = useState(null);

    const loadOrders = useCallback(async () => {
        setLoading(true);
        try {
            const res = await adminOrderService.getOrders({
                status: statusFilter,
                search: searchQuery
            });
            if (res.success) {
                setOrders(res.data);
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
        const res = await adminOrderService.updateOrderStatus(orderId, newStatus, note);
        if (res.success) {
            setSelectedOrderForStatus(null);
            await loadOrders();
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
            <div className="admin-card">
                {/* Search & Status Filter Controls */}
                <div className="admin-card-header">
                    <div className="admin-search-box">
                        <span className="admin-search-icon">🔍</span>
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
                                className={`admin-tab-btn ${statusFilter === tab.id ? 'active' : ''}`}
                                onClick={() => setStatusFilter(tab.id)}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Orders Data Table */}
                <OrderTable
                    orders={orders}
                    isLoading={loading}
                    onUpdateStatusClick={(order) => setSelectedOrderForStatus(order)}
                />
            </div>

            {/* Status Update Modal */}
            {selectedOrderForStatus && (
                <UpdateStatusModal
                    order={selectedOrderForStatus}
                    onClose={() => setSelectedOrderForStatus(null)}
                    onSave={handleSaveStatus}
                />
            )}
        </div>
    );
}
