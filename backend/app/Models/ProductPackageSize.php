<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProductPackageSize extends Model
{
    use HasFactory;

    protected $fillable = [
        'product_id',
        'size_key',
        'size_number',
        'size_unit',
        'variant_price',
        'variant_badge',
        'discount_type',
        'discount_value',
        'stock',
        'images',
    ];

    protected function casts(): array
    {
        return [
            'size_number'    => 'float',
            'variant_price'  => 'float',
            'variant_badge'  => 'integer',
            'discount_type'   => 'integer',
            'discount_value' => 'float',
            'stock'          => 'integer',
            'images'         => 'array',
        ];
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}
