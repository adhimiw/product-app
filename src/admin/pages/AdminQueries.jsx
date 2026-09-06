import React, { useState, useEffect } from 'react';
import { adminQueryService } from '../services/adminQueryService';
import TableSkeleton from '../components/TableSkeleton';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import { 
    Search, 
    RefreshCw, 
    Trash2, 
    CheckCircle2, 
    Clock, 
    AlertCircle, 
    Archive, 
    Mail, 
    Phone, 
    ExternalLink, 
    X, 
    MessageSquare, 
    Inbox,
    Send,
    Eye,
    Check,
    Copy,
    CornerDownRight,
    Sparkles,
    Calendar,
    User,
    FileText
} from 'lucide-react';

export default function AdminQueries() {
    const [queries, setQueries] = useState([]);
    const [counts, setCounts] = useState({ all: 0, pending: 0, in_progress: 0, resolved: 0, archived: 0 });
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedIds, setSelectedIds] = useState([]);
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
    const [copiedKey, setCopiedKey] = useState('');

    // Modals state
    const [selectedQueryForDetails, setSelectedQueryForDetails] = useState(null);
    const [selectedQueryForDelete, setSelectedQueryForDelete] = useState(null);
    const [selectedQueryForReply, setSelectedQueryForReply] = useState(null);
    const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);

    // Detail modal state
    const [modalAdminNotes, setModalAdminNotes] = useState('');
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
    const [notesSavedSuccess, setNotesSavedSuccess] = useState(false);

    // Reply modal form state
    const [replySubject, setReplySubject] = useState('');
    const [replyMessage, setReplyMessage] = useState('');
    const [replyStatusOnSend, setReplyStatusOnSend] = useState('resolved');
    const [isSendingReply, setIsSendingReply] = useState(false);

    // Delete modal loading state
    const [isDeleting, setIsDeleting] = useState(false);

    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 4000);
    };

    const handleCopyText = (text, key) => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        setCopiedKey(key);
        setTimeout(() => setCopiedKey(''), 2000);
    };

    const loadQueries = async (isManualRefresh = false) => {
        if (isManualRefresh) setRefreshing(true);
        else setLoading(true);

        const res = await adminQueryService.getQueries(searchTerm, statusFilter);
        if (res.success) {
            setQueries(res.data);
            setCounts(res.counts);
        } else {
            showToast(res.message || 'Failed to load queries', 'error');
        }

        setLoading(false);
        setRefreshing(false);
    };

    useEffect(() => {
        loadQueries();
    }, [statusFilter]);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        loadQueries();
    };

    // Quick inline status change
    const handleStatusChange = async (id, newStatus) => {
        setIsUpdatingStatus(true);
        const res = await adminQueryService.updateStatus(id, newStatus);
        setIsUpdatingStatus(false);

        if (res.success) {
            showToast(`Status updated to ${newStatus.replace('_', ' ')}`, 'success');
            setQueries(prev => prev.map(q => q.id === id ? { ...q, status: newStatus } : q));
            if (selectedQueryForDetails && selectedQueryForDetails.id === id) {
                setSelectedQueryForDetails(prev => ({ ...prev, status: newStatus }));
            }
            // Update counts
            const countRes = await adminQueryService.getQueries('', statusFilter);
            if (countRes.success) setCounts(countRes.counts);
        } else {
            showToast(res.message || 'Failed to update status', 'error');
        }
    };

    // Save admin notes inside detail modal
    const handleSaveAdminNotes = async () => {
        if (!selectedQueryForDetails) return;
        setIsUpdatingStatus(true);
        const res = await adminQueryService.updateStatus(selectedQueryForDetails.id, selectedQueryForDetails.status, modalAdminNotes);
        setIsUpdatingStatus(false);

        if (res.success) {
            setNotesSavedSuccess(true);
            setTimeout(() => setNotesSavedSuccess(false), 2500);
            showToast('Admin notes saved successfully', 'success');
            setQueries(prev => prev.map(q => q.id === selectedQueryForDetails.id ? { ...q, admin_notes: modalAdminNotes } : q));
            setSelectedQueryForDetails(prev => ({ ...prev, admin_notes: modalAdminNotes }));
        } else {
            showToast(res.message || 'Failed to save notes', 'error');
        }
    };

    // Open Reply Modal
    const handleOpenReplyModal = (query) => {
        setSelectedQueryForReply(query);
        setReplySubject(`Re: Inquiry - Mangalam Healthy Foods (${query.subject || 'Customer Support'})`);
        setReplyMessage(`Dear ${query.name},\n\nThank you for reaching out to Mangalam Healthy Foods!\n\nRegarding your query:\n"${query.message}"\n\n\n\nIf you have any questions or need further assistance, please feel free to reply to this email or reach us on WhatsApp at +91 7094074655.\n\nWarm regards,\nCustomer Care Team\nMangalam Healthy Foods\nhttps://mangalamhealthyfoods.com`);
        setReplyStatusOnSend('resolved');
    };

    // Submit Reply via API
    const handleSendReplySubmit = async (e) => {
        e.preventDefault();
        if (!selectedQueryForReply) return;
        if (!replySubject.trim() || !replyMessage.trim()) {
            showToast('Please fill in both subject and reply message', 'error');
            return;
        }

        setIsSendingReply(true);
        const res = await adminQueryService.replyToQuery(selectedQueryForReply.id, {
            subject: replySubject.trim(),
            message: replyMessage.trim(),
            status: replyStatusOnSend
        });
        setIsSendingReply(false);

        if (res.success) {
            showToast(res.message || 'Reply sent and inquiry marked as resolved!', 'success');
            setSelectedQueryForReply(null);
            if (selectedQueryForDetails && selectedQueryForDetails.id === selectedQueryForReply.id) {
                setSelectedQueryForDetails(null);
            }
            loadQueries();
        } else {
            showToast(res.message || 'Failed to send reply', 'error');
        }
    };

    // Confirm and Delete Single Query
    const handleConfirmDelete = async () => {
        if (!selectedQueryForDelete) return;
        setIsDeleting(true);
        const res = await adminQueryService.deleteQuery(selectedQueryForDelete.id);
        setIsDeleting(false);

        if (res.success) {
            showToast('Inquiry deleted successfully', 'success');
            setQueries(prev => prev.filter(q => q.id !== selectedQueryForDelete.id));
            setSelectedIds(prev => prev.filter(item => item !== selectedQueryForDelete.id));
            if (selectedQueryForDetails && selectedQueryForDetails.id === selectedQueryForDelete.id) {
                setSelectedQueryForDetails(null);
            }
            setSelectedQueryForDelete(null);
            // Refresh counts
            const countRes = await adminQueryService.getQueries('', statusFilter);
            if (countRes.success) setCounts(countRes.counts);
        } else {
            showToast(res.message || 'Failed to delete inquiry', 'error');
        }
    };

    // Confirm and Bulk Delete Queries
    const handleConfirmBulkDelete = async () => {
        if (selectedIds.length === 0) return;
        setIsDeleting(true);
        const res = await adminQueryService.bulkDelete(selectedIds);
        setIsDeleting(false);

        if (res.success) {
            showToast(res.message || 'Selected inquiries deleted successfully', 'success');
            setSelectedIds([]);
            setIsBulkDeleteModalOpen(false);
            loadQueries();
        } else {
            showToast(res.message || 'Failed to delete queries', 'error');
        }
    };

    // Bulk selection handlers
    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedIds(queries.map(q => q.id));
        } else {
            setSelectedIds([]);
        }
    };

    const handleSelectOne = (id) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
    };

    const handleBulkStatus = async (status) => {
        if (selectedIds.length === 0) return;
        const res = await adminQueryService.bulkUpdateStatus(selectedIds, status);
        if (res.success) {
            showToast(res.message, 'success');
            setSelectedIds([]);
            loadQueries();
        } else {
            showToast(res.message || 'Failed to update queries', 'error');
        }
    };

    const openDetailModal = (query) => {
        setSelectedQueryForDetails(query);
        setModalAdminNotes(query.admin_notes || '');
        setNotesSavedSuccess(false);
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'pending':
                return {
                    label: 'Pending',
                    bg: 'rgba(245, 158, 11, 0.12)',
                    color: '#d97706',
                    border: '1px solid rgba(245, 158, 11, 0.3)',
                    icon: <Clock size={12} />
                };
            case 'in_progress':
                return {
                    label: 'In Progress',
                    bg: 'rgba(59, 130, 246, 0.12)',
                    color: '#2563eb',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    icon: <AlertCircle size={12} />
                };
            case 'resolved':
                return {
                    label: 'Resolved',
                    bg: 'rgba(16, 185, 129, 0.12)',
                    color: '#059669',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    icon: <CheckCircle2 size={12} />
                };
            case 'archived':
                return {
                    label: 'Archived',
                    bg: 'rgba(107, 114, 128, 0.12)',
                    color: '#6b7280',
                    border: '1px solid rgba(107, 114, 128, 0.3)',
                    icon: <Archive size={12} />
                };
            default:
                return {
                    label: status,
                    bg: 'rgba(107, 114, 128, 0.12)',
                    color: '#6b7280',
                    border: '1px solid rgba(107, 114, 128, 0.3)',
                    icon: null
                };
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '—';
        try {
            const d = new Date(dateStr);
            return d.toLocaleDateString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return dateStr;
        }
    };

    return (
        <div className="admin-page-container">
            {/* Toast Notification */}
            {toast.show && (
                <div style={{
                    position: 'fixed',
                    top: '24px',
                    right: '24px',
                    zIndex: 99999,
                    background: toast.type === 'error' ? '#ef4444' : '#10b981',
                    color: '#ffffff',
                    padding: '12px 20px',
                    borderRadius: 'var(--admin-radius-md)',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    fontSize: '0.86rem',
                    fontWeight: 600,
                    animation: 'fadeIn 0.2s ease-out'
                }}>
                    <span>{toast.message}</span>
                </div>
            )}

            {/* Breadcrumbs matching Product Catalog Header */}
            <div className="admin-breadcrumbs" style={{ fontSize: '0.78rem', color: 'var(--admin-text-muted)', marginBottom: '4px', fontWeight: 600 }}>
                Admin / Support / <span style={{ color: 'var(--admin-text-main)' }}>Customer Inquiries</span>
            </div>

            {/* Page Header matching Product Page */}
            <div className="admin-page-header">
                <div>
                    <h1 className="admin-page-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        Customer Inquiries & Queries
                    </h1>
                    <p className="admin-page-subtitle">
                        Manage website customer messages, contact form submissions, and support requests.
                    </p>
                </div>
                <div className="admin-page-header-actions">
                    <button
                        className="admin-btn admin-btn-secondary"
                        onClick={() => loadQueries(true)}
                        disabled={refreshing}
                    >
                        <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
                        <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
                    </button>
                </div>
            </div>

            {/* KPI Stats Cards */}
            <div className="admin-stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', marginBottom: '20px' }}>
                <div 
                    className="admin-stat-card" 
                    style={{ cursor: 'pointer', border: statusFilter === 'all' ? '1.5px solid var(--admin-primary)' : '1px solid var(--admin-border-color)' }}
                    onClick={() => setStatusFilter('all')}
                >
                    <div className="admin-stat-label">Total Queries</div>
                    <div className="admin-stat-value">{counts.all}</div>
                </div>

                <div 
                    className="admin-stat-card" 
                    style={{ cursor: 'pointer', border: statusFilter === 'pending' ? '1.5px solid #f59e0b' : '1px solid var(--admin-border-color)' }}
                    onClick={() => setStatusFilter('pending')}
                >
                    <div className="admin-stat-label" style={{ color: '#d97706', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={12} /> Pending Action
                    </div>
                    <div className="admin-stat-value" style={{ color: '#d97706' }}>{counts.pending}</div>
                </div>

                <div 
                    className="admin-stat-card" 
                    style={{ cursor: 'pointer', border: statusFilter === 'in_progress' ? '1.5px solid #3b82f6' : '1px solid var(--admin-border-color)' }}
                    onClick={() => setStatusFilter('in_progress')}
                >
                    <div className="admin-stat-label" style={{ color: '#2563eb', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <AlertCircle size={12} /> In Progress
                    </div>
                    <div className="admin-stat-value" style={{ color: '#2563eb' }}>{counts.in_progress}</div>
                </div>

                <div 
                    className="admin-stat-card" 
                    style={{ cursor: 'pointer', border: statusFilter === 'resolved' ? '1.5px solid #10b981' : '1px solid var(--admin-border-color)' }}
                    onClick={() => setStatusFilter('resolved')}
                >
                    <div className="admin-stat-label" style={{ color: '#059669', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <CheckCircle2 size={12} /> Resolved
                    </div>
                    <div className="admin-stat-value" style={{ color: '#059669' }}>{counts.resolved}</div>
                </div>
            </div>

            {/* Main Table Card matching Product Page */}
            <div className="admin-card">
                {/* Search & Filter Bar */}
                <div className="admin-card-header">
                    <form onSubmit={handleSearchSubmit} className="admin-search-box">
                        <span className="admin-search-icon">
                            <Search size={15} />
                        </span>
                        <input
                            type="text"
                            placeholder="Search name, email, message..."
                            className="admin-search-input"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </form>

                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        <select
                            className="admin-select"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            style={{ width: 'auto', minWidth: '160px' }}
                        >
                            <option value="all">All Queries ({counts.all})</option>
                            <option value="pending">Pending ({counts.pending})</option>
                            <option value="in_progress">In Progress ({counts.in_progress})</option>
                            <option value="resolved">Resolved ({counts.resolved})</option>
                            <option value="archived">Archived ({counts.archived})</option>
                        </select>
                    </div>
                </div>

                {/* Bulk Actions Bar */}
                {selectedIds.length > 0 && (
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 16px',
                        background: 'var(--admin-surface-subtle)',
                        borderBottom: '1px solid var(--admin-border-color)',
                        fontSize: '0.82rem',
                        fontWeight: 600
                    }}>
                        <span>{selectedIds.length} inquiries selected</span>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)' }}>Change status:</span>
                            <button onClick={() => handleBulkStatus('in_progress')} className="admin-btn admin-btn-secondary" style={{ padding: '4px 8px', fontSize: '0.72rem' }}>
                                In Progress
                            </button>
                            <button onClick={() => handleBulkStatus('resolved')} className="admin-btn admin-btn-secondary" style={{ padding: '4px 8px', fontSize: '0.72rem', color: '#059669' }}>
                                Resolved
                            </button>
                            <button onClick={() => handleBulkStatus('archived')} className="admin-btn admin-btn-secondary" style={{ padding: '4px 8px', fontSize: '0.72rem' }}>
                                Archive
                            </button>
                            <button onClick={() => setIsBulkDeleteModalOpen(true)} className="admin-btn admin-btn-danger" style={{ padding: '4px 8px', fontSize: '0.72rem' }}>
                                <Trash2 size={12} /> Delete
                            </button>
                        </div>
                    </div>
                )}

                {/* Queries Table */}
                {loading ? (
                    <TableSkeleton rows={6} cols={6} />
                ) : queries.length === 0 ? (
                    <div className="admin-empty-state" style={{ padding: '60px 20px', textAlign: 'center' }}>
                        <div style={{
                            width: '56px',
                            height: '56px',
                            borderRadius: '50%',
                            background: 'var(--admin-surface-subtle)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 16px auto',
                            color: 'var(--admin-text-muted)'
                        }}>
                            <Inbox size={26} />
                        </div>
                        <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 6px 0', color: 'var(--admin-text-main)' }}>
                            No Customer Inquiries Found
                        </h3>
                        <p style={{ fontSize: '0.82rem', color: 'var(--admin-text-muted)', margin: 0 }}>
                            {searchTerm ? 'Try adjusting your search criteria.' : 'Customer messages submitted via the website contact form will appear here.'}
                        </p>
                    </div>
                ) : (
                    <div className="admin-table-responsive">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th style={{ width: '36px', textAlign: 'center', paddingLeft: '14px' }}>
                                        <input
                                            type="checkbox"
                                            onChange={handleSelectAll}
                                            checked={queries.length > 0 && selectedIds.length === queries.length}
                                        />
                                    </th>
                                    <th>CUSTOMER</th>
                                    <th>MESSAGE PREVIEW</th>
                                    <th>STATUS (QUICK CHANGE)</th>
                                    <th>SUBMITTED DATE</th>
                                    <th style={{ textAlign: 'right', paddingRight: '14px' }}>ACTIONS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {queries.map((q) => {
                                    const badge = getStatusBadge(q.status);
                                    return (
                                        <tr key={q.id} className={selectedIds.includes(q.id) ? 'selected' : ''}>
                                            <td style={{ textAlign: 'center', width: '36px', paddingLeft: '14px' }}>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedIds.includes(q.id)}
                                                    onChange={() => handleSelectOne(q.id)}
                                                />
                                            </td>

                                            {/* Customer Info */}
                                            <td>
                                                <div 
                                                    style={{ fontWeight: 700, color: 'var(--admin-text-main)', fontSize: '0.84rem', cursor: 'pointer' }}
                                                    onClick={() => openDetailModal(q)}
                                                >
                                                    {q.name}
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px', flexWrap: 'wrap' }}>
                                                    <a 
                                                        href={`mailto:${q.email}`} 
                                                        style={{ fontSize: '0.74rem', color: 'var(--admin-text-secondary)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        <Mail size={11} /> {q.email}
                                                    </a>
                                                    {q.phone && (
                                                        <span style={{ fontSize: '0.72rem', color: 'var(--admin-text-muted)' }}>
                                                            • {q.phone}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>

                                            {/* Message Snippet */}
                                            <td>
                                                <div 
                                                    style={{ 
                                                        fontSize: '0.8rem', 
                                                        color: 'var(--admin-text-secondary)', 
                                                        maxWidth: '320px', 
                                                        overflow: 'hidden', 
                                                        textOverflow: 'ellipsis', 
                                                        whiteSpace: 'nowrap',
                                                        cursor: 'pointer'
                                                    }}
                                                    onClick={() => openDetailModal(q)}
                                                    title={q.message}
                                                >
                                                    {q.message}
                                                </div>
                                                {q.admin_notes && (
                                                    <div style={{ fontSize: '0.7rem', color: 'var(--admin-primary)', marginTop: '2px', fontWeight: 600 }}>
                                                        Note: {q.admin_notes}
                                                    </div>
                                                )}
                                            </td>

                                            {/* Quick Status Select */}
                                            <td>
                                                <select
                                                    value={q.status}
                                                    onChange={(e) => handleStatusChange(q.id, e.target.value)}
                                                    style={{
                                                        fontSize: '0.74rem',
                                                        fontWeight: 700,
                                                        padding: '4px 8px',
                                                        borderRadius: 'var(--admin-radius-sm)',
                                                        background: badge.bg,
                                                        color: badge.color,
                                                        border: badge.border,
                                                        cursor: 'pointer',
                                                        outline: 'none'
                                                    }}
                                                >
                                                    <option value="pending" style={{ background: 'var(--admin-surface)', color: 'var(--admin-text-main)' }}>Pending</option>
                                                    <option value="in_progress" style={{ background: 'var(--admin-surface)', color: 'var(--admin-text-main)' }}>In Progress</option>
                                                    <option value="resolved" style={{ background: 'var(--admin-surface)', color: 'var(--admin-text-main)' }}>Resolved</option>
                                                    <option value="archived" style={{ background: 'var(--admin-surface)', color: 'var(--admin-text-main)' }}>Archived</option>
                                                </select>
                                            </td>

                                            {/* Submitted Date */}
                                            <td>
                                                <span style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)' }}>
                                                    {formatDate(q.created_at)}
                                                </span>
                                            </td>

                                            {/* Actions Group matching Product Table */}
                                            <td style={{ textAlign: 'right', paddingRight: '14px' }}>
                                                <div style={{ display: 'inline-flex', gap: '5px', alignItems: 'center' }}>
                                                    {/* View Details Button */}
                                                    <button
                                                        type="button"
                                                        className="admin-btn-icon"
                                                        title="View Inquiry Details"
                                                        onClick={() => openDetailModal(q)}
                                                        style={{ width: '28px', height: '28px', color: '#2563eb', background: 'rgba(59, 130, 246, 0.08)', borderColor: 'rgba(59, 130, 246, 0.2)' }}
                                                    >
                                                        <Eye size={13} strokeWidth={2.2} />
                                                    </button>

                                                    {/* Send Reply Modal Button */}
                                                    <button
                                                        type="button"
                                                        className="admin-btn-icon"
                                                        title="Compose & Send Reply"
                                                        onClick={() => handleOpenReplyModal(q)}
                                                        style={{ width: '28px', height: '28px', color: 'var(--admin-primary)', background: 'rgba(27, 59, 43, 0.08)', borderColor: 'rgba(27, 59, 43, 0.2)' }}
                                                    >
                                                        <Send size={13} strokeWidth={2} />
                                                    </button>

                                                    {/* Delete Modal Button */}
                                                    <button
                                                        type="button"
                                                        className="admin-btn-icon"
                                                        title="Delete Inquiry"
                                                        onClick={() => setSelectedQueryForDelete(q)}
                                                        style={{ width: '28px', height: '28px', color: 'var(--admin-danger-text)', background: 'rgba(239, 68, 68, 0.08)', borderColor: 'rgba(239, 68, 68, 0.2)' }}
                                                    >
                                                        <Trash2 size={13} strokeWidth={2} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* ========================================================= */}
            {/* 1. QUERY DETAIL MODAL (HIGH CONTRAST & SLEEK DESIGN)     */}
            {/* ========================================================= */}
            {selectedQueryForDetails && (
                <div className="admin-modal-backdrop" onClick={() => setSelectedQueryForDetails(null)}>
                    <div 
                        className="admin-modal-card" 
                        onClick={(e) => e.stopPropagation()}
                        style={{ maxWidth: '660px', width: '92%' }}
                    >
                        {/* Header */}
                        <div className="admin-modal-header" style={{ padding: '16px 22px', borderBottom: '1px solid var(--admin-border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--admin-surface-subtle)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{
                                    width: '34px',
                                    height: '34px',
                                    borderRadius: '8px',
                                    background: 'rgba(16, 185, 129, 0.12)',
                                    color: 'var(--admin-primary)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0
                                }}>
                                    <MessageSquare size={17} />
                                </div>
                                <div>
                                    <h3 className="admin-modal-title" style={{ fontSize: '1.05rem', margin: 0 }}>
                                        Inquiry from {selectedQueryForDetails.name}
                                    </h3>
                                    <span style={{ fontSize: '0.74rem', color: 'var(--admin-text-muted)' }}>
                                        Ticket #{selectedQueryForDetails.id} • Submitted on {formatDate(selectedQueryForDetails.created_at)}
                                    </span>
                                </div>
                            </div>
                            <button 
                                type="button"
                                className="admin-modal-close" 
                                onClick={() => setSelectedQueryForDetails(null)}
                                title="Close"
                            >
                                <X size={15} />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="admin-modal-body" style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '18px', maxHeight: '72vh', overflowY: 'auto' }}>
                            {/* Contact Overview Card */}
                            <div style={{
                                padding: '16px',
                                borderRadius: '12px',
                                background: 'var(--admin-surface-subtle)',
                                border: '1px solid var(--admin-border-color)',
                                display: 'grid',
                                gridTemplateColumns: 'repeat(2, 1fr)',
                                gap: '14px'
                            }}>
                                <div>
                                    <div style={{ fontSize: '0.68rem', color: 'var(--admin-text-muted)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '3px' }}>
                                        CUSTOMER NAME
                                    </div>
                                    <div style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--admin-text-main)' }}>
                                        {selectedQueryForDetails.name}
                                    </div>
                                </div>

                                <div>
                                    <div style={{ fontSize: '0.68rem', color: 'var(--admin-text-muted)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '3px' }}>
                                        SUBMITTED ON
                                    </div>
                                    <div style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--admin-text-secondary)' }}>
                                        {formatDate(selectedQueryForDetails.created_at)}
                                    </div>
                                </div>

                                <div>
                                    <div style={{ fontSize: '0.68rem', color: 'var(--admin-text-muted)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '3px' }}>
                                        EMAIL ADDRESS
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <a href={`mailto:${selectedQueryForDetails.email}`} style={{ fontSize: '0.86rem', fontWeight: 700, color: '#2563eb', textDecoration: 'none' }}>
                                            {selectedQueryForDetails.email}
                                        </a>
                                        <button
                                            type="button"
                                            onClick={() => handleCopyText(selectedQueryForDetails.email, 'email')}
                                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', color: copiedKey === 'email' ? '#10b981' : 'var(--admin-text-muted)' }}
                                            title="Copy email"
                                        >
                                            {copiedKey === 'email' ? <Check size={13} /> : <Copy size={13} />}
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <div style={{ fontSize: '0.68rem', color: 'var(--admin-text-muted)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '3px' }}>
                                        PHONE NUMBER
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <span style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--admin-text-main)' }}>
                                            {selectedQueryForDetails.phone || 'Not provided'}
                                        </span>
                                        {selectedQueryForDetails.phone && (
                                            <button
                                                type="button"
                                                onClick={() => handleCopyText(selectedQueryForDetails.phone, 'phone')}
                                                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', color: copiedKey === 'phone' ? '#10b981' : 'var(--admin-text-muted)' }}
                                                title="Copy phone"
                                            >
                                                {copiedKey === 'phone' ? <Check size={13} /> : <Copy size={13} />}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Status Selector with Clear, High-Contrast Buttons */}
                            <div>
                                <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '8px', color: 'var(--admin-text-muted)' }}>
                                    Inquiry Workflow Status
                                </label>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                                    {[
                                        { 
                                            id: 'pending', 
                                            label: 'Pending', 
                                            icon: <Clock size={13} />,
                                            activeBg: '#fef3c7',
                                            activeColor: '#92400e',
                                            activeBorder: '#f59e0b'
                                        },
                                        { 
                                            id: 'in_progress', 
                                            label: 'In Progress', 
                                            icon: <AlertCircle size={13} />,
                                            activeBg: '#dbeafe',
                                            activeColor: '#1e40af',
                                            activeBorder: '#3b82f6'
                                        },
                                        { 
                                            id: 'resolved', 
                                            label: 'Resolved', 
                                            icon: <CheckCircle2 size={13} />,
                                            activeBg: '#d1fae5',
                                            activeColor: '#065f46',
                                            activeBorder: '#10b981'
                                        },
                                        { 
                                            id: 'archived', 
                                            label: 'Archived', 
                                            icon: <Archive size={13} />,
                                            activeBg: '#f3f4f6',
                                            activeColor: '#1f2937',
                                            activeBorder: '#6b7280'
                                        }
                                    ].map((st) => {
                                        const isSelected = selectedQueryForDetails.status === st.id;
                                        return (
                                            <button
                                                key={st.id}
                                                type="button"
                                                onClick={() => handleStatusChange(selectedQueryForDetails.id, st.id)}
                                                disabled={isUpdatingStatus}
                                                style={{
                                                    padding: '10px 6px',
                                                    fontSize: '0.78rem',
                                                    fontWeight: isSelected ? 800 : 600,
                                                    borderRadius: '8px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: '5px',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.15s ease',
                                                    background: isSelected ? st.activeBg : 'var(--admin-card-bg)',
                                                    color: isSelected ? st.activeColor : 'var(--admin-text-secondary)',
                                                    border: isSelected ? `2px solid ${st.activeBorder}` : '1.5px solid var(--admin-border-color)',
                                                    boxShadow: isSelected ? '0 2px 8px rgba(0, 0, 0, 0.08)' : 'none'
                                                }}
                                            >
                                                {st.icon}
                                                <span>{st.label}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Customer Message Box */}
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                    <label style={{ fontSize: '0.76rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', margin: 0, color: 'var(--admin-text-muted)' }}>
                                        Customer Message
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => handleCopyText(selectedQueryForDetails.message, 'msg')}
                                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px 6px', fontSize: '0.72rem', color: copiedKey === 'msg' ? '#10b981' : 'var(--admin-text-muted)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                                    >
                                        {copiedKey === 'msg' ? <><Check size={11} /> Copied</> : <><Copy size={11} /> Copy Message</>}
                                    </button>
                                </div>
                                <div style={{
                                    padding: '16px 18px',
                                    borderRadius: '10px',
                                    background: 'var(--admin-surface-subtle)',
                                    border: '1px solid var(--admin-border-color)',
                                    borderLeft: '4px solid var(--admin-primary)',
                                    fontSize: '0.88rem',
                                    lineHeight: '1.6',
                                    color: 'var(--admin-text-main)',
                                    whiteSpace: 'pre-wrap',
                                    boxShadow: 'var(--admin-shadow-xs)'
                                }}>
                                    {selectedQueryForDetails.message}
                                </div>
                            </div>

                            {/* Internal Admin Notes */}
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                    <label style={{ fontSize: '0.76rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', margin: 0, color: 'var(--admin-text-muted)' }}>
                                        Internal Team Notes & History
                                    </label>
                                    {notesSavedSuccess && (
                                        <span style={{ fontSize: '0.74rem', color: '#059669', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                            <Check size={12} /> Notes Saved!
                                        </span>
                                    )}
                                </div>
                                <textarea
                                    rows="3"
                                    placeholder="Add notes for your team (e.g., 'Called customer on WhatsApp, quoted bulk prices')..."
                                    value={modalAdminNotes}
                                    onChange={(e) => setModalAdminNotes(e.target.value)}
                                    className="admin-input"
                                    style={{ width: '100%', resize: 'vertical', fontSize: '0.82rem', lineHeight: '1.5' }}
                                />
                                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '6px' }}>
                                    <button
                                        type="button"
                                        onClick={handleSaveAdminNotes}
                                        disabled={isUpdatingStatus}
                                        className="admin-btn admin-btn-secondary"
                                        style={{ padding: '6px 14px', fontSize: '0.76rem' }}
                                    >
                                        Save Notes
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="admin-modal-footer" style={{ padding: '14px 22px', borderTop: '1px solid var(--admin-border-color)', background: 'var(--admin-surface-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <button
                                type="button"
                                className="admin-btn admin-btn-danger"
                                onClick={() => {
                                    setSelectedQueryForDelete(selectedQueryForDetails);
                                }}
                                style={{ padding: '8px 16px', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                            >
                                <Trash2 size={13} />
                                <span>Delete</span>
                            </button>

                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button
                                    type="button"
                                    className="admin-btn admin-btn-secondary"
                                    onClick={() => setSelectedQueryForDetails(null)}
                                    style={{ padding: '8px 18px', fontSize: '0.8rem' }}
                                >
                                    Close
                                </button>
                                <button
                                    type="button"
                                    className="admin-btn admin-btn-primary"
                                    onClick={() => {
                                        handleOpenReplyModal(selectedQueryForDetails);
                                    }}
                                    style={{ padding: '8px 20px', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                                >
                                    <Send size={13} />
                                    <span>Compose Reply</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ========================================================= */}
            {/* 2. SEND REPLY MODAL POPUP (HIGH-END DESIGN)               */}
            {/* ========================================================= */}
            {selectedQueryForReply && (
                <div className="admin-modal-backdrop" onClick={() => !isSendingReply && setSelectedQueryForReply(null)}>
                    <div 
                        className="admin-modal-card" 
                        onClick={(e) => e.stopPropagation()}
                        style={{ maxWidth: '660px', width: '92%' }}
                    >
                        {/* Header */}
                        <div className="admin-modal-header" style={{ padding: '16px 22px', borderBottom: '1px solid var(--admin-border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--admin-surface-subtle)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{
                                    width: '34px',
                                    height: '34px',
                                    borderRadius: '8px',
                                    background: 'rgba(27, 59, 43, 0.1)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'var(--admin-primary)',
                                    flexShrink: 0
                                }}>
                                    <Send size={16} />
                                </div>
                                <div>
                                    <h3 className="admin-modal-title" style={{ fontSize: '1.05rem', margin: 0 }}>
                                        Compose Reply to {selectedQueryForReply.name}
                                    </h3>
                                    <span style={{ fontSize: '0.74rem', color: 'var(--admin-text-muted)' }}>
                                        Direct recipient: <strong style={{ color: 'var(--admin-text-main)' }}>{selectedQueryForReply.email}</strong>
                                    </span>
                                </div>
                            </div>
                            <button className="admin-modal-close" onClick={() => setSelectedQueryForReply(null)} disabled={isSendingReply}>
                                <X size={15} />
                            </button>
                        </div>

                        {/* Form Body */}
                        <form onSubmit={handleSendReplySubmit}>
                            <div className="admin-modal-body" style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: '72vh', overflowY: 'auto' }}>
                                {/* Original Message Quote Box */}
                                <div style={{
                                    padding: '12px 16px',
                                    borderRadius: '8px',
                                    background: 'var(--admin-surface-subtle)',
                                    border: '1px solid var(--admin-border-color)',
                                    fontSize: '0.80rem',
                                    color: 'var(--admin-text-secondary)',
                                    lineHeight: '1.45'
                                }}>
                                    <div style={{ fontWeight: 800, color: 'var(--admin-text-muted)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px', textTransform: 'uppercase', fontSize: '0.68rem', letterSpacing: '0.04em' }}>
                                        <CornerDownRight size={12} /> Original Customer Query:
                                    </div>
                                    <p style={{ margin: 0, fontStyle: 'italic', color: 'var(--admin-text-main)' }}>
                                        "{selectedQueryForReply.message}"
                                    </p>
                                </div>

                                {/* Subject Line */}
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px', color: 'var(--admin-text-muted)' }}>
                                        Email Subject *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        className="admin-input"
                                        style={{ width: '100%', fontSize: '0.84rem' }}
                                        value={replySubject}
                                        onChange={(e) => setReplySubject(e.target.value)}
                                        disabled={isSendingReply}
                                    />
                                </div>

                                {/* Message Body */}
                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                        <label style={{ fontSize: '0.76rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', margin: 0, color: 'var(--admin-text-muted)' }}>
                                            Reply Message Body *
                                        </label>
                                        <span style={{ fontSize: '0.72rem', color: 'var(--admin-text-muted)' }}>
                                            HTML & Plaintext supported
                                        </span>
                                    </div>
                                    <textarea
                                        required
                                        rows="8"
                                        className="admin-input"
                                        style={{ width: '100%', resize: 'vertical', fontFamily: 'inherit', fontSize: '0.84rem', lineHeight: '1.55' }}
                                        value={replyMessage}
                                        onChange={(e) => setReplyMessage(e.target.value)}
                                        disabled={isSendingReply}
                                    />
                                </div>

                                {/* Update Status Setting */}
                                <div style={{
                                    padding: '12px 16px',
                                    background: 'var(--admin-surface-subtle)',
                                    borderRadius: '8px',
                                    border: '1px solid var(--admin-border-color)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between'
                                }}>
                                    <div>
                                        <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--admin-text-main)' }}>
                                            Set Inquiry Status on Send:
                                        </div>
                                        <div style={{ fontSize: '0.72rem', color: 'var(--admin-text-muted)' }}>
                                            Automatically transition workflow status after emailing customer.
                                        </div>
                                    </div>

                                    <select
                                        value={replyStatusOnSend}
                                        onChange={(e) => setReplyStatusOnSend(e.target.value)}
                                        className="admin-input"
                                        style={{ padding: '6px 12px', fontSize: '0.78rem', fontWeight: 700, minWidth: '140px' }}
                                    >
                                        <option value="resolved">Resolved (Done)</option>
                                        <option value="in_progress">In Progress</option>
                                        <option value="pending">Keep Pending</option>
                                    </select>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="admin-modal-footer" style={{ padding: '14px 22px', borderTop: '1px solid var(--admin-border-color)', background: 'var(--admin-surface-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <a
                                    href={`mailto:${selectedQueryForReply.email}?subject=${encodeURIComponent(replySubject)}&body=${encodeURIComponent(replyMessage)}`}
                                    className="admin-btn admin-btn-secondary"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{ fontSize: '0.76rem', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                                >
                                    <ExternalLink size={13} /> Open Mail Client
                                </a>

                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <button
                                        type="button"
                                        className="admin-btn admin-btn-secondary"
                                        onClick={() => setSelectedQueryForReply(null)}
                                        disabled={isSendingReply}
                                        style={{ padding: '8px 18px', fontSize: '0.8rem' }}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="admin-btn admin-btn-primary"
                                        disabled={isSendingReply}
                                        style={{ padding: '8px 22px', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                                    >
                                        <Send size={13} />
                                        <span>{isSendingReply ? 'Sending Email...' : 'Send Email Reply'}</span>
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ========================================================= */}
            {/* 3. DEDICATED DELETE CONFIRMATION MODALS                   */}
            {/* ========================================================= */}
            {/* Single Delete Confirmation Modal */}
            <ConfirmDeleteModal
                isOpen={!!selectedQueryForDelete}
                title="Delete Customer Inquiry"
                itemName={selectedQueryForDelete ? `Inquiry from ${selectedQueryForDelete.name} (${selectedQueryForDelete.email})` : ''}
                warningText="This action cannot be undone and will permanently remove this customer inquiry from the database."
                onConfirm={handleConfirmDelete}
                onCancel={() => setSelectedQueryForDelete(null)}
                isDeleting={isDeleting}
            />

            {/* Bulk Delete Confirmation Modal */}
            <ConfirmDeleteModal
                isOpen={isBulkDeleteModalOpen}
                title="Delete Selected Customer Inquiries"
                itemName={`${selectedIds.length} selected inquiry records`}
                warningText="This action cannot be undone and will permanently remove all selected inquiries from the database."
                onConfirm={handleConfirmBulkDelete}
                onCancel={() => setIsBulkDeleteModalOpen(false)}
                isDeleting={isDeleting}
            />
        </div>
    );
}
