<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductResource;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductPackageSize;
use App\Services\ProductImageService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ProductController extends Controller
{
    protected ProductImageService $imageService;

    public function __construct(ProductImageService $imageService)
    {
        $this->imageService = $imageService;
    }

    /**
     * Display a listing of products with optimized eager loading.
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = Product::with([
                'category:id,name,slug',
                'packageSizes:id,product_id,size_key,size_number,size_unit,variant_price,variant_badge,discount_type,discount_value,stock,images'
            ]);

            if ($request->has('status') && $request->status !== null && $request->status !== '') {
                $query->where('status', (int) $request->status);
            }

            if ($request->filled('category_id')) {
                $query->where('category_id', (int) $request->category_id);
            }

            if ($request->filled('search')) {
                $search = trim($request->search);
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('category', 'like', "%{$search}%");
                });
            }

            $products = $query->orderBy('id', 'desc')->get();

            return response()->json([
                'status'  => true,
                'message' => 'Products retrieved successfully',
                'data'    => ProductResource::collection($products),
            ], 200);
        } catch (\Throwable $e) {
            return response()->json([
                'status'  => false,
                'message' => 'Failed to fetch products: ' . $e->getMessage(),
                'data'    => null,
            ], 500);
        }
    }

    /**
     * Store a newly created product in storage with atomic transaction and rollback guard.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
        ]);

        try {
            $product = DB::transaction(function () use ($request) {
                // 1. Resolve Category in 1 fast query
                [$categoryId, $categoryName] = $this->resolveCategory($request);

                // 2. Process & Compress Main Images to WebP
                $mainImages = $this->processMainImages($request);

                // 3. Process Tags Array
                $tags = $this->parseArrayInput($request->input('tags'));

                // 4. Create Product Record
                $product = Product::create([
                    'name'           => $request->name,
                    'slug'           => Str::slug($request->name),
                    'category_id'    => $categoryId,
                    'category'       => $categoryName,
                    'description'    => $request->input('description'),
                    'actual_price'   => (float) $request->input('actual_price', 0),
                    'discount_type'  => (int) $request->input('discount_type', 0),
                    'discount_value' => (float) $request->input('discount_value', 0),
                    'discount'       => $request->input('discount'),
                    'status'         => (int) $request->input('status', 1),
                    'stock'          => (int) $request->input('stock', 0),
                    'how_to_use'     => $request->input('how_to_use'),
                    'benefits'       => $request->input('benefits'),
                    'ingredients'    => $request->input('ingredients'),
                    'tags'           => $tags,
                    'images'         => $mainImages,
                ]);

                // 5. Bulk Insert Package Size Variants
                $this->savePackageSizesBulk($product->id, $request);

                return $product;
            });

            // Eager load relationships after transaction completes
            $product->load([
                'category:id,name,slug',
                'packageSizes:id,product_id,size_key,size_number,size_unit,variant_price,variant_badge,discount_type,discount_value,stock,images'
            ]);

            return response()->json([
                'status'  => true,
                'message' => 'Product created successfully',
                'data'    => new ProductResource($product),
            ], 201);
        } catch (\Throwable $e) {
            // Rollback all files written to disk if anything failed
            $this->imageService->rollback();

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
            $product = Product::with([
                'category:id,name,slug',
                'packageSizes:id,product_id,size_key,size_number,size_unit,variant_price,variant_badge,discount_type,discount_value,stock,images'
            ])->find($id);

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
        } catch (\Throwable $e) {
            return response()->json([
                'status'  => false,
                'message' => 'Failed to fetch product: ' . $e->getMessage(),
                'data'    => null,
            ], 500);
        }
    }

    /**
     * Update the specified product in storage with diff-based image cleanup and bulk operations.
     */
    public function update(Request $request, $id): JsonResponse
    {
        $product = Product::find($id);

        if (!$product) {
            return response()->json([
                'status'  => false,
                'message' => 'Product not found',
                'data'    => null,
            ], 404);
        }

        $oldImages = is_array($product->images) ? $product->images : [];
        $filesToDeleteAfterCommit = [];

        try {
            DB::transaction(function () use ($request, $product, $oldImages, &$filesToDeleteAfterCommit) {
                // 1. Resolve Category
                [$categoryId, $categoryName] = $this->resolveCategory($request, $product);

                // 2. Process & Compress Images
                $mainImages = $this->processMainImages($request, $oldImages);

                // Determine deleted old images for cleanup
                $filesToDeleteAfterCommit = array_diff($oldImages, $mainImages);

                // 3. Process Tags
                $tags = $request->has('tags')
                    ? $this->parseArrayInput($request->input('tags'))
                    : $product->tags;

                // 4. Update Product Record
                $product->update([
                    'name'           => $request->input('name', $product->name),
                    'slug'           => $request->filled('name') ? Str::slug($request->name) : $product->slug,
                    'category_id'    => $categoryId,
                    'category'       => $categoryName,
                    'description'    => $request->input('description', $product->description),
                    'actual_price'   => (float) $request->input('actual_price', $product->actual_price),
                    'discount_type'  => (int) $request->input('discount_type', $product->discount_type),
                    'discount_value' => (float) $request->input('discount_value', $product->discount_value),
                    'discount'       => $request->input('discount', $product->discount),
                    'status'         => (int) $request->input('status', $product->status),
                    'stock'          => (int) $request->input('stock', $product->stock),
                    'how_to_use'     => $request->input('how_to_use', $product->how_to_use),
                    'benefits'       => $request->input('benefits', $product->benefits),
                    'ingredients'    => $request->input('ingredients', $product->ingredients),
                    'tags'           => $tags,
                    'images'         => $mainImages,
                ]);

                // 5. Update package sizes if present in payload
                if ($request->has('package_sizes')) {
                    $product->packageSizes()->delete();
                    $this->savePackageSizesBulk($product->id, $request);
                }
            });

            // Clean up removed old images after successful commit
            if (!empty($filesToDeleteAfterCommit)) {
                $this->imageService->deleteFiles($filesToDeleteAfterCommit);
            }

            // Eager load fresh relations
            $product->load([
                'category:id,name,slug',
                'packageSizes:id,product_id,size_key,size_number,size_unit,variant_price,variant_badge,discount_type,discount_value,stock,images'
            ]);

            return response()->json([
                'status'  => true,
                'message' => 'Product updated successfully',
                'data'    => new ProductResource($product),
            ], 200);
        } catch (\Throwable $e) {
            $this->imageService->rollback();

            return response()->json([
                'status'  => false,
                'message' => 'Failed to update product: ' . $e->getMessage(),
                'data'    => null,
            ], 500);
        }
    }

    /**
     * Mark product status as inactive or delete.
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

            $product->status = 0;
            $product->save();

            return response()->json([
                'status'  => true,
                'message' => 'Product marked as inactive (status = 0)',
                'data'    => new ProductResource($product),
            ], 200);
        } catch (\Throwable $e) {
            return response()->json([
                'status'  => false,
                'message' => 'Failed to delete product: ' . $e->getMessage(),
                'data'    => null,
            ], 500);
        }
    }

    /**
     * Efficient Category Resolution: Returns [$categoryId, $categoryName].
     */
    private function resolveCategory(Request $request, ?Product $existingProduct = null): array
    {
        $categoryId = $request->filled('category_id') ? (int) $request->category_id : ($existingProduct ? $existingProduct->category_id : null);
        $categoryName = $request->input('category', $existingProduct ? $existingProduct->category : null);

        if ($categoryId && empty($categoryName)) {
            $cat = Category::find($categoryId);
            if ($cat) $categoryName = $cat->name;
        } elseif (!$categoryId && !empty($categoryName)) {
            $cat = Category::firstOrCreate(
                ['name' => $categoryName],
                ['slug' => Str::slug($categoryName), 'status' => 1]
            );
            $categoryId = $cat->id;
            $categoryName = $cat->name;
        }

        return [$categoryId, $categoryName];
    }

    /**
     * Process main product images with high-performance WebP compression.
     */
    private function processMainImages(Request $request, array $existingImages = []): array
    {
        $images = [];

        // Retain existing image URLs
        if ($request->has('existing_images')) {
            $existing = $request->input('existing_images');
            if (is_array($existing)) {
                $images = array_merge($images, $existing);
            } elseif (is_string($existing)) {
                $images[] = $existing;
            }
        } elseif (($request->isMethod('put') || $request->isMethod('patch') || $request->input('_method') === 'PUT') && !$request->hasFile('images')) {
            $images = $existingImages;
        }

        // Process newly uploaded binary files
        if ($request->hasFile('images')) {
            $files = $request->file('images');
            if (!is_array($files)) {
                $files = [$files];
            }

            foreach ($files as $file) {
                if ($file instanceof UploadedFile && $file->isValid()) {
                    $images[] = $this->imageService->optimizeAndStore($file, 'products');
                }
            }
        }

        return array_values(array_unique(array_filter($images)));
    }

    /**
     * Bulk insert package size variants in a single optimized query.
     */
    private function savePackageSizesBulk(int $productId, Request $request): void
    {
        $packageSizes = $request->input('package_sizes');
        if (!is_array($packageSizes) || empty($packageSizes)) {
            return;
        }

        $now = now();
        $records = [];

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

            // Uploaded variant image files inside pkgData
            if (isset($pkgData['variant_images'])) {
                $vFiles = $pkgData['variant_images'];
                if (!is_array($vFiles)) $vFiles = [$vFiles];

                foreach ($vFiles as $vFile) {
                    if ($vFile instanceof UploadedFile && $vFile->isValid()) {
                        $variantImages[] = $this->imageService->optimizeAndStore($vFile, 'products/variants');
                    }
                }
            }

            // Uploaded variant image files via dot-notation
            if ($request->hasFile("package_sizes.{$index}.variant_images")) {
                $reqFiles = $request->file("package_sizes.{$index}.variant_images");
                if (!is_array($reqFiles)) $reqFiles = [$reqFiles];

                foreach ($reqFiles as $reqFile) {
                    if ($reqFile instanceof UploadedFile && $reqFile->isValid()) {
                        $variantImages[] = $this->imageService->optimizeAndStore($reqFile, 'products/variants');
                    }
                }
            }

            $records[] = [
                'product_id'     => $productId,
                'size_key'       => $pkgData['id'] ?? ('pkg-' . Str::random(8)),
                'size_number'    => (float) ($pkgData['size_number'] ?? 0),
                'size_unit'      => !empty($pkgData['size_unit']) ? $pkgData['size_unit'] : 'g',
                'variant_price'  => (float) ($pkgData['variant_price'] ?? 0),
                'variant_badge'  => (int) ($pkgData['variant_badge'] ?? 0),
                'discount_type'  => (int) ($pkgData['discount_type'] ?? 1),
                'discount_value' => (float) ($pkgData['discount_value'] ?? 0),
                'stock'          => (int) ($pkgData['stock'] ?? 0),
                'images'         => json_encode(array_values(array_unique(array_filter($variantImages)))),
                'created_at'     => $now,
                'updated_at'     => $now,
            ];
        }

        if (!empty($records)) {
            ProductPackageSize::insert($records);
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
            return array_values(array_filter($input));
        }

        if (is_string($input)) {
            $decoded = json_decode($input, true);
            if (is_array($decoded)) {
                return array_values(array_filter($decoded));
            }
            return array_values(array_filter(array_map('trim', explode(',', $input))));
        }

        return [];
    }
}
