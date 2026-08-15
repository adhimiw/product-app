<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;

class HealthController extends Controller
{
    /**
     * Return HealthMix API operational status.
     */
    public function ping(): JsonResponse
    {
        return response()->json([
            'status' => 'success',
            'message' => 'HealthMix API is operational.',
            'version' => 'v1',
            'timestamp' => now()->toIso8601String(),
        ]);
    }
}
