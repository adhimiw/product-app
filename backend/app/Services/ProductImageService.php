<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ProductImageService
{
    /**
     * Tracks files written during the current request for transactional rollback.
     *
     * @var array<string>
     */
    protected array $trackedFiles = [];

    /**
     * Max dimensions and quality for product web optimization.
     */
    protected int $maxWidth = 1200;
    protected int $maxHeight = 1200;
    protected int $quality = 82;

    /**
     * Store and optimize an uploaded image file.
     * Converts to WebP if supported by GD, otherwise compresses and saves directly.
     *
     * @param UploadedFile $file
     * @param string $folder Relative directory inside 'public' disk
     * @return string Full public URL of stored image
     */
    public function optimizeAndStore(UploadedFile $file, string $folder = 'products'): string
    {
        if (!$file->isValid()) {
            throw new \InvalidArgumentException('Invalid uploaded file.');
        }

        $extension = strtolower($file->getClientOriginalExtension());
        $mime = $file->getMimeType();

        // If SVG or GIF, preserve raw format without GD manipulation
        if (in_array($extension, ['svg', 'gif']) || str_contains($mime, 'svg') || str_contains($mime, 'gif')) {
            $filename = Str::uuid() . '.' . $extension;
            $path = $file->storeAs($folder, $filename, 'public');
            $this->trackedFiles[] = $path;
            return asset(Storage::url($path));
        }

        // Attempt GD-based WebP / JPEG high-efficiency compression
        try {
            $optimizedData = $this->compressImageToBuffer($file);
            if ($optimizedData !== null) {
                $filename = Str::uuid() . '.webp';
                $relativePath = rtrim($folder, '/') . '/' . $filename;
                
                Storage::disk('public')->put($relativePath, $optimizedData);
                $this->trackedFiles[] = $relativePath;

                return asset(Storage::url($relativePath));
            }
        } catch (\Throwable $e) {
            // Fallback to standard fast stream storage if GD fails
            report($e);
        }

        // Standard fast stream fallback
        $filename = Str::uuid() . '.' . ($extension ?: 'jpg');
        $path = $file->storeAs($folder, $filename, 'public');
        $this->trackedFiles[] = $path;

        return asset(Storage::url($path));
    }

    /**
     * Compress and scale image in-memory using native GD.
     *
     * @param UploadedFile $file
     * @return string|null Binary WebP string, or null on failure
     */
    protected function compressImageToBuffer(UploadedFile $file): ?string
    {
        if (!function_exists('imagecreatefromstring')) {
            return null;
        }

        $sourceData = file_get_contents($file->getRealPath());
        if ($sourceData === false) {
            return null;
        }

        $srcImage = @imagecreatefromstring($sourceData);
        if (!$srcImage) {
            return null;
        }

        // Fix EXIF orientation if JPEG
        if (function_exists('exif_read_data')) {
            $exif = @exif_read_data($file->getRealPath());
            if (!empty($exif['Orientation'])) {
                switch ($exif['Orientation']) {
                    case 8:
                        $srcImage = imagerotate($srcImage, 90, 0);
                        break;
                    case 3:
                        $srcImage = imagerotate($srcImage, 180, 0);
                        break;
                    case 6:
                        $srcImage = imagerotate($srcImage, -90, 0);
                        break;
                }
            }
        }

        $origWidth = imagesx($srcImage);
        $origHeight = imagesy($srcImage);

        // Calculate aspect-ratio scaling
        $targetWidth = $origWidth;
        $targetHeight = $origHeight;

        if ($origWidth > $this->maxWidth || $origHeight > $this->maxHeight) {
            $ratio = min($this->maxWidth / $origWidth, $this->maxHeight / $origHeight);
            $targetWidth = (int) round($origWidth * $ratio);
            $targetHeight = (int) round($origHeight * $ratio);
        }

        $dstImage = imagecreatetruecolor($targetWidth, $targetHeight);

        // Preserve PNG / WebP transparency
        imagealphablending($dstImage, false);
        imagesavealpha($dstImage, true);
        $transparent = imagecolorallocatealpha($dstImage, 255, 255, 255, 127);
        imagefilledrectangle($dstImage, 0, 0, $targetWidth, $targetHeight, $transparent);

        imagecopyresampled(
            $dstImage,
            $srcImage,
            0, 0, 0, 0,
            $targetWidth,
            $targetHeight,
            $origWidth,
            $origHeight
        );

        // Output to WebP buffer
        ob_start();
        if (function_exists('imagewebp')) {
            imagewebp($dstImage, null, $this->quality);
        } else {
            imagejpeg($dstImage, null, $this->quality);
        }
        $buffer = ob_get_clean();

        imagedestroy($srcImage);
        imagedestroy($dstImage);

        return $buffer ?: null;
    }

    /**
     * Extract storage relative path from full asset URL.
     *
     * @param string $url
     * @return string|null
     */
    public function getRelativePathFromUrl(string $url): ?string
    {
        $parsed = parse_url($url, PHP_URL_PATH);
        if (!$parsed) return null;

        if (str_contains($parsed, '/storage/')) {
            return ltrim(substr($parsed, strpos($parsed, '/storage/') + 9), '/');
        }

        return null;
    }

    /**
     * Delete files from storage safely.
     *
     * @param array<string>|string $urlsOrPaths
     */
    public function deleteFiles(array|string $urlsOrPaths): void
    {
        $items = is_array($urlsOrPaths) ? $urlsOrPaths : [$urlsOrPaths];
        $disk = Storage::disk('public');

        foreach ($items as $item) {
            if (empty($item)) continue;

            $relPath = str_starts_with($item, 'http')
                ? $this->getRelativePathFromUrl($item)
                : ltrim($item, '/');

            if ($relPath && $disk->exists($relPath)) {
                $disk->delete($relPath);
            }
        }
    }

    /**
     * Rollback all newly created files in this request lifecycle if DB fails.
     */
    public function rollback(): void
    {
        if (!empty($this->trackedFiles)) {
            Storage::disk('public')->delete($this->trackedFiles);
            $this->trackedFiles = [];
        }
    }

    /**
     * Get list of tracked files.
     *
     * @return array<string>
     */
    public function getTrackedFiles(): array
    {
        return $this->trackedFiles;
    }
}
