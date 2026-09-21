<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\WhatsAppConversation;
use App\Models\WhatsAppMessage;
use App\Models\WhatsAppSetting;
use App\Services\WhatsAppGatewayService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WhatsAppController extends Controller
{
    protected WhatsAppGatewayService $gateway;

    public function __construct(WhatsAppGatewayService $gateway)
    {
        $this->gateway = $gateway;
    }

    /**
     * Get live WhatsApp gateway status.
     */
    public function getStatus(): JsonResponse
    {
        $status = $this->gateway->getStatus();
        $settings = WhatsAppSetting::getSettings();

        return response()->json([
            'success' => true,
            'data'    => array_merge($status, [
                'admin_phone_number' => $settings->admin_phone_number,
                'is_enabled'         => $settings->is_enabled,
                'auto_reply_enabled' => $settings->auto_reply_enabled,
            ]),
        ]);
    }

    /**
     * Get QR code for linking WhatsApp.
     */
    public function getQrCode(): JsonResponse
    {
        $qrData = $this->gateway->getQrCode();
        return response()->json([
            'success' => true,
            'data'    => $qrData,
        ]);
    }

    /**
     * Get all WhatsApp conversations for ForgeChat UI synchronized with real Database users.
     */
    public function getConversations(Request $request): JsonResponse
    {
        $settings = WhatsAppSetting::getSettings();
        $adminPhoneClean = WhatsAppConversation::normalizePhone($settings->admin_phone_number ?: '9025192863');

        // 1. Auto-synchronize registered CUSTOMERS ONLY (role != 1) into WhatsApp conversations
        try {
            $convCount = WhatsAppConversation::count();
            if ($convCount === 0 || !\Illuminate\Support\Facades\Cache::has('wa_user_sync_lock')) {
                \Illuminate\Support\Facades\Cache::put('wa_user_sync_lock', true, now()->addMinutes(5));
                
                // Fetch Customers ONLY (exclude Admin role = 1)
                $users = \App\Models\User::where('role', '!=', 1)
                    ->where(function ($q) {
                        $q->whereNotNull('contact_number')->orWhereNotNull('whatsapp_number');
                    })->get();

                foreach ($users as $u) {
                    $phone = $u->whatsapp_number ?: $u->contact_number;
                    if (!$phone) continue;
                    $cleanPhone = WhatsAppConversation::normalizePhone($phone);
                    if (!$cleanPhone || $cleanPhone === $adminPhoneClean) continue;
                    
                    $userName = $u->full_name ?: $u->name ?: 'Valued Customer';
                    
                    WhatsAppConversation::updateOrCreate(
                        ['customer_phone' => $cleanPhone],
                        [
                            'customer_name'   => $userName,
                            'user_id'         => $u->id,
                            'status'          => 'active',
                        ]
                    );
                }
            }
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::warning("Auto-sync customers to WhatsApp conversations failed: " . $e->getMessage());
        }

        $query = WhatsAppConversation::with(['user.orders' => function ($q) {
            $q->latest()->limit(3);
        }])
        ->where('customer_phone', '!=', $adminPhoneClean)
        ->whereDoesntHave('user', function($q) {
            $q->where('role', 1);
        })
        ->orderBy('last_message_at', 'desc');

        if ($request->has('search') && !empty($request->search)) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('customer_name', 'like', "%{$search}%")
                  ->orWhere('customer_phone', 'like', "%{$search}%")
                  ->orWhere('last_message', 'like', "%{$search}%");
            });
        }

        if ($request->filter === 'unread') {
            $query->where('unread_count', '>', 0);
        }

        // Deduplicate by customer_phone to guarantee uniqueness
        $conversations = $query->get()->unique('customer_phone')->values();

        return response()->json([
            'success' => true,
            'data'    => $conversations,
        ]);
    }

    /**
     * Get full message thread for a conversation.
     */
    public function getMessages(int $conversationId): JsonResponse
    {
        $conversation = WhatsAppConversation::with(['user.orders.items'])->findOrFail($conversationId);
        
        // Mark conversation as read
        $conversation->update(['unread_count' => 0]);

        $messages = $conversation->messages()->with('order.items')->get();

        return response()->json([
            'success' => true,
            'data'    => [
                'conversation' => $conversation,
                'messages'     => $messages,
            ],
        ]);
    }

    /**
     * Send a WhatsApp message to customer.
     */
    public function sendMessage(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'conversation_id' => 'nullable|integer',
            'phone'           => 'required|string',
            'message'         => 'required|string',
            'order_id'        => 'nullable|integer',
        ]);

        $success = $this->gateway->sendMessage(
            $validated['phone'],
            $validated['message'],
            $validated['order_id'] ?? null,
            'admin'
        );

        return response()->json([
            'success' => $success,
            'message' => 'Message sent successfully!',
        ]);
    }

    /**
     * Delete a single conversation and its message history from DB.
     */
    public function deleteConversation($id): JsonResponse
    {
        $conv = WhatsAppConversation::find($id);
        if (!$conv) {
            return response()->json([
                'success' => false,
                'message' => 'Conversation not found.',
            ], 404);
        }

        WhatsAppMessage::where('conversation_id', $id)->delete();
        $conv->delete();

        return response()->json([
            'success' => true,
            'message' => 'Conversation and message history deleted successfully from database.',
        ]);
    }

    /**
     * Clear all messages in a conversation while retaining the contact.
     */
    public function clearMessages($id): JsonResponse
    {
        $conv = WhatsAppConversation::find($id);
        if (!$conv) {
            return response()->json([
                'success' => false,
                'message' => 'Conversation not found.',
            ], 404);
        }

        WhatsAppMessage::where('conversation_id', $id)->delete();
        $conv->update([
            'last_message'    => null,
            'last_message_at' => null,
            'unread_count'    => 0,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Chat message history cleared successfully.',
        ]);
    }

    /**
     * Purge ALL WhatsApp conversations and message history from DB.
     */
    public function purgeAllConversations(): JsonResponse
    {
        $msgsCount = WhatsAppMessage::count();
        $convsCount = WhatsAppConversation::count();

        WhatsAppMessage::truncate();
        WhatsAppConversation::truncate();
        \Illuminate\Support\Facades\Cache::forget('wa_user_sync_lock');

        return response()->json([
            'success' => true,
            'message' => "Successfully purged all {$convsCount} conversations and {$msgsCount} messages from database.",
        ]);
    }

    /**
     * Get current WhatsApp settings.
     */
    public function getSettings(): JsonResponse
    {
        $settings = WhatsAppSetting::getSettings();
        return response()->json([
            'success' => true,
            'data'    => $settings,
        ]);
    }

    /**
     * Update WhatsApp settings.
     */
    public function updateSettings(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'admin_phone_number'       => 'required|string',
            'session_name'             => 'nullable|string',
            'api_base_url'             => 'nullable|string',
            'api_key'                  => 'nullable|string',
            'is_enabled'               => 'nullable|boolean',
            'auto_reply_enabled'       => 'nullable|boolean',
            'notify_customer_on_order' => 'nullable|boolean',
            'notify_admin_on_order'    => 'nullable|boolean',
        ]);

        $settings = WhatsAppSetting::getSettings();
        $settings->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'WhatsApp settings updated successfully!',
            'data'    => $settings,
        ]);
    }

    /**
     * Trigger a test notification.
     */
    public function sendTestNotification(Request $request): JsonResponse
    {
        $type = $request->input('type', 'admin');
        $settings = WhatsAppSetting::getSettings();

        if ($type === 'admin') {
            $phone = $settings->admin_phone_number;
            $msg = "🔔 *Mangalam WhatsApp Gateway Test Alert*\n\n"
                 . "This is a test notification from your Admin Portal. WhatsApp integration is active and operating normally!\n"
                 . "🕒 " . now()->format('d M Y, h:i A');
        } else {
            $phone = $request->input('customer_phone', '9944508736');
            $msg = "🌾 *Mangalam Healthy Foods - Test Notification*\n\n"
                 . "Hello! This is a test confirmation message from Mangalam Healthy Foods WhatsApp service.\n"
                 . "🕒 " . now()->format('d M Y, h:i A');
        }

        $this->gateway->sendMessage($phone, $msg, null, 'system');

        return response()->json([
            'success' => true,
            'message' => "Test WhatsApp message sent to {$phone}!",
        ]);
    }

    /**
     * Request One-Time Password (OTP) to Admin WhatsApp for Session Disconnection / Logout.
     */
    public function requestLogoutOtp(Request $request): JsonResponse
    {
        $settings = WhatsAppSetting::getSettings();
        $adminPhone = $settings->admin_phone_number ?: '9025192863';
        
        // Generate secure 6-digit random OTP
        $otp = (string) mt_rand(100000, 999999);
        \Illuminate\Support\Facades\Cache::put('wa_session_logout_otp', $otp, now()->addMinutes(10));
        
        $msg = "🔐 *Mangalam WhatsApp Gateway Security Verification*\n\n"
             . "Your One-Time Password (OTP) to disconnect / logout the active WhatsApp gateway session is:\n\n"
             . "👉 *{$otp}*\n\n"
             . "⏱️ Valid for 10 minutes. If you did not initiate this request, please secure your admin portal.\n"
             . "🌾 *Mangalam Healthy Foods*";
             
        $this->gateway->sendMessage($adminPhone, $msg, null, 'system');
        
        return response()->json([
            'success'          => true,
            'message'          => "One-Time Password (OTP) dispatched to Admin WhatsApp (+91 {$adminPhone})",
            'admin_phone'      => $adminPhone,
            'expires_in'       => 600,
            'test_otp_preview' => $otp,
        ]);
    }

    /**
     * Verify Session Logout OTP.
     */
    public function verifyLogoutOtp(Request $request): JsonResponse
    {
        $request->validate([
            'otp'                 => 'required|string',
            'perform_disconnect'  => 'nullable|boolean',
        ]);
        
        $inputOtp = trim($request->input('otp'));
        $cachedOtp = \Illuminate\Support\Facades\Cache::get('wa_session_logout_otp');
        
        if (!$cachedOtp || $inputOtp !== $cachedOtp) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid or expired OTP. Please check your Admin WhatsApp and try again.',
            ], 422);
        }
        
        // OTP is valid! Clear it
        \Illuminate\Support\Facades\Cache::forget('wa_session_logout_otp');
        
        $performDisconnect = $request->boolean('perform_disconnect', false);
        if ($performDisconnect) {
            $this->gateway->disconnectSession();
        }
        
        return response()->json([
            'success'      => true,
            'message'      => 'OTP verified successfully! WhatsApp Gateway session disconnected.',
            'disconnected' => $performDisconnect,
        ]);
    }

    /**
     * Direct Disconnect session endpoint.
     */
    public function disconnect(Request $request): JsonResponse
    {
        $res = $this->gateway->disconnectSession();
        return response()->json($res);
    }

    /**
     * Keep-alive ping and health diagnostics endpoint.
     */
    public function pingGateway(Request $request): JsonResponse
    {
        $forceWake = $request->boolean('wake', false);
        $res = $this->gateway->pingGateway($forceWake);
        return response()->json([
            'success' => $res['success'],
            'data'    => $res,
        ]);
    }

    /**
     * Get recent KeepAlive ping log entries.
     */
    public function getKeepaliveLogs(Request $request): JsonResponse
    {
        $limit = (int) $request->input('limit', 50);
        $logs = $this->gateway->getKeepaliveLogs($limit);
        return response()->json([
            'success' => true,
            'data'    => $logs,
        ]);
    }

    /**
     * Get automated dispatched message logs with filtering, search, and summary metrics.
     */
    public function getMessageLogs(Request $request): JsonResponse
    {
        $search = trim((string)$request->input('search', ''));
        $filter = trim((string)$request->input('filter', 'all'));
        $page = (int)$request->input('page', 1);
        $perPage = (int)$request->input('per_page', 50);

        $query = WhatsAppMessage::with(['conversation.user', 'order.user', 'order.items'])
            ->orderBy('created_at', 'desc');

        if (!empty($search)) {
            $query->where(function ($q) use ($search) {
                $q->where('message', 'like', "%{$search}%")
                  ->orWhereHas('conversation', function ($cq) use ($search) {
                      $cq->where('customer_name', 'like', "%{$search}%")
                         ->orWhere('customer_phone', 'like', "%{$search}%");
                  })
                  ->orWhereHas('order', function ($oq) use ($search) {
                      $oq->where('order_number', 'like', "%{$search}%");
                  });
            });
        }

        // Filter by notification event type
        if ($filter === 'order_placed') {
            $query->where(function ($q) {
                $q->where('message', 'like', '%Order Confirmed%')
                  ->orWhere('message', 'like', '%NEW ORDER RECEIVED%');
            });
        } elseif ($filter === 'shipped') {
            $query->where(function ($q) {
                $q->where('message', 'like', '%Dispatched%')
                  ->orWhere('message', 'like', '%shipped%')
                  ->orWhere('message', 'like', '%Shipment%');
            });
        } elseif ($filter === 'delivered') {
            $query->where('message', 'like', '%Delivered%');
        } elseif ($filter === 'processing') {
            $query->where('message', 'like', '%Processing%');
        } elseif ($filter === 'admin') {
            $query->where(function ($q) {
                $q->where('message', 'like', '%NEW ORDER RECEIVED%')
                  ->orWhere('message', 'like', '%ORDER STATUS UPDATED%')
                  ->orWhere('message', 'like', '%Security Verification%')
                  ->orWhere('message', 'like', '%Test Alert%');
            });
        }

        // Metrics counts
        $totalLogs = WhatsAppMessage::count();
        $orderPlacedCount = WhatsAppMessage::where(function ($q) {
            $q->where('message', 'like', '%Order Confirmed%')
              ->orWhere('message', 'like', '%NEW ORDER RECEIVED%');
        })->count();
        $shippedCount = WhatsAppMessage::where(function ($q) {
            $q->where('message', 'like', '%Dispatched%')
              ->orWhere('message', 'like', '%shipped%')
              ->orWhere('message', 'like', '%Shipment%');
        })->count();
        $deliveredCount = WhatsAppMessage::where('message', 'like', '%Delivered%')->count();
        $adminCount = WhatsAppMessage::where(function ($q) {
            $q->where('message', 'like', '%NEW ORDER RECEIVED%')
              ->orWhere('message', 'like', '%ORDER STATUS UPDATED%')
              ->orWhere('message', 'like', '%Security Verification%')
              ->orWhere('message', 'like', '%Test Alert%');
        })->count();

        $paginated = $query->paginate($perPage, ['*'], 'page', $page);

        $formattedItems = collect($paginated->items())->map(function ($msg) {
            $text = $msg->message ?? '';
            $eventType = 'general';
            $eventLabel = 'Notice';
            $eventColor = 'slate';

            if (str_contains($text, 'Order Confirmed') || (str_contains($text, 'NEW ORDER RECEIVED') && !str_contains($text, 'STATUS UPDATED'))) {
                $eventType = 'order_placed';
                $eventLabel = 'Order Placed';
                $eventColor = 'emerald';
            } elseif (str_contains($text, 'Dispatched') || str_contains($text, 'shipped') || str_contains($text, 'Shipment')) {
                $eventType = 'shipped';
                $eventLabel = 'Shipped';
                $eventColor = 'indigo';
            } elseif (str_contains($text, 'Delivered')) {
                $eventType = 'delivered';
                $eventLabel = 'Delivered';
                $eventColor = 'green';
            } elseif (str_contains($text, 'Processing')) {
                $eventType = 'processing';
                $eventLabel = 'Processing';
                $eventColor = 'blue';
            } elseif (str_contains($text, 'Security Verification') || str_contains($text, 'OTP')) {
                $eventType = 'otp';
                $eventLabel = 'OTP Security';
                $eventColor = 'amber';
            } elseif (str_contains($text, 'ORDER STATUS UPDATED')) {
                $eventType = 'status_updated';
                $eventLabel = 'Status Changed';
                $eventColor = 'purple';
            } elseif (str_contains($text, 'Cancelled')) {
                $eventType = 'cancelled';
                $eventLabel = 'Cancelled';
                $eventColor = 'rose';
            }

            // Recipient
            $conv = $msg->conversation;
            $order = $msg->order;
            $user = $order?->user ?: $conv?->user;

            $recipientName = $conv?->customer_name ?: ($user?->full_name ?: ($user?->name ?: 'Customer'));
            $recipientPhone = $conv?->customer_phone ?: ($user?->whatsapp_number ?: ($user?->contact_number ?: ''));
            $isAdminAlert = str_contains($text, 'NEW ORDER RECEIVED') || str_contains($text, 'ORDER STATUS UPDATED') || str_contains($text, 'Security Verification') || str_contains($text, 'Test Alert');

            if ($isAdminAlert) {
                $recipientName = 'Mangalam Admin';
            }

            return [
                'id'             => $msg->id,
                'sender_type'    => $msg->sender_type,
                'status'         => $msg->status ?: 'sent',
                'order_id'       => $msg->order_id,
                'order_number'   => $order?->order_number ?: null,
                'total_amount'   => $order?->total_amount ?: null,
                'recipient_name' => $recipientName,
                'recipient_phone'=> $recipientPhone,
                'is_admin'       => $isAdminAlert,
                'event_type'     => $eventType,
                'event_label'    => $eventLabel,
                'event_color'    => $eventColor,
                'message'        => $text,
                'created_at'     => $msg->created_at ? $msg->created_at->toIso8601String() : now()->toIso8601String(),
                'formatted_time' => $msg->created_at ? $msg->created_at->format('d M Y, h:i A') : '',
            ];
        });

        return response()->json([
            'success' => true,
            'data'    => $formattedItems,
            'meta'    => [
                'current_page' => $paginated->currentPage(),
                'last_page'    => $paginated->lastPage(),
                'total'        => $paginated->total(),
                'per_page'     => $paginated->perPage(),
            ],
            'counts'  => [
                'total'        => $totalLogs,
                'order_placed' => $orderPlacedCount,
                'shipped'      => $shippedCount,
                'delivered'    => $deliveredCount,
                'admin_alerts' => $adminCount,
            ],
        ]);
    }

    /**
     * Delete a single message log record.
     */
    public function deleteMessage($id): JsonResponse
    {
        $msg = WhatsAppMessage::find($id);
        if (!$msg) {
            return response()->json([
                'success' => false,
                'message' => 'Message log record not found.',
            ], 404);
        }

        $msg->delete();

        return response()->json([
            'success' => true,
            'message' => 'Message log removed successfully.',
        ]);
    }
}
