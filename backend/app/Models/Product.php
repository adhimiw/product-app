<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'category_id',
        'category',
        'description',
        'actual_price',
        'discount_type',
        'discount_value',
        'discount',
        'status',
        'stock',
        'how_to_use',
        'benefits',
        'ingredients',
        'tags',
        'images',
    ];

    protected function casts(): array
    {
        return [
            'actual_price'   => 'float',
            'discount_type'  => 'integer',
            'discount_value' => 'float',
            'status'         => 'integer',
            'stock'          => 'integer',
            'tags'           => 'array',
            'images'         => 'array',
        ];
    }

    protected static function boot(): void
    {
        parent::boot();

        static::creating(function ($product) {
            if (empty($product->slug) && !empty($product->name)) {
                $product->slug = Str::slug($product->name);
            }
        });

        static::updating(function ($product) {
            if ($product->isDirty('name') && empty($product->slug)) {
                $product->slug = Str::slug($product->name);
            }
        });
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function packageSizes(): HasMany
    {
        return $this->hasMany(ProductPackageSize::class);
    }
}
