<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\CategoryResource;
use App\Models\Category;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class CategoryController extends Controller
{
    /**
     * Display a listing of categories.
     * 
     * Status filter: 1 = Active, 0 = Deleted/Inactive
     */
public function index(Request $request): JsonResponse
{
    try {
        $query = Category::query();

        if ($request->has('status') && $request->status !== null && $request->status !== '') {
            $query->where('status', (int) $request->status);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        $categories = $query->orderBy('created_at', 'asc')->get(); // changed

        return response()->json([
            'status'  => true,
            'message' => 'Categories retrieved successfully',
            'data'    => CategoryResource::collection($categories),
        ], 200);
    } catch (\Exception $e) {
        return response()->json([
            'status'  => false,
            'message' => 'Failed to fetch categories: ' . $e->getMessage(),
            'data'    => null,
        ], 500);
    }
}

    /**
     * Store a newly created category in storage.
     * 
     * Handles file uploads for icon and image into storage/app/public/categories.
     * Status: 1 = Active, 0 = Deleted.
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'name'        => 'required|string|max:255',
                'slug'        => 'nullable|string|max:255|unique:categories,slug',
                'description' => 'nullable|string',
                'icon'        => 'nullable|file|mimes:jpeg,jpg,png,gif,svg,webp|max:2048',
                'image'       => 'nullable|file|mimes:jpeg,jpg,png,gif,svg,webp|max:4096',
                'status'      => 'nullable|in:0,1',
            ]);

            // Auto-generate slug if not provided
            $slug = !empty($validated['slug']) 
                ? Str::slug($validated['slug']) 
                : Str::slug($validated['name']);

            // Ensure slug uniqueness if generated automatically
            $originalSlug = $slug;
            $count = 1;
            while (Category::where('slug', $slug)->exists()) {
                $slug = "{$originalSlug}-{$count}";
                $count++;
            }

            $iconPath = null;
            if ($request->hasFile('icon')) {
                $iconPath = $request->file('icon')->store('categories/icons', 'public');
            }

            $imagePath = null;
            if ($request->hasFile('image')) {
                $imagePath = $request->file('image')->store('categories/images', 'public');
            }

            $category = Category::create([
                'name'        => $validated['name'],
                'slug'        => $slug,
                'description' => $validated['description'] ?? null,
                'icon'        => $iconPath,
                'image'       => $imagePath,
                'status'      => isset($validated['status']) ? (int) $validated['status'] : 1, // 1 = Active, 0 = Deleted
            ]);

            return response()->json([
                'status'  => true,
                'message' => 'Category created successfully',
                'data'    => new CategoryResource($category),
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
                'message' => 'Failed to create category: ' . $e->getMessage(),
                'data'    => null,
            ], 500);
        }
    }

    /**
     * Display the specified category.
     */
    public function show(int $id): JsonResponse
    {
        try {
            $category = Category::find($id);

            if (!$category) {
                return response()->json([
                    'status'  => false,
                    'message' => 'Category not found',
                    'data'    => null,
                ], 404);
            }

            return response()->json([
                'status'  => true,
                'message' => 'Category retrieved successfully',
                'data'    => new CategoryResource($category),
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status'  => false,
                'message' => 'Error retrieving category: ' . $e->getMessage(),
                'data'    => null,
            ], 500);
        }
    }

    /**
     * Update the specified category.
     * 
     * Note: When submitting multipart/form-data via POST, pass _method=PUT to support file uploads.
     */
    public function update(Request $request, int $id): JsonResponse
    {
        try {
            $category = Category::find($id);

            if (!$category) {
                return response()->json([
                    'status'  => false,
                    'message' => 'Category not found',
                    'data'    => null,
                ], 404);
            }

            $validated = $request->validate([
                'name'        => 'sometimes|required|string|max:255',
                'slug'        => 'nullable|string|max:255|unique:categories,slug,' . $id,
                'description' => 'nullable|string',
                'icon'        => 'nullable|file|mimes:jpeg,jpg,png,gif,svg,webp|max:2048',
                'image'       => 'nullable|file|mimes:jpeg,jpg,png,gif,svg,webp|max:4096',
                'status'      => 'nullable|in:0,1',
            ]);

            if (isset($validated['name'])) {
                $category->name = $validated['name'];
            }

            if (array_key_exists('slug', $validated) && !empty($validated['slug'])) {
                $category->slug = Str::slug($validated['slug']);
            } elseif (isset($validated['name']) && empty($request->slug)) {
                $category->slug = Str::slug($validated['name']);
            }

            if (array_key_exists('description', $validated)) {
                $category->description = $validated['description'];
            }

            if (isset($validated['status'])) {
                $category->status = (int) $validated['status'];
            }

            // Handle new icon file upload
            if ($request->hasFile('icon')) {
                // Delete old icon if exists
                if ($category->icon && Storage::disk('public')->exists($category->icon)) {
                    Storage::disk('public')->delete($category->icon);
                }
                $category->icon = $request->file('icon')->store('categories/icons', 'public');
            }

            // Handle new image file upload
            if ($request->hasFile('image')) {
                // Delete old image if exists
                if ($category->image && Storage::disk('public')->exists($category->image)) {
                    Storage::disk('public')->delete($category->image);
                }
                $category->image = $request->file('image')->store('categories/images', 'public');
            }

            $category->save();

            return response()->json([
                'status'  => true,
                'message' => 'Category updated successfully',
                'data'    => new CategoryResource($category),
            ], 200);
        } catch (ValidationException $e) {
            return response()->json([
                'status'  => false,
                'message' => 'Validation failed',
                'errors'  => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'status'  => false,
                'message' => 'Failed to update category: ' . $e->getMessage(),
                'data'    => null,
            ], 500);
        }
    }

    /**
     * Remove the specified category or set status to 0 (Deleted).
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        try {
            $category = Category::find($id);

            if (!$category) {
                return response()->json([
                    'status'  => false,
                    'message' => 'Category not found',
                    'data'    => null,
                ], 404);
            }

            // If soft status update requested or default behavior
            if ($request->query('force') === 'true' || $request->query('force') === '1') {
                // Hard delete: remove stored files
                if ($category->icon && Storage::disk('public')->exists($category->icon)) {
                    Storage::disk('public')->delete($category->icon);
                }
                if ($category->image && Storage::disk('public')->exists($category->image)) {
                    Storage::disk('public')->delete($category->image);
                }
                $category->delete();

                return response()->json([
                    'status'  => true,
                    'message' => 'Category permanently deleted',
                    'data'    => null,
                ], 200);
            } else {
                // Set status to 0 (Deleted/Inactive)
                $category->status = 0;
                $category->save();

                return response()->json([
                    'status'  => true,
                    'message' => 'Category marked as deleted (status = 0)',
                    'data'    => new CategoryResource($category),
                ], 200);
            }
        } catch (\Exception $e) {
            return response()->json([
                'status'  => false,
                'message' => 'Failed to delete category: ' . $e->getMessage(),
                'data'    => null,
            ], 500);
        }
    }
}
