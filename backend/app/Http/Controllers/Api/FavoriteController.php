<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Favorite;
use App\Models\Product;
use App\Services\CartFavoriteService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class FavoriteController extends Controller
{
    protected CartFavoriteService $cartService;

    public function __construct(CartFavoriteService $cartService)
    {
        $this->cartService = $cartService;
    }

    /**
     * GET /api/favorites
     * Retrieve all favorites for current user or guest.
     */
    public function index(Request $request): JsonResponse
    {
        $actor = $this->cartService->resolveActor($request);
        $favoritesData = $this->cartService->formatFavoritesResponse($actor);

        return response()->json([
            'status'  => true,
            'message' => 'Favorites retrieved successfully',
            'data'    => $favoritesData,
        ]);
    }

    /**
     * POST /api/favorites
     * Add a product to favorites.
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'product_id' => 'required|exists:products,id',
            ]);

            $actor = $this->cartService->resolveActor($request);
            $productId = (int) $validated['product_id'];

            $favorite = $this->cartService->getFavoritesQuery($actor)
                ->where('product_id', $productId)
                ->first();

            if (!$favorite) {
                Favorite::create([
                    'user_id'     => $actor['user_id'],
                    'guest_token' => $actor['guest_token'],
                    'product_id'  => $productId,
                ]);
            }

            $count = $this->cartService->getFavoritesQuery($actor)->count();

            return response()->json([
                'status'  => true,
                'message' => 'Product added to favorites',
                'data'    => [
                    'product_id'  => $productId,
                    'is_favorite' => true,
                    'count'       => $count,
                    'actor'       => $actor,
                ],
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
                'message' => 'Failed to add favorite: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * DELETE /api/favorites/{productId}
     * Remove product from favorites.
     */
    public function destroy(Request $request, $productId): JsonResponse
    {
        try {
            $actor = $this->cartService->resolveActor($request);

            $this->cartService->getFavoritesQuery($actor)
                ->where('product_id', $productId)
                ->delete();

            $count = $this->cartService->getFavoritesQuery($actor)->count();

            return response()->json([
                'status'  => true,
                'message' => 'Product removed from favorites',
                'data'    => [
                    'product_id'  => (int) $productId,
                    'is_favorite' => false,
                    'count'       => $count,
                    'actor'       => $actor,
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status'  => false,
                'message' => 'Failed to remove favorite: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * POST /api/favorites/toggle
     * Toggle product favorite status (add if missing, delete if present).
     */
    public function toggle(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'product_id' => 'required|exists:products,id',
            ]);

            $actor = $this->cartService->resolveActor($request);
            $productId = (int) $validated['product_id'];

            $favorite = $this->cartService->getFavoritesQuery($actor)
                ->where('product_id', $productId)
                ->first();

            if ($favorite) {
                $favorite->delete();
                $isFavorite = false;
                $message = 'Removed from favorites';
            } else {
                Favorite::create([
                    'user_id'     => $actor['user_id'],
                    'guest_token' => $actor['guest_token'],
                    'product_id'  => $productId,
                ]);
                $isFavorite = true;
                $message = 'Added to favorites';
            }

            $count = $this->cartService->getFavoritesQuery($actor)->count();

            return response()->json([
                'status'  => true,
                'message' => $message,
                'data'    => [
                    'product_id'  => $productId,
                    'is_favorite' => $isFavorite,
                    'count'       => $count,
                    'actor'       => [
                        'is_guest'    => $actor['is_guest'],
                        'guest_token' => $actor['guest_token'],
                        'user_id'     => $actor['user_id'],
                    ],
                ],
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
                'message' => 'Failed to toggle favorite: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * GET /api/favorites/count
     * Quick count of favorites for badge in header.
     */
    public function count(Request $request): JsonResponse
    {
        $actor = $this->cartService->resolveActor($request);
        $count = (int) $this->cartService->getFavoritesQuery($actor)->count();

        // Also return list of favorited product IDs for fast O(1) checking on frontend
        $favoriteProductIds = $this->cartService->getFavoritesQuery($actor)
            ->pluck('product_id')
            ->map(fn($id) => (int) $id)
            ->toArray();

        return response()->json([
            'status' => true,
            'data'   => [
                'count'                => $count,
                'favorite_product_ids' => $favoriteProductIds,
                'guest_token'          => $actor['guest_token'],
                'is_guest'             => $actor['is_guest'],
            ],
        ]);
    }

    /**
     * POST /api/favorites/merge
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
                'message' => 'Authentication required to merge favorites.',
            ], 401);
        }

        $result = $this->cartService->mergeGuestToUser($user->id, $request->input('guest_token'));
        $actor = $this->cartService->resolveActor($request);
        $favoritesData = $this->cartService->formatFavoritesResponse($actor);

        return response()->json([
            'status'  => true,
            'message' => 'Guest favorites merged successfully',
            'merge'   => $result,
            'data'    => $favoritesData,
        ]);
    }
}
