<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class BrandingSetting extends Model
{
    use HasFactory;

    protected $fillable = [
        'key',
        'value',
        'group',
        'type',
    ];

    /**
     * Default branding fallback assets.
     */
    public const DEFAULTS = [
        'logo_full'   => '/mangalam_logo.png',
        'logo_small'  => '/mangalam_logo.png',
        'logo_dark'   => '/mangalam_logo.png',
        'favicon'     => '/mangalam_logo.png',
        'site_title'  => 'Mangalam Healthy Foods',
        'tagline'     => 'Traditional & Heritage Wellness Foods',
        'footer_text' => '© 2026 Mangalam Healthy Foods. All rights reserved.',
    ];

    /**
     * Get a setting by key with fallback default.
     */
    public static function getByKey(string $key, ?string $default = null): ?string
    {
        $setting = static::where('key', $key)->first();
        if ($setting && !empty($setting->value)) {
            return static::formatUrl($setting->value);
        }

        return $default ?? (self::DEFAULTS[$key] ?? null);
    }

    /**
     * Set/Update a setting by key.
     */
    public static function setByKey(string $key, ?string $value, string $group = 'branding', string $type = 'image'): static
    {
        return static::updateOrCreate(
            ['key' => $key],
            [
                'value' => $value,
                'group' => $group,
                'type'  => $type,
            ]
        );
    }

    /**
     * Get all branding settings with absolute public URLs and defaults.
     *
     * @return array<string, mixed>
     */
    public static function getAllBranding(): array
    {
        $settings = static::where('group', 'branding')->pluck('value', 'key')->toArray();
        $imageKeys = ['logo_full', 'logo_small', 'logo_dark', 'favicon'];

        $result = [];
        foreach (self::DEFAULTS as $key => $defaultVal) {
            $val = $settings[$key] ?? null;
            if (!empty($val)) {
                $result[$key] = in_array($key, $imageKeys) ? static::formatUrl($val) : (string) $val;
            } else {
                $result[$key] = $defaultVal;
            }
        }

        return $result;
    }

    /**
     * Format a stored relative path or URL into a full public accessible asset URL.
     */
    public static function formatUrl(?string $pathOrUrl): ?string
    {
        if (empty($pathOrUrl)) {
            return null;
        }

        if (str_starts_with($pathOrUrl, 'http://') || str_starts_with($pathOrUrl, 'https://') || str_starts_with($pathOrUrl, 'data:')) {
            return $pathOrUrl;
        }

        if (str_starts_with($pathOrUrl, '/')) {
            return asset(ltrim($pathOrUrl, '/'));
        }

        return asset(Storage::url($pathOrUrl));
    }
}
