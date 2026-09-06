<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Banner;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class BannerController extends Controller
{
    /**
     * Display a listing of banners for Admin Panel.
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = Banner::query();

            // Search filter
            if ($request->filled('search')) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('title', 'like', "%{$search}%")
                      ->orWhere('description', 'like', "%{$search}%")
                      ->orWhere('pill_badge', 'like', "%{$search}%");
                });
            }

            // Status filter
            if ($request->has('status') && $request->status !== 'all' && $request->status !== null && $request->status !== '') {
                $query->where('is_active', filter_var($request->status, FILTER_VALIDATE_BOOLEAN));
            }

            $banners = $query->orderBy('sort_order', 'asc')->orderBy('id', 'asc')->get();

            // KPI Counts
            $counts = [
                'all'      => Banner::count(),
                'active'   => Banner::where('is_active', true)->count(),
                'inactive' => Banner::where('is_active', false)->count(),
            ];

            return response()->json([
                'status'  => true,
                'message' => 'Banners retrieved successfully',
                'data'    => $banners,
                'counts'  => $counts,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status'  => false,
                'message' => 'Failed to fetch banners: ' . $e->getMessage(),
                'data'    => [],
            ], 500);
        }
    }

    /**
     * Store a newly created banner.
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'title'        => 'nullable|string|max:255',
                'description'  => 'nullable|string',
                'pill_badge'   => 'nullable|string|max:100',
                'button_text'  => 'nullable|string|max:50',
                'button_link'  => 'nullable|string|max:255',
                'image'        => 'nullable|file|mimes:jpeg,jpg,png,gif,svg,webp|max:8192',
                'image_url'    => 'nullable|string|max:500',
                'bg_gradient'  => 'nullable|string|max:255',
                'banner_type'  => 'nullable|in:split,full_image',
                'is_active'    => 'nullable',
                'sort_order'   => 'nullable|integer',
            ]);

            $imageUrl = $validated['image_url'] ?? null;

            // Handle file upload
            if ($request->hasFile('image')) {
                $path = $request->file('image')->store('banners', 'public');
                $imageUrl = Storage::url($path);
            }

            // Calculate sort order if not provided
            $sortOrder = isset($validated['sort_order']) 
                ? (int) $validated['sort_order'] 
                : (Banner::max('sort_order') ?? 0) + 1;

            $banner = Banner::create([
                'title'        => $validated['title'] ?? null,
                'description'  => $validated['description'] ?? null,
                'pill_badge'   => $validated['pill_badge'] ?? null,
                'button_text'  => $validated['button_text'] ?? 'Shop Now',
                'button_link'  => $validated['button_link'] ?? '/shop',
                'image_url'    => $imageUrl,
                'bg_gradient'  => $validated['bg_gradient'] ?? 'linear-gradient(135deg, #073820 0%, #0d4a2b 50%, #062b18 100%)',
                'banner_type'  => $validated['banner_type'] ?? 'split',
                'is_active'    => isset($validated['is_active']) ? filter_var($validated['is_active'], FILTER_VALIDATE_BOOLEAN) : true,
                'sort_order'   => $sortOrder,
            ]);

            return response()->json([
                'status'  => true,
                'message' => 'Hero Banner created successfully',
                'data'    => $banner,
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
                'message' => 'Failed to create banner: ' . $e->getMessage(),
                'data'    => null,
            ], 500);
        }
    }

    /**
     * Display the specified banner.
     */
    public function show(int $id): JsonResponse
    {
        try {
            $banner = Banner::find($id);

            if (!$banner) {
                return response()->json([
                    'status'  => false,
                    'message' => 'Banner not found',
                    'data'    => null,
                ], 404);
            }

            return response()->json([
                'status'  => true,
                'message' => 'Banner retrieved successfully',
                'data'    => $banner,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status'  => false,
                'message' => 'Error retrieving banner: ' . $e->getMessage(),
                'data'    => null,
            ], 500);
        }
    }

    /**
     * Update the specified banner.
     */
    public function update(Request $request, int $id): JsonResponse
    {
        try {
            $banner = Banner::find($id);

            if (!$banner) {
                return response()->json([
                    'status'  => false,
                    'message' => 'Banner not found',
                    'data'    => null,
                ], 404);
            }

            $validated = $request->validate([
                'title'        => 'nullable|string|max:255',
                'description'  => 'nullable|string',
                'pill_badge'   => 'nullable|string|max:100',
                'button_text'  => 'nullable|string|max:50',
                'button_link'  => 'nullable|string|max:255',
                'image'        => 'nullable|file|mimes:jpeg,jpg,png,gif,svg,webp|max:8192',
                'image_url'    => 'nullable|string|max:500',
                'bg_gradient'  => 'nullable|string|max:255',
                'banner_type'  => 'nullable|in:split,full_image',
                'is_active'    => 'nullable',
                'sort_order'   => 'nullable|integer',
            ]);

            if (array_key_exists('title', $validated)) {
                $banner->title = $validated['title'];
            }
            if (array_key_exists('description', $validated)) {
                $banner->description = $validated['description'];
            }
            if (array_key_exists('pill_badge', $validated)) {
                $banner->pill_badge = $validated['pill_badge'];
            }
            if (array_key_exists('button_text', $validated)) {
                $banner->button_text = $validated['button_text'];
            }
            if (array_key_exists('button_link', $validated)) {
                $banner->button_link = $validated['button_link'];
            }
            if (array_key_exists('bg_gradient', $validated) && !empty($validated['bg_gradient'])) {
                $banner->bg_gradient = $validated['bg_gradient'];
            }
            if (array_key_exists('banner_type', $validated)) {
                $banner->banner_type = $validated['banner_type'];
            }
            if (isset($validated['is_active'])) {
                $banner->is_active = filter_var($validated['is_active'], FILTER_VALIDATE_BOOLEAN);
            }
            if (isset($validated['sort_order'])) {
                $banner->sort_order = (int) $validated['sort_order'];
            }

            // Handle file upload
            if ($request->hasFile('image')) {
                // Remove old storage file if stored locally
                if ($banner->image_url && str_contains($banner->image_url, '/storage/banners/')) {
                    $oldPath = str_replace('/storage/', '', parse_url($banner->image_url, PHP_URL_PATH));
                    if (Storage::disk('public')->exists($oldPath)) {
                        Storage::disk('public')->delete($oldPath);
                    }
                }

                $path = $request->file('image')->store('banners', 'public');
                $banner->image_url = Storage::url($path);
            } elseif (array_key_exists('image_url', $validated) && $validated['image_url'] !== null) {
                $banner->image_url = $validated['image_url'];
            }

            $banner->save();

            return response()->json([
                'status'  => true,
                'message' => 'Hero Banner updated successfully',
                'data'    => $banner,
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
                'message' => 'Failed to update banner: ' . $e->getMessage(),
                'data'    => null,
            ], 500);
        }
    }

    /**
     * Toggle active status.
     */
    public function updateStatus(Request $request, int $id): JsonResponse
    {
        try {
            $banner = Banner::find($id);

            if (!$banner) {
                return response()->json([
                    'status'  => false,
                    'message' => 'Banner not found',
                    'data'    => null,
                ], 404);
            }

            $banner->is_active = !$banner->is_active;
            $banner->save();

            return response()->json([
                'status'  => true,
                'message' => 'Banner status updated to ' . ($banner->is_active ? 'Active' : 'Inactive'),
                'data'    => $banner,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status'  => false,
                'message' => 'Failed to toggle status: ' . $e->getMessage(),
                'data'    => null,
            ], 500);
        }
    }

    /**
     * Reorder banners.
     */
    public function reorder(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'orders' => 'required|array',
                'orders.*.id' => 'required|integer|exists:banners,id',
                'orders.*.sort_order' => 'required|integer',
            ]);

            foreach ($request->orders as $item) {
                Banner::where('id', $item['id'])->update(['sort_order' => $item['sort_order']]);
            }

            return response()->json([
                'status'  => true,
                'message' => 'Banner display order updated successfully',
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status'  => false,
                'message' => 'Failed to reorder banners: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Remove the specified banner.
     */
    public function destroy(int $id): JsonResponse
    {
        try {
            $banner = Banner::find($id);

            if (!$banner) {
                return response()->json([
                    'status'  => false,
                    'message' => 'Banner not found',
                    'data'    => null,
                ], 404);
            }

            // Remove stored image if local
            if ($banner->image_url && str_contains($banner->image_url, '/storage/banners/')) {
                $oldPath = str_replace('/storage/', '', parse_url($banner->image_url, PHP_URL_PATH));
                if (Storage::disk('public')->exists($oldPath)) {
                    Storage::disk('public')->delete($oldPath);
                }
            }

            $banner->delete();

            return response()->json([
                'status'  => true,
                'message' => 'Hero Banner deleted successfully',
                'data'    => null,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status'  => false,
                'message' => 'Failed to delete banner: ' . $e->getMessage(),
                'data'    => null,
            ], 500);
        }
    }
}
