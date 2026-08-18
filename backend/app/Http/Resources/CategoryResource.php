<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CategoryResource extends JsonResource
{
    private function formatUrl(?string $path): ?string
    {
        if (empty($path)) {
            return null;
        }
        if (str_starts_with($path, 'http://') || str_starts_with($path, 'https://')) {
            return $path;
        }
        if (str_starts_with($path, '/')) {
            return url($path);
        }
        if (str_starts_with($path, 'storage/')) {
            return url($path);
        }
        return url('storage/' . $path);
    }

    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id'             => $this->id,
            'name'           => $this->name,
            'slug'           => $this->slug,
            'description'    => $this->description,
            'icon'           => $this->icon,
            'icon_url'       => $this->formatUrl($this->icon),
            'image'          => $this->image,
            'image_url'      => $this->formatUrl($this->image),
            'status'         => (int) $this->status, // 1 = Active, 0 = Deleted
            'products_count' => isset($this->products_count) ? (int) $this->products_count : \App\Models\Product::where('category_id', $this->id)->where('status', 1)->count(),
            'created_at'     => $this->created_at ? $this->created_at->toIso8601String() : null,
            'updated_at'     => $this->updated_at ? $this->updated_at->toIso8601String() : null,
        ];
    }
}
