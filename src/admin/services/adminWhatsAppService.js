import { adminAuthService } from './adminAuthService';

const API_BASE = '/api/admin/whatsapp';

export const adminWhatsAppService = {
    _getHeaders() {
        let token = null;
        try {
            const session = JSON.parse(localStorage.getItem('mangalam_admin_session') || '{}');
            token = session.token || null;
        } catch (e) {
            token = null;
        }

        const headers = {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        return headers;
    },

    /**
     * Get live gateway status & admin phone.
     */
    async getStatus() {
        try {
            const headers = this._getHeaders();
            const res = await fetch(`${API_BASE}/status`, { headers });
            if (res.ok) {
                const data = await res.json();
                if (data.data) return data.data;
            }
        } catch (e) {
            console.warn('Status check fallback to OpenWA proxy', e);
        }

        // Direct OpenWA proxy check
        try {
            const openwaKey = 'owa_k1_747bb008102884877e6105f90f3ed73ff2d002874da80296343e730386364341';
            const sessRes = await fetch('https://mangalam-openwa-gateway.onrender.com/api/sessions', {
                headers: { 'X-API-Key': openwaKey, 'Accept': 'application/json' }
            });
            if (sessRes.ok) {
                const sessions = await sessRes.json();
                const session = Array.isArray(sessions) ? (sessions.find(s => s.name === 'mangalam-admin') || sessions[0]) : null;
                if (session) {
                    const isConnected = session.status === 'ready';
                    return {
                        success: true,
                        status: isConnected ? 'CONNECTED' : (session.status === 'qr_ready' ? 'SCAN_QR' : session.status.toUpperCase()),
                        session: session.name || 'mangalam-admin',
                        session_id: session.id,
                        admin_phone_number: session.phone || '9025192863',
                        phone: session.phone,
                        is_enabled: true,
                        auto_reply_enabled: true,
                    };
                }
            }
        } catch (err) {
            // OpenWA offline
        }

        return {
            success: false,
            status: 'SCAN_QR',
            session: 'mangalam-admin',
            admin_phone_number: '9025192863',
            is_enabled: true,
            auto_reply_enabled: true,
        };
    },

    /**
     * Fetch Live Real WhatsApp QR Code directly from OpenWA.
     */
    async getQrCode() {
        try {
            const headers = this._getHeaders();
            const res = await fetch(`${API_BASE}/qr`, { headers });
            if (res.ok) {
                const data = await res.json();
                if (data.data && data.data.qrCode) {
                    return data.data;
                }
            }
        } catch (e) {
            console.warn('QR check fallback to OpenWA proxy', e);
        }

        // Fallback: Fetch direct cryptographic QR from OpenWA Render Gateway
        try {
            const openwaKey = 'owa_k1_747bb008102884877e6105f90f3ed73ff2d002874da80296343e730386364341';
            const sessRes = await fetch('https://mangalam-openwa-gateway.onrender.com/api/sessions', {
                headers: { 'X-API-Key': openwaKey, 'Accept': 'application/json' }
            });
            if (sessRes.ok) {
                const sessions = await sessRes.json();
                let session = Array.isArray(sessions) ? (sessions.find(s => s.name === 'mangalam-admin') || sessions[0]) : null;

                if (!session) {
                    const createRes = await fetch('https://mangalam-openwa-gateway.onrender.com/api/sessions', {
                        method: 'POST',
                        headers: { 'X-API-Key': openwaKey, 'Content-Type': 'application/json' },
                        body: JSON.stringify({ name: 'mangalam-admin' })
                    });
                    session = await createRes.json();
                }

                if (session && session.id) {
                    const qrRes = await fetch(`https://mangalam-openwa-gateway.onrender.com/api/sessions/${session.id}/qr`, {
                        headers: { 'X-API-Key': openwaKey, 'Accept': 'application/json' }
                    });
                    if (qrRes.ok) {
                        const qrData = await qrRes.json();
                        if (qrData.qrCode) {
                            return {
                                qr: qrData.qrCode,
                                qrCode: qrData.qrCode,
                                status: qrData.status,
                                session_id: session.id,
                                admin_phone: '9025192863'
                            };
                        }
                    }
                }
            }
        } catch (err) {
            console.error('Direct OpenWA QR fetch error:', err);
        }

        return {
            qr: null,
            admin_phone: '9025192863',
            message: 'Waiting for OpenWA session...'
        };
    },

    /**
     * Get 100% Real Live WhatsApp conversations synchronized with MySQL database users & orders.
     */
    async getConversations(search = '', filter = 'all') {
        try {
            const headers = this._getHeaders();
            const params = new URLSearchParams();
            if (search) params.append('search', search);
            if (filter && filter !== 'all') params.append('filter', filter);

            const queryStr = params.toString() ? `?${params.toString()}` : '';
            const res = await fetch(`${API_BASE}/conversations${queryStr}`, { headers });
            if (res.ok) {
                const data = await res.json();
                if (data && Array.isArray(data.data)) {
                    return data.data;
                }
                if (Array.isArray(data)) {
                    return data;
                }
            }
        } catch (e) {
            console.warn('Backend conversations fetch error', e);
        }

        // Direct retry with simple headers
        try {
            const res = await fetch(`${API_BASE}/conversations`, {
                headers: { 'Accept': 'application/json' }
            });
            if (res.ok) {
                const data = await res.json();
                if (data && Array.isArray(data.data)) {
                    return data.data;
                }
            }
        } catch (e) {}

        return [];
    },

    /**
     * Get 100% Real Live messages for conversation from Database.
     */
    async getMessages(conversationId) {
        try {
            const headers = this._getHeaders();
            const res = await fetch(`${API_BASE}/conversations/${conversationId}/messages`, { headers });
            if (res.ok) {
                const data = await res.json();
                if (data.data) {
                    return data.data;
                }
            }
        } catch (e) {
            console.warn('Backend messages fetch error', e);
        }

        // Direct retry with simple headers
        try {
            const res = await fetch(`${API_BASE}/conversations/${conversationId}/messages`, {
                headers: { 'Accept': 'application/json' }
            });
            if (res.ok) {
                const data = await res.json();
                if (data.data) {
                    return data.data;
                }
            }
        } catch (e) {}

        return {
            conversation: null,
            messages: []
        };
    },

    /**
     * Send direct message via Laravel API and OpenWA Gateway.
     */
    async sendMessage(conversationId, recipientPhone, messageText) {
        try {
            const headers = this._getHeaders();
            const res = await fetch(`${API_BASE}/messages/send`, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    conversation_id: conversationId,
                    phone: recipientPhone,
                    message: messageText
                })
            });

            if (res.ok) {
                const data = await res.json();
                return { success: true, data: data.data };
            }
        } catch (e) {
            console.warn('Backend send message error, trying OpenWA direct fallback', e);
        }

        // Direct OpenWA proxy fallback
        try {
            const openwaKey = 'owa_k1_747bb008102884877e6105f90f3ed73ff2d002874da80296343e730386364341';
            const cleanPhone = (recipientPhone || '').replace(/\D/g, '');
            const waPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;

            const sessRes = await fetch('/openwa-api/sessions', {
                headers: { 'X-API-Key': openwaKey }
            });
            if (sessRes.ok) {
                const sessions = await sessRes.json();
                const session = Array.isArray(sessions) ? sessions.find(s => s.name === 'mangalam-admin') : null;
                if (session && session.id) {
                    const sendRes = await fetch(`/openwa-api/sessions/${session.id}/messages/send-text`, {
                        method: 'POST',
                        headers: {
                            'X-API-Key': openwaKey,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            chatId: `${waPhone}@c.us`,
                            text: messageText
                        })
                    });
                    if (sendRes.ok) {
                        return { success: true };
                    }
                }
            }
        } catch (err) {
            console.error('Direct OpenWA dispatch error:', err);
        }

        return { success: false, message: 'Failed to send WhatsApp message.' };
    },

    /**
     * Request OTP to Admin WhatsApp for session logout/disconnection.
     */
    async requestLogoutOtp() {
        try {
            const headers = this._getHeaders();
            const res = await fetch(`${API_BASE}/session/request-logout-otp`, {
                method: 'POST',
                headers
            });
            return await res.json();
        } catch (e) {
            console.error('Failed to request logout OTP', e);
            return { success: false, message: 'Network error requesting OTP' };
        }
    },

    /**
     * Verify Session Logout OTP.
     */
    async verifyLogoutOtp(otp, performDisconnect = false) {
        try {
            const headers = this._getHeaders();
            const res = await fetch(`${API_BASE}/session/verify-logout-otp`, {
                method: 'POST',
                headers,
                body: JSON.stringify({ otp, perform_disconnect: performDisconnect })
            });
            return await res.json();
        } catch (e) {
            console.error('Failed to verify logout OTP', e);
            return { success: false, message: 'Network error verifying OTP' };
        }
    },

    /**
     * Keep-alive ping and real-time health check of OpenWA Gateway.
     */
    async pingGateway(wake = false) {
        try {
            const headers = this._getHeaders();
            const res = await fetch(`${API_BASE}/ping`, {
                method: 'POST',
                headers,
                body: JSON.stringify({ wake })
            });
            if (res.ok) {
                const data = await res.json();
                return data.data || data;
            }
        } catch (e) {
            console.error('Ping gateway error:', e);
        }
        return {
            success: false,
            status: 'OFFLINE',
            message: 'Failed to contact backend ping service.'
        };
    },

    /**
     * Delete a conversation and its messages from DB.
     */
    async deleteConversation(conversationId) {
        try {
            const headers = this._getHeaders();
            const res = await fetch(`${API_BASE}/conversations/${conversationId}`, {
                method: 'DELETE',
                headers
            });
            return await res.json();
        } catch (e) {
            console.error('Failed to delete conversation', e);
            return { success: false, message: 'Network error deleting conversation.' };
        }
    },

    /**
     * Clear all messages in a conversation from DB.
     */
    async clearMessages(conversationId) {
        try {
            const headers = this._getHeaders();
            const res = await fetch(`${API_BASE}/conversations/${conversationId}/clear`, {
                method: 'POST',
                headers
            });
            return await res.json();
        } catch (e) {
            console.error('Failed to clear messages', e);
            return { success: false, message: 'Network error clearing messages.' };
        }
    },

    /**
     * Purge ALL WhatsApp conversations and messages from DB.
     */
    async purgeAllConversations() {
        try {
            const headers = this._getHeaders();
            const res = await fetch(`${API_BASE}/conversations`, {
                method: 'DELETE',
                headers
            });
            return await res.json();
        } catch (e) {
            console.error('Failed to purge conversations', e);
            return { success: false, message: 'Network error purging conversations.' };
        }
    },

    /**
     * Get current WhatsApp CRM settings.
     */
    async getSettings() {
        try {
            const headers = this._getHeaders();
            const res = await fetch(`${API_BASE}/settings`, { headers });
            if (res.ok) {
                const data = await res.json();
                return data.data || data;
            }
        } catch (e) {
            console.error('Failed to fetch WhatsApp settings', e);
        }
        return null;
    },

    /**
     * Update WhatsApp CRM settings.
     */
    async updateSettings(payload) {
        try {
            const headers = this._getHeaders();
            const res = await fetch(`${API_BASE}/settings`, {
                method: 'POST',
                headers,
                body: JSON.stringify(payload)
            });
            return await res.json();
        } catch (e) {
            console.error('Failed to update WhatsApp settings', e);
            return { success: false, message: 'Network error updating settings.' };
        }
    }
};
