<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WhatsAppWebhookController extends Controller
{
    public function handle(Request $request): JsonResponse
    {
        return response()->json(['status' => true, 'message' => 'Webhook received']);
    }
}
