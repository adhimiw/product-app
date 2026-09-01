<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BrandingSetting;
use Illuminate\Http\JsonResponse;

class BrandingController extends Controller
{
    /**
     * Get public branding assets and configurations.
     */
    public function index(): JsonResponse
    {
        try {
            $branding = BrandingSetting::getAllBranding();

            return response()->json([
                'status'  => true,
                'message' => 'Branding configuration retrieved successfully',
                'data'    => $branding,
            ], 200);
        } catch (\Throwable $e) {
            return response()->json([
                'status'  => false,
                'message' => 'Failed to fetch branding: ' . $e->getMessage(),
                'data'    => BrandingSetting::DEFAULTS,
            ], 200);
        }
    }
}
