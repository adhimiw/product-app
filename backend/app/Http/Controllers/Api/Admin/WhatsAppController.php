<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WhatsAppController extends Controller
{
    public function getStatus(): JsonResponse
    {
        return response()->json(['status' => true, 'connected' => false]);
    }

    public function getQrCode(): JsonResponse
    {
        return response()->json(['status' => true, 'qr' => null]);
    }

    public function getConversations(): JsonResponse
    {
        return response()->json(['status' => true, 'data' => []]);
    }

    public function getMessages($id): JsonResponse
    {
        return response()->json(['status' => true, 'data' => []]);
    }

    public function sendMessage(Request $request): JsonResponse
    {
        return response()->json(['status' => true, 'message' => 'Sent']);
    }

    public function getSettings(): JsonResponse
    {
        return response()->json(['status' => true, 'settings' => []]);
    }

    public function updateSettings(Request $request): JsonResponse
    {
        return response()->json(['status' => true, 'message' => 'Settings updated']);
    }

    public function sendTestNotification(Request $request): JsonResponse
    {
        return response()->json(['status' => true, 'message' => 'Test sent']);
    }

    public function requestLogoutOtp(): JsonResponse
    {
        return response()->json(['status' => true, 'message' => 'OTP sent']);
    }

    public function verifyLogoutOtp(Request $request): JsonResponse
    {
        return response()->json(['status' => true, 'message' => 'OTP verified']);
    }

    public function disconnect(): JsonResponse
    {
        return response()->json(['status' => true, 'message' => 'Disconnected']);
    }

    public function pingGateway(): JsonResponse
    {
        return response()->json(['status' => true, 'pong' => true]);
    }

    public function getKeepaliveLogs(): JsonResponse
    {
        return response()->json(['status' => true, 'logs' => []]);
    }
}
