<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    /**
     * Display a listing of all orders for Admin with filters.
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = Order::with(['user', 'items', 'address']);

            // Status filter
            if ($request->filled('status') && strtolower($request->status) !== 'all') {
                $query->where('status', strtolower($request->status));
            }

            // Search filter (order_number, user name, email, phone)
            if ($request->filled('search')) {
                $search = trim($request->search);
                $query->where(function ($q) use ($search) {
                    $q->where('order_number', 'like', "%{$search}%")
                      ->orWhere('id', 'like', "%{$search}%")
                      ->orWhereHas('user', function ($uq) use ($search) {
                          $uq->where('full_name', 'like', "%{$search}%")
                             ->orWhere('email', 'like', "%{$search}%")
                             ->orWhere('whatsapp_number', 'like', "%{$search}%")
                             ->orWhere('contact_number', 'like', "%{$search}%");
                      });
                });
            }

            $orders = $query->orderBy('created_at', 'desc')->get();

            return response()->json([
                'success' => true,
                'message' => 'Admin orders retrieved successfully',
                'data'    => $orders,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve admin orders: ' . $e->getMessage(),
                'data'    => []
            ], 500);
        }
    }

    /**
     * Display single order details.
     */
    public function show($id): JsonResponse
    {
        try {
            $order = Order::with(['user', 'items', 'address'])->find($id);

            if (!$order) {
                // Try searching by order_number
                $order = Order::with(['user', 'items', 'address'])->where('order_number', $id)->first();
            }

            if (!$order) {
                return response()->json([
                    'success' => false,
                    'message' => 'Order not found',
                ], 404);
            }

            return response()->json([
                'success' => true,
                'message' => 'Order details retrieved successfully',
                'data'    => $order,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch order details: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update status of an order.
     */
    public function updateStatus(Request $request, $id): JsonResponse
    {
        try {
            $order = Order::find($id) ?? Order::where('order_number', $id)->first();

            if (!$order) {
                return response()->json([
                    'success' => false,
                    'message' => 'Order not found',
                ], 404);
            }

            $validated = $request->validate([
                'status'         => 'nullable|string',
                'orderStatus'    => 'nullable|string',
                'payment_status' => 'nullable|string',
                'paymentStatus'  => 'nullable|string',
                'notes'          => 'nullable|string',
            ]);

            $newStatus = $validated['status'] ?? $validated['orderStatus'] ?? null;
            if ($newStatus) {
                $order->status = strtolower($newStatus);
            }

            $newPaymentStatus = $validated['payment_status'] ?? $validated['paymentStatus'] ?? null;
            if ($newPaymentStatus) {
                $order->payment_status = strtolower($newPaymentStatus);
            }

            $order->save();
            $order->load(['user', 'items', 'address']);

            return response()->json([
                'success' => true,
                'message' => 'Order status updated successfully',
                'data'    => $order,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update order status: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Delete an order.
     */
    public function destroy($id): JsonResponse
    {
        try {
            $order = Order::find($id) ?? Order::where('order_number', $id)->first();

            if (!$order) {
                return response()->json([
                    'success' => false,
                    'message' => 'Order not found',
                ], 404);
            }

            // Delete order items first
            $order->items()->delete();
            $order->delete();

            return response()->json([
                'success' => true,
                'message' => 'Order deleted successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete order: ' . $e->getMessage(),
            ], 500);
        }
    }
}
