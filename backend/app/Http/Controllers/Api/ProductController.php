<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    /**
     * Display a listing of active products.
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = Product::with(['category', 'packageSizes'])->where('status', 1);

            if ($request->filled('category_id')) {
                $query->where('category_id', (int) $request->category_id);
            }

            if ($request->filled('search')) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('description', 'like', "%{$search}%")
                      ->orWhere('category', 'like', "%{$search}%");
                });
            }

            $products = $query->orderBy('id', 'desc')->get();

            return response()->json([
                'status'  => true,
                'message' => 'Products retrieved successfully',
                'data'    => ProductResource::collection($products),
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status'  => false,
                'message' => 'Failed to fetch products: ' . $e->getMessage(),
                'data'    => null,
            ], 500);
        }
    }

    /**
     * Display the specified product.
     */
    public function show($id): JsonResponse
    {
        try {
            $product = Product::with(['category', 'packageSizes'])
                ->where('status', 1)
                ->where(function ($q) use ($id) {
                    if (is_numeric($id)) {
                        $q->where('id', $id)->orWhere('slug', $id);
                    } else {
                        $q->where('slug', $id);
                    }
                })
                ->first();

            if (!$product) {
                return response()->json([
                    'status'  => false,
                    'message' => 'Product not found',
                    'data'    => null,
                ], 404);
            }

            return response()->json([
                'status'  => true,
                'message' => 'Product retrieved successfully',
                'data'    => new ProductResource($product),
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status'  => false,
                'message' => 'Failed to fetch product: ' . $e->getMessage(),
                'data'    => null,
            ], 500);
        }
    }
}
