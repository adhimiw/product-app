<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Banner;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BannerController extends Controller
{
    /**
     * Get all active banners for the frontend Hero Carousel
     */
    public function index(): JsonResponse
    {
        try {
            $banners = Banner::where('is_active', true)
                ->orderBy('sort_order', 'asc')
                ->orderBy('id', 'asc')
                ->get();

            return response()->json([
                'status'  => true,
                'message' => 'Active banners retrieved successfully',
                'data'    => $banners,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status'  => false,
                'message' => 'Failed to fetch banners: ' . $e->getMessage(),
                'data'    => [],
            ], 500);
        }
    }
}
