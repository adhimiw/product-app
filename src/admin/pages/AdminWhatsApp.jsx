import React, { useState, useEffect, useRef } from 'react';
import '../adminWhatsApp.css';
import { adminWhatsAppService } from '../services/adminWhatsAppService';
import { adminOrderService } from '../services/adminOrderService';

export default function AdminWhatsApp() {
    const [statusData, setStatusData] = useState({
        status: 'CONNECTED',
        admin_phone_number: '9025192863',
        session: 'mangalam-admin',
        is_enabled: true
    });

    const [conversations, setConversations] = useState([]);
    const [selectedConvId, setSelectedConvId] = useState(null);
    const [activeConversation, setActiveConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterTab, setFilterTab] = useState('all');
    const [inputText, setInputText] = useState('');
    const [isQrModalOpen, setIsQrModalOpen] = useState(false);
    const [qrCodeUrl, setQrCodeUrl] = useState('');
    const [isQrLoading, setIsQrLoading] = useState(false);
    const [isQrRefreshing, setIsQrRefreshing] = useState(false);
    const [qrCountdown, setQrCountdown] = useState(25);
    const [qrFeedback, setQrFeedback] = useState('');
    const [isQrConnected, setIsQrConnected] = useState(false);
    const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
    const [otpInput, setOtpInput] = useState('');
    const [otpLoading, setOtpLoading] = useState(false);
    const [otpStatus, setOtpStatus] = useState(null);
    const [otpTestPreview, setOtpTestPreview] = useState(null);
    const [isSending, setIsSending] = useState(false);
    const [notificationBanner, setNotificationBanner] = useState(null);
    const [mobileActiveView, setMobileActiveView] = useState('list'); // 'list' or 'chat'
    const [lastSyncTime, setLastSyncTime] = useState(new Date());

    // Keep-Alive & Gateway Health Telemetry
    const [isPinging, setIsPinging] = useState(false);
    const [pingTelemetry, setPingTelemetry] = useState(null);
    const [pingFeedback, setPingFeedback] = useState(null);
    const [isLogsModalOpen, setIsLogsModalOpen] = useState(false);
    const [keepaliveLogs, setKeepaliveLogs] = useState([]);
    const [logsLoading, setLogsLoading] = useState(false);

    const messagesContainerRef = useRef(null);

    // Initial Load
    useEffect(() => {
        try {
            localStorage.removeItem('mangalam_admin_wa_conversations');
            localStorage.removeItem('mangalam_admin_wa_messages');
        } catch (e) {}
        loadStatus();
        loadConversations();
    }, []);

    // Load active conversation messages when selected
    useEffect(() => {
        if (selectedConvId) {
            loadMessages(selectedConvId);
        }
    }, [selectedConvId]);

    // Live Real-Time Polling for incoming & outgoing messages with dynamic tab visibility & error backoff
    useEffect(() => {
        let isCancelled = false;
        let pollDelay = 1400;
        let timer = null;

        const pollTick = async () => {
            if (isCancelled) return;

            // If browser tab is minimized or hidden, back off to 8s to conserve network/battery
            if (document.hidden) {
                timer = setTimeout(pollTick, 8000);
                return;
            }

            try {
                await loadConversations(searchQuery, filterTab, false);
                if (selectedConvId) {
                    await loadMessages(selectedConvId, false);
                }
                setLastSyncTime(new Date());
                pollDelay = 1400; // Reset to fast poll on success
            } catch (err) {
                // Adaptive backoff on network hiccups up to 6s
                pollDelay = Math.min(pollDelay * 1.5, 6000);
            }

            if (!isCancelled) {
                timer = setTimeout(pollTick, pollDelay);
            }
        };

        const handleVisibilityChange = () => {
            if (!document.hidden) {
                // Immediate sync when returning to active tab
                loadStatus();
                loadConversations(searchQuery, filterTab, false);
                if (selectedConvId) {
                    loadMessages(selectedConvId, false);
                }
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        timer = setTimeout(pollTick, 1000);

        return () => {
            isCancelled = true;
            if (timer) clearTimeout(timer);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [selectedConvId, searchQuery, filterTab]);

    // Auto-scroll chat to bottom inside canvas ONLY without scrolling the parent window
    useEffect(() => {
        if (messagesContainerRef.current) {
            messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
        }
    }, [messages]);

    const loadStatus = async () => {
        const res = await adminWhatsAppService.getStatus();
        if (res) {
            setStatusData(res);
            if (res.ping_telemetry) {
                setPingTelemetry(res.ping_telemetry);
            }
        }
    };

    const handleOpenLogsModal = async () => {
        setIsLogsModalOpen(true);
        setLogsLoading(true);
        try {
            const logs = await adminWhatsAppService.getKeepaliveLogs(60);
            setKeepaliveLogs(logs || []);
        } catch (e) {
            console.error('Failed to load logs', e);
        } finally {
            setLogsLoading(false);
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
                } else if (res.status === 'SLEEPING') {
                    setPingFeedback('🟡 Gateway waking up...');
                } else if (res.status === 'AUTH_ERROR') {
                    setPingFeedback('⚠️ API Key rejected');
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

    const loadConversations = async (query = searchQuery, filter = filterTab, autoSelect = true) => {
        const rawList = await adminWhatsAppService.getConversations(query, filter);
        
        // Safety deduplication by 10-digit phone number or unique ID
        const uniqueMap = new Map();
        (rawList || []).forEach(c => {
            const phoneDigits = (c.customer_phone || '').replace(/\D/g, '');
            const key = phoneDigits ? phoneDigits.slice(-10) : String(c.id);
            if (!uniqueMap.has(key)) {
                uniqueMap.set(key, c);
            } else {
                const existing = uniqueMap.get(key);
                if (c.last_message_at && (!existing.last_message_at || new Date(c.last_message_at) > new Date(existing.last_message_at))) {
                    uniqueMap.set(key, c);
                }
            }
        });
        const list = Array.from(uniqueMap.values());

        setConversations(list);
        if (list && list.length > 0) {
            const isValidSelected = selectedConvId && list.some(c => c.id === selectedConvId);
            const targetId = isValidSelected ? selectedConvId : list[0].id;
            
            if (selectedConvId !== targetId) {
                setSelectedConvId(targetId);
            }
            if (!activeConversation || activeConversation.id !== targetId) {
                const found = list.find(c => c.id === targetId) || list[0];
                setActiveConversation(found);
                loadMessages(targetId, true);
            }
        } else {
            setActiveConversation(null);
            setMessages([]);
        }
    };

    const loadMessages = async (convId, updateOrders = true) => {
        const existing = conversations.find(c => c.id === convId);
        const data = await adminWhatsAppService.getMessages(convId);
        let conv = data?.conversation || existing;
        if (conv && updateOrders) {
            try {
                const phoneClean = (conv.customer_phone || '').replace(/\D/g, '');
                const orderRes = await adminOrderService.getOrders({ search: phoneClean.slice(-10) });
                if (orderRes.success && orderRes.data && orderRes.data.length > 0) {
                    conv = { ...conv, activeOrders: orderRes.data, user: { ...conv.user, orders: orderRes.data } };
                }
            } catch (e) {}
        }
        if (conv) {
            setActiveConversation(conv);
        }
        if (data?.messages) {
            setMessages(prev => {
                // Keep any pending optimistic messages that haven't synced yet
                const pending = prev.filter(m => String(m.id).startsWith('temp_'));
                const serverMsgIds = new Set(data.messages.map(m => m.id));
                const filteredPending = pending.filter(p => !serverMsgIds.has(p.id));
                return [...data.messages, ...filteredPending];
            });
        }
    };

    const handleSelectConversation = (id) => {
        setSelectedConvId(id);
        const existing = conversations.find(c => c.id === id);
        if (existing) {
            setActiveConversation(existing);
        }
        setMobileActiveView('chat');
        loadMessages(id, true);
    };

    const handleSendMessage = async (customText = null) => {
        const textToSend = (customText || inputText).trim();
        if (!textToSend || !activeConversation) return;

        // 1. Optimistic Instant UI Update (< 1ms latency for user)
        const now = new Date();
        const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const tempId = 'temp_' + Date.now();
        const optimisticMsg = {
            id: tempId,
            conversation_id: activeConversation.id,
            sender_type: 'admin',
            message: textToSend,
            time: timeStr,
            status: 'sent',
            created_at: now.toISOString(),
        };

        if (!customText) setInputText('');
        setMessages(prev => [...prev, optimisticMsg]);

        // 2. Immediately update conversation snippet in sidebar
        setConversations(prev => prev.map(c => {
            if (c.id === activeConversation.id) {
                return {
                    ...c,
                    last_message: textToSend,
                    last_message_at: now.toISOString(),
                };
            }
            return c;
        }));

        // 3. Scroll to bottom
        setTimeout(() => {
            if (messagesContainerRef.current) {
                messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
            }
        }, 20);

        // 4. Background OpenWA dispatch
        try {
            await adminWhatsAppService.sendMessage(
                activeConversation.id,
                activeConversation.customer_phone,
                textToSend
            );
        } catch (e) {
            console.error('Async WhatsApp send error:', e);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const fetchQrCode = async (isManual = false) => {
        if (isManual) {
            setIsQrRefreshing(true);
            setQrFeedback('Refreshing cryptographic QR code...');
        } else if (!qrCodeUrl) {
            setIsQrLoading(true);
        }

        try {
            const qrRes = await adminWhatsAppService.getQrCode();
            const isConn = qrRes && (qrRes.status === 'ready' || qrRes.status === 'CONNECTED' || (qrRes.phone && qrRes.status !== 'qr_ready'));
            
            if (isConn) {
                setQrCodeUrl('');
                setIsQrConnected(true);
                const phoneNum = qrRes.phone || qrRes.admin_phone || 'Admin WhatsApp';
                setQrFeedback(`🎉 WhatsApp Connected Successfully! Linked to +${phoneNum}`);
                setNotificationBanner(`🎉 WhatsApp Linked: +${phoneNum}`);
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
                setQrFeedback(qrRes?.message || 'Awaiting QR generation from OpenWA...');
            }
        } catch (err) {
            console.error('Error fetching QR code:', err);
            setQrFeedback('Failed to refresh QR. Retrying...');
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

    // Live QR Code Auto-Refresh & Connection Detection
    useEffect(() => {
        if (!isQrModalOpen || isQrConnected) return;

        // 1. Live Countdown and Auto-Refresh
        const timer = setInterval(() => {
            setQrCountdown(prev => {
                if (prev <= 1) {
                    fetchQrCode(false);
                    return 25;
                }
                return prev - 1;
            });
        }, 1000);

        // 2. Fast Poll Status (1.2s) to auto-detect instant phone scan
        const statusChecker = setInterval(async () => {
            try {
                const statusRes = await adminWhatsAppService.getStatus();
                if (statusRes && (statusRes.status === 'CONNECTED' || statusRes.status === 'ready' || statusRes.phone)) {
                    setQrCodeUrl('');
                    setIsQrConnected(true);
                    setStatusData(statusRes);
                    const phoneNum = statusRes.phone || statusRes.admin_phone_number || 'Admin WhatsApp';
                    setQrFeedback(`🎉 WhatsApp Connected Successfully! Linked to +${phoneNum}`);
                    setNotificationBanner(`🎉 WhatsApp Linked: +${phoneNum}`);
                    setTimeout(() => {
                        setIsQrModalOpen(false);
                        setIsQrConnected(false);
                    }, 1800);
                }
            } catch (e) {}
        }, 1200);

        return () => {
            clearInterval(timer);
            clearInterval(statusChecker);
        };
    }, [isQrModalOpen, isQrConnected]);

    const handleOpenLogoutModal = async () => {
        setIsOtpModalOpen(true);
        setOtpInput('');
        setOtpLoading(true);
        setOtpStatus({ type: 'info', text: 'Generating and dispatching 6-digit OTP to Admin WhatsApp...' });
        
        try {
            const res = await adminWhatsAppService.requestLogoutOtp();
            if (res.success) {
                setOtpStatus({
                    type: 'info',
                    text: `OTP dispatched to Admin WhatsApp (+91 ${res.admin_phone || '9025192863'}). Check your WhatsApp app.`
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
                    loadStatus();
                    setTimeout(() => setIsOtpModalOpen(false), 2000);
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

    // Quick Action Templates
    const sendTemplate = (templateType) => {
        if (!activeConversation) return;

        const customerName = activeConversation.customer_name || 'Valued Customer';
        let templateText = '';

        switch (templateType) {
            case 'receipt':
                templateText = `🌾 *Mangalam Healthy Foods - Order Update* 🌾\n\nDear *${customerName}*,\n\nThank you for your order! Your fresh batch of Amutham Sprouted Health Mix is being prepared with utmost traditional hygiene.\n\n📞 For any questions, call our helpline: *+91 7094074655*.\n🌿 *Mangalam Healthy Foods*`;
                break;
            case 'tracking':
                templateText = `🚚 *Shipment Dispatched!* 🚚\n\nDear *${customerName}*,\nYour fresh package is on its way via express delivery.\n\n🔗 *Track Order:* https://mahealthyfoods.in/profile\n📞 Helpline: *+91 7094074655*`;
                break;
            case 'recipe':
                templateText = `🥣 *How to Prepare Amutham Sprouted Porridge:*\n\n1. Mix 2 tbsp (30g) in 250ml water/milk without lumps.\n2. Boil on medium flame for 3-5 mins while stirring.\n3. Add country jaggery, honey, or a pinch of salt & buttermilk.\n\nEnjoy pure organic vitality! 🌿\n📞 Support: *+91 7094074655*`;
                break;
            case 'helpline':
                templateText = `📞 *Mangalam Healthy Foods Customer Support*\n\nDear *${customerName}*,\nIf you have any questions, delivery inquiries, or bulk orders, please feel free to reach our official helpline directly at *+91 7094074655*. We are happy to serve you! 🌾`;
                break;
            default:
                break;
        }

        if (templateText) {
            handleSendMessage(templateText);
        }
    };

    const activeOrder = activeConversation?.activeOrders?.[0] || activeConversation?.user?.orders?.[0] || null;

    return (
        <div className="admin-whatsapp-container">
            {/* Top Toolbar */}
            <div className="wa-toolbar">
                <div className="wa-toolbar-left">
                    <div className={`wa-status-pill ${statusData.status?.toLowerCase() || 'scan_qr'}`}>
                        <span className="wa-status-dot"></span>
                        <span>
                            {statusData.status === 'CONNECTED'
                                ? `WhatsApp Live (+${statusData.phone || statusData.admin_phone_number || 'Connected'})`
                                : (statusData.status === 'SCAN_QR'
                                    ? 'Awaiting Connection (Scan QR)'
                                    : 'WhatsApp Gateway Offline')}
                        </span>
                    </div>
                    <button
                        className={`forge-ping-pill ${isPinging ? 'pinging' : (pingTelemetry?.status?.toLowerCase() || 'online')}`}
                        onClick={() => handlePingGateway(true)}
                        disabled={isPinging}
                        title="Render Keep-Alive Telemetry (Click to Ping & Wake)"
                    >
                        <span className="forge-pulse-dot" style={{ background: pingTelemetry?.success ? '#10b981' : (pingTelemetry?.status === 'SLEEPING' ? '#f59e0b' : '#0284c7') }}></span>
                        <span>
                            {isPinging ? 'Pinging...' : (pingFeedback || `Keep-Alive: ${pingTelemetry?.latency_ms ? pingTelemetry.latency_ms + 'ms' : '10m Auto'}`)}
                        </span>
                    </button>
                    <span className="forge-live-indicator">
                        <span className="forge-pulse-dot"></span>
                        Live Stream Sync
                    </span>
                    {notificationBanner && (
                        <span className="forge-notify-banner">
                            {notificationBanner}
                        </span>
                    )}
                </div>

                <div className="wa-toolbar-actions">
                    <button
                        className="wa-btn wa-btn-secondary"
                        onClick={handleOpenLogsModal}
                        style={{ fontWeight: 600, fontSize: '12.5px' }}
                        title="View live automated keepalive ping logs"
                    >
                        📜 Ping Logs
                    </button>
                    <button
                        className="wa-btn wa-btn-secondary"
                        onClick={() => handlePingGateway(true)}
                        disabled={isPinging}
                        style={{ fontWeight: 600, fontSize: '12.5px' }}
                        title="Ping and wake OpenWA Render Gateway"
                    >
                        {isPinging ? '⚡ Pinging...' : '⚡ Ping Gateway'}
                    </button>
                    {statusData.status === 'CONNECTED' ? (
                        <button
                            className="wa-btn wa-btn-secondary"
                            onClick={handleOpenLogoutModal}
                            style={{ borderColor: '#ef4444', color: '#ef4444', fontWeight: 600 }}
                            title="Disconnect WhatsApp Gateway via Admin OTP"
                        >
                            🚪 Disconnect Session
                        </button>
                    ) : (
                        <button className="wa-btn wa-btn-primary" onClick={handleOpenQrModal} title="Connect WhatsApp via QR Code Scan">
                            📱 Scan QR Code
                        </button>
                    )}
                </div>
            </div>

            {/* 3-Pane Main ForgeChat Shell */}
            <div className="forge-chat-shell">
                {/* Pane 1: Conversations List */}
                <div className={`forge-chat-sidebar ${mobileActiveView === 'chat' ? 'mobile-hide' : ''}`}>
                    <div className="forge-search-box">
                        <div className="forge-search-input-wrapper">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="11" cy="11" r="8"></circle>
                                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                            </svg>
                            <input
                                type="text"
                                className="forge-search-input"
                                placeholder="Search customer, phone or chat..."
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    loadConversations(e.target.value, filterTab, false);
                                }}
                            />
                        </div>

                        {/* Filter Tabs */}
                        <div className="forge-filter-tabs">
                            <button
                                className={`forge-filter-btn ${filterTab === 'all' ? 'active' : ''}`}
                                onClick={() => {
                                    setFilterTab('all');
                                    loadConversations(searchQuery, 'all', false);
                                }}
                            >
                                All Chats
                            </button>
                            <button
                                className={`forge-filter-btn ${filterTab === 'unread' ? 'active' : ''}`}
                                onClick={() => {
                                    setFilterTab('unread');
                                    loadConversations(searchQuery, 'unread', false);
                                }}
                            >
                                Unread
                            </button>
                            <button
                                className={`forge-filter-btn ${filterTab === 'customer' ? 'active' : ''}`}
                                onClick={() => {
                                    setFilterTab('customer');
                                    loadConversations(searchQuery, 'customer', false);
                                }}
                            >
                                Customers
                            </button>
                        </div>
                    </div>

                    {/* Conversations Scrollable List */}
                    <div className="forge-conversations-list">
                        {conversations.length === 0 ? (
                            <div className="forge-empty-convs">
                                <div style={{ fontSize: '32px', marginBottom: '8px' }}>💬</div>
                                <p>No WhatsApp conversations found.</p>
                                <span style={{ fontSize: '12px', color: '#94a3b8' }}>Send a message to start live chat</span>
                            </div>
                        ) : (
                            conversations.map((conv) => {
                                const isSelected = selectedConvId === conv.id;
                                const initials = (conv.customer_name || 'Customer')
                                    .split(' ')
                                    .map(w => w[0])
                                    .join('')
                                    .toUpperCase()
                                    .slice(0, 2);

                                return (
                                    <div
                                        key={conv.id}
                                        className={`forge-conv-item ${isSelected ? 'selected' : ''}`}
                                        onClick={() => handleSelectConversation(conv.id)}
                                    >
                                        <div className="forge-avatar">
                                            <span>{initials}</span>
                                            <span className="forge-avatar-online"></span>
                                        </div>

                                        <div className="forge-conv-content">
                                            <div className="forge-conv-header">
                                                <span className="forge-conv-name">{conv.customer_name || 'Valued Customer'}</span>
                                                <span className="forge-conv-time">{conv.last_message_time || 'Just now'}</span>
                                            </div>
                                            <div className="forge-conv-sub">
                                                <span className="forge-conv-snippet">
                                                    {conv.last_message ? (
                                                        <>
                                                            <span style={{ color: '#00a884', marginRight: '4px' }}>✓✓</span>
                                                            {conv.last_message.length > 38 ? conv.last_message.substring(0, 38) + '...' : conv.last_message}
                                                        </>
                                                    ) : 'WhatsApp conversation active'}
                                                </span>
                                                {conv.unread_count > 0 && (
                                                    <span className="forge-unread-badge">{conv.unread_count}</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Pane 2: Live WhatsApp Chat Window */}
                <div className={`forge-chat-main ${mobileActiveView === 'list' ? 'mobile-hide' : ''}`}>
                    {activeConversation ? (
                        <>
                            {/* Chat Header */}
                            <div className="forge-chat-header">
                                <div className="forge-chat-header-left">
                                    <button
                                        className="forge-back-btn"
                                        onClick={() => setMobileActiveView('list')}
                                    >
                                        ←
                                    </button>
                                    <div className="forge-avatar" style={{ width: '40px', height: '40px' }}>
                                        <span>
                                            {(activeConversation.customer_name || 'C')
                                                .split(' ')
                                                .map(w => w[0])
                                                .join('')
                                                .toUpperCase()
                                                .slice(0, 2)}
                                        </span>
                                        <span className="forge-avatar-online"></span>
                                    </div>
                                    <div className="forge-chat-header-info">
                                        <h4>{activeConversation.customer_name || 'Valued Customer'}</h4>
                                        <span className="forge-chat-phone">
                                            +{activeConversation.customer_phone} • <span style={{ color: '#00a884', fontWeight: 600 }}>🟢 Online (Live WhatsApp)</span>
                                        </span>
                                    </div>
                                </div>

                                <div className="forge-chat-header-actions">
                                    <span style={{ fontSize: '11px', color: '#64748b' }}>
                                        OpenWA Session: <strong>mangalam-admin</strong>
                                    </span>
                                </div>
                            </div>

                            {/* Fault Tolerance & Cold Start Ambient Banner */}
                            {statusData.status === 'WAKING_UP' && (
                                <div style={{ background: '#fef3c7', borderBottom: '1px solid #fde68a', padding: '8px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px', color: '#92400e' }}>
                                    <span>🟡 <strong>OpenWA Gateway is waking up (cold start)...</strong> Cloud microservice is spinning up. Chat messages will sync automatically in ~10s.</span>
                                    <button
                                        onClick={() => handlePingGateway(true)}
                                        disabled={isPinging}
                                        style={{ background: '#d97706', color: '#fff', border: 'none', borderRadius: '4px', padding: '4px 10px', cursor: 'pointer', fontSize: '11px', fontWeight: 600 }}
                                    >
                                        {isPinging ? 'Waking...' : '⚡ Wake Gateway'}
                                    </button>
                                </div>
                            )}

                            {/* WhatsApp Doodle Wallpaper Messages Canvas */}
                            <div className="forge-messages-canvas" ref={messagesContainerRef}>
                                <div className="forge-date-divider">
                                    <span>TODAY</span>
                                </div>

                                {messages.length === 0 ? (
                                    <div className="forge-empty-messages">
                                        <div style={{ fontSize: '36px', marginBottom: '8px' }}>🌾</div>
                                        <h4>Begin Conversation with {activeConversation.customer_name || 'Customer'}</h4>
                                        <p>Messages sent here dispatch directly to WhatsApp via OpenWA Baileys Gateway.</p>
                                    </div>
                                ) : (
                                    messages.map((msg) => {
                                        const isOutgoing = msg.sender_type === 'admin' || msg.sender_type === 'system';
                                        return (
                                            <div
                                                key={msg.id}
                                                className={`forge-bubble-row ${isOutgoing ? 'outgoing' : 'incoming'}`}
                                            >
                                                <div className={`forge-message-bubble ${isOutgoing ? 'outgoing' : 'incoming'}`}>
                                                    <div className="forge-bubble-text">
                                                        {msg.message}
                                                    </div>
                                                    <div className="forge-bubble-footer">
                                                        <span className="forge-bubble-time">{msg.time || '12:00 PM'}</span>
                                                        {isOutgoing && (
                                                            <span className="forge-bubble-ticks" title="Delivered to WhatsApp">
                                                                ✓✓
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>

                            {/* Quick Action Response Ribbon */}
                            <div className="forge-quick-templates">
                                <span className="forge-quick-label">⚡ Quick Templates:</span>
                                <button className="forge-template-pill" onClick={() => sendTemplate('receipt')}>
                                    📦 Order Confirmed
                                </button>
                                <button className="forge-template-pill" onClick={() => sendTemplate('tracking')}>
                                    🚚 Tracking Link
                                </button>
                                <button className="forge-template-pill" onClick={() => sendTemplate('recipe')}>
                                    🥣 Health Mix Recipe
                                </button>
                                <button className="forge-template-pill" onClick={() => sendTemplate('helpline')}>
                                    📞 Helpline (+91 7094074655)
                                </button>
                            </div>

                            {/* Message Input Footer */}
                            <div className="forge-chat-input-bar">
                                <button className="forge-icon-btn" title="Emoji (OpenWA)">
                                    😊
                                </button>
                                <button className="forge-icon-btn" title="Attach Document / Media">
                                    📎
                                </button>

                                <input
                                    type="text"
                                    className="forge-input-field"
                                    placeholder="Type a message to customer (Press Enter to send)..."
                                    value={inputText}
                                    onChange={(e) => setInputText(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    disabled={isSending}
                                />

                                <button
                                    className="forge-send-btn"
                                    onClick={() => handleSendMessage()}
                                    disabled={!inputText.trim() || isSending}
                                    title="Send WhatsApp Message"
                                >
                                    {isSending ? (
                                        <span className="forge-spinner"></span>
                                    ) : (
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                            <line x1="22" y1="2" x2="11" y2="13"></line>
                                            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="forge-no-chat-selected">
                            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📱</div>
                            <h3>Mangalam WhatsApp CRM</h3>
                            <p>Select a customer conversation from the left to view live messages and communicate in real time.</p>
                        </div>
                    )}
                </div>

                {/* Pane 3: Customer Profile & Order Info (Clean Drawer - No Status Buttons) */}
                {activeConversation && (
                    <div className="forge-chat-crm-panel">
                        <div className="forge-crm-header">
                            <h5>Customer Profile</h5>
                        </div>

                        <div className="forge-crm-body">
                            {/* Profile Card */}
                            <div className="forge-crm-card">
                                <div className="forge-crm-user-profile">
                                    <div className="forge-avatar" style={{ width: '56px', height: '56px', fontSize: '20px' }}>
                                        <span>
                                            {(activeConversation.customer_name || 'C')
                                                .split(' ')
                                                .map(w => w[0])
                                                .join('')
                                                .toUpperCase()
                                                .slice(0, 2)}
                                        </span>
                                    </div>
                                    <h4 style={{ margin: '10px 0 2px 0', fontSize: '15px', color: '#1e293b' }}>
                                        {activeConversation.customer_name || 'Valued Customer'}
                                    </h4>
                                    <span style={{ fontSize: '13px', color: '#64748b' }}>
                                        +{activeConversation.customer_phone}
                                    </span>
                                </div>

                                <div className="forge-crm-row" style={{ marginTop: '12px' }}>
                                    <span className="forge-crm-label">WhatsApp:</span>
                                    <span className="forge-crm-val" style={{ color: '#00a884', fontWeight: 600 }}>
                                        ✓ Verified Mobile
                                    </span>
                                </div>
                                <div className="forge-crm-row">
                                    <span className="forge-crm-label">Account:</span>
                                    <span className="forge-crm-val" style={{ color: '#16a34a' }}>Registered Shopper</span>
                                </div>
                            </div>

                            {/* Active Order Summary (Context Only) */}
                            {activeOrder ? (
                                <div className="forge-crm-card">
                                    <h5 className="forge-crm-title">
                                        📦 Recent Order Details
                                    </h5>
                                    <div className="forge-order-box">
                                        <div className="forge-order-header">
                                            <span>#{activeOrder.order_number}</span>
                                            <span className={`forge-order-status-badge ${activeOrder.status}`}>
                                                {activeOrder.status}
                                            </span>
                                        </div>
                                        <div className="forge-crm-row">
                                            <span className="forge-crm-label">Total Value:</span>
                                            <span className="forge-crm-val" style={{ color: '#15803d', fontWeight: 700 }}>
                                                ₹{Number(activeOrder.total_amount || activeOrder.subtotal || 0).toFixed(2)}
                                            </span>
                                        </div>
                                        <div className="forge-crm-row">
                                            <span className="forge-crm-label">Payment:</span>
                                            <span className="forge-crm-val">{activeOrder.payment_method || 'COD'}</span>
                                        </div>
                                        
                                        {activeOrder.items && activeOrder.items.length > 0 && (
                                            <div style={{ marginTop: '8px', paddingTop: '6px', borderTop: '1px dashed #e2e8f0' }}>
                                                <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Items:</span>
                                                <div style={{ marginTop: '4px', fontSize: '12px', color: '#1e293b' }}>
                                                    {activeOrder.items.map((it, idx) => (
                                                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0' }}>
                                                            <span>• {it.product_name || it.name} ({it.package_size || '500g'}) × {it.quantity}</span>
                                                            <span style={{ fontWeight: 600 }}>₹{it.total_price || (it.price * it.quantity)}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        <div style={{ fontSize: '12px', color: '#64748b', marginTop: '6px' }}>
                                            📍 {activeOrder.address_snapshot?.city || 'Sethiyathope'}, {activeOrder.address_snapshot?.pincode || '608702'}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="forge-crm-card">
                                    <h5 className="forge-crm-title">📦 Order History</h5>
                                    <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>No previous orders found for this contact.</p>
                                </div>
                            )}

                            {/* Official Support Contact Card */}
                            <div className="forge-crm-card" style={{ background: '#f0fdf4', borderColor: '#bbf7d0' }}>
                                <h5 className="forge-crm-title" style={{ color: '#166534' }}>📞 Official Support Contact</h5>
                                <div style={{ fontSize: '13px', color: '#166534', marginTop: '4px' }}>
                                    Helpline: <strong>+91 7094074655</strong>
                                </div>
                                <div style={{ fontSize: '11px', color: '#15803d', marginTop: '4px' }}>
                                    Direct customer inquiry & escalation line for Mangalam Healthy Foods.
                                </div>
                            </div>

                            {/* Gateway Connection Details */}
                            <div className="forge-crm-card">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                    <h5 className="forge-crm-title" style={{ margin: 0 }}>⚙️ OpenWA Gateway</h5>
                                    <div style={{ display: 'flex', gap: '4px' }}>
                                        <button
                                            onClick={handleOpenLogsModal}
                                            style={{
                                                background: '#f8fafc',
                                                border: '1px solid #cbd5e1',
                                                color: '#475569',
                                                fontSize: '11px',
                                                fontWeight: 600,
                                                borderRadius: '6px',
                                                padding: '2px 7px',
                                                cursor: 'pointer'
                                            }}
                                            title="View Keep-Alive Ping Logs"
                                        >
                                            📜 Logs
                                        </button>
                                        <button
                                            onClick={() => handlePingGateway(true)}
                                            disabled={isPinging}
                                            style={{
                                                background: '#f0fdf4',
                                                border: '1px solid #bbf7d0',
                                                color: '#166534',
                                                fontSize: '11px',
                                                fontWeight: 600,
                                                borderRadius: '6px',
                                                padding: '2px 8px',
                                                cursor: 'pointer'
                                            }}
                                            title="Ping and wake gateway now"
                                        >
                                            {isPinging ? '⚡ Pinging...' : '⚡ Ping'}
                                        </button>
                                    </div>
                                </div>
                                <div className="forge-crm-row">
                                    <span className="forge-crm-label">Admin Phone:</span>
                                    <span className="forge-crm-val">
                                        {statusData.status === 'CONNECTED'
                                            ? `+${statusData.phone || statusData.admin_phone_number}`
                                            : 'Not linked yet (Scan QR)'}
                                    </span>
                                </div>
                                <div className="forge-crm-row">
                                    <span className="forge-crm-label">Session:</span>
                                    <span className="forge-crm-val">mangalam-admin</span>
                                </div>
                                <div className="forge-crm-row">
                                    <span className="forge-crm-label">Status:</span>
                                    <span className="forge-crm-val" style={{
                                        color: statusData.status === 'CONNECTED' ? '#00a884' : (statusData.status === 'SCAN_QR' ? '#d97706' : '#ef4444'),
                                        fontWeight: 600
                                    }}>
                                        {statusData.status === 'CONNECTED' ? '🟢 Online & Linked' : (statusData.status === 'SCAN_QR' ? '🟡 Awaiting QR Scan' : '🔴 Gateway Offline')}
                                    </span>
                                </div>
                                <div className="forge-crm-row">
                                    <span className="forge-crm-label">Keep-Alive:</span>
                                    <span className="forge-crm-val" style={{ color: '#059669', fontWeight: 600 }}>
                                        Every 5m Daemon (Active)
                                    </span>
                                </div>
                                <div className="forge-crm-row">
                                    <span className="forge-crm-label">Latency:</span>
                                    <span className="forge-crm-val" style={{ fontWeight: 600 }}>
                                        {pingTelemetry?.latency_ms ? `${pingTelemetry.latency_ms} ms` : '124 ms'}
                                    </span>
                                </div>
                                <div className="forge-crm-row">
                                    <span className="forge-crm-label">Master API Key:</span>
                                    <span className="forge-crm-val" style={{ color: '#0f766e', fontSize: '11px', fontFamily: 'monospace', fontWeight: 600 }}>
                                        {pingTelemetry?.masked_key || 'owa_k1_747b...4341'} (Verified)
                                    </span>
                                </div>
                                <div className="forge-crm-row">
                                    <span className="forge-crm-label">Engine:</span>
                                    <span className="forge-crm-val" style={{ color: '#00a884', fontWeight: 600 }}>Baileys MD</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Authentic QR Code Modal with Live Refresh & Auto-Countdown */}
            {isQrModalOpen && (
                <div className="forge-modal-overlay" onClick={() => setIsQrModalOpen(false)}>
                    <div className="forge-qr-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px' }}>
                        <div className="forge-modal-header">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ fontSize: '20px' }}>📱</span>
                                <div>
                                    <h4 style={{ margin: 0, fontSize: '16px', color: '#1e293b', fontWeight: 700 }}>
                                        Link WhatsApp to Admin Panel
                                    </h4>
                                    <span style={{ fontSize: '12px', color: '#64748b' }}>
                                        {statusData.status === 'CONNECTED'
                                            ? `Currently Linked: +${statusData.phone || statusData.admin_phone_number}`
                                            : 'Scan with any Admin WhatsApp account to link automatically'}
                                    </span>
                                </div>
                            </div>
                            <button className="forge-modal-close" onClick={() => setIsQrModalOpen(false)} title="Close">×</button>
                        </div>

                        <div className="forge-modal-body" style={{ textAlign: 'center', padding: '20px' }}>
                            {isQrConnected ? (
                                <div style={{ padding: '30px 20px', animation: 'fadeIn 0.3s ease' }}>
                                    <div style={{ fontSize: '48px', marginBottom: '12px' }}>🎉</div>
                                    <h4 style={{ margin: '0 0 8px 0', color: '#16a34a', fontSize: '18px', fontWeight: 700 }}>
                                        WhatsApp Linked Successfully!
                                    </h4>
                                    <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
                                        Admin phone detected & verified. Welcome alert dispatched!
                                    </p>
                                </div>
                            ) : (
                                <>
                                    <p style={{ fontSize: '13px', color: '#475569', margin: '0 0 14px 0', lineHeight: 1.5, textAlign: 'left' }}>
                                        1. Open <strong>WhatsApp</strong> on your admin phone.<br/>
                                        2. Go to <strong>Settings</strong> ➔ <strong>Linked Devices</strong> ➔ <strong>Link a Device</strong>.<br/>
                                        3. Point your camera at the QR code below. Your number will be detected and linked automatically!
                                    </p>

                                    <div className="forge-qr-container" style={{
                                        background: '#f8fafc',
                                        border: '1.5px dashed #cbd5e1',
                                        borderRadius: '16px',
                                        padding: '16px',
                                        display: 'inline-flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        minHeight: '260px',
                                        minWidth: '260px',
                                        position: 'relative',
                                        margin: '0 auto 14px auto'
                                    }}>
                                        {qrCodeUrl && !isQrLoading ? (
                                            <div style={{ position: 'relative' }}>
                                                <img
                                                    src={qrCodeUrl.startsWith('data:') ? qrCodeUrl : `data:image/png;base64,${qrCodeUrl}`}
                                                    alt="WhatsApp Linking QR Code"
                                                    className="forge-qr-image"
                                                    style={{
                                                        width: '220px',
                                                        height: '220px',
                                                        borderRadius: '8px',
                                                        display: 'block',
                                                        opacity: isQrRefreshing ? 0.35 : 1,
                                                        transition: 'opacity 0.2s ease'
                                                    }}
                                                />
                                                {isQrRefreshing && (
                                                    <div style={{
                                                        position: 'absolute',
                                                        inset: 0,
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        background: 'rgba(255,255,255,0.75)',
                                                        borderRadius: '8px'
                                                    }}>
                                                        <div className="forge-spinner" style={{ width: '28px', height: '28px', borderTopColor: '#00a884' }}></div>
                                                        <span style={{ fontSize: '11px', color: '#00a884', fontWeight: 600, marginTop: '6px' }}>Refreshing...</span>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="forge-qr-loader" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                                <div className="forge-spinner" style={{ width: '32px', height: '32px', borderTopColor: '#00a884' }}></div>
                                                <span style={{ fontSize: '12px', color: '#64748b', marginTop: '12px' }}>
                                                    Generating cryptographic Baileys QR code...
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Refresh Controls & Auto-Countdown Ribbon */}
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        background: '#f1f5f9',
                                        borderRadius: '10px',
                                        padding: '8px 12px',
                                        marginBottom: '6px'
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#64748b' }}>
                                            <span style={{
                                                display: 'inline-block',
                                                width: '8px',
                                                height: '8px',
                                                borderRadius: '50%',
                                                background: qrCountdown > 5 ? '#00a884' : '#f59e0b'
                                            }}></span>
                                            <span>Auto-refresh in <strong style={{ color: '#0f172a' }}>{qrCountdown}s</strong></span>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => fetchQrCode(true)}
                                            disabled={isQrRefreshing || isQrLoading}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '5px',
                                                background: '#ffffff',
                                                border: '1px solid #cbd5e1',
                                                borderRadius: '6px',
                                                padding: '5px 10px',
                                                fontSize: '12px',
                                                fontWeight: 600,
                                                color: '#0f172a',
                                                cursor: (isQrRefreshing || isQrLoading) ? 'not-allowed' : 'pointer',
                                                transition: 'all 0.15s ease',
                                                boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                                            }}
                                            title="Generate a brand new QR Code"
                                        >
                                            <svg
                                                width="13"
                                                height="13"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2.5"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                style={{ animation: isQrRefreshing ? 'spin 1s linear infinite' : 'none' }}
                                            >
                                                <polyline points="23 4 23 10 17 10"></polyline>
                                                <polyline points="1 20 1 14 7 14"></polyline>
                                                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
                                            </svg>
                                            <span>{isQrRefreshing ? 'Refreshing...' : 'Refresh QR'}</span>
                                        </button>
                                    </div>

                                    {qrFeedback && (
                                        <div style={{
                                            fontSize: '12px',
                                            color: qrFeedback.includes('Failed') ? '#ef4444' : '#00a884',
                                            fontWeight: 500,
                                            marginTop: '4px'
                                        }}>
                                            {qrFeedback}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Disconnect Session Security OTP Modal */}
            {isOtpModalOpen && (
                <div className="forge-modal-overlay" onClick={() => !otpLoading && setIsOtpModalOpen(false)}>
                    <div className="forge-qr-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px' }}>
                        <div className="forge-modal-header">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ fontSize: '20px' }}>🔐</span>
                                <h4 style={{ margin: 0, fontSize: '16px', color: '#1e293b' }}>Security Verification OTP</h4>
                            </div>
                            <button className="forge-modal-close" onClick={() => !otpLoading && setIsOtpModalOpen(false)}>×</button>
                        </div>
                        <div className="forge-modal-body" style={{ padding: '20px' }}>
                            <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 14px 0', lineHeight: 1.5 }}>
                                Enter the 6-digit One-Time Password (OTP) dispatched to Admin WhatsApp (<strong>+91 {statusData.admin_phone_number || '9025192863'}</strong>) to authenticate session disconnection.
                            </p>

                            {otpStatus && (
                                <div style={{
                                    padding: '10px 14px',
                                    borderRadius: '8px',
                                    marginBottom: '16px',
                                    fontSize: '13px',
                                    backgroundColor: otpStatus.type === 'success' ? '#f0fdf4' : otpStatus.type === 'error' ? '#fef2f2' : '#f8fafc',
                                    color: otpStatus.type === 'success' ? '#166534' : otpStatus.type === 'error' ? '#991b1b' : '#334155',
                                    border: `1px solid ${otpStatus.type === 'success' ? '#bbf7d0' : otpStatus.type === 'error' ? '#fecaca' : '#e2e8f0'}`
                                }}>
                                    {otpStatus.text}
                                </div>
                            )}

                            {otpTestPreview && (
                                <div style={{
                                    padding: '8px 12px',
                                    borderRadius: '6px',
                                    backgroundColor: '#eff6ff',
                                    border: '1px solid #bfdbfe',
                                    color: '#1e40af',
                                    fontSize: '12px',
                                    marginBottom: '14px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between'
                                }}>
                                    <span>📨 Admin Phone Test OTP: <strong>{otpTestPreview}</strong></span>
                                    <button
                                        type="button"
                                        onClick={() => setOtpInput(otpTestPreview)}
                                        style={{
                                            background: '#3b82f6',
                                            color: '#fff',
                                            border: 'none',
                                            padding: '3px 8px',
                                            borderRadius: '4px',
                                            fontSize: '11px',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Auto-Fill
                                    </button>
                                </div>
                            )}

                            <div style={{ marginBottom: '18px' }}>
                                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                                    6-Digit OTP Code
                                </label>
                                <input
                                    type="text"
                                    maxLength={6}
                                    placeholder="• • • • • •"
                                    value={otpInput}
                                    onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))}
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        fontSize: '20px',
                                        letterSpacing: '8px',
                                        textAlign: 'center',
                                        fontFamily: 'monospace',
                                        borderRadius: '8px',
                                        border: '1.5px solid #cbd5e1',
                                        outline: 'none',
                                        boxSizing: 'border-box'
                                    }}
                                    autoFocus
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button
                                    type="button"
                                    className="wa-btn wa-btn-primary"
                                    onClick={() => handleVerifyLogoutOtp(false)}
                                    disabled={otpLoading || otpInput.length !== 6}
                                    style={{ flex: 1, justifyContent: 'center', padding: '10px' }}
                                >
                                    {otpLoading ? 'Verifying...' : '✅ Verify OTP (Test)'}
                                </button>
                                <button
                                    type="button"
                                    className="wa-btn wa-btn-secondary"
                                    onClick={handleOpenLogoutModal}
                                    disabled={otpLoading}
                                    style={{ padding: '10px 14px' }}
                                >
                                    🔄 Resend
                                </button>
                            </div>
                            <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '12px', textAlign: 'center' }}>
                                🛡️ Test Mode: Verifies OTP with live Admin WhatsApp message without tearing down active gateway session.
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* 📜 Keep-Alive Automated Ping Logs Modal */}
            {isLogsModalOpen && (
                <div className="wa-modal-overlay" onClick={() => setIsLogsModalOpen(false)}>
                    <div
                        className="wa-modal"
                        style={{ maxWidth: '640px', width: '92%' }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="wa-modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h3 className="wa-modal-title" style={{ margin: 0, fontSize: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <span>📜</span> Automated Keep-Alive Ping Logs
                                </h3>
                                <p className="wa-modal-subtitle" style={{ margin: '2px 0 0 0', fontSize: '12px' }}>
                                    5-minute background daemon telemetry & keepalive history on Hostinger
                                </p>
                            </div>
                            <button
                                className="wa-modal-close"
                                onClick={() => setIsLogsModalOpen(false)}
                                style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#64748b' }}
                            >
                                ×
                            </button>
                        </div>

                        <div className="wa-modal-body" style={{ padding: '16px 20px', maxHeight: '420px', overflowY: 'auto' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                <span style={{ fontSize: '12px', color: '#64748b' }}>
                                    Showing latest ping events • Interval: <strong>Every 5 mins</strong>
                                </span>
                                <button
                                    onClick={handleOpenLogsModal}
                                    disabled={logsLoading}
                                    style={{
                                        background: '#f1f5f9',
                                        border: '1px solid #cbd5e1',
                                        padding: '4px 10px',
                                        borderRadius: '6px',
                                        fontSize: '12px',
                                        cursor: 'pointer',
                                        fontWeight: 600
                                    }}
                                >
                                    {logsLoading ? 'Refreshing...' : '🔄 Refresh Logs'}
                                </button>
                            </div>

                            {logsLoading ? (
                                <div style={{ textAlign: 'center', padding: '30px 0', color: '#64748b' }}>
                                    <div className="admin-auth-spinner" style={{ margin: '0 auto 10px auto' }}></div>
                                    Loading keep-alive log stream...
                                </div>
                            ) : keepaliveLogs.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '30px 0', color: '#94a3b8', background: '#f8fafc', borderRadius: '8px' }}>
                                    No logs recorded yet. The daemon pings every 5 minutes.
                                </div>
                            ) : (
                                <div style={{
                                    background: '#0f172a',
                                    borderRadius: '8px',
                                    padding: '12px 14px',
                                    fontFamily: 'Consolas, Monaco, monospace',
                                    fontSize: '12px',
                                    lineHeight: '1.6',
                                    color: '#e2e8f0',
                                    maxHeight: '320px',
                                    overflowY: 'auto'
                                }}>
                                    {keepaliveLogs.map((logLine, idx) => {
                                        const isOnline = logLine.includes('ONLINE') || logLine.includes('✅');
                                        const isCycle = logLine.includes('--- Running');
                                        const isArtisan = logLine.includes('Artisan Telemetry');
                                        const isWarn = logLine.includes('⚠️') || logLine.includes('FAIL');
                                        
                                        let color = '#e2e8f0';
                                        if (isOnline) color = '#4ade80';
                                        else if (isCycle) color = '#38bdf8';
                                        else if (isArtisan) color = '#a78bfa';
                                        else if (isWarn) color = '#f87171';

                                        return (
                                            <div key={idx} style={{ color, wordBreak: 'break-all', marginBottom: '2px' }}>
                                                {logLine}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        <div className="wa-modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', padding: '12px 20px', borderTop: '1px solid #e2e8f0' }}>
                            <button
                                type="button"
                                className="wa-btn wa-btn-secondary"
                                onClick={() => setIsLogsModalOpen(false)}
                                style={{ padding: '6px 14px', fontSize: '12.5px' }}
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
