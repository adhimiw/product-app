import React, { useState, useEffect, useCallback, useRef } from 'react';
import { adminUserService } from '../services/adminUserService';
import StatCard from '../components/StatCard';
import { 
    Users, 
    UserCheck, 
    UserX, 
    Store, 
    Search, 
    Edit2, 
    Trash2, 
    ShieldAlert, 
    ShieldCheck, 
    Eye, 
    Phone, 
    MessageCircle, 
    Mail, 
    CheckCircle2, 
    X,
    RefreshCw,
    AlertTriangle,
    Shield
} from 'lucide-react';

export default function AdminUsers() {
    const [users, setUsers] = useState([]);
    const [stats, setStats] = useState({ total_users: 0, total_customers: 0, total_vendors: 0, total_blocked: 0 });
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState(''); // '' = All, '2' = Customer, '3' = Vendor
    const [statusFilter, setStatusFilter] = useState(''); // '' = All, 'active', 'blocked'
    const [sortBy, setSortBy] = useState('created_at');
    const [sortDir, setSortDir] = useState('desc');

    // Modals
    const [editingUser, setEditingUser] = useState(null);
    const [viewingUser, setViewingUser] = useState(null);
    const [deletingUser, setDeletingUser] = useState(null);
    const [blockingUser, setBlockingUser] = useState(null);
    const [blockReason, setBlockReason] = useState('');

    // Edit Form State (No password field)
    const [editForm, setEditForm] = useState({
        full_name: '',
        email: '',
        contact_number: '',
        whatsapp_number: '',
        role: 2,
        is_blocked: false,
        blocked_reason: ''
    });
    const [formSubmitting, setFormSubmitting] = useState(false);
    
    // Toast Notification State
    const [toast, setToast] = useState(null);
    const toastTimeoutRef = useRef(null);

    const showToast = useCallback((type, message) => {
        if (toastTimeoutRef.current) {
            clearTimeout(toastTimeoutRef.current);
        }
        setToast({ type, message });
        toastTimeoutRef.current = setTimeout(() => {
            setToast(null);
        }, 3500);
    }, []);

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        const res = await adminUserService.getUsers({
            search: searchQuery,
            role: roleFilter,
            status: statusFilter,
            sort_by: sortBy,
            sort_dir: sortDir
        });

        if (res.success) {
            setUsers(res.users);
            setStats(res.stats);
        } else {
            showToast('error', res.error || 'Failed to fetch users.');
        }
        setLoading(false);
    }, [searchQuery, roleFilter, statusFilter, sortBy, sortDir, showToast]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchUsers();
        }, 250);
        return () => clearTimeout(timer);
    }, [fetchUsers]);

    // Handle Edit Click
    const handleOpenEdit = (user) => {
        setEditingUser(user);
        setEditForm({
            full_name: user.full_name || '',
            email: user.email || '',
            contact_number: user.contact_number || '',
            whatsapp_number: user.whatsapp_number || '',
            role: user.role || 2,
            is_blocked: Boolean(user.is_blocked),
            blocked_reason: user.blocked_reason || ''
        });
    };

    // Handle View Details Click
    const handleOpenDetails = async (user) => {
        setViewingUser(user);
        const res = await adminUserService.getUserDetails(user.id);
        if (res.success && res.user) {
            setViewingUser(res.user);
        }
    };

    // Save Edit Form
    const handleSaveEdit = async (e) => {
        e.preventDefault();
        if (!editingUser) return;

        setFormSubmitting(true);
        const res = await adminUserService.updateUser(editingUser.id, editForm);
        setFormSubmitting(false);

        if (res.success) {
            showToast('success', `User "${editForm.full_name}" updated successfully!`);
            setEditingUser(null);
            fetchUsers();
        } else {
            showToast('error', res.error || 'Failed to update user.');
        }
    };

    // Confirm Block/Unblock
    const handleConfirmBlock = async () => {
        if (!blockingUser) return;

        setFormSubmitting(true);
        const res = await adminUserService.toggleBlockUser(blockingUser.id, blockReason);
        setFormSubmitting(false);

        if (res.success) {
            const action = blockingUser.is_blocked ? 'unblocked' : 'blocked';
            showToast('success', `User account has been ${action} successfully.`);
            setBlockingUser(null);
            setBlockReason('');
            fetchUsers();
        } else {
            showToast('error', res.error || 'Action failed.');
        }
    };

    // Confirm Delete
    const handleConfirmDelete = async () => {
        if (!deletingUser) return;

        setFormSubmitting(true);
        const res = await adminUserService.deleteUser(deletingUser.id);
        setFormSubmitting(false);

        if (res.success) {
            showToast('success', `User "${deletingUser.full_name}" has been deleted.`);
            setDeletingUser(null);
            fetchUsers();
        } else {
            showToast('error', res.error || 'Failed to delete user.');
        }
    };

    const getInitials = (name) => {
        if (!name) return 'U';
        const parts = name.trim().split(' ');
        if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
        return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
    };

    return (
        <div className="admin-page-container">
            {/* Floating Top-Right Toast Notification */}
            {toast && (
                <div className="admin-toast-container">
                    <div className={`admin-floating-toast ${toast.type}`}>
                        <div className="admin-toast-icon">
                            {toast.type === 'success' ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
                        </div>
                        <div className="admin-toast-text">{toast.message}</div>
                        <button 
                            className="admin-toast-close" 
                            onClick={() => setToast(null)}
                            title="Dismiss notification"
                        >
                            <X size={14} />
                        </button>
                    </div>
                </div>
            )}

            {/* Page Header */}
            <div className="admin-page-header">
                <div>
                    <h1 className="admin-page-title">User Management</h1>
                    <p className="admin-page-subtitle">
                        View, update, and manage customer accounts and registered store vendors
                    </p>
                </div>
                <div className="admin-page-actions">
                    <button 
                        className="admin-btn admin-btn-secondary" 
                        onClick={fetchUsers}
                        title="Refresh users directory"
                    >
                        <RefreshCw size={14} className={loading ? 'admin-spin' : ''} />
                        <span>Refresh Directory</span>
                    </button>
                </div>
            </div>

            {/* Dynamic Matte Gradient Stat Cards */}
            <div className="admin-stats-grid" style={{ gridTemplateColumns: 'repeat(4, minmax(0, 1fr))' }}>
                <StatCard
                    title="TOTAL USERS"
                    value={stats.total_users}
                    subtext="Registered Accounts"
                    icon={<Users size={16} />}
                    variant="users"
                    badgeText="Live"
                />

                <StatCard
                    title="CUSTOMERS"
                    value={stats.total_customers}
                    subtext="Active Shoppers"
                    icon={<UserCheck size={16} />}
                    variant="customers"
                    badgeText="Direct"
                />

                <StatCard
                    title="VENDORS"
                    value={stats.total_vendors}
                    subtext="Store Partners"
                    icon={<Store size={16} />}
                    variant="vendors"
                    badgeText="Partners"
                />

                <StatCard
                    title="BLOCKED USERS"
                    value={stats.total_blocked}
                    subtext="Suspended Access"
                    icon={<UserX size={16} />}
                    variant="blocked"
                    badgeText={stats.total_blocked > 0 ? "Alert" : "Clean"}
                />
            </div>

            {/* Filter Card: Correctly Aligned Search & Role Filters */}
            <div className="admin-card" style={{ marginBottom: '16px', padding: '12px 16px' }}>
                <div className="admin-user-toolbar">
                    {/* Search Field with Properly Anchored Icon */}
                    <div className="admin-search-box" style={{ flex: '1 1 300px', maxWidth: '420px' }}>
                        <span className="admin-search-icon">
                            <Search size={14} />
                        </span>
                        <input
                            type="text"
                            className="admin-search-input"
                            placeholder="Search by name, email, or phone..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    {/* Role Filter Pills */}
                    <div className="admin-role-filter-pills">
                        <button 
                            className={`admin-filter-pill ${roleFilter === '' ? 'active' : ''}`}
                            onClick={() => setRoleFilter('')}
                        >
                            All Users
                        </button>
                        <button 
                            className={`admin-filter-pill ${roleFilter === '2' ? 'active' : ''}`}
                            onClick={() => setRoleFilter('2')}
                        >
                            Customers
                        </button>
                        <button 
                            className={`admin-filter-pill ${roleFilter === '3' ? 'active' : ''}`}
                            onClick={() => setRoleFilter('3')}
                        >
                            Vendors
                        </button>
                    </div>

                    {/* Status Dropdown */}
                    <div className="admin-select-wrapper" style={{ minWidth: '140px' }}>
                        <select 
                            className="admin-select"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="">All Statuses</option>
                            <option value="active">Active Only</option>
                            <option value="blocked">Blocked Only</option>
                        </select>
                    </div>

                    {/* Sort Dropdown */}
                    <div className="admin-select-wrapper" style={{ minWidth: '150px' }}>
                        <select 
                            className="admin-select"
                            value={`${sortBy}-${sortDir}`}
                            onChange={(e) => {
                                const [by, dir] = e.target.value.split('-');
                                setSortBy(by);
                                setSortDir(dir);
                            }}
                        >
                            <option value="created_at-desc">Newest Joined</option>
                            <option value="created_at-asc">Oldest Joined</option>
                            <option value="full_name-asc">Name (A-Z)</option>
                            <option value="full_name-desc">Name (Z-A)</option>
                            <option value="orders_count-desc">Most Orders</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Users Data Table */}
            <div className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>
                <div className="admin-table-responsive">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>User Profile</th>
                                <th>Contact Information</th>
                                <th>Account Role</th>
                                <th>Access Status</th>
                                <th>Orders & Activity</th>
                                <th>Registration Date</th>
                                <th style={{ textAlign: 'center', minWidth: '160px' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="7" style={{ textAlign: 'center', padding: '40px' }}>
                                        <div className="admin-spinner-inline"></div>
                                        <p style={{ marginTop: '10px', color: '#64748b', fontSize: '0.84rem' }}>Loading user directory...</p>
                                    </td>
                                </tr>
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan="7" style={{ textAlign: 'center', padding: '48px 20px' }}>
                                        <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>👥</div>
                                        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#1e293b', margin: '0 0 6px 0' }}>No matching accounts found</h3>
                                        <p style={{ fontSize: '0.84rem', color: '#64748b', margin: 0 }}>
                                            Try adjusting your search keywords or filter settings.
                                        </p>
                                    </td>
                                </tr>
                            ) : (
                                users.map(user => {
                                    const isCustomer = user.role === 2;
                                    const isVendor = user.role === 3;
                                    const isBlocked = Boolean(user.is_blocked);
                                    const orderCount = user.orders_count || 0;
                                    const totalSpent = parseFloat(user.orders_sum_total_amount || 0);

                                    return (
                                        <tr key={user.id} className={isBlocked ? 'admin-row-blocked' : ''}>
                                            <td>
                                                <div className="admin-user-cell">
                                                    <div 
                                                        className="admin-user-avatar"
                                                        style={{
                                                            background: isBlocked ? '#fee2e2' : isVendor ? '#f3e8ff' : '#ecfdf5',
                                                            color: isBlocked ? '#dc2626' : isVendor ? '#9333ea' : '#059669'
                                                        }}
                                                    >
                                                        {getInitials(user.full_name)}
                                                    </div>
                                                    <div className="admin-user-info-text">
                                                        <span className="admin-user-name">{user.full_name || 'Unnamed User'}</span>
                                                        <span className="admin-user-email">
                                                            <Mail size={12} style={{ display: 'inline', marginRight: '4px', verticalAlign: '-1px' }} />
                                                            {user.email}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="admin-contact-cell">
                                                    {user.contact_number ? (
                                                        <span className="admin-contact-pill">
                                                            <Phone size={12} />
                                                            {user.contact_number}
                                                        </span>
                                                    ) : (
                                                        <span className="admin-text-muted" style={{ fontSize: '0.78rem' }}>No phone</span>
                                                    )}
                                                    {user.whatsapp_number && (
                                                        <a 
                                                            href={`https://wa.me/${user.whatsapp_number.replace(/\D/g, '')}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="admin-whatsapp-pill"
                                                            title="Chat on WhatsApp"
                                                        >
                                                            <MessageCircle size={12} />
                                                            {user.whatsapp_number}
                                                        </a>
                                                    )}
                                                </div>
                                            </td>
                                            <td>
                                                {isCustomer && (
                                                    <span className="admin-badge admin-badge-customer">Customer</span>
                                                )}
                                                {isVendor && (
                                                    <span className="admin-badge admin-badge-vendor">Vendor</span>
                                                )}
                                                {!isCustomer && !isVendor && (
                                                    <span className="admin-badge admin-badge-neutral">User</span>
                                                )}
                                            </td>
                                            <td>
                                                {isBlocked ? (
                                                    <span className="admin-badge admin-badge-danger" title={user.blocked_reason || 'Blocked'}>
                                                        <ShieldAlert size={12} />
                                                        Blocked
                                                    </span>
                                                ) : (
                                                    <span className="admin-badge admin-badge-success">
                                                        <ShieldCheck size={12} />
                                                        Active
                                                    </span>
                                                )}
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                                    <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#1e293b' }}>
                                                        {orderCount} {orderCount === 1 ? 'Order' : 'Orders'}
                                                    </span>
                                                    {totalSpent > 0 && (
                                                        <span style={{ fontSize: '0.78rem', color: '#059669', fontWeight: 600 }}>
                                                            ₹{totalSpent.toFixed(2)} spent
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td style={{ fontSize: '0.82rem', color: '#64748b' }}>
                                                {user.created_at ? new Date(user.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                                            </td>
                                            <td style={{ textAlign: 'center' }}>
                                                <div className="admin-user-action-group">
                                                    <button
                                                        className="admin-btn-action admin-action-view"
                                                        onClick={() => handleOpenDetails(user)}
                                                        title="View account overview"
                                                        aria-label="View user details"
                                                    >
                                                        <Eye size={15} />
                                                    </button>
                                                    <button
                                                        className="admin-btn-action admin-action-edit"
                                                        onClick={() => handleOpenEdit(user)}
                                                        title="Edit user details"
                                                        aria-label="Edit user"
                                                    >
                                                        <Edit2 size={15} />
                                                    </button>
                                                    <button
                                                        className={`admin-btn-action ${isBlocked ? 'admin-action-unblock' : 'admin-action-block'}`}
                                                        onClick={() => {
                                                            setBlockingUser(user);
                                                            setBlockReason(user.blocked_reason || '');
                                                        }}
                                                        title={isBlocked ? "Restore login access" : "Block user account"}
                                                        aria-label={isBlocked ? "Unblock account" : "Block account"}
                                                    >
                                                        {isBlocked ? <ShieldCheck size={15} /> : <ShieldAlert size={15} />}
                                                    </button>
                                                    <button
                                                        className="admin-btn-action admin-action-delete"
                                                        onClick={() => setDeletingUser(user)}
                                                        title="Delete user"
                                                        aria-label="Delete user"
                                                    >
                                                        <Trash2 size={15} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ----------------- EDIT USER MODAL (NO PASSWORD INPUT) ----------------- */}
            {editingUser && (
                <div className="admin-modal-overlay" onClick={() => !formSubmitting && setEditingUser(null)}>
                    <div className="admin-modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
                        <div className="admin-modal-header">
                            <div>
                                <h3 className="admin-modal-title">Edit User Details</h3>
                                <p className="admin-modal-desc">Update profile information and access role</p>
                            </div>
                            <button 
                                className="admin-modal-close" 
                                onClick={() => !formSubmitting && setEditingUser(null)}
                            >
                                <X size={16} />
                            </button>
                        </div>

                        <form onSubmit={handleSaveEdit}>
                            <div className="admin-modal-body">
                                <div className="admin-security-pill-notice">
                                    <Shield size={16} style={{ color: '#059669', flexShrink: 0 }} />
                                    <span>Password Security: User passwords are encrypted with one-way hashing and cannot be edited from the admin console.</span>
                                </div>

                                <div className="admin-form-group">
                                    <label className="admin-label">Full Name *</label>
                                    <input
                                        type="text"
                                        className="admin-input"
                                        required
                                        value={editForm.full_name}
                                        onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                                        placeholder="e.g. Ramesh Kumar"
                                    />
                                </div>

                                <div className="admin-form-group">
                                    <label className="admin-label">Email Address *</label>
                                    <input
                                        type="email"
                                        className="admin-input"
                                        required
                                        value={editForm.email}
                                        onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                        placeholder="user@example.com"
                                    />
                                </div>

                                <div className="admin-form-row">
                                    <div className="admin-form-group">
                                        <label className="admin-label">Contact Phone</label>
                                        <input
                                            type="text"
                                            className="admin-input"
                                            value={editForm.contact_number}
                                            onChange={(e) => setEditForm({ ...editForm, contact_number: e.target.value })}
                                            placeholder="e.g. 09876543210"
                                        />
                                    </div>
                                    <div className="admin-form-group">
                                        <label className="admin-label">WhatsApp Number</label>
                                        <input
                                            type="text"
                                            className="admin-input"
                                            value={editForm.whatsapp_number}
                                            onChange={(e) => setEditForm({ ...editForm, whatsapp_number: e.target.value })}
                                            placeholder="e.g. 09876543210"
                                        />
                                    </div>
                                </div>

                                <div className="admin-form-group">
                                    <label className="admin-label">Account Role *</label>
                                    <select
                                        className="admin-select"
                                        value={editForm.role}
                                        onChange={(e) => setEditForm({ ...editForm, role: Number(e.target.value) })}
                                    >
                                        <option value={2}>Customer</option>
                                        <option value={3}>Vendor / Partner</option>
                                    </select>
                                </div>

                                <div className="admin-form-group">
                                    <label className="admin-label">Account Status</label>
                                    <div className="admin-radio-toggle-group">
                                        <label className={`admin-radio-toggle ${!editForm.is_blocked ? 'selected' : ''}`}>
                                            <input
                                                type="radio"
                                                name="is_blocked"
                                                checked={!editForm.is_blocked}
                                                onChange={() => setEditForm({ ...editForm, is_blocked: false, blocked_reason: '' })}
                                            />
                                            <span>Active (Authorized)</span>
                                        </label>
                                        <label className={`admin-radio-toggle danger ${editForm.is_blocked ? 'selected' : ''}`}>
                                            <input
                                                type="radio"
                                                name="is_blocked"
                                                checked={editForm.is_blocked}
                                                onChange={() => setEditForm({ ...editForm, is_blocked: true })}
                                            />
                                            <span>Suspended / Blocked</span>
                                        </label>
                                    </div>
                                </div>

                                {editForm.is_blocked && (
                                    <div className="admin-form-group">
                                        <label className="admin-label">Suspension Reason</label>
                                        <input
                                            type="text"
                                            className="admin-input"
                                            value={editForm.blocked_reason}
                                            onChange={(e) => setEditForm({ ...editForm, blocked_reason: e.target.value })}
                                            placeholder="Reason for suspension (shown during login attempt)"
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="admin-modal-footer">
                                <button
                                    type="button"
                                    className="admin-btn admin-btn-secondary"
                                    onClick={() => setEditingUser(null)}
                                    disabled={formSubmitting}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="admin-btn admin-btn-primary"
                                    disabled={formSubmitting}
                                >
                                    {formSubmitting ? 'Saving Changes...' : 'Save User Info'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ----------------- BLOCK / UNBLOCK MODAL ----------------- */}
            {blockingUser && (
                <div className="admin-modal-overlay" onClick={() => !formSubmitting && setBlockingUser(null)}>
                    <div className="admin-modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px' }}>
                        <div className="admin-modal-header">
                            <div>
                                <h3 className="admin-modal-title">
                                    {blockingUser.is_blocked ? 'Unblock Account' : 'Suspend Account Access'}
                                </h3>
                                <p className="admin-modal-desc">{blockingUser.full_name}</p>
                            </div>
                            <button className="admin-modal-close" onClick={() => !formSubmitting && setBlockingUser(null)}>
                                <X size={16} />
                            </button>
                        </div>

                        <div className="admin-modal-body">
                            <p style={{ fontSize: '0.86rem', color: '#475569', margin: '0 0 14px 0', lineHeight: 1.5 }}>
                                {blockingUser.is_blocked 
                                    ? `Are you sure you want to restore full login and store access for "${blockingUser.full_name}"?`
                                    : `Suspending "${blockingUser.full_name}" will immediately invalidate their active sessions and block any subsequent sign-ins.`
                                }
                            </p>

                            {!blockingUser.is_blocked && (
                                <div className="admin-form-group">
                                    <label className="admin-label">Suspension Reason (Optional)</label>
                                    <input
                                        type="text"
                                        className="admin-input"
                                        value={blockReason}
                                        onChange={(e) => setBlockReason(e.target.value)}
                                        placeholder="e.g. Terms violation, chargeback issue, invalid activity"
                                    />
                                </div>
                            )}
                        </div>

                        <div className="admin-modal-footer">
                            <button
                                type="button"
                                className="admin-btn admin-btn-secondary"
                                onClick={() => setBlockingUser(null)}
                                disabled={formSubmitting}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                className={`admin-btn ${blockingUser.is_blocked ? 'admin-btn-primary' : 'admin-btn-danger'}`}
                                onClick={handleConfirmBlock}
                                disabled={formSubmitting}
                            >
                                {formSubmitting ? 'Processing...' : blockingUser.is_blocked ? 'Confirm Unblock' : 'Suspend User'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ----------------- DELETE USER MODAL ----------------- */}
            {deletingUser && (
                <div className="admin-modal-overlay" onClick={() => !formSubmitting && setDeletingUser(null)}>
                    <div className="admin-modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px' }}>
                        <div className="admin-modal-header">
                            <div>
                                <h3 className="admin-modal-title" style={{ color: '#dc2626' }}>Delete User Account</h3>
                                <p className="admin-modal-desc">Permanent database removal</p>
                            </div>
                            <button className="admin-modal-close" onClick={() => !formSubmitting && setDeletingUser(null)}>
                                <X size={16} />
                            </button>
                        </div>

                        <div className="admin-modal-body">
                            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', background: '#fef2f2', padding: '14px', borderRadius: '10px', border: '1px solid #fee2e2' }}>
                                <AlertTriangle size={22} style={{ color: '#dc2626', flexShrink: 0, marginTop: '2px' }} />
                                <div>
                                    <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#991b1b', margin: '0 0 4px 0' }}>Warning: Destructive Action</h4>
                                    <p style={{ fontSize: '0.82rem', color: '#b91c1c', margin: 0, lineHeight: 1.45 }}>
                                        Are you sure you want to delete <strong>"{deletingUser.full_name}"</strong> ({deletingUser.email})? Associated carts, favorites, and saved delivery addresses will be cleaned up.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="admin-modal-footer">
                            <button
                                type="button"
                                className="admin-btn admin-btn-secondary"
                                onClick={() => setDeletingUser(null)}
                                disabled={formSubmitting}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                className="admin-btn admin-btn-danger"
                                onClick={handleConfirmDelete}
                                disabled={formSubmitting}
                            >
                                {formSubmitting ? 'Deleting...' : 'Delete Permanently'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ----------------- USER DETAILS MODAL ----------------- */}
            {viewingUser && (
                <div className="admin-modal-overlay" onClick={() => setViewingUser(null)}>
                    <div className="admin-modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
                        <div className="admin-modal-header">
                            <div>
                                <h3 className="admin-modal-title">User Account Overview</h3>
                                <p className="admin-modal-desc">Registered Member Profile</p>
                            </div>
                            <button className="admin-modal-close" onClick={() => setViewingUser(null)}>
                                <X size={16} />
                            </button>
                        </div>

                        <div className="admin-modal-body" style={{ maxHeight: '72vh', overflowY: 'auto' }}>
                            {/* Profile Header */}
                            <div className="admin-user-profile-header-card">
                                <div 
                                    className="admin-user-avatar"
                                    style={{
                                        width: '52px',
                                        height: '52px',
                                        fontSize: '1.25rem',
                                        background: viewingUser.is_blocked ? '#fee2e2' : '#ecfdf5',
                                        color: viewingUser.is_blocked ? '#dc2626' : '#059669'
                                    }}
                                >
                                    {getInitials(viewingUser.full_name)}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '4px', flexWrap: 'wrap' }}>
                                        <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#1e293b' }}>
                                            {viewingUser.full_name || 'Unnamed User'}
                                        </h3>
                                        <span className={`admin-badge ${viewingUser.role === 3 ? 'admin-badge-vendor' : 'admin-badge-customer'}`}>
                                            {viewingUser.role === 3 ? 'Vendor' : 'Customer'}
                                        </span>
                                        {viewingUser.is_blocked && (
                                            <span className="admin-badge admin-badge-danger">Suspended</span>
                                        )}
                                    </div>
                                    <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748b' }}>{viewingUser.email}</p>
                                </div>
                            </div>

                            {/* Metrics Grid */}
                            <div className="admin-user-metrics-grid">
                                <div className="admin-user-metric-box">
                                    <span className="metric-label">TOTAL ORDERS</span>
                                    <strong className="metric-val">{viewingUser.orders_count || (viewingUser.orders ? viewingUser.orders.length : 0)}</strong>
                                </div>
                                <div className="admin-user-metric-box">
                                    <span className="metric-label">CART ITEMS</span>
                                    <strong className="metric-val">{viewingUser.carts_count || 0}</strong>
                                </div>
                                <div className="admin-user-metric-box">
                                    <span className="metric-label">SAVED ADDRESSES</span>
                                    <strong className="metric-val">{viewingUser.addresses_count || (viewingUser.addresses ? viewingUser.addresses.length : 0)}</strong>
                                </div>
                            </div>

                            {/* Contact Details */}
                            <div className="admin-user-section-box">
                                <h4 className="admin-user-section-title">Contact Channels</h4>
                                <div className="admin-user-info-list">
                                    <div className="info-row">
                                        <span className="info-key">Primary Phone:</span>
                                        <strong className="info-val">{viewingUser.contact_number || 'Not provided'}</strong>
                                    </div>
                                    <div className="info-row">
                                        <span className="info-key">WhatsApp:</span>
                                        <strong className="info-val">{viewingUser.whatsapp_number || 'Not provided'}</strong>
                                    </div>
                                    <div className="info-row">
                                        <span className="info-key">Member Since:</span>
                                        <strong className="info-val">
                                            {viewingUser.created_at ? new Date(viewingUser.created_at).toLocaleString('en-IN') : '—'}
                                        </strong>
                                    </div>
                                </div>
                            </div>

                            {/* Saved Delivery Addresses */}
                            {viewingUser.addresses && viewingUser.addresses.length > 0 && (
                                <div className="admin-user-section-box">
                                    <h4 className="admin-user-section-title">Saved Delivery Addresses</h4>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        {viewingUser.addresses.map((addr, idx) => (
                                            <div key={addr.id || idx} className="admin-user-address-card">
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                                    <strong style={{ color: '#1e293b' }}>{addr.full_name || addr.name}</strong>
                                                    <span className="admin-badge admin-badge-neutral">{addr.type || 'Home'}</span>
                                                </div>
                                                <p style={{ margin: '0 0 4px 0', color: '#475569' }}>
                                                    {addr.address_line1 || addr.line1}, {addr.city}, {addr.state} - {addr.pincode}
                                                </p>
                                                <span style={{ color: '#64748b' }}>📞 {addr.phone_number}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Recent Orders */}
                            {viewingUser.orders && viewingUser.orders.length > 0 && (
                                <div className="admin-user-section-box">
                                    <h4 className="admin-user-section-title">Recent Orders</h4>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        {viewingUser.orders.map(order => (
                                            <div key={order.id} className="admin-user-order-card">
                                                <div>
                                                    <strong style={{ fontSize: '0.84rem', color: '#1e293b' }}>#{order.order_number || order.id}</strong>
                                                    <span style={{ fontSize: '0.76rem', color: '#64748b', display: 'block' }}>
                                                        {new Date(order.created_at).toLocaleDateString('en-IN')}
                                                    </span>
                                                </div>
                                                <div style={{ textAlign: 'right' }}>
                                                    <strong style={{ fontSize: '0.88rem', color: '#059669' }}>₹{order.total_amount}</strong>
                                                    <span className="admin-badge admin-badge-success" style={{ display: 'block', marginTop: '2px', fontSize: '0.68rem' }}>
                                                        {order.order_status || 'Confirmed'}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="admin-modal-footer">
                            <button
                                type="button"
                                className="admin-btn admin-btn-secondary"
                                onClick={() => setViewingUser(null)}
                            >
                                Close Details
                            </button>
                            <button
                                type="button"
                                className="admin-btn admin-btn-primary"
                                onClick={() => {
                                    const userToEdit = viewingUser;
                                    setViewingUser(null);
                                    handleOpenEdit(userToEdit);
                                }}
                            >
                                <Edit2 size={13} />
                                <span>Edit User Info</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
