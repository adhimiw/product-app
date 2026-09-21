<?php

namespace App\Services;

use App\Models\Order;
use App\Models\WhatsAppConversation;
use App\Models\WhatsAppMessage;
use App\Models\WhatsAppSetting;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class WhatsAppGatewayService
{
    private ?string $cachedBaseUrl = null;

    /**
     * Dynamically resolve reachable base URL for OpenWA (handles Docker, local host, and remote Render/VPS).
     */
    public function getBaseUrl(WhatsAppSetting $settings): string
    {
        if ($this->cachedBaseUrl) {
            return $this->cachedBaseUrl;
        }

        $candidates = array_unique(array_filter([
            $settings->api_base_url,
            env('OPENWA_URL'),
            'https://mangalam-openwa-gateway-13xy.onrender.com',
            'http://localhost:2785',
            'http://127.0.0.1:2785',
            'http://host.docker.internal:2785',
        ]));

        foreach ($candidates as $url) {
            try {
                $res = Http::withHeaders([
                    'X-API-Key' => $settings->api_key,
                    'Accept'    => 'application/json',
                ])->timeout(3)->get("{$url}/api/sessions");

                if ($res->successful()) {
                    $this->cachedBaseUrl = $url;
                    return $url;
                }
            } catch (\Exception $e) {
                // Try next candidate
            }
        }

        return $settings->api_base_url ?: 'https://mangalam-openwa-gateway-13xy.onrender.com';
    }

    /**
     * Resolve or automatically provision OpenWA session UUID.
     */
    protected function resolveSessionId(WhatsAppSetting $settings, bool $forceRefresh = false): ?string
    {
        $baseUrl = $this->getBaseUrl($settings);
        $cacheKey = "openwa_session_id_" . md5($baseUrl) . "_{$settings->session_name}";

        if (!$forceRefresh) {
            $cachedId = \Illuminate\Support\Facades\Cache::get($cacheKey);
            if ($cachedId) {
                return $cachedId;
            }
        }

        try {
            $response = Http::withHeaders([
                'X-API-Key' => $settings->api_key,
                'Accept'    => 'application/json',
            ])->timeout(8)->get("{$baseUrl}/api/sessions");

            if ($response->successful()) {
                $sessions = $response->json();
                if (is_array($sessions)) {
                    foreach ($sessions as $s) {
                        if (($s['name'] ?? '') === $settings->session_name) {
                            $id = $s['id'] ?? null;
                            if ($id) {
                                \Illuminate\Support\Facades\Cache::put($cacheKey, $id, now()->addMinutes(15));
                                return $id;
                            }
                        }
                    }
                }
            }

            // If session does not exist on gateway, automatically create and start it
            $createRes = Http::withHeaders([
                'X-API-Key'    => $settings->api_key,
                'Content-Type' => 'application/json',
            ])->timeout(5)->post("{$baseUrl}/api/sessions", [
                'name' => $settings->session_name,
            ]);

            if ($createRes->successful()) {
                $newSession = $createRes->json();
                $newId = $newSession['id'] ?? null;
                if ($newId) {
                    Http::withHeaders([
                        'X-API-Key' => $settings->api_key,
                    ])->timeout(5)->post("{$baseUrl}/api/sessions/{$newId}/start");

                    \Illuminate\Support\Facades\Cache::put($cacheKey, $newId, now()->addMinutes(15));
                    return $newId;
                }
            }
        } catch (\Exception $e) {
            Log::warning("OpenWA resolveSessionId error: " . $e->getMessage());
        }

        return null;
    }

    /**
     * Get live status of OpenWA session with dynamic number detection & welcome dispatch.
     */
    public function getStatus(): array
    {
        $settings = WhatsAppSetting::getSettings();
        $baseUrl = $this->getBaseUrl($settings);
        $sessionId = $this->resolveSessionId($settings);
        
        if (!$sessionId) {
            $telemetry = $this->getPingTelemetry();
            $status = ($telemetry['status'] ?? '') === 'SLEEPING' ? 'WAKING_UP' : 'OFFLINE';
            $msg = $status === 'WAKING_UP' 
                ? 'OpenWA gateway is waking up from idle state (10-15s)...' 
                : 'OpenWA gateway offline or unreachable.';

            return [
                'success'        => $status === 'WAKING_UP',
                'status'         => $status,
                'session'        => $settings->session_name,
                'phone'          => null,
                'admin_phone'    => $settings->admin_phone_number,
                'message'        => $msg,
                'ping_telemetry' => $telemetry,
            ];
        }

        try {
            $response = Http::withHeaders([
                'X-API-Key' => $settings->api_key,
                'Accept'    => 'application/json',
            ])->timeout(8)->get("{$baseUrl}/api/sessions/{$sessionId}");

            // If stale ID returned 404, force refresh session ID from gateway
            if ($response->status() === 404) {
                $sessionId = $this->resolveSessionId($settings, true);
                if ($sessionId) {
                    $response = Http::withHeaders([
                        'X-API-Key' => $settings->api_key,
                        'Accept'    => 'application/json',
                    ])->timeout(8)->get("{$baseUrl}/api/sessions/{$sessionId}");
                }
            }

            if ($response->successful()) {
                $data = $response->json();
                $rawStatus = strtolower($data['status'] ?? 'unknown');
                $sessionPhone = $data['phone'] ?? null;
                $pushName = $data['pushName'] ?? null;

                $statusFormatted = match ($rawStatus) {
                    'ready'          => 'CONNECTED',
                    'qr_ready'       => 'SCAN_QR',
                    'authenticating' => 'AUTHENTICATING',
                    'initializing'   => 'INITIALIZING',
                    default          => strtoupper($rawStatus),
                };

                // DYNAMIC AUTO-DETECTION & WELCOME MESSAGE ON CONNECTION
                if ($statusFormatted === 'CONNECTED') {
                    $cleanPhone = preg_replace('/\D/', '', (string)$sessionPhone);
                    if (!empty($cleanPhone)) {
                        // 1. If linked number differs from DB, dynamically update DB
                        $currentDbPhone = preg_replace('/\D/', '', (string)$settings->admin_phone_number);
                        if ($cleanPhone !== $currentDbPhone) {
                            $settings->update(['admin_phone_number' => $cleanPhone]);
                        }

                        // 2. On first connection / newly detected session, send Welcome message to newly linked Admin number
                        $welcomeCacheKey = "wa_welcome_sent_session_{$sessionId}";
                        if (!\Illuminate\Support\Facades\Cache::has($welcomeCacheKey)) {
                            \Illuminate\Support\Facades\Cache::put($welcomeCacheKey, true, now()->addDays(30));

                            $welcomeMsg = "🌿 *Mangalam Healthy Foods - WhatsApp Gateway Connected* 🌿\n\n"
                                . "Hello" . ($pushName ? " *{$pushName}*" : " Admin") . "! Your WhatsApp number (*+{$cleanPhone}*) has been successfully linked to the Mangalam Healthy Foods Admin Console.\n\n"
                                . "✅ Real-time 2-way customer chat active\n"
                                . "✅ Automated instant order alerts enabled\n"
                                . "✅ Dispatch tracking & delivery updates live\n\n"
                                . "🌾 *Mangalam Healthy Foods — Authentic Sprouted Vitality* 🌾\n"
                                . "📞 Support Helpline: *+91 7094074655*";

                            try {
                                $waId = $this->formatWhatsAppId($cleanPhone);
                                Http::withHeaders([
                                    'X-API-Key'    => $settings->api_key,
                                    'Content-Type' => 'application/json',
                                ])->timeout(6)->post("{$baseUrl}/api/sessions/{$sessionId}/messages/send-text", [
                                    'chatId' => $waId,
                                    'text'   => $welcomeMsg,
                                ]);
                            } catch (\Exception $e) {
                                Log::warning("Failed to send Welcome message: " . $e->getMessage());
                            }
                        }
                    }

                    return [
                        'success'        => true,
                        'status'         => 'CONNECTED',
                        'session_id'     => $sessionId,
                        'session'        => $settings->session_name,
                        'phone'          => $cleanPhone ?: $settings->admin_phone_number,
                        'push_name'      => $pushName,
                        'admin_phone'    => $cleanPhone ?: $settings->admin_phone_number,
                        'ping_telemetry' => $this->getPingTelemetry(),
                        'raw'            => $data,
                    ];
                }

                // If NOT connected (SCAN_QR, INITIALIZING, etc.)
                return [
                    'success'        => true,
                    'status'         => $statusFormatted,
                    'session_id'     => $sessionId,
                    'session'        => $settings->session_name,
                    'phone'          => null,
                    'admin_phone'    => $settings->admin_phone_number,
                    'message'        => 'Awaiting device connection via QR code scan.',
                    'ping_telemetry' => $this->getPingTelemetry(),
                    'raw'            => $data,
                ];
            }
        } catch (\Illuminate\Http\Client\ConnectionException $e) {
            Log::warning("OpenWA getStatus connection timeout: " . $e->getMessage());
            return [
                'success'        => true,
                'status'         => 'WAKING_UP',
                'session'        => $settings->session_name,
                'phone'          => $settings->admin_phone_number,
                'admin_phone'    => $settings->admin_phone_number,
                'message'        => 'OpenWA gateway is waking up (cold start). Reconnecting...',
                'ping_telemetry' => $this->getPingTelemetry(),
            ];
        } catch (\Exception $e) {
            Log::warning("OpenWA getStatus failed: " . $e->getMessage());
        }

        return [
            'success'        => false,
            'status'         => 'OFFLINE',
            'session'        => $settings->session_name,
            'phone'          => null,
            'admin_phone'    => $settings->admin_phone_number,
            'message'        => 'Failed to connect to OpenWA gateway.',
            'ping_telemetry' => $this->getPingTelemetry(),
        ];
    }

    /**
     * Keep-alive ping to prevent Render free instance sleep, verify API key, and measure latency.
     */
    public function pingGateway(bool $forceWake = false): array
    {
        $settings = WhatsAppSetting::getSettings();
        $baseUrl = $this->getBaseUrl($settings);
        $timeout = $forceWake ? 45 : 12;

        $startTime = microtime(true);
        $result = [
            'success'            => false,
            'status'             => 'OFFLINE',
            'base_url'           => $baseUrl,
            'latency_ms'         => null,
            'api_key_valid'      => false,
            'masked_key'         => strlen($settings->api_key) > 16 
                ? substr($settings->api_key, 0, 10) . '...' . substr($settings->api_key, -6)
                : 'configured',
            'pinged_at'          => now()->toIso8601String(),
            'message'            => '',
            'details'            => [],
        ];

        try {
            $response = Http::withHeaders([
                'X-API-Key' => $settings->api_key,
                'Accept'    => 'application/json',
            ])->timeout($timeout)->get("{$baseUrl}/api/sessions");

            $latency = round((microtime(true) - $startTime) * 1000, 2);
            $result['latency_ms'] = $latency;

            if ($response->successful()) {
                $sessions = $response->json();
                $result['success'] = true;
                $result['status'] = 'ONLINE';
                $result['api_key_valid'] = true;
                $result['message'] = "Gateway is active and responsive ({$latency}ms).";
                $result['details'] = [
                    'active_sessions_count' => is_array($sessions) ? count($sessions) : 0,
                    'http_status'           => $response->status(),
                ];
            } elseif ($response->status() === 401 || $response->status() === 403) {
                $result['status'] = 'AUTH_ERROR';
                $result['api_key_valid'] = false;
                $result['message'] = "Gateway rejected API key (HTTP {$response->status()}). Master key update required.";
            } else {
                $result['status'] = 'UNHEALTHY';
                $result['message'] = "Gateway returned HTTP {$response->status()}.";
            }
        } catch (\Illuminate\Http\Client\ConnectionException $e) {
            $latency = round((microtime(true) - $startTime) * 1000, 2);
            $result['latency_ms'] = $latency;
            $result['status'] = 'SLEEPING';
            $result['message'] = "Gateway connection timed out. Service may be sleeping or spinning up.";
        } catch (\Exception $e) {
            $result['message'] = "Ping failed: " . $e->getMessage();
        }

        // Cache last ping telemetry for 30 minutes
        \Illuminate\Support\Facades\Cache::put('openwa_last_ping_telemetry', $result, now()->addMinutes(30));

        return $result;
    }

    /**
     * Retrieve cached ping telemetry or run a fresh ping if older than 5 minutes.
     */
    public function getPingTelemetry(): array
    {
        $telemetry = \Illuminate\Support\Facades\Cache::get('openwa_last_ping_telemetry');
        if (!$telemetry) {
            return $this->pingGateway();
        }
        return $telemetry;
    }

    /**
     * Read recent KeepAlive ping logs.
     */
    public function getKeepaliveLogs(int $lines = 40): array
    {
        $logPath = storage_path('logs/keepalive.log');
        if (!file_exists($logPath)) {
            return [];
        }

        $content = @file_get_contents($logPath);
        if (!$content) return [];

        $allLines = array_filter(explode("\n", trim($content)));
        $recent = array_slice($allLines, -$lines);

        return array_values(array_reverse($recent));
    }

    /**
     * Fetch QR Code from OpenWA session.
     */
    public function getQrCode(): array
    {
        $settings = WhatsAppSetting::getSettings();
        $baseUrl = $this->getBaseUrl($settings);
        $sessionId = $this->resolveSessionId($settings);

        if (!$sessionId) {
            return [
                'success' => false,
                'status'  => 'OFFLINE',
                'message' => 'Unable to contact OpenWA to generate QR code.',
            ];
        }

        // 1. Check if session is already connected / authenticated
        try {
            $sessRes = Http::withHeaders([
                'X-API-Key' => $settings->api_key,
                'Accept'    => 'application/json',
            ])->timeout(4)->get("{$baseUrl}/api/sessions/{$sessionId}");

            if ($sessRes->successful()) {
                $sessData = $sessRes->json();
                $rawStatus = strtolower($sessData['status'] ?? '');
                if ($rawStatus === 'ready' || $rawStatus === 'connected') {
                    $phone = $sessData['phone'] ?? $settings->admin_phone_number;
                    return [
                        'success'     => true,
                        'status'      => 'CONNECTED',
                        'session_id'  => $sessionId,
                        'phone'       => $phone,
                        'admin_phone' => $phone,
                        'qrCode'      => null,
                        'message'     => 'WhatsApp is already connected and active!',
                    ];
                }
            }
        } catch (\Exception $e) {}

        // 2. Fetch QR Code from OpenWA session
        try {
            $response = Http::withHeaders([
                'X-API-Key' => $settings->api_key,
                'Accept'    => 'application/json',
            ])->timeout(6)->get("{$baseUrl}/api/sessions/{$sessionId}/qr");

            if ($response->status() === 404) {
                $sessionId = $this->resolveSessionId($settings, true);
                if ($sessionId) {
                    $response = Http::withHeaders([
                        'X-API-Key' => $settings->api_key,
                        'Accept'    => 'application/json',
                    ])->timeout(6)->get("{$baseUrl}/api/sessions/{$sessionId}/qr");
                }
            }

            if ($response->successful()) {
                $data = $response->json();
                return [
                    'success'    => true,
                    'session_id' => $sessionId,
                    'status'     => $data['status'] ?? 'qr_ready',
                    'qrCode'     => $data['qrCode'] ?? null,
                    'message'    => 'Scan QR Code with WhatsApp -> Linked Devices',
                ];
            }
        } catch (\Exception $e) {
            Log::warning("OpenWA QR Fetch failed: " . $e->getMessage());
        }

        return [
            'success' => false,
            'status'  => 'SCAN_QR',
            'message' => 'Waiting for QR code generation from OpenWA...',
        ];
    }

    /**
     * Disconnect active OpenWA session and send disconnect alert to Admin WhatsApp.
     */
    public function disconnectSession(): array
    {
        $settings = WhatsAppSetting::getSettings();
        $baseUrl = $this->getBaseUrl($settings);
        $sessionId = $this->resolveSessionId($settings);

        if (!$sessionId) {
            return [
                'success' => false,
                'message' => 'No active session found to disconnect.',
            ];
        }

        $adminPhone = $settings->admin_phone_number ?: '9025192863';
        $cleanPhone = preg_replace('/\D/', '', $adminPhone);

        // 1. Send Disconnect Alert to Admin Phone if session is alive
        if (!empty($cleanPhone)) {
            $disconnectMsg = "⚠️ *Mangalam Healthy Foods - WhatsApp Gateway Disconnected* ⚠️\n\n"
                . "Your WhatsApp Admin session (*+{$cleanPhone}*) has been disconnected from the store management console.\n\n"
                . "To reconnect and resume order alerts, scan the QR code in the Admin Panel:\n"
                . "👉 https://palegreen-dogfish-720166.hostingersite.com/admin\n\n"
                . "🌾 *Mangalam Healthy Foods*";

            try {
                $waId = $this->formatWhatsAppId($cleanPhone);
                Http::withHeaders([
                    'X-API-Key'    => $settings->api_key,
                    'Content-Type' => 'application/json',
                ])->timeout(4)->post("{$baseUrl}/api/sessions/{$sessionId}/messages/send-text", [
                    'chatId' => $waId,
                    'text'   => $disconnectMsg,
                ]);
            } catch (\Exception $e) {
                Log::warning("Failed to send disconnect notice: " . $e->getMessage());
            }
        }

        // 2. Stop / Terminate OpenWA session
        try {
            Http::withHeaders([
                'X-API-Key' => $settings->api_key,
            ])->timeout(5)->post("{$baseUrl}/api/sessions/{$sessionId}/stop");

            Http::withHeaders([
                'X-API-Key' => $settings->api_key,
            ])->timeout(5)->delete("{$baseUrl}/api/sessions/{$sessionId}");
        } catch (\Exception $e) {
            Log::warning("OpenWA stop/delete session error: " . $e->getMessage());
        }

        // 3. Clear all cached session UUIDs and welcome flags
        $cacheKey = "openwa_session_id_" . md5($baseUrl) . "_{$settings->session_name}";
        \Illuminate\Support\Facades\Cache::forget($cacheKey);
        \Illuminate\Support\Facades\Cache::forget("openwa_session_id_{$settings->session_name}");
        \Illuminate\Support\Facades\Cache::forget("wa_welcome_sent_session_{$sessionId}");

        return [
            'success' => true,
            'message' => 'WhatsApp gateway session disconnected successfully.',
        ];
    }

    /**
     * Format phone numbers into WhatsApp ID (e.g. 919025192863@c.us).
     */
    public function formatWhatsAppId(string $phone): string
    {
        $clean = preg_replace('/\D/', '', $phone);
        if (strlen($clean) === 10) {
            $clean = '91' . $clean;
        }
        return $clean . '@c.us';
    }

    /**
     * Send direct message via OpenWA API & record in DB.
     */
    public function sendMessage(string $recipientPhone, string $messageText, ?int $orderId = null, string $senderType = 'admin'): bool
    {
        $settings = WhatsAppSetting::getSettings();
        $cleanPhone = WhatsAppConversation::normalizePhone($recipientPhone);

        // 1. Find or create conversation in Database
        $conversation = WhatsAppConversation::firstOrCreate(
            ['customer_phone' => $cleanPhone],
            [
                'customer_name'   => 'Valued Customer',
                'last_message'    => $messageText,
                'last_message_at' => now(),
                'unread_count'    => 0,
                'status'          => 'active',
            ]
        );

        $conversation->update([
            'last_message'    => $messageText,
            'last_message_at' => now(),
        ]);

        // 2. Create message record
        WhatsAppMessage::create([
            'conversation_id' => $conversation->id,
            'sender_type'     => $senderType,
            'message'         => $messageText,
            'status'          => 'sent',
            'order_id'        => $orderId,
        ]);

        // 3. Dispatch via OpenWA HTTP REST API if enabled
        if ($settings->is_enabled) {
            $baseUrl = $this->getBaseUrl($settings);
            $sessionId = $this->resolveSessionId($settings);
            if ($sessionId) {
                $waId = $this->formatWhatsAppId($cleanPhone);
                $attempts = 0;
                $dispatched = false;

                while ($attempts < 2 && !$dispatched) {
                    $attempts++;
                    try {
                        $res = Http::withHeaders([
                            'X-API-Key'    => $settings->api_key,
                            'Content-Type' => 'application/json',
                        ])->timeout(8)->post("{$baseUrl}/api/sessions/{$sessionId}/messages/send-text", [
                            'chatId' => $waId,
                            'text'   => $messageText,
                        ]);

                        if ($res->successful()) {
                            $dispatched = true;
                        } else if ($attempts < 2) {
                            usleep(800000); // 0.8s backoff
                        }
                    } catch (\Exception $e) {
                        if ($attempts < 2) {
                            usleep(1200000); // 1.2s backoff
                        } else {
                            Log::warning("OpenWA message dispatch failed: " . $e->getMessage());
                        }
                    }
                }
            }
        }

        return true;
    }

    /**
     * Send automated dual notifications when an order is created.
     */
    public function sendOrderPlacedNotifications(Order $order): void
    {
        $settings = WhatsAppSetting::getSettings();
        $user = $order->user;

        // Resolve Customer Phone & Name
        $customerPhone = $user->whatsapp_number 
            ?? $user->contact_number 
            ?? ($order->address_snapshot['phone_number'] ?? null)
            ?? '9944508736';

        $customerName = $user->full_name 
            ?? $user->name 
            ?? ($order->address_snapshot['full_name'] ?? null)
            ?? 'Valued Customer';

        $cleanCustomerPhone = preg_replace('/\D/', '', $customerPhone);
        if (strlen($cleanCustomerPhone) === 10) {
            $cleanCustomerPhone = '91' . $cleanCustomerPhone;
        }

        $conv = WhatsAppConversation::where('customer_phone', $cleanCustomerPhone)->first();
        if ($conv) {
            $conv->update(['customer_name' => $customerName, 'user_id' => $user ? $user->id : null]);
        }

        $itemsList = "";
        foreach ($order->items as $item) {
            $size = $item->package_size ? " ({$item->package_size})" : "";
            $itemsList .= "• *{$item->product_name}*{$size} × {$item->quantity} — ₹{$item->total_price}\n";
        }

        $addressLine1 = $order->address_snapshot['address_line1'] ?? 'No. 14, Main Road';
        $addressLine2 = $order->address_snapshot['address_line2'] ?? '';
        $city = $order->address_snapshot['city'] ?? 'Sethiyathope';
        $state = $order->address_snapshot['state'] ?? 'Tamil Nadu';
        $pincode = $order->address_snapshot['pincode'] ?? '608702';

        $fullAddress = trim("{$addressLine1}, {$addressLine2}, {$city}, {$state} - {$pincode}", ", ");

        // 1. Customer Confirmation Message
        if ($settings->notify_customer_on_order && $customerPhone) {
            $customerMessage = "🌾 *Mangalam Healthy Foods - Order Confirmed!* 🌾\n\n"
                . "Dear *{$customerName}*,\n\n"
                . "Thank you for your order! We have successfully received your order *#{$order->order_number}*.\n\n"
                . "📦 *Order Details:*\n"
                . "{$itemsList}"
                . "💰 *Total Amount:* ₹" . number_format($order->total_amount, 2) . " ({$order->payment_method})\n"
                . "📍 *Delivery Address:* {$fullAddress}\n\n"
                . "Thank you for choosing Mangalam Healthy Foods! Pure, authentic sprouted vitality. 🌿\n\n"
                . "📞 If you have any queries, please contact us at *+91 7094074655*.\n"
                . "🌐 *Track Order:* https://mahealthyfoods.in/profile";

            $this->sendMessage($customerPhone, $customerMessage, $order->id, 'system');
        }

        // 2. Admin Alert Message
        if ($settings->notify_admin_on_order && $settings->admin_phone_number) {
            $adminMessage = "🚨 *NEW ORDER RECEIVED!* 🚨\n\n"
                . "Order ID: *#{$order->order_number}*\n"
                . "Customer Name: *{$customerName}*\n"
                . "Customer Mobile: *+{$cleanCustomerPhone}*\n\n"
                . "📍 *Delivery Address:*\n{$fullAddress}\n\n"
                . "📦 *Ordered Items:*\n"
                . "{$itemsList}"
                . "💰 *Total Value:* *₹" . number_format($order->total_amount, 2) . "* ({$order->payment_method})\n\n"
                . "👉 *View Order:* http://localhost:5173/admin/orders";

            $this->sendMessage($settings->admin_phone_number, $adminMessage, $order->id, 'system');
        }
    }

    /**
     * Send automated status update notifications to customer & admin.
     */
    public function sendOrderStatusUpdatedNotification(Order $order, string $newStatus): void
    {
        $settings = WhatsAppSetting::getSettings();
        $user = $order->user;

        $customerPhone = $user->whatsapp_number 
            ?? $user->contact_number 
            ?? ($order->address_snapshot['phone_number'] ?? null)
            ?? '9944508736';

        $customerName = $user->full_name 
            ?? $user->name 
            ?? ($order->address_snapshot['full_name'] ?? null)
            ?? 'Valued Customer';

        $statusNormalized = strtolower($newStatus);

        $itemsList = "";
        foreach ($order->items as $item) {
            $size = $item->package_size ? " ({$item->package_size})" : "";
            $itemsList .= "• *{$item->product_name}*{$size} × {$item->quantity}\n";
        }

        $message = match ($statusNormalized) {
            'processing' => "🌾 *Mangalam Healthy Foods - Order in Processing* 🌾\n\n"
                . "Dear *{$customerName}*,\n"
                . "Great news! Your order *#{$order->order_number}* is now being freshly milled and packaged under hygienic traditional standards.\n\n"
                . "📦 *Items:*\n{$itemsList}\n"
                . "🔄 *Status:* Processing at Sethiyathope Facility\n"
                . "🌐 Track anytime: https://mahealthyfoods.in/profile",

            'confirmed' => "✅ *Mangalam Healthy Foods - Order Confirmed* ✅\n\n"
                . "Dear *{$customerName}*,\n"
                . "Your order *#{$order->order_number}* has been verified and confirmed by our team.\n\n"
                . "💰 *Total:* ₹" . number_format($order->total_amount, 2) . " ({$order->payment_method})\n"
                . "📦 Next step: Batch preparation & quality check.",

            'shipped' => "🚚 *Mangalam Healthy Foods - Order Dispatched!* 🚚\n\n"
                . "Dear *{$customerName}*,\n"
                . "Your fresh package *#{$order->order_number}* has been dispatched via courier!\n\n"
                . "📍 Delivery To: " . ($order->address_snapshot['city'] ?? 'Local Delivery') . " (" . ($order->address_snapshot['pincode'] ?? '608702') . ")\n"
                . "📞 Delivery Helpdesk: +91 90251 92863\n"
                . "🌐 Track: https://mahealthyfoods.in/profile",

            'delivered' => "🎉 *Mangalam Healthy Foods - Order Delivered!* 🎉\n\n"
                . "Dear *{$customerName}*,\n"
                . "Your order *#{$order->order_number}* has been safely delivered!\n\n"
                . "🥣 *Health Tip:* Mix 2 tbsp of Amutham Sprouted Health Mix in 250ml warm water/milk for an energetic morning breakfast.\n\n"
                . "Thank you for supporting organic ancestral nutrition! 🌿",

            'cancelled' => "⚠️ *Mangalam Healthy Foods - Order Cancelled* ⚠️\n\n"
                . "Dear *{$customerName}*,\n"
                . "Your order *#{$order->order_number}* has been marked as cancelled.\n"
                . "If this was a mistake or you have questions, please reply directly to this WhatsApp chat or call +91 90251 92863.",

            default => "🌾 *Mangalam Healthy Foods - Order Update* 🌾\n\n"
                . "Dear *{$customerName}*,\n"
                . "Your order *#{$order->order_number}* status is now: *" . strtoupper($newStatus) . "*."
        };

        // Send to Customer
        if ($customerPhone) {
            $this->sendMessage($customerPhone, $message, $order->id, 'system');
        }

        // Send Status Alert to Admin
        if ($settings->admin_phone_number) {
            $adminAlert = "🔔 *ORDER STATUS UPDATED* 🔔\n\n"
                . "Order: *#{$order->order_number}*\n"
                . "Customer: *{$customerName}* (📞 +{$customerPhone})\n"
                . "New Status: *" . strtoupper($newStatus) . "*\n"
                . "Total Value: ₹" . number_format($order->total_amount, 2);
            
            $this->sendMessage($settings->admin_phone_number, $adminAlert, $order->id, 'system');
        }
    }
}
