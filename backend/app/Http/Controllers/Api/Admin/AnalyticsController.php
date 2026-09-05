<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;

class AnalyticsController extends Controller
{
    public function getOverview(): JsonResponse
    {
        return response()->json(['status' => true, 'data' => []]);
    }

    public function getTimeline(): JsonResponse
    {
        return response()->json(['status' => true, 'data' => []]);
    }

    public function getRevenue(): JsonResponse
    {
        return response()->json(['status' => true, 'data' => []]);
    }

    public function getStatusDistribution(): JsonResponse
    {
        return response()->json(['status' => true, 'data' => []]);
    }

    public function getPerformance(): JsonResponse
    {
        return response()->json(['status' => true, 'data' => []]);
    }
}
