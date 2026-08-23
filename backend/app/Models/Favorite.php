<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Favorite extends Model
{
    use HasFactory;

    protected $table = 'favorites';

    protected $fillable = [
        'user_id',
        'guest_token',
        'product_id',
    ];

    protected $casts = [
        'user_id'    => 'integer',
        'product_id' => 'integer',
    ];

    /**
     * Get the user that owns the favorite.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the favorited product.
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}
