<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Cart extends Model
{
    use HasFactory;

    protected $table = 'carts';

    protected $fillable = [
        'user_id',
        'guest_token',
        'product_id',
        'package_size_id',
        'quantity',
    ];

    protected $casts = [
        'user_id'         => 'integer',
        'product_id'      => 'integer',
        'package_size_id' => 'integer',
        'quantity'        => 'integer',
    ];

    /**
     * Get the user that owns the cart item.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the product for the cart item.
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * Get the variant package size if applicable.
     */
    public function packageSize(): BelongsTo
    {
        return $this->belongsTo(ProductPackageSize::class, 'package_size_id');
    }
}
