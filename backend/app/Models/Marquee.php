<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Marquee extends Model
{
    use HasFactory;

    protected $table = 'marquees';

    protected $fillable = [
        'text',
        'icon',
        'link_url',
        'badge_text',
        'show_first',
        'is_active',
        'sort_order',
    ];

    protected $casts = [
        'show_first' => 'boolean',
        'is_active'  => 'boolean',
        'sort_order' => 'integer',
    ];

    /**
     * Scope for active items ordered by show_first (desc) and sort_order (asc).
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true)
                     ->orderByDesc('show_first')
                     ->orderBy('sort_order', 'asc')
                     ->orderBy('id', 'asc');
    }
}
