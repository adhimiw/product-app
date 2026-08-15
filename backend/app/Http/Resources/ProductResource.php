<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $categoryName = $this->category;
        if (empty($categoryName) && $this->relationLoaded('category') && $this->category) {
            $categoryName = $this->category->name;
        }

        $rawImages = $this->images ?? [];
        $formattedImages = array_map(function ($img) {
            if (empty($img)) return $img;
            if (str_starts_with($img, 'http://') || str_starts_with($img, 'https://') || str_starts_with($img, 'data:')) {
                return $img;
            }
            if (str_starts_with($img, '/storage/') || str_starts_with($img, 'storage/')) {
                return asset(ltrim($img, '/'));
            }
            return $img;
        }, $rawImages);

        return [
            'id'             => $this->id,
            'name'           => $this->name,
            'slug'           => $this->slug,
            'category_id'    => $this->category_id,
            'category'       => $categoryName,
            'description'    => $this->description,
            'actual_price'   => $this->actual_price,
            'discount_type'  => $this->discount_type,
            'discount_value' => $this->discount_value,
            'discount'       => $this->discount,
            'status'         => $this->status,
            'stock'          => $this->stock,
            'how_to_use'     => $this->how_to_use,
            'benefits'       => $this->benefits,
            'ingredients'    => $this->ingredients,
            'tags'           => $this->tags ?? [],
            'images'         => $formattedImages,
            'package_sizes'  => ProductPackageSizeResource::collection($this->whenLoaded('packageSizes', $this->packageSizes, [])),
            'created_at'     => $this->created_at?->toIso8601String(),
            'updated_at'     => $this->updated_at?->toIso8601String(),
        ];
    }
}
