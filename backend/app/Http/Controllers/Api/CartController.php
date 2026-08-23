<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\Product;
use App\Services\CartFavoriteService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class CartController extends Controller
{
    protected CartFavoriteService $cartService;

    public function __construct(CartFavoriteService $cartService)
    {
        $this->cartService = $cartService;
    }

    /**
     * GET /api/cart
     * Retrieve all cart items with full summary for the current user or guest.
     */
    public function index(Request $request): JsonResponse
    {
        $actor = $this->cartService->resolveActor($request);
        $cartData = $this->cartService->formatCartResponse($actor);

        return response()->json([
            'status'  => true,
            'message' => 'Cart retrieved successfully',
            'data'    => $cartData,
        ]);
    }

    /**
     * POST /api/cart
     * Add product to cart (or increment quantity if already present).
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'product_id'      => 'required|exists:products,id',
                'quantity'        => 'nullable|integer|min:1|max:999',
                'package_size_id' => 'nullable|exists:product_package_sizes,id',
            ]);

            $actor = $this->cartService->resolveActor($request);
            $productId = (int) $validated['product_id'];
            $quantity = (int) ($validated['quantity'] ?? 1);
            $packageSizeId = !empty($validated['package_size_id']) ? (int) $validated['package_size_id'] : null;

            // Check if item already exists in this actor's cart
            $existing = $this->cartService->getCartQuery($actor)
                ->where('product_id', $productId)
                ->where('package_size_id', $packageSizeId)
                ->first();

            if ($existing) {
                $existing->quantity += $quantity;
                $existing->save();
                $cartItem = $existing;
            } else {
                $cartItem = Cart::create([
                    'user_id'         => $actor['user_id'],
                    'guest_token'     => $actor['guest_token'],
                    'product_id'      => $productId,
                    'package_size_id' => $packageSizeId,
                    'quantity'        => $quantity,
                ]);
            }

            $cartData = $this->cartService->formatCartResponse($actor);

            return response()->json([
                'status'  => true,
                'message' => 'Product added to cart successfully',
                'data'    => $cartData,
            ], 201);
        } catch (ValidationException $e) {
            return response()->json([
                'status'  => false,
                'message' => 'Validation failed',
                'errors'  => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'status'  => false,
                'message' => 'Failed to add product to cart: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * PUT /api/cart/{id}
     * Update item quantity in cart. Can pass cart item id OR product_id.
     */
    public function update(Request $request, $id): JsonResponse
    {
        try {
            $validated = $request->validate([
                'quantity'        => 'required|integer|min:0|max:999',
                'package_size_id' => 'nullable|integer',
            ]);

            $actor = $this->cartService->resolveActor($request);
            $quantity = (int) $validated['quantity'];

            // Find item by cart row ID or product_id
            $query = $this->cartService->getCartQuery($actor);
            $cartItem = (clone $query)->where('id', $id)->first();

            if (!$cartItem) {
                $cartQuery = (clone $query)->where('product_id', $id);
                if (isset($validated['package_size_id'])) {
                    $cartQuery->where('package_size_id', $validated['package_size_id']);
                }
                $cartItem = $cartQuery->first();
            }

            if (!$cartItem) {
                return response()->json([
                    'status'  => false,
                    'message' => 'Cart item not found',
                ], 404);
            }

            if ($quantity <= 0) {
                $cartItem->delete();
                $message = 'Item removed from cart';
            } else {
                $cartItem->quantity = $quantity;
                $cartItem->save();
                $message = 'Cart quantity updated';
            }

            $cartData = $this->cartService->formatCartResponse($actor);

            return response()->json([
                'status'  => true,
                'message' => $message,
                'data'    => $cartData,
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'status'  => false,
                'message' => 'Validation failed',
                'errors'  => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'status'  => false,
                'message' => 'Failed to update cart: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * DELETE /api/cart/{id}
     * Remove specific item from cart.
     */
    public function destroy(Request $request, $id): JsonResponse
    {
        try {
            $actor = $this->cartService->resolveActor($request);
            $query = $this->cartService->getCartQuery($actor);

            $cartItem = (clone $query)->where('id', $id)->first();

            if (!$cartItem) {
                $cartItem = (clone $query)->where('product_id', $id)->first();
            }

            if (!$cartItem) {
                return response()->json([
                    'status'  => false,
                    'message' => 'Cart item not found',
                ], 404);
            }

            $cartItem->delete();
            $cartData = $this->cartService->formatCartResponse($actor);

            return response()->json([
                'status'  => true,
                'message' => 'Item removed from cart',
                'data'    => $cartData,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status'  => false,
                'message' => 'Failed to remove item: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * DELETE /api/cart
     * Clear all items from the current user or guest cart.
     */
    public function clear(Request $request): JsonResponse
    {
        try {
            $actor = $this->cartService->resolveActor($request);
            $this->cartService->getCartQuery($actor)->delete();

            $cartData = $this->cartService->formatCartResponse($actor);

            return response()->json([
                'status'  => true,
                'message' => 'Cart cleared successfully',
                'data'    => $cartData,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status'  => false,
                'message' => 'Failed to clear cart: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * GET /api/cart/count
     * Quick badge count for cart header.
     */
    public function count(Request $request): JsonResponse
    {
        $actor = $this->cartService->resolveActor($request);
        $totalQuantity = (int) $this->cartService->getCartQuery($actor)->sum('quantity');
        $itemCount = (int) $this->cartService->getCartQuery($actor)->count();

        return response()->json([
            'status' => true,
            'data'   => [
                'count'          => $totalQuantity,
                'total_items'    => $itemCount,
                'total_quantity' => $totalQuantity,
                'guest_token'    => $actor['guest_token'],
                'is_guest'       => $actor['is_guest'],
            ],
        ]);
    }

    /**
     * POST /api/cart/merge
     * Explicit merge endpoint if requested by frontend.
     */
    public function merge(Request $request): JsonResponse
    {
        $request->validate([
            'guest_token' => 'required|string',
        ]);

        $user = $request->user() ?: auth('sanctum')->user();
        if (!$user) {
            return response()->json([
                'status'  => false,
                'message' => 'Authentication required to merge guest cart.',
            ], 401);
        }

        $result = $this->cartService->mergeGuestToUser($user->id, $request->input('guest_token'));
        $actor = $this->cartService->resolveActor($request);
        $cartData = $this->cartService->formatCartResponse($actor);

        return response()->json([
            'status'  => true,
            'message' => 'Guest cart merged successfully',
            'merge'   => $result,
            'data'    => $cartData,
        ]);
    }
}
