<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductResource;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductPackageSize;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class ProductController extends Controller
{
    /**
     * Display a listing of products.
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = Product::with(['category', 'packageSizes']);

            if ($request->has('status') && $request->status !== null && $request->status !== '') {
                $query->where('status', (int) $request->status);
            }

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
     * Store a newly created product in storage.
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'name' => 'required|string|max:255',
            ]);

            return DB::transaction(function () use ($request) {
                // Category resolution
                $categoryId = $request->filled('category_id') ? (int) $request->category_id : null;
                $categoryName = $request->input('category');

                $catObj = null;
                if ($categoryId) {
                    $catObj = Category::find($categoryId);
                }
                if (!$catObj && !empty($categoryName)) {
                    $catObj = Category::where('name', $categoryName)->first();
                }
                if (!$catObj && !empty($categoryName)) {
                    $catObj = Category::create([
                        'name'   => $categoryName,
                        'slug'   => \Illuminate\Support\Str::slug($categoryName),
                        'status' => 1,
                    ]);
                }

                if ($catObj) {
                    $categoryId = $catObj->id;
                    $categoryName = $catObj->name;
                } else {
                    $categoryId = null;
                }

                // Process main product images
                $mainImages = $this->processMainImages($request);

                // Process tags
                $tags = $this->parseArrayInput($request->input('tags'));

                $product = Product::create([
                    'name'           => $request->name,
                    'category_id'    => $categoryId,
                    'category'       => $categoryName,
                    'description'    => $request->description,
                    'actual_price'   => $request->input('actual_price', 0),
                    'discount_type'  => $request->input('discount_type', 0),
                    'discount_value' => $request->input('discount_value', 0),
                    'discount'       => $request->discount,
                    'status'         => $request->input('status', 1),
                    'stock'          => $request->input('stock', 0),
                    'how_to_use'     => $request->how_to_use,
                    'benefits'       => $request->benefits,
                    'ingredients'    => $request->ingredients,
                    'tags'           => $tags,
                    'images'         => $mainImages,
                ]);

                // Process package sizes
                $this->savePackageSizes($product, $request);

                $product->load(['category', 'packageSizes']);

                return response()->json([
                    'status'  => true,
                    'message' => 'Product created successfully',
                    'data'    => new ProductResource($product),
                ], 201);
            });
        } catch (\Illuminate\Validation\ValidationException $ve) {
            return response()->json([
                'status'  => false,
                'message' => 'Validation error',
                'errors'  => $ve->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'status'  => false,
                'message' => 'Failed to create product: ' . $e->getMessage(),
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
            $product = Product::with(['category', 'packageSizes'])->find($id);

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

    /**
     * Update the specified product in storage.
     */
    public function update(Request $request, $id): JsonResponse
    {
        try {
            $product = Product::find($id);

            if (!$product) {
                return response()->json([
                    'status'  => false,
                    'message' => 'Product not found',
                    'data'    => null,
                ], 404);
            }

            return DB::transaction(function () use ($request, $product) {
                // Category resolution
                $categoryId = $request->has('category_id') ? (int) $request->category_id : $product->category_id;
                $categoryName = $request->input('category', $product->category);

                $catObj = null;
                if ($categoryId) {
                    $catObj = Category::find($categoryId);
                }
                if (!$catObj && !empty($categoryName)) {
                    $catObj = Category::where('name', $categoryName)->first();
                }
                if (!$catObj && !empty($categoryName)) {
                    $catObj = Category::create([
                        'name'   => $categoryName,
                        'slug'   => \Illuminate\Support\Str::slug($categoryName),
                        'status' => 1,
                    ]);
                }

                if ($catObj) {
                    $categoryId = $catObj->id;
                    $categoryName = $catObj->name;
                } else {
                    $categoryId = null;
                }

                // Process main product images
                $mainImages = $this->processMainImages($request, $product->images ?? []);

                // Process tags
                $tags = $request->has('tags')
                    ? $this->parseArrayInput($request->input('tags'))
                    : $product->tags;

                $product->update([
                    'name'           => $request->input('name', $product->name),
                    'category_id'    => $categoryId,
                    'category'       => $categoryName,
                    'description'    => $request->input('description', $product->description),
                    'actual_price'   => $request->input('actual_price', $product->actual_price),
                    'discount_type'  => $request->input('discount_type', $product->discount_type),
                    'discount_value' => $request->input('discount_value', $product->discount_value),
                    'discount'       => $request->input('discount', $product->discount),
                    'status'         => $request->input('status', $product->status),
                    'stock'          => $request->input('stock', $product->stock),
                    'how_to_use'     => $request->input('how_to_use', $product->how_to_use),
                    'benefits'       => $request->input('benefits', $product->benefits),
                    'ingredients'    => $request->input('ingredients', $product->ingredients),
                    'tags'           => $tags,
                    'images'         => $mainImages,
                ]);

                // Update package sizes if provided
                if ($request->has('package_sizes')) {
                    $product->packageSizes()->delete();
                    $this->savePackageSizes($product, $request);
                }

                $product->load(['category', 'packageSizes']);

                return response()->json([
                    'status'  => true,
                    'message' => 'Product updated successfully',
                    'data'    => new ProductResource($product),
                ], 200);
            });
        } catch (\Illuminate\Validation\ValidationException $ve) {
            return response()->json([
                'status'  => false,
                'message' => 'Validation error',
                'errors'  => $ve->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'status'  => false,
                'message' => 'Failed to update product: ' . $e->getMessage(),
                'data'    => null,
            ], 500);
        }
    }

    /**
     * Remove the specified product from storage.
     */
    public function destroy($id): JsonResponse
    {
        try {
            $product = Product::find($id);

            if (!$product) {
                return response()->json([
                    'status'  => false,
                    'message' => 'Product not found',
                    'data'    => null,
                ], 404);
            }

            // Soft delete by updating status = 0 or hard delete
            $product->status = 0;
            $product->save();

            return response()->json([
                'status'  => true,
                'message' => 'Product marked as inactive (status = 0)',
                'data'    => new ProductResource($product),
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status'  => false,
                'message' => 'Failed to delete product: ' . $e->getMessage(),
                'data'    => null,
            ], 500);
        }
    }

    /**
     * Process main product images from input and file uploads.
     */
    private function processMainImages(Request $request, array $existingImages = []): array
    {
        $images = [];

        if ($request->has('existing_images')) {
            $existing = $request->input('existing_images');
            if (is_array($existing)) {
                $images = array_merge($images, $existing);
            } elseif (is_string($existing)) {
                $images[] = $existing;
            }
        } elseif ($request->isMethod('put') || $request->isMethod('patch')) {
            $images = $existingImages;
        }

        if ($request->hasFile('images')) {
            $files = $request->file('images');
            if (!is_array($files)) {
                $files = [$files];
            }

            foreach ($files as $file) {
                if ($file instanceof UploadedFile && $file->isValid()) {
                    $path = $file->store('products', 'public');
                    $images[] = asset(Storage::url($path));
                }
            }
        }

        return array_values(array_unique($images));
    }

    /**
     * Save package size variants for a product.
     */
    private function savePackageSizes(Product $product, Request $request): void
    {
        $packageSizes = $request->input('package_sizes');
        if (!is_array($packageSizes)) {
            return;
        }

        foreach ($packageSizes as $index => $pkgData) {
            if (!is_array($pkgData)) {
                continue;
            }

            $variantImages = [];

            // Existing variant images
            if (isset($pkgData['existing_variant_images'])) {
                $ex = $pkgData['existing_variant_images'];
                if (is_array($ex)) {
                    $variantImages = array_merge($variantImages, $ex);
                } elseif (is_string($ex)) {
                    $variantImages[] = $ex;
                }
            }

            // Uploaded variant images inside $pkgData
            if (isset($pkgData['variant_images'])) {
                $vFiles = $pkgData['variant_images'];
                if (!is_array($vFiles)) {
                    $vFiles = [$vFiles];
                }
                foreach ($vFiles as $vFile) {
                    if ($vFile instanceof UploadedFile && $vFile->isValid()) {
                        $path = $vFile->store('products/variants', 'public');
                        $variantImages[] = asset(Storage::url($path));
                    }
                }
            }

            // Uploaded variant images via $request->file("package_sizes.{$index}.variant_images")
            if ($request->hasFile("package_sizes.{$index}.variant_images")) {
                $reqFiles = $request->file("package_sizes.{$index}.variant_images");
                if (!is_array($reqFiles)) {
                    $reqFiles = [$reqFiles];
                }
                foreach ($reqFiles as $reqFile) {
                    if ($reqFile instanceof UploadedFile && $reqFile->isValid()) {
                        $path = $reqFile->store('products/variants', 'public');
                        $variantImages[] = asset(Storage::url($path));
                    }
                }
            }

            ProductPackageSize::create([
                'product_id'     => $product->id,
                'size_key'       => $pkgData['id'] ?? ('pkg-' . uniqid()),
                'size_number'    => (isset($pkgData['size_number']) && $pkgData['size_number'] !== '') ? $pkgData['size_number'] : 0,
                'size_unit'      => !empty($pkgData['size_unit']) ? $pkgData['size_unit'] : 'g',
                'variant_price'  => (isset($pkgData['variant_price']) && $pkgData['variant_price'] !== '') ? $pkgData['variant_price'] : 0,
                'variant_badge'  => (isset($pkgData['variant_badge']) && $pkgData['variant_badge'] !== '') ? $pkgData['variant_badge'] : 0,
                'discount_type'  => (isset($pkgData['discount_type']) && $pkgData['discount_type'] !== '') ? $pkgData['discount_type'] : 1,
                'discount_value' => (isset($pkgData['discount_value']) && $pkgData['discount_value'] !== '') ? $pkgData['discount_value'] : 0,
                'stock'          => (isset($pkgData['stock']) && $pkgData['stock'] !== '') ? $pkgData['stock'] : 0,
                'images'         => array_values(array_unique($variantImages)),
            ]);
        }
    }

    /**
     * Parse tag/array input cleanly.
     */
    private function parseArrayInput($input): array
    {
        if (empty($input)) {
            return [];
        }

        if (is_array($input)) {
            return array_values($input);
        }

        if (is_string($input)) {
            $decoded = json_decode($input, true);
            if (is_array($decoded)) {
                return $decoded;
            }
            return array_map('trim', explode(',', $input));
        }

        return [];
    }
}
