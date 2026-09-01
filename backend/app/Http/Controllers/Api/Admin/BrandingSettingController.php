<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\BrandingSetting;
use App\Services\ProductImageService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class BrandingSettingController extends Controller
{
    protected ProductImageService $imageService;

    public function __construct(ProductImageService $imageService)
    {
        $this->imageService = $imageService;
    }

    /**
     * Get current branding settings.
     */
    public function index(): JsonResponse
    {
        try {
            $branding = BrandingSetting::getAllBranding();

            return response()->json([
                'status'  => true,
                'message' => 'Branding settings retrieved successfully',
                'data'    => $branding,
            ], 200);
        } catch (\Throwable $e) {
            return response()->json([
                'status'  => false,
                'message' => 'Failed to fetch branding settings: ' . $e->getMessage(),
                'data'    => null,
            ], 500);
        }
    }

    /**
     * Upload or update branding settings (logos and text).
     */
    public function update(Request $request): JsonResponse
    {
        $request->validate([
            'logo_full'   => 'nullable|file|mimes:png,jpg,jpeg,webp,svg|max:2048',
            'logo_small'  => 'nullable|file|mimes:png,jpg,jpeg,webp,svg,ico|max:2048',
            'logo_dark'   => 'nullable|file|mimes:png,jpg,jpeg,webp,svg|max:2048',
            'favicon'     => 'nullable|file|mimes:png,jpg,jpeg,webp,svg,ico|max:1024',
            'site_title'  => 'nullable|string|max:255',
            'tagline'     => 'nullable|string|max:255',
            'footer_text' => 'nullable|string|max:500',
        ]);

        try {
            DB::transaction(function () use ($request) {
                $logoKeys = ['logo_full', 'logo_small', 'logo_dark', 'favicon'];

                foreach ($logoKeys as $key) {
                    if ($request->hasFile($key)) {
                        $file = $request->file($key);
                        if ($file instanceof UploadedFile && $file->isValid()) {
                            // Find existing setting to delete old file
                            $existing = BrandingSetting::where('key', $key)->first();
                            if ($existing && !empty($existing->value)) {
                                $this->imageService->deleteFiles($existing->value);
                            }

                            // Store new file
                            $extension = strtolower($file->getClientOriginalExtension());
                            $filename = "branding_{$key}_" . Str::random(8) . '.' . $extension;
                            $path = $file->storeAs('branding', $filename, 'public');

                            BrandingSetting::setByKey($key, $path, 'branding', 'image');
                        }
                    }
                }

                // Handle text metadata
                $textKeys = ['site_title', 'tagline', 'footer_text'];
                foreach ($textKeys as $tKey) {
                    if ($request->has($tKey)) {
                        BrandingSetting::setByKey($tKey, $request->input($tKey), 'branding', 'text');
                    }
                }
            });

            $updatedBranding = BrandingSetting::getAllBranding();

            return response()->json([
                'status'  => true,
                'message' => 'Branding settings updated successfully',
                'data'    => $updatedBranding,
            ], 200);
        } catch (\Throwable $e) {
            $this->imageService->rollback();

            return response()->json([
                'status'  => false,
                'message' => 'Failed to update branding settings: ' . $e->getMessage(),
                'data'    => null,
            ], 500);
        }
    }

    /**
     * Delete/reset an individual logo key.
     */
    public function destroy(string $key): JsonResponse
    {
        try {
            $allowedKeys = ['logo_full', 'logo_small', 'logo_dark', 'favicon'];
            if (!in_array($key, $allowedKeys)) {
                return response()->json([
                    'status'  => false,
                    'message' => 'Invalid logo key specified',
                    'data'    => null,
                ], 400);
            }

            $existing = BrandingSetting::where('key', $key)->first();
            if ($existing) {
                if (!empty($existing->value)) {
                    $this->imageService->deleteFiles($existing->value);
                }
                $existing->delete();
            }

            $updatedBranding = BrandingSetting::getAllBranding();

            return response()->json([
                'status'  => true,
                'message' => "Logo '{$key}' reset to default successfully",
                'data'    => $updatedBranding,
            ], 200);
        } catch (\Throwable $e) {
            return response()->json([
                'status'  => false,
                'message' => 'Failed to reset logo: ' . $e->getMessage(),
                'data'    => null,
            ], 500);
        }
    }

    /**
     * Reset all branding settings back to factory default.
     */
    public function reset(): JsonResponse
    {
        try {
            $allSettings = BrandingSetting::where('group', 'branding')->get();
            foreach ($allSettings as $st) {
                if ($st->type === 'image' && !empty($st->value)) {
                    $this->imageService->deleteFiles($st->value);
                }
                $st->delete();
            }

            $defaultBranding = BrandingSetting::getAllBranding();

            return response()->json([
                'status'  => true,
                'message' => 'All branding settings reset to default',
                'data'    => $defaultBranding,
            ], 200);
        } catch (\Throwable $e) {
            return response()->json([
                'status'  => false,
                'message' => 'Failed to reset branding settings: ' . $e->getMessage(),
                'data'    => null,
            ], 500);
        }
    }
}
