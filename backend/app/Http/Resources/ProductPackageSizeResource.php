<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductPackageSizeResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
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
            'id'             => $this->size_key ?? ('pkg-' . $this->id),
            'db_id'          => $this->id,
            'size_number'    => $this->size_number,
            'size_unit'      => $this->size_unit,
            'variant_price'  => $this->variant_price,
            'variant_badge'  => $this->variant_badge,
            'discount_type'  => $this->discount_type,
            'discount_value' => $this->discount_value,
            'stock'          => $this->stock,
            'variant_images' => $formattedImages,
            'images'         => $formattedImages,
        ];
    }
}
