<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Marquee;
use App\Models\BrandingSetting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class MarqueeController extends Controller
{
    /**
     * Display a listing of all marquee announcements with global status.
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = Marquee::query();

            if ($request->filled('search')) {
                $search = trim($request->input('search'));
                $query->where('text', 'like', "%{$search}%")
                      ->orWhere('badge_text', 'like', "%{$search}%");
            }

            if ($request->filled('status') && $request->input('status') !== 'all') {
                $isActive = $request->input('status') === 'active';
                $query->where('is_active', $isActive);
            }

            $items = $query->orderByDesc('show_first')
                           ->orderBy('sort_order', 'asc')
                           ->orderBy('id', 'asc')
                           ->get();

            $globalSetting = BrandingSetting::where('key', 'marquee_enabled')->first();
            $isEnabled = $globalSetting ? filter_var($globalSetting->value, FILTER_VALIDATE_BOOLEAN) : true;

            return response()->json([
                'status'  => true,
                'message' => 'Marquee announcements retrieved successfully',
                'data'    => [
                    'is_enabled' => $isEnabled,
                    'items'      => $items,
                    'total'      => $items->count(),
                ],
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'status'  => false,
                'message' => 'Failed to fetch marquee items: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Store a newly created marquee announcement.
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'text'       => 'required|string|max:255',
                'icon'       => 'nullable|string|max:50',
                'link_url'   => 'nullable|string|max:255',
                'badge_text' => 'nullable|string|max:50',
                'show_first' => 'nullable|boolean',
                'is_active'  => 'nullable|boolean',
                'sort_order' => 'nullable|integer',
            ]);

            // If show_first is true, optionally uncheck others or place at the top
            if (!empty($validated['show_first']) && $validated['show_first']) {
                // If show_first is set, give it sort order 0
                $validated['sort_order'] = 0;
            } elseif (!isset($validated['sort_order'])) {
                $maxOrder = Marquee::max('sort_order') ?? 0;
                $validated['sort_order'] = $maxOrder + 1;
            }

            $marquee = Marquee::create([
                'text'       => trim($validated['text']),
                'icon'       => isset($validated['icon']) ? trim($validated['icon']) : null,
                'link_url'   => isset($validated['link_url']) ? trim($validated['link_url']) : null,
                'badge_text' => isset($validated['badge_text']) ? trim($validated['badge_text']) : null,
                'show_first' => $validated['show_first'] ?? false,
                'is_active'  => $validated['is_active'] ?? true,
                'sort_order' => $validated['sort_order'] ?? 0,
            ]);

            return response()->json([
                'status'  => true,
                'message' => 'Marquee announcement created successfully',
                'data'    => $marquee,
            ], 201);
        } catch (ValidationException $e) {
            return response()->json([
                'status'  => false,
                'message' => 'Validation error',
                'errors'  => $e->errors(),
            ], 422);
        } catch (\Throwable $e) {
            return response()->json([
                'status'  => false,
                'message' => 'Failed to create marquee item: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Display the specified marquee announcement.
     */
    public function show($id): JsonResponse
    {
        try {
            $marquee = Marquee::findOrFail($id);

            return response()->json([
                'status'  => true,
                'message' => 'Marquee item details retrieved',
                'data'    => $marquee,
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'status'  => false,
                'message' => 'Marquee item not found',
            ], 404);
        }
    }

    /**
     * Update the specified marquee announcement.
     */
    public function update(Request $request, $id): JsonResponse
    {
        try {
            $marquee = Marquee::findOrFail($id);

            $validated = $request->validate([
                'text'       => 'required|string|max:255',
                'icon'       => 'nullable|string|max:50',
                'link_url'   => 'nullable|string|max:255',
                'badge_text' => 'nullable|string|max:50',
                'show_first' => 'nullable|boolean',
                'is_active'  => 'nullable|boolean',
                'sort_order' => 'nullable|integer',
            ]);

            $marquee->update([
                'text'       => trim($validated['text']),
                'icon'       => isset($validated['icon']) ? trim($validated['icon']) : null,
                'link_url'   => isset($validated['link_url']) ? trim($validated['link_url']) : null,
                'badge_text' => isset($validated['badge_text']) ? trim($validated['badge_text']) : null,
                'show_first' => $validated['show_first'] ?? false,
                'is_active'  => $validated['is_active'] ?? true,
                'sort_order' => $validated['sort_order'] ?? $marquee->sort_order,
            ]);

            return response()->json([
                'status'  => true,
                'message' => 'Marquee announcement updated successfully',
                'data'    => $marquee,
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'status'  => false,
                'message' => 'Validation error',
                'errors'  => $e->errors(),
            ], 422);
        } catch (\Throwable $e) {
            return response()->json([
                'status'  => false,
                'message' => 'Failed to update marquee item: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Remove the specified marquee announcement.
     */
    public function destroy($id): JsonResponse
    {
        try {
            $marquee = Marquee::findOrFail($id);
            $marquee->delete();

            return response()->json([
                'status'  => true,
                'message' => 'Marquee announcement deleted successfully',
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'status'  => false,
                'message' => 'Failed to delete marquee item: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Quick toggle active / inactive status of an item.
     */
    public function toggleStatus($id): JsonResponse
    {
        try {
            $marquee = Marquee::findOrFail($id);
            $marquee->is_active = ! $marquee->is_active;
            $marquee->save();

            return response()->json([
                'status'  => true,
                'message' => 'Marquee item status updated',
                'data'    => $marquee,
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'status'  => false,
                'message' => 'Failed to toggle status: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Toggle global marquee bar visibility across the website.
     */
    public function toggleGlobalVisibility(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'is_enabled' => 'required|boolean',
            ]);

            BrandingSetting::setByKey(
                'marquee_enabled',
                $validated['is_enabled'] ? '1' : '0',
                'general',
                'boolean'
            );

            return response()->json([
                'status'  => true,
                'message' => $validated['is_enabled'] ? 'Marquee bar enabled across website' : 'Marquee bar hidden from website',
                'data'    => [
                    'is_enabled' => (bool) $validated['is_enabled'],
                ],
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'status'  => false,
                'message' => 'Failed to update global marquee setting: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Reorder marquee items.
     */
    public function reorder(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'orders'         => 'required|array',
                'orders.*.id'    => 'required|exists:marquees,id',
                'orders.*.order' => 'required|integer',
            ]);

            DB::transaction(function () use ($validated) {
                foreach ($validated['orders'] as $row) {
                    Marquee::where('id', $row['id'])->update(['sort_order' => $row['order']]);
                }
            });

            return response()->json([
                'status'  => true,
                'message' => 'Marquee order saved successfully',
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'status'  => false,
                'message' => 'Failed to save order: ' . $e->getMessage(),
            ], 500);
        }
    }
}
