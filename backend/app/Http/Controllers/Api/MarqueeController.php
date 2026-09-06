<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Marquee;
use App\Models\BrandingSetting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MarqueeController extends Controller
{
    /**
     * Get active marquee announcements for the storefront.
     */
    public function index(): JsonResponse
    {
        try {
            $globalSetting = BrandingSetting::where('key', 'marquee_enabled')->first();
            $isEnabled = $globalSetting ? filter_var($globalSetting->value, FILTER_VALIDATE_BOOLEAN) : true;

            $items = Marquee::active()->get();

            return response()->json([
                'status'  => true,
                'message' => 'Active marquee items retrieved successfully',
                'data'    => [
                    'is_enabled' => $isEnabled,
                    'items'      => $items,
                ],
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'status'  => false,
                'message' => 'Failed to fetch marquee: ' . $e->getMessage(),
                'data'    => [
                    'is_enabled' => true,
                    'items'      => [],
                ],
            ], 500);
        }
    }
}
