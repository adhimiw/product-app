<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AnalyticsController extends Controller
{
    /**
     * Get consolidated analytics overview for dashboard.
     */
    public function getOverview(Request $request): JsonResponse
    {
        try {
            $period = strtoupper($request->get('period', '30D'));

            $timeline = $this->computeTimelineData($period);
            $statusDist = $this->computeStatusDistribution();
            $performance = $this->computePerformanceData($period);

            return response()->json([
                'success' => true,
                'data'    => [
                    'timeline'            => $timeline['orders'],
                    'revenue'             => $timeline['revenue'],
                    'status_distribution' => $statusDist,
                    'performance'         => $performance,
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to generate analytics: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get Order & Revenue Timeline.
     */
    public function getTimeline(Request $request): JsonResponse
    {
        $period = strtoupper($request->get('period', '30D'));
        $data = $this->computeTimelineData($period);

        return response()->json([
            'success' => true,
            'period'  => $period,
            'data'    => $data['orders'],
            'revenue' => $data['revenue'],
        ]);
    }

    /**
     * Get Revenue Trajectory Timeline.
     */
    public function getRevenue(Request $request): JsonResponse
    {
        $period = strtoupper($request->get('period', '30D'));
        $data = $this->computeTimelineData($period);

        return response()->json([
            'success' => true,
            'period'  => $period,
            'data'    => $data['revenue'],
        ]);
    }

    /**
     * Get Orders by Status Distribution.
     */
    public function getStatusDistribution(): JsonResponse
    {
        $dist = $this->computeStatusDistribution();

        return response()->json([
            'success' => true,
            'total'   => $dist['total'],
            'data'    => $dist['data'],
        ]);
    }

    /**
     * Get Order Performance bar chart data.
     */
    public function getPerformance(Request $request): JsonResponse
    {
        $period = strtoupper($request->get('period', '30D'));
        $data = $this->computePerformanceData($period);

        return response()->json([
            'success' => true,
            'period'  => $period,
            'data'    => $data,
        ]);
    }

    /**
     * Compute dynamic timeline and revenue data based on selected time period.
     */
    private function computeTimelineData(string $period): array
    {
        $now = Carbon::now();
        $ordersTimeline = [];
        $revenueTimeline = [];

        if ($period === '7D') {
            // Last 7 days
            for ($i = 6; $i >= 0; $i--) {
                $day = (clone $now)->subDays($i);
                $start = (clone $day)->startOfDay();
                $end = (clone $day)->endOfDay();
                $label = $day->format('D'); // Mon, Tue, etc.

                $dayOrders = Order::whereBetween('created_at', [$start, $end])->get();
                $orderCount = $dayOrders->count();
                $revSum = (float) $dayOrders->whereIn('status', ['delivered', 'completed', 'processing', 'confirmed', 'pending'])->sum('total_amount');

                $ordersTimeline[] = ['label' => $label, 'orders' => $orderCount];
                $revenueTimeline[] = ['label' => $label, 'revenue' => round($revSum, 2)];
            }
        } elseif ($period === '30D') {
            // Last 30 days divided into 4 weekly chunks
            for ($i = 3; $i >= 0; $i--) {
                $weekStart = (clone $now)->subDays(($i + 1) * 7)->startOfDay();
                $weekEnd = (clone $now)->subDays($i * 7)->endOfDay();
                $label = 'Week ' . (4 - $i);

                $weekOrders = Order::whereBetween('created_at', [$weekStart, $weekEnd])->get();
                $orderCount = $weekOrders->count();
                $revSum = (float) $weekOrders->whereIn('status', ['delivered', 'completed', 'processing', 'confirmed', 'pending'])->sum('total_amount');

                $ordersTimeline[] = ['label' => $label, 'orders' => $orderCount];
                $revenueTimeline[] = ['label' => $label, 'revenue' => round($revSum, 2)];
            }
        } elseif ($period === '3M') {
            // Last 3 months
            for ($i = 2; $i >= 0; $i--) {
                $month = (clone $now)->subMonths($i);
                $start = (clone $month)->startOfMonth();
                $end = (clone $month)->endOfMonth();
                $label = $month->format('M');

                $mOrders = Order::whereBetween('created_at', [$start, $end])->get();
                $orderCount = $mOrders->count();
                $revSum = (float) $mOrders->whereIn('status', ['delivered', 'completed', 'processing', 'confirmed', 'pending'])->sum('total_amount');

                $ordersTimeline[] = ['label' => $label, 'orders' => $orderCount];
                $revenueTimeline[] = ['label' => $label, 'revenue' => round($revSum, 2)];
            }
        } elseif ($period === '6M') {
            // Last 6 months
            for ($i = 5; $i >= 0; $i--) {
                $month = (clone $now)->subMonths($i);
                $start = (clone $month)->startOfMonth();
                $end = (clone $month)->endOfMonth();
                $label = $month->format('M');

                $mOrders = Order::whereBetween('created_at', [$start, $end])->get();
                $orderCount = $mOrders->count();
                $revSum = (float) $mOrders->whereIn('status', ['delivered', 'completed', 'processing', 'confirmed', 'pending'])->sum('total_amount');

                $ordersTimeline[] = ['label' => $label, 'orders' => $orderCount];
                $revenueTimeline[] = ['label' => $label, 'revenue' => round($revSum, 2)];
            }
        } else {
            // 1 Year (12 months)
            for ($i = 11; $i >= 0; $i--) {
                $month = (clone $now)->subMonths($i);
                $start = (clone $month)->startOfMonth();
                $end = (clone $month)->endOfMonth();
                $label = $month->format('M');

                $mOrders = Order::whereBetween('created_at', [$start, $end])->get();
                $orderCount = $mOrders->count();
                $revSum = (float) $mOrders->whereIn('status', ['delivered', 'completed', 'processing', 'confirmed', 'pending'])->sum('total_amount');

                $ordersTimeline[] = ['label' => $label, 'orders' => $orderCount];
                $revenueTimeline[] = ['label' => $label, 'revenue' => round($revSum, 2)];
            }
        }

        return [
            'orders'  => $ordersTimeline,
            'revenue' => $revenueTimeline,
        ];
    }

    /**
     * Compute actual fulfillment distribution by status.
     */
    private function computeStatusDistribution(): array
    {
        $statusConfig = [
            'pending'    => ['label' => 'Pending', 'color' => '#F59E0B'],
            'processing' => ['label' => 'Processing', 'color' => '#3B82F6'],
            'shipped'    => ['label' => 'Shipped', 'color' => '#8B5CF6'],
            'delivered'  => ['label' => 'Delivered', 'color' => '#10B981'],
            'cancelled'  => ['label' => 'Cancelled', 'color' => '#EF4444'],
        ];

        $counts = Order::select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->pluck('count', 'status')
            ->toArray();

        $total = array_sum($counts);
        $data = [];

        foreach ($statusConfig as $key => $cfg) {
            $cnt = (int) ($counts[$key] ?? $counts[strtolower($key)] ?? 0);
            $pct = $total > 0 ? (int) round(($cnt / $total) * 100) : 0;

            $data[] = [
                'status'     => $key,
                'label'      => $cfg['label'],
                'count'      => $cnt,
                'percentage' => $pct,
                'color'      => $cfg['color'],
            ];
        }

        return [
            'total' => $total,
            'data'  => $data,
        ];
    }

    /**
     * Compute performance bar chart data.
     */
    private function computePerformanceData(string $period): array
    {
        $now = Carbon::now();
        $data = [];

        if ($period === '7D') {
            for ($i = 6; $i >= 0; $i--) {
                $day = (clone $now)->subDays($i);
                $start = (clone $day)->startOfDay();
                $end = (clone $day)->endOfDay();
                $count = Order::whereBetween('created_at', [$start, $end])->count();
                $data[] = ['label' => $day->format('D'), 'value' => $count];
            }
        } elseif ($period === '30D') {
            for ($i = 3; $i >= 0; $i--) {
                $weekStart = (clone $now)->subDays(($i + 1) * 7)->startOfDay();
                $weekEnd = (clone $now)->subDays($i * 7)->endOfDay();
                $count = Order::whereBetween('created_at', [$weekStart, $weekEnd])->count();
                $data[] = ['label' => 'Week ' . (4 - $i), 'value' => $count];
            }
        } else {
            // Quarterly or monthly breakdown
            for ($i = 3; $i >= 0; $i--) {
                $qStart = (clone $now)->subMonths(($i + 1) * 3)->startOfMonth();
                $qEnd = (clone $now)->subMonths($i * 3)->endOfMonth();
                $count = Order::whereBetween('created_at', [$qStart, $qEnd])->count();
                $data[] = ['label' => 'Q' . (4 - $i), 'value' => $count];
            }
        }

        return $data;
    }
}
