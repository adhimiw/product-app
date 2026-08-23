<?php

namespace App\Services;

use App\Models\Cart;
use App\Models\Favorite;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CartFavoriteService
{
    /**
     * Resolves the current actor (logged-in user or guest with a guest_token).
     */
    public function resolveActor(Request $request): array
    {
        $user = $request->user() ?: auth('sanctum')->user();

        if ($user) {
            return [
                'user_id'     => $user->id,
                'guest_token' => null,
                'is_guest'    => false,
                'user'        => $user,
            ];
        }

        $guestToken = $request->header('X-Guest-Token')
            ?: $request->header('Guest-Token')
            ?: $request->input('guest_token')
            ?: $request->query('guest_token');

        if (empty($guestToken) || !is_string($guestToken) || strlen(trim($guestToken)) < 6) {
            $guestToken = (string) Str::uuid();
        } else {
            $guestToken = trim($guestToken);
        }

        return [
            'user_id'     => null,
            'guest_token' => $guestToken,
            'is_guest'    => true,
            'user'        => null,
        ];
    }

    /**
     * Get base query for Cart scoped to actor.
     */
    public function getCartQuery(array $actor)
    {
        if (!empty($actor['user_id'])) {
            return Cart::where('user_id', $actor['user_id']);
        }

        return Cart::where('guest_token', $actor['guest_token']);
    }

    /**
     * Get base query for Favorite scoped to actor.
     */
    public function getFavoritesQuery(array $actor)
    {
        if (!empty($actor['user_id'])) {
            return Favorite::where('user_id', $actor['user_id']);
        }

        return Favorite::where('guest_token', $actor['guest_token']);
    }

    /**
     * Formats uniform Cart response with enriched product & pricing data.
     */
    public function formatCartResponse(array $actor): array
    {
        $items = $this->getCartQuery($actor)
            ->with(['product.category', 'packageSize'])
            ->orderBy('created_at', 'desc')
            ->get();

        $formattedItems = [];
        $subtotal = 0;
        $totalQuantity = 0;

        foreach ($items as $item) {
            $product = $item->product;
            if (!$product) {
                continue;
            }

            $packageSize = $item->packageSize;
            
            // Determine unit price
            if ($packageSize && !empty($packageSize->variant_price)) {
                $unitPrice = (float) $packageSize->variant_price;
                $regularPrice = (float) ($product->actual_price ?: $unitPrice);
                $sizeLabel = $packageSize->size_number . $packageSize->size_unit;
            } else {
                $unitPrice = (float) ($product->actual_price ?: 0);
                $regularPrice = (float) ($product->regular_price ?: $unitPrice);
                $sizeLabel = 'Standard';
            }

            $itemSubtotal = $unitPrice * $item->quantity;
            $subtotal += $itemSubtotal;
            $totalQuantity += $item->quantity;

            // Product image
            $images = is_array($product->images) ? $product->images : (json_decode($product->images, true) ?: []);
            $primaryImage = !empty($images[0]) ? $images[0] : '/assets/images/categories/organic-food-ingredients.png';

            $formattedItems[] = [
                'id'              => $item->id,
                'product_id'      => $product->id,
                'package_size_id' => $item->package_size_id,
                'quantity'        => $item->quantity,
                'unit_price'      => $unitPrice,
                'regular_price'   => $regularPrice,
                'subtotal'        => round($itemSubtotal, 2),
                'size_label'      => $sizeLabel,
                'product'         => [
                    'id'           => $product->id,
                    'name'         => $product->name,
                    'slug'         => $product->slug,
                    'category'     => ($product->category instanceof \App\Models\Category ? $product->category->name : ($product->category ?: 'General')),
                    'image'        => $primaryImage,
                    'actual_price' => $unitPrice,
                    'stock'        => $product->stock,
                    'discount'     => $product->discount,
                ],
                'created_at'      => $item->created_at?->toISOString(),
                'updated_at'      => $item->updated_at?->toISOString(),
            ];
        }

        $deliveryFee = 0.00;
        $tax = 0.00;
        $grandTotal = $subtotal + $deliveryFee + $tax;

        return [
            'items'          => $formattedItems,
            'summary'        => [
                'total_items'    => count($formattedItems),
                'total_quantity' => $totalQuantity,
                'subtotal'       => round($subtotal, 2),
                'delivery_fee'   => $deliveryFee,
                'tax'            => $tax,
                'grand_total'    => round($grandTotal, 2),
            ],
            'actor'          => [
                'is_guest'    => $actor['is_guest'],
                'guest_token' => $actor['guest_token'],
                'user_id'     => $actor['user_id'],
            ],
        ];
    }

    /**
     * Formats uniform Favorites list response.
     */
    public function formatFavoritesResponse(array $actor): array
    {
        $favorites = $this->getFavoritesQuery($actor)
            ->with(['product.category', 'product.packageSizes'])
            ->orderBy('created_at', 'desc')
            ->get();

        $formatted = [];

        foreach ($favorites as $fav) {
            $product = $fav->product;
            if (!$product) {
                continue;
            }

            $images = is_array($product->images) ? $product->images : (json_decode($product->images, true) ?: []);
            $primaryImage = !empty($images[0]) ? $images[0] : '/assets/images/categories/organic-food-ingredients.png';

            $formatted[] = [
                'id'         => $fav->id,
                'product_id' => $product->id,
                'product'    => [
                    'id'            => $product->id,
                    'name'          => $product->name,
                    'slug'          => $product->slug,
                    'category'      => ($product->category instanceof \App\Models\Category ? $product->category->name : ($product->category ?: 'General')),
                    'actual_price'  => (float) ($product->actual_price ?: 0),
                    'regular_price' => (float) ($product->regular_price ?: 0),
                    'discount'      => $product->discount,
                    'image'         => $primaryImage,
                    'stock'         => $product->stock,
                    'is_favorite'   => true,
                ],
                'created_at' => $fav->created_at?->toISOString(),
            ];
        }

        return [
            'favorites'   => $formatted,
            'count'       => count($formatted),
            'actor'       => [
                'is_guest'    => $actor['is_guest'],
                'guest_token' => $actor['guest_token'],
                'user_id'     => $actor['user_id'],
            ],
        ];
    }

    /**
     * Merges a guest's cart & favorites into an authenticated user's records.
     * Resolves duplicates safely and cleans up guest tokens.
     */
    public function mergeGuestToUser(int $userId, ?string $guestToken): array
    {
        if (empty($guestToken)) {
            return [
                'merged_cart_count'     => 0,
                'merged_favorite_count' => 0,
            ];
        }

        $mergedCartCount = 0;
        $mergedFavCount = 0;

        // 1. Merge Guest Cart Items
        $guestCartItems = Cart::where('guest_token', $guestToken)->get();

        foreach ($guestCartItems as $guestItem) {
            $existingUserItem = Cart::where('user_id', $userId)
                ->where('product_id', $guestItem->product_id)
                ->where('package_size_id', $guestItem->package_size_id)
                ->first();

            if ($existingUserItem) {
                // Item exists in user cart: add guest quantity and delete guest item
                $existingUserItem->quantity += $guestItem->quantity;
                $existingUserItem->save();
                $guestItem->delete();
            } else {
                // Transfer item to user
                $guestItem->user_id = $userId;
                $guestItem->guest_token = null;
                $guestItem->save();
            }
            $mergedCartCount++;
        }

        // 2. Merge Guest Favorites
        $guestFavorites = Favorite::where('guest_token', $guestToken)->get();

        foreach ($guestFavorites as $guestFav) {
            $existingUserFav = Favorite::where('user_id', $userId)
                ->where('product_id', $guestFav->product_id)
                ->first();

            if ($existingUserFav) {
                // Already favorited by user: remove guest duplicate
                $guestFav->delete();
            } else {
                // Transfer favorite to user
                $guestFav->user_id = $userId;
                $guestFav->guest_token = null;
                $guestFav->save();
                $mergedFavCount++;
            }
        }

        // Cleanup any leftover guest rows with this token
        Cart::where('guest_token', $guestToken)->delete();
        Favorite::where('guest_token', $guestToken)->delete();

        return [
            'merged_cart_count'     => $mergedCartCount,
            'merged_favorite_count' => $mergedFavCount,
        ];
    }
}
