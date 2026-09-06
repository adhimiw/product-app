import React, { useState, useEffect } from 'react';
import '../adminWhatsApp.css';
import { adminWhatsAppService } from '../services/adminWhatsAppService';
import { 
    MessageSquare, 
    QrCode, 
    LogOut, 
    RefreshCw, 
    Search, 
    Sliders, 
    CheckCircle2, 
    Clock, 
    Phone, 
    ExternalLink, 
    Eye, 
    Trash2, 
    Copy, 
    Check, 
    X, 
    AlertTriangle, 
    Zap, 
    Package, 
    Truck, 
    Sparkles, 
    ShoppingBag, 
    Bell, 
    ShieldCheck,
    CheckCheck,
    ArrowUpRight,
    Activity,
    Info
} from 'lucide-react';

export default function AdminWhatsApp() {
    // Gateway & Session State - Phone is strictly null until genuine QR scan
    const [statusData, setStatusData] = useState({
        status: 'SCAN_QR',
        session: 'mangalam-admin',
        is_enabled: true,
        phone: null
    });
    const [statusLoading, setStatusLoading] = useState(false);

    // Logs & Filter State
    const [logs, setLogs] = useState([]);
    const [logsLoading, setLogsLoading] = useState(true);
    const [logsRefreshing, setLogsRefreshing] = useState(false);
    const [counts, setCounts] = useState({
        total: 0,
        order_placed: 0,
        shipped: 0,
        delivered: 0,
        admin_alerts: 0
    });
    const [searchQuery, setSearchQuery] = useState('');
    const [filterTab, setFilterTab] = useState('all');

    // Modals
    const [isQrModalOpen, setIsQrModalOpen] = useState(false);
    const [qrCodeUrl, setQrCodeUrl] = useState('');
    const [isQrLoading, setIsQrLoading] = useState(false);
    const [isQrRefreshing, setIsQrRefreshing] = useState(false);
    const [qrCountdown, setQrCountdown] = useState(25);
    const [qrFeedback, setQrFeedback] = useState('');
    const [isQrConnected, setIsQrConnected] = useState(false);

    // Disconnect / OTP Modal
    const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
    const [otpInput, setOtpInput] = useState('');
    const [otpLoading, setOtpLoading] = useState(false);
    const [otpStatus, setOtpStatus] = useState(null);
    const [otpTestPreview, setOtpTestPreview] = useState(null);

    // View Full Message Modal
    const [selectedMessage, setSelectedMessage] = useState(null);
    const [copiedText, setCopiedText] = useState(false);

    // Keepalive Ping Telemetry
    const [isPinging, setIsPinging] = useState(false);
    const [pingTelemetry, setPingTelemetry] = useState(null);
    const [pingFeedback, setPingFeedback] = useState(null);
    const [isLogsModalOpen, setIsLogsModalOpen] = useState(false);
    const [keepaliveLogs, setKeepaliveLogs] = useState([]);
    const [keepaliveLoading, setKeepaliveLoading] = useState(false);

    // Settings Modal
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
    const [settingsData, setSettingsData] = useState({
        admin_phone_number: '',
        is_enabled: true,
        notify_customer_on_order: true,
        notify_admin_on_order: true,
        auto_reply_enabled: true,
    });
    const [settingsSaving, setSettingsSaving] = useState(false);
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 4000);
    };

    // Initial Load
    useEffect(() => {
        loadStatus();
        loadLogs();
    }, []);

    // Filter or Search Change
    useEffect(() => {
        loadLogs(searchQuery, filterTab, false);
    }, [filterTab]);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        loadLogs(searchQuery, filterTab, false);
    };

    const loadStatus = async () => {
        setStatusLoading(true);
        try {
            const res = await adminWhatsAppService.getStatus();
            if (res) {
                setStatusData(res);
                if (res.ping_telemetry) {
                    setPingTelemetry(res.ping_telemetry);
                }
            }
        } catch (e) {
            console.error('Error loading WhatsApp status', e);
        } finally {
            setStatusLoading(false);
        }
    };

    const loadLogs = async (search = searchQuery, filter = filterTab, isRefresh = true) => {
        if (isRefresh) setLogsRefreshing(true);
        try {
            const res = await adminWhatsAppService.getMessageLogs({ search, filter });
            if (res && res.data) {
                setLogs(res.data);
                if (res.counts) {
                    setCounts(res.counts);
                }
            }
        } catch (e) {
            console.error('Error loading message logs:', e);
        } finally {
            setLogsLoading(false);
            setLogsRefreshing(false);
        }
    };

    // QR Code Auto-Refresh & Phone Scan Detector
    useEffect(() => {
        if (!isQrModalOpen || isQrConnected) return;

        const countdownTimer = setInterval(() => {
            setQrCountdown(prev => {
                if (prev <= 1) {
                    fetchQrCode(false);
                    return 25;
                }
                return prev - 1;
            });
        }, 1000);

        const statusChecker = setInterval(async () => {
            try {
                const statusRes = await adminWhatsAppService.getStatus();
                const isConn = (statusRes?.status === 'CONNECTED' || statusRes?.status === 'ready') && Boolean(statusRes?.phone);
                
                if (isConn) {
                    setQrCodeUrl('');
                    setIsQrConnected(true);
                    setStatusData(statusRes);
                    const phoneNum = statusRes.phone;
                    setQrFeedback(`🎉 WhatsApp Connected Successfully! Linked to +${phoneNum}`);
                    showToast(`🎉 WhatsApp Linked: +${phoneNum}`, 'success');
                    setTimeout(() => {
                        setIsQrModalOpen(false);
                        setIsQrConnected(false);
                    }, 1800);
                }
            } catch (e) {}
        }, 1400);

        return () => {
            clearInterval(countdownTimer);
            clearInterval(statusChecker);
        };
    }, [isQrModalOpen, isQrConnected]);

    const fetchQrCode = async (isManual = false) => {
        if (isManual) {
            setIsQrRefreshing(true);
            setQrFeedback('Refreshing cryptographic QR code...');
        } else if (!qrCodeUrl) {
            setIsQrLoading(true);
        }

        try {
            const qrRes = await adminWhatsAppService.getQrCode();
            const isConn = (qrRes?.status === 'ready' || qrRes?.status === 'CONNECTED') && Boolean(qrRes?.phone);
            
            if (isConn) {
                setQrCodeUrl('');
                setIsQrConnected(true);
                const phoneNum = qrRes.phone;
                setStatusData(prev => ({ ...prev, status: 'CONNECTED', phone: phoneNum }));
                setQrFeedback(`🎉 WhatsApp Connected Successfully! Linked to +${phoneNum}`);
                showToast(`🎉 WhatsApp Linked: +${phoneNum}`, 'success');
                loadStatus();
                setTimeout(() => {
                    setIsQrModalOpen(false);
                    setIsQrConnected(false);
                }, 1800);
                return;
            }

            const qrImg = qrRes?.qrCode || qrRes?.qr || null;
            if (qrImg) {
                setQrCodeUrl(qrImg);
                setQrCountdown(25);
                if (isManual) {
                    setQrFeedback('QR Code refreshed! Scan within 25 seconds.');
                    setTimeout(() => setQrFeedback(''), 3000);
                } else {
                    setQrFeedback('');
                }
            } else {
                setQrFeedback(qrRes?.message || 'Awaiting QR generation from OpenWA gateway...');
            }
        } catch (err) {
            console.error('Error fetching QR code:', err);
            setQrFeedback('Failed to generate QR. Retrying...');
        } finally {
            setIsQrLoading(false);
            setIsQrRefreshing(false);
        }
    };

    const handleOpenQrModal = () => {
        setIsQrModalOpen(true);
        setIsQrConnected(false);
        setQrCodeUrl('');
        setQrCountdown(25);
        setQrFeedback('Connecting to OpenWA gateway for fresh QR...');
        fetchQrCode(false);
    };

    const handleOpenLogoutModal = async () => {
        setIsOtpModalOpen(true);
        setOtpInput('');
        setOtpLoading(true);
        setOtpStatus({ type: 'info', text: 'Generating and dispatching 6-digit OTP to Admin WhatsApp...' });
        
        try {
            const res = await adminWhatsAppService.requestLogoutOtp();
            if (res.success) {
                const phoneLabel = res.admin_phone ? `+${res.admin_phone}` : 'your linked phone';
                setOtpStatus({
                    type: 'info',
                    text: `OTP dispatched to Admin WhatsApp (${phoneLabel}). Check your WhatsApp app.`
                });
                if (res.test_otp_preview) {
                    setOtpTestPreview(res.test_otp_preview);
                }
            } else {
                setOtpStatus({
                    type: 'error',
                    text: res.message || 'Failed to dispatch OTP. Check OpenWA gateway connection.'
                });
            }
        } catch (err) {
            setOtpStatus({ type: 'error', text: 'Network error requesting OTP.' });
        } finally {
            setOtpLoading(false);
        }
    };

    const handleVerifyLogoutOtp = async (performDisconnect = false) => {
        if (!otpInput || otpInput.trim().length !== 6) return;
        setOtpLoading(true);
        try {
            const res = await adminWhatsAppService.verifyLogoutOtp(otpInput.trim(), performDisconnect);
            if (res.success) {
                setOtpStatus({
                    type: 'success',
                    text: `✅ ${res.message}`
                });
                if (performDisconnect) {
                    showToast('🚪 WhatsApp session disconnected.', 'info');
                    setStatusData(prev => ({ ...prev, status: 'SCAN_QR', phone: null }));
                    loadStatus();
                    setTimeout(() => setIsOtpModalOpen(false), 1800);
                }
            } else {
                setOtpStatus({
                    type: 'error',
                    text: res.message || 'Invalid or expired OTP. Please try again.'
                });
            }
        } catch (err) {
            setOtpStatus({ type: 'error', text: 'Verification error.' });
        } finally {
            setOtpLoading(false);
        }
    };

    const handlePingGateway = async (wake = false) => {
        setIsPinging(true);
        setPingFeedback('⚡ Pinging gateway...');
        try {
            const res = await adminWhatsAppService.pingGateway(wake);
            if (res) {
                setPingTelemetry(res);
                if (res.success) {
                    setPingFeedback(`✅ Awake (${res.latency_ms || 120}ms)`);
                    showToast(`Gateway healthy: ${res.latency_ms || 120}ms`, 'success');
                } else if (res.status === 'SLEEPING') {
                    setPingFeedback('🟡 Gateway waking up...');
                    showToast('Gateway waking up from standby...', 'info');
                } else {
                    setPingFeedback(`❌ ${res.message || 'Ping failed'}`);
                }
            }
        } catch (e) {
            setPingFeedback('❌ Ping error');
        } finally {
            setIsPinging(false);
            setTimeout(() => setPingFeedback(null), 4000);
        }
    };

    const handleOpenKeepaliveLogs = async () => {
        setIsLogsModalOpen(true);
        setKeepaliveLoading(true);
        try {
            const logs = await adminWhatsAppService.getKeepaliveLogs(50);
            setKeepaliveLogs(logs || []);
        } catch (e) {
            console.error('Failed to load keepalive logs', e);
        } finally {
            setKeepaliveLoading(false);
        }
    };

    const handleOpenSettingsModal = async () => {
        setIsSettingsModalOpen(true);
        try {
            const current = await adminWhatsAppService.getSettings();
            if (current) {
                setSettingsData({
                    admin_phone_number: current.admin_phone_number || '',
                    is_enabled: current.is_enabled !== false,
                    notify_customer_on_order: current.notify_customer_on_order !== false,
                    notify_admin_on_order: current.notify_admin_on_order !== false,
                    auto_reply_enabled: current.auto_reply_enabled !== false,
                });
            }
        } catch (err) {
            console.error('Error fetching settings:', err);
        }
    };

    const handleSaveSettings = async (e) => {
        e.preventDefault();
        setSettingsSaving(true);
        try {
            const res = await adminWhatsAppService.updateSettings(settingsData);
            if (res.success) {
                showToast('WhatsApp notification settings updated!', 'success');
                setIsSettingsModalOpen(false);
                loadStatus();
            } else {
                alert(res.message || 'Failed to save settings.');
            }
        } catch (err) {
            console.error('Save settings error:', err);
            alert('Failed to update WhatsApp settings.');
        } finally {
            setSettingsSaving(false);
        }
    };

    const handleDeleteLog = async (id) => {
        if (!window.confirm('Delete this dispatched message log record?')) return;
        try {
            const res = await adminWhatsAppService.deleteMessage(id);
            if (res.success) {
                setLogs(prev => prev.filter(l => l.id !== id));
                showToast('Log record removed.', 'info');
            }
        } catch (e) {
            console.error('Delete log error:', e);
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        setCopiedText(true);
        setTimeout(() => setCopiedText(false), 2000);
    };

    // Helper to render event badge
    const renderEventBadge = (type, label) => {
        switch (type) {
            case 'order_placed':
                return (
                    <span className="wa-event-pill wa-event-order">
                        <ShoppingBag size={12} />
                        {label || 'Order Placed'}
                    </span>
                );
            case 'shipped':
                return (
                    <span className="wa-event-pill wa-event-shipped">
                        <Truck size={12} />
                        {label || 'Shipped'}
                    </span>
                );
            case 'delivered':
                return (
                    <span className="wa-event-pill wa-event-delivered">
                        <CheckCircle2 size={12} />
                        {label || 'Delivered'}
                    </span>
                );
            case 'processing':
                return (
                    <span className="wa-event-pill wa-event-processing">
                        <Package size={12} />
                        {label || 'Processing'}
                    </span>
                );
            case 'admin_alert':
            case 'status_updated':
                return (
                    <span className="wa-event-pill wa-event-admin">
                        <Bell size={12} />
                        {label || 'Admin Alert'}
                    </span>
                );
            case 'otp':
                return (
                    <span className="wa-event-pill wa-event-otp">
                        <ShieldCheck size={12} />
                        {label || 'OTP Security'}
                    </span>
                );
            default:
                return (
                    <span className="wa-event-pill wa-event-general">
                        <MessageSquare size={12} />
                        {label || 'Notification'}
                    </span>
                );
        }
    };

    // Format bold WhatsApp markdown (*bold*)
    const formatWhatsAppMarkdown = (text) => {
        if (!text) return null;
        const lines = text.split('\n');
        return lines.map((line, lIdx) => {
            const parts = line.split(/(\*[^*]+\*)/g);
            return (
                <div key={lIdx} style={{ minHeight: '1.25em', marginBottom: '2px' }}>
                    {parts.map((part, pIdx) => {
                        if (part.startsWith('*') && part.endsWith('*')) {
                            return <strong key={pIdx} style={{ fontWeight: 700 }}>{part.slice(1, -1)}</strong>;
                        }
                        return <span key={pIdx}>{part}</span>;
                    })}
                </div>
            );
        });
    };

    // A session is strictly connected ONLY if status is ready/connected AND a genuine scanned phone is present
    const isConnected = (statusData.status === 'CONNECTED' || statusData.status === 'ready') && Boolean(statusData.phone);

    return (
        <div className="wa-gateway-dashboard">
            {/* Toast Banner */}
            {toast.show && (
                <div className={`wa-toast-banner ${toast.type}`}>
                    <CheckCircle2 size={16} />
                    <span>{toast.message}</span>
                </div>
            )}

            {/* Header Toolbar */}
            <div className="wa-top-header">
                <div className="wa-header-brand">
                    <div className="wa-brand-icon-wrapper">
                        <MessageSquare size={24} className="wa-brand-icon" />
                    </div>
                    <div>
                        <div className="wa-title-row">
                            <h1 className="wa-main-title">WhatsApp Notification Gateway</h1>
                            <span className={`wa-conn-badge ${isConnected ? 'connected' : (statusData.status === 'SCAN_QR' ? 'scan_qr' : 'offline')}`}>
                                <span className="wa-pulse-circle"></span>
                                {isConnected 
                                    ? `Live (+${statusData.phone})` 
                                    : (statusData.status === 'SCAN_QR' ? 'Awaiting QR Scan' : 'Gateway Standby')}
                            </span>
                        </div>
                        <p className="wa-subtitle">
                            Automated dispatch logs for customer order confirmations, shipping tracking updates, and delivery alerts.
                        </p>
                    </div>
                </div>

                <div className="wa-header-actions">
                    <button
                        className="wa-action-btn wa-btn-outline"
                        onClick={() => handlePingGateway(true)}
                        disabled={isPinging}
                        title="Ping and wake OpenWA Render Gateway"
                    >
                        <Zap size={15} className={isPinging ? 'wa-icon-spin' : ''} />
                        <span>{isPinging ? 'Pinging...' : (pingFeedback || 'Ping Gateway')}</span>
                    </button>

                    <button
                        className="wa-action-btn wa-btn-outline"
                        onClick={handleOpenKeepaliveLogs}
                        title="View keep-alive ping history"
                    >
                        <Activity size={15} />
                        <span>Telemetry</span>
                    </button>

                    <button
                        className="wa-action-btn wa-btn-outline"
                        onClick={handleOpenSettingsModal}
                        title="Configure WhatsApp Auto-Replies & Hooks"
                    >
                        <Sliders size={15} />
                        <span>Settings</span>
                    </button>

                    {isConnected ? (
                        <button
                            className="wa-action-btn wa-btn-danger"
                            onClick={handleOpenLogoutModal}
                            title="Disconnect WhatsApp session via Admin OTP"
                        >
                            <LogOut size={15} />
                            <span>Disconnect</span>
                        </button>
                    ) : (
                        <button
                            className="wa-action-btn wa-btn-primary"
                            onClick={handleOpenQrModal}
                            title="Scan QR Code to link WhatsApp account"
                        >
                            <QrCode size={16} />
                            <span>Scan QR to Connect</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Gateway Status & Hook Overview Card */}
            <div className="wa-session-overview-card">
                <div className="wa-session-left">
                    <div className={`wa-session-avatar ${isConnected ? 'connected' : ''}`}>
                        <Phone size={22} />
                    </div>
                    <div className="wa-session-info">
                        <div className="wa-session-label">Linked WhatsApp Business Device</div>
                        <div className="wa-session-phone">
                            {isConnected && statusData.phone ? (
                                <>
                                    <span>+{statusData.phone}</span>
                                    <span className="wa-verified-pill">
                                        <ShieldCheck size={13} /> Active Session
                                    </span>
                                </>
                            ) : (
                                <span className="wa-no-device-text">
                                    No Device Linked (Scan QR to Connect)
                                </span>
                            )}
                        </div>
                        <div className="wa-session-meta">
                            {isConnected && statusData.phone ? (
                                <>Gateway: OpenWA v4.4 • Session: <code>{statusData.session || 'mangalam-admin'}</code> • Mode: REST API Multi-Tenant</>
                            ) : (
                                <>Awaiting device scan. Click "Scan QR to Connect" and scan the code with WhatsApp to link your number.</>
                            )}
                        </div>
                    </div>
                </div>

                <div className="wa-session-hooks">
                    <div className="wa-hook-item">
                        <div className={`wa-hook-dot ${isConnected ? 'active' : ''}`}></div>
                        <span>🛒 Order Placed: <strong>{isConnected ? 'Auto-Dispatch Active' : 'Standby'}</strong></span>
                    </div>
                    <div className="wa-hook-item">
                        <div className={`wa-hook-dot ${isConnected ? 'active' : ''}`}></div>
                        <span>🚚 Order Shipped: <strong>{isConnected ? 'Tracking Dispatch Active' : 'Standby'}</strong></span>
                    </div>
                    <div className="wa-hook-item">
                        <div className={`wa-hook-dot ${isConnected ? 'active' : ''}`}></div>
                        <span>🎉 Order Delivered: <strong>{isConnected ? 'Tip Dispatch Active' : 'Standby'}</strong></span>
                    </div>
                    <div className="wa-hook-item">
                        <div className={`wa-hook-dot ${isConnected ? 'active' : ''}`}></div>
                        <span>🚨 Admin Alerts: <strong>{isConnected ? 'Instant SMS/WA Enabled' : 'Standby'}</strong></span>
                    </div>
                </div>
            </div>

            {/* Metrics KPI Cards */}
            <div className="wa-kpi-grid">
                <div className={`wa-kpi-card ${filterTab === 'all' ? 'active' : ''}`} onClick={() => setFilterTab('all')}>
                    <div className="wa-kpi-header">
                        <span className="wa-kpi-title">Total Dispatches</span>
                        <div className="wa-kpi-icon-wrap" style={{ background: '#f1f5f9', color: '#475569' }}>
                            <MessageSquare size={16} />
                        </div>
                    </div>
                    <div className="wa-kpi-value">{counts.total || logs.length || 0}</div>
                    <div className="wa-kpi-hint">All automated WhatsApp alerts</div>
                </div>

                <div className={`wa-kpi-card ${filterTab === 'order_placed' ? 'active' : ''}`} onClick={() => setFilterTab('order_placed')}>
                    <div className="wa-kpi-header">
                        <span className="wa-kpi-title">Order Placed</span>
                        <div className="wa-kpi-icon-wrap" style={{ background: '#ecfdf5', color: '#059669' }}>
                            <ShoppingBag size={16} />
                        </div>
                    </div>
                    <div className="wa-kpi-value">{counts.order_placed || 0}</div>
                    <div className="wa-kpi-hint">Instant order confirmations</div>
                </div>

                <div className={`wa-kpi-card ${filterTab === 'shipped' ? 'active' : ''}`} onClick={() => setFilterTab('shipped')}>
                    <div className="wa-kpi-header">
                        <span className="wa-kpi-title">Dispatched</span>
                        <div className="wa-kpi-icon-wrap" style={{ background: '#e0e7ff', color: '#4338ca' }}>
                            <Truck size={16} />
                        </div>
                    </div>
                    <div className="wa-kpi-value">{counts.shipped || 0}</div>
                    <div className="wa-kpi-hint">Courier & shipment updates</div>
                </div>

                <div className={`wa-kpi-card ${filterTab === 'delivered' ? 'active' : ''}`} onClick={() => setFilterTab('delivered')}>
                    <div className="wa-kpi-header">
                        <span className="wa-kpi-title">Delivered</span>
                        <div className="wa-kpi-icon-wrap" style={{ background: '#dcfce7', color: '#15803d' }}>
                            <CheckCircle2 size={16} />
                        </div>
                    </div>
                    <div className="wa-kpi-value">{counts.delivered || 0}</div>
                    <div className="wa-kpi-hint">Delivery & vitality recipes</div>
                </div>

                <div className={`wa-kpi-card ${filterTab === 'admin' ? 'active' : ''}`} onClick={() => setFilterTab('admin')}>
                    <div className="wa-kpi-header">
                        <span className="wa-kpi-title">Admin Alerts</span>
                        <div className="wa-kpi-icon-wrap" style={{ background: '#f3e8ff', color: '#7e22ce' }}>
                            <Bell size={16} />
                        </div>
                    </div>
                    <div className="wa-kpi-value">{counts.admin_alerts || 0}</div>
                    <div className="wa-kpi-hint">Store owner alerts & security</div>
                </div>
            </div>

            {/* Filter Tabs and Search Bar */}
            <div className="wa-table-controls">
                <div className="wa-filter-pills">
                    <button
                        className={`wa-tab-btn ${filterTab === 'all' ? 'active' : ''}`}
                        onClick={() => setFilterTab('all')}
                    >
                        All Dispatches ({counts.total || logs.length || 0})
                    </button>
                    <button
                        className={`wa-tab-btn ${filterTab === 'order_placed' ? 'active' : ''}`}
                        onClick={() => setFilterTab('order_placed')}
                    >
                        🛒 Order Placed ({counts.order_placed || 0})
                    </button>
                    <button
                        className={`wa-tab-btn ${filterTab === 'shipped' ? 'active' : ''}`}
                        onClick={() => setFilterTab('shipped')}
                    >
                        🚚 Shipped ({counts.shipped || 0})
                    </button>
                    <button
                        className={`wa-tab-btn ${filterTab === 'delivered' ? 'active' : ''}`}
                        onClick={() => setFilterTab('delivered')}
                    >
                        🎉 Delivered ({counts.delivered || 0})
                    </button>
                    <button
                        className={`wa-tab-btn ${filterTab === 'processing' ? 'active' : ''}`}
                        onClick={() => setFilterTab('processing')}
                    >
                        ⚙️ Processing
                    </button>
                    <button
                        className={`wa-tab-btn ${filterTab === 'admin' ? 'active' : ''}`}
                        onClick={() => setFilterTab('admin')}
                    >
                        🚨 Admin Alerts ({counts.admin_alerts || 0})
                    </button>
                </div>

                <div className="wa-search-and-refresh">
                    <form onSubmit={handleSearchSubmit} className="wa-search-form">
                        <Search size={15} className="wa-search-icon" />
                        <input
                            type="text"
                            className="wa-search-field"
                            placeholder="Search recipient, phone, order #..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        {searchQuery && (
                            <button
                                type="button"
                                className="wa-clear-search-btn"
                                onClick={() => {
                                    setSearchQuery('');
                                    loadLogs('', filterTab, false);
                                }}
                            >
                                <X size={14} />
                            </button>
                        )}
                    </form>

                    <button
                        className="wa-refresh-btn"
                        onClick={() => loadLogs(searchQuery, filterTab, true)}
                        disabled={logsRefreshing}
                        title="Refresh Dispatched Message Logs"
                    >
                        <RefreshCw size={15} className={logsRefreshing ? 'wa-icon-spin' : ''} />
                    </button>
                </div>
            </div>

            {/* Dispatched Messages Logs Table */}
            <div className="wa-logs-card">
                {logsLoading ? (
                    <div className="wa-table-loading">
                        <div className="wa-spinner"></div>
                        <span>Loading dispatched message audit records...</span>
                    </div>
                ) : logs.length === 0 ? (
                    <div className="wa-empty-state">
                        <div className="wa-empty-icon-wrap">
                            <MessageSquare size={32} />
                        </div>
                        <h3>No Dispatched Messages Found</h3>
                        <p>
                            {searchQuery 
                                ? `No logs match your search "${searchQuery}". Try clearing filters.` 
                                : 'Automated WhatsApp alerts sent on order placement or status changes will appear here.'}
                        </p>
                        {searchQuery && (
                            <button
                                className="wa-btn wa-btn-outline"
                                onClick={() => {
                                    setSearchQuery('');
                                    loadLogs('', filterTab, false);
                                }}
                            >
                                Clear Search Filter
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="wa-table-responsive">
                        <table className="wa-table">
                            <thead>
                                <tr>
                                    <th style={{ width: '150px' }}>Timestamp</th>
                                    <th style={{ width: '135px' }}>Event Type</th>
                                    <th style={{ width: '210px' }}>Recipient</th>
                                    <th style={{ width: '130px' }}>Order Ref</th>
                                    <th>Message Snippet</th>
                                    <th style={{ width: '90px' }}>Status</th>
                                    <th style={{ width: '100px', textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {logs.map((log) => {
                                    const cleanPhone = (log.recipient_phone || '').replace(/\D/g, '');
                                    const waLink = cleanPhone ? `https://wa.me/${cleanPhone}` : null;
                                    const firstLine = (log.message || '').split('\n').filter(Boolean)[0] || 'Message dispatched';

                                    return (
                                        <tr key={log.id} className="wa-table-row">
                                            {/* Timestamp */}
                                            <td>
                                                <div className="wa-time-cell">
                                                    <Clock size={13} className="wa-time-icon" />
                                                    <span className="wa-time-text">{log.formatted_time || new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                </div>
                                            </td>

                                            {/* Event Type Badge */}
                                            <td>
                                                {renderEventBadge(log.event_type, log.event_label)}
                                            </td>

                                            {/* Recipient */}
                                            <td>
                                                <div className="wa-recipient-cell">
                                                    <span className="wa-recipient-name">{log.recipient_name || 'Customer'}</span>
                                                    <div className="wa-recipient-phone-row">
                                                        <span className="wa-recipient-phone">
                                                            {log.recipient_phone ? `+${log.recipient_phone}` : '—'}
                                                        </span>
                                                        {waLink && (
                                                            <a
                                                                href={waLink}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="wa-direct-link"
                                                                title="Open in WhatsApp"
                                                            >
                                                                <ArrowUpRight size={12} />
                                                            </a>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Order Reference */}
                                            <td>
                                                {log.order_number ? (
                                                    <div className="wa-order-ref-cell">
                                                        <span className="wa-order-pill">#{log.order_number}</span>
                                                        {log.total_amount && (
                                                            <span className="wa-order-amount">₹{Number(log.total_amount).toFixed(0)}</span>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="wa-text-muted">—</span>
                                                )}
                                            </td>

                                            {/* Message Snippet */}
                                            <td>
                                                <div className="wa-message-snippet-cell" onClick={() => setSelectedMessage(log)} title="Click to view full message">
                                                    <span className="wa-snippet-highlight">{firstLine}</span>
                                                    <span className="wa-snippet-sub">
                                                        {(log.message || '').slice(0, 110).replace(/[*_~`]/g, '')}...
                                                    </span>
                                                </div>
                                            </td>

                                            {/* Status */}
                                            <td>
                                                <span className="wa-status-badge sent">
                                                    <CheckCheck size={13} /> Sent
                                                </span>
                                            </td>

                                            {/* Actions */}
                                            <td style={{ textAlign: 'right' }}>
                                                <div className="wa-action-cell">
                                                    <button
                                                        className="wa-icon-action-btn"
                                                        onClick={() => setSelectedMessage(log)}
                                                        title="View Full WhatsApp Message"
                                                    >
                                                        <Eye size={15} />
                                                    </button>
                                                    <button
                                                        className="wa-icon-action-btn delete"
                                                        onClick={() => handleDeleteLog(log.id)}
                                                        title="Delete Log"
                                                    >
                                                        <Trash2 size={15} />
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

            {/* ------------------------------------------------------------- */}
            {/* MODAL 1: VIEW FULL WHATSAPP MESSAGE (AUTHENTIC GREEN BUBBLE)  */}
            {/* ------------------------------------------------------------- */}
            {selectedMessage && (
                <div className="forge-modal-overlay" onClick={() => setSelectedMessage(null)}>
                    <div className="wa-message-modal-card" onClick={(e) => e.stopPropagation()}>
                        <div className="wa-modal-header">
                            <div className="wa-modal-header-left">
                                <div className="wa-modal-avatar">
                                    <Phone size={18} />
                                </div>
                                <div>
                                    <h3 className="wa-modal-title">{selectedMessage.recipient_name || 'Recipient'}</h3>
                                    <p className="wa-modal-subtitle">
                                        +{selectedMessage.recipient_phone || ''} • {renderEventBadge(selectedMessage.event_type, selectedMessage.event_label)}
                                    </p>
                                </div>
                            </div>
                            <button
                                className="forge-modal-close"
                                onClick={() => setSelectedMessage(null)}
                                title="Close"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="wa-modal-chat-body">
                            <div className="wa-chat-date-separator">
                                <span>{selectedMessage.formatted_time || 'WhatsApp Dispatch'}</span>
                            </div>

                            <div className="wa-full-bubble">
                                <div className="wa-bubble-content">
                                    {formatWhatsAppMarkdown(selectedMessage.message)}
                                </div>
                                <div className="wa-bubble-meta">
                                    <span className="wa-bubble-time">
                                        {selectedMessage.formatted_time || 'Just now'}
                                    </span>
                                    <CheckCheck size={14} className="wa-bubble-ticks" />
                                </div>
                            </div>
                        </div>

                        <div className="wa-modal-footer">
                            <button
                                className="wa-btn wa-btn-outline"
                                onClick={() => copyToClipboard(selectedMessage.message)}
                            >
                                {copiedText ? <Check size={15} /> : <Copy size={15} />}
                                <span>{copiedText ? 'Copied to Clipboard!' : 'Copy Text'}</span>
                            </button>

                            {selectedMessage.recipient_phone && (
                                <a
                                    href={`https://wa.me/${selectedMessage.recipient_phone.replace(/\D/g, '')}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="wa-btn wa-btn-primary"
                                >
                                    <ExternalLink size={15} />
                                    <span>Open WhatsApp Web</span>
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* MODAL 2: SCAN QR CODE TO CONNECT                              */}
            {/* ------------------------------------------------------------- */}
            {isQrModalOpen && (
                <div className="forge-modal-overlay" onClick={() => setIsQrModalOpen(false)}>
                    <div className="forge-qr-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="forge-modal-header">
                            <div>
                                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>
                                    📱 Scan WhatsApp QR Code
                                </h3>
                                <p style={{ margin: '3px 0 0 0', fontSize: '12.5px', color: '#64748b' }}>
                                    Link your WhatsApp device with Mangalam Automation Gateway
                                </p>
                            </div>
                            <button className="forge-modal-close" onClick={() => setIsQrModalOpen(false)}>
                                <X size={20} />
                            </button>
                        </div>

                        <div className="forge-qr-container">
                            {isQrLoading ? (
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', padding: '30px' }}>
                                    <div className="forge-spinner"></div>
                                    <span style={{ fontSize: '13px', color: '#475569', fontWeight: 600 }}>
                                        Generating cryptographic QR code...
                                    </span>
                                </div>
                            ) : isQrConnected ? (
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', padding: '30px', textAlign: 'center' }}>
                                    <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#166534' }}>
                                        <CheckCircle2 size={32} />
                                    </div>
                                    <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#166534' }}>
                                        Connection Established!
                                    </h4>
                                    <p style={{ margin: 0, fontSize: '12.5px', color: '#15803d' }}>
                                        Linked to WhatsApp device successfully.
                                    </p>
                                </div>
                            ) : qrCodeUrl ? (
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                                    <img src={qrCodeUrl} alt="WhatsApp QR Code" className="forge-qr-image" />
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#64748b' }}>
                                        <Clock size={13} />
                                        <span>Auto-refreshes in <strong>{qrCountdown}s</strong></span>
                                        <button
                                            onClick={() => fetchQrCode(true)}
                                            disabled={isQrRefreshing}
                                            style={{ background: 'none', border: 'none', color: '#0284c7', cursor: 'pointer', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                                        >
                                            <RefreshCw size={11} className={isQrRefreshing ? 'wa-icon-spin' : ''} /> Refresh
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>
                                    <AlertTriangle size={32} color="#f59e0b" style={{ margin: '0 auto 8px auto' }} />
                                    <p style={{ margin: 0, fontSize: '13px' }}>{qrFeedback || 'Unable to load QR. Check gateway status.'}</p>
                                    <button
                                        className="wa-btn wa-btn-outline"
                                        style={{ marginTop: '12px' }}
                                        onClick={() => fetchQrCode(true)}
                                    >
                                        <RefreshCw size={14} /> Retry Generation
                                    </button>
                                </div>
                            )}
                        </div>

                        {qrFeedback && !isQrConnected && (
                            <div style={{ fontSize: '12px', color: '#0284c7', textAlign: 'center', marginTop: '8px' }}>
                                {qrFeedback}
                            </div>
                        )}

                        <div className="wa-qr-instructions">
                            <h5 style={{ margin: '0 0 8px 0', fontSize: '12.5px', fontWeight: 700, color: '#334155' }}>
                                How to connect:
                            </h5>
                            <ol style={{ margin: 0, paddingLeft: '18px', fontSize: '12px', color: '#64748b', lineHeight: 1.6 }}>
                                <li>Open <strong>WhatsApp</strong> on your mobile phone</li>
                                <li>Tap <strong>Menu (⋮)</strong> on Android or <strong>Settings (⚙️)</strong> on iPhone</li>
                                <li>Tap <strong>Linked Devices</strong> and then <strong>Link a Device</strong></li>
                                <li>Point your phone camera at this QR code to confirm linking</li>
                            </ol>
                        </div>
                    </div>
                </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* MODAL 3: DISCONNECT SESSION VIA ADMIN OTP                     */}
            {/* ------------------------------------------------------------- */}
            {isOtpModalOpen && (
                <div className="forge-modal-overlay" onClick={() => setIsOtpModalOpen(false)}>
                    <div className="forge-qr-modal" style={{ maxWidth: '400px' }} onClick={(e) => e.stopPropagation()}>
                        <div className="forge-modal-header">
                            <div>
                                <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 700, color: '#0f172a' }}>
                                    🔐 Verify Disconnect
                                </h3>
                                <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>
                                    Security confirmation required to unbind device
                                </p>
                            </div>
                            <button className="forge-modal-close" onClick={() => setIsOtpModalOpen(false)}>
                                <X size={20} />
                            </button>
                        </div>

                        <div style={{ padding: '16px 0' }}>
                            {otpStatus && (
                                <div style={{
                                    padding: '10px 14px',
                                    borderRadius: '8px',
                                    fontSize: '12.5px',
                                    lineHeight: 1.5,
                                    marginBottom: '14px',
                                    background: otpStatus.type === 'error' ? '#fee2e2' : (otpStatus.type === 'success' ? '#dcfce7' : '#eff6ff'),
                                    color: otpStatus.type === 'error' ? '#991b1b' : (otpStatus.type === 'success' ? '#166534' : '#1e40af'),
                                    border: `1px solid ${otpStatus.type === 'error' ? '#fca5a5' : (otpStatus.type === 'success' ? '#bbf7d0' : '#bfdbfe')}`
                                }}>
                                    {otpStatus.text}
                                </div>
                            )}

                            {otpTestPreview && (
                                <div style={{ background: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: '8px', padding: '8px 12px', fontSize: '12px', color: '#475569', marginBottom: '12px', textAlign: 'center' }}>
                                    <span>Dev OTP Helper: <strong>{otpTestPreview}</strong></span>
                                </div>
                            )}

                            <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                                Enter 6-Digit Verification OTP:
                            </label>
                            <input
                                type="text"
                                maxLength={6}
                                value={otpInput}
                                onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))}
                                placeholder="• • • • • •"
                                style={{
                                    width: '100%',
                                    boxSizing: 'border-box',
                                    fontSize: '22px',
                                    fontWeight: 700,
                                    textAlign: 'center',
                                    letterSpacing: '8px',
                                    padding: '10px',
                                    borderRadius: '8px',
                                    border: '2px solid #cbd5e1',
                                    outline: 'none',
                                    background: '#ffffff',
                                    fontFamily: 'monospace'
                                }}
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px' }}>
                            <button
                                className="wa-btn wa-btn-outline"
                                onClick={() => setIsOtpModalOpen(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="wa-btn wa-btn-danger"
                                onClick={() => handleVerifyLogoutOtp(true)}
                                disabled={otpLoading || otpInput.trim().length !== 6}
                            >
                                {otpLoading ? 'Verifying...' : 'Confirm Disconnect'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* MODAL 4: SETTINGS MODAL                                       */}
            {/* ------------------------------------------------------------- */}
            {isSettingsModalOpen && (
                <div className="forge-modal-overlay" onClick={() => setIsSettingsModalOpen(false)}>
                    <div className="forge-qr-modal" style={{ maxWidth: '480px' }} onClick={(e) => e.stopPropagation()}>
                        <div className="forge-modal-header">
                            <div>
                                <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 700, color: '#0f172a' }}>
                                    ⚙️ WhatsApp Automation Settings
                                </h3>
                                <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>
                                    Manage automated customer notifications and admin alerts
                                </p>
                            </div>
                            <button className="forge-modal-close" onClick={() => setIsSettingsModalOpen(false)}>
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSaveSettings} style={{ padding: '14px 0' }}>
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                                    Admin WhatsApp Alert Mobile Number:
                                </label>
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <span style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', borderRight: 'none', padding: '8px 10px', borderRadius: '8px 0 0 8px', fontSize: '13px', color: '#64748b', fontWeight: 600 }}>
                                        +91
                                    </span>
                                    <input
                                        type="tel"
                                        value={settingsData.admin_phone_number}
                                        onChange={(e) => setSettingsData({ ...settingsData, admin_phone_number: e.target.value.replace(/\D/g, '') })}
                                        placeholder="Enter 10-digit mobile number"
                                        style={{ flex: 1, padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '0 8px 8px 0', fontSize: '13px', outline: 'none' }}
                                    />
                                </div>
                                <span style={{ fontSize: '11px', color: '#64748b', display: 'block', marginTop: '4px' }}>
                                    New orders and critical system status updates will be dispatched to this mobile.
                                </span>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '16px' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', fontWeight: 600, color: '#1e293b', cursor: 'pointer' }}>
                                    <input
                                        type="checkbox"
                                        checked={settingsData.notify_customer_on_order}
                                        onChange={(e) => setSettingsData({ ...settingsData, notify_customer_on_order: e.target.checked })}
                                    />
                                    <span>🛒 Send Customer Order Confirmation Alert</span>
                                </label>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', fontWeight: 600, color: '#1e293b', cursor: 'pointer' }}>
                                    <input
                                        type="checkbox"
                                        checked={settingsData.notify_admin_on_order}
                                        onChange={(e) => setSettingsData({ ...settingsData, notify_admin_on_order: e.target.checked })}
                                    />
                                    <span>🚨 Send Admin Instant New Order Alert</span>
                                </label>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', fontWeight: 600, color: '#1e293b', cursor: 'pointer' }}>
                                    <input
                                        type="checkbox"
                                        checked={settingsData.is_enabled}
                                        onChange={(e) => setSettingsData({ ...settingsData, is_enabled: e.target.checked })}
                                    />
                                    <span>🌿 Enable Background OpenWA Dispatches</span>
                                </label>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                                <button
                                    type="button"
                                    className="wa-btn wa-btn-outline"
                                    onClick={() => setIsSettingsModalOpen(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="wa-btn wa-btn-primary"
                                    disabled={settingsSaving}
                                >
                                    {settingsSaving ? 'Saving...' : 'Save Settings'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* MODAL 5: KEEPALIVE PING LOGS MODAL                            */}
            {/* ------------------------------------------------------------- */}
            {isLogsModalOpen && (
                <div className="forge-modal-overlay" onClick={() => setIsLogsModalOpen(false)}>
                    <div className="forge-qr-modal" style={{ maxWidth: '560px' }} onClick={(e) => e.stopPropagation()}>
                        <div className="forge-modal-header">
                            <div>
                                <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 700, color: '#0f172a' }}>
                                    📜 Gateway Keep-Alive Telemetry
                                </h3>
                                <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>
                                    Automated 10-minute cron keepalive telemetry preventing cold starts
                                </p>
                            </div>
                            <button className="forge-modal-close" onClick={() => setIsLogsModalOpen(false)}>
                                <X size={20} />
                            </button>
                        </div>

                        <div style={{ maxHeight: '360px', overflowY: 'auto', background: '#090d16', borderRadius: '8px', padding: '12px', fontFamily: 'monospace', fontSize: '11.5px', color: '#34d399', margin: '14px 0' }}>
                            {keepaliveLoading ? (
                                <div style={{ color: '#94a3b8', textAlign: 'center', padding: '20px' }}>Loading telemetry...</div>
                            ) : keepaliveLogs.length === 0 ? (
                                <div style={{ color: '#94a3b8', textAlign: 'center', padding: '20px' }}>No ping history recorded yet.</div>
                            ) : (
                                keepaliveLogs.map((entry, idx) => (
                                    <div key={idx} style={{ marginBottom: '4px', borderBottom: '1px solid #1e293b', paddingBottom: '3px' }}>
                                        {entry}
                                    </div>
                                ))
                            )}
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <button
                                className="wa-btn wa-btn-outline"
                                onClick={() => setIsLogsModalOpen(false)}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
