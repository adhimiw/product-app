<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('marquees', function (Blueprint $table) {
            $table->id();
            $table->string('text', 255);
            $table->string('icon', 50)->nullable();
            $table->string('link_url', 255)->nullable();
            $table->string('badge_text', 50)->nullable();
            $table->boolean('show_first')->default(false);
            $table->boolean('is_active')->default(true);
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });

        // Seed initial default marquee announcements
        DB::table('marquees')->insert([
            [
                'text'        => 'FREE SHIPPING ON ORDERS OVER ₹999 / $40',
                'icon'        => '🚚',
                'link_url'    => '/shop',
                'badge_text'  => 'OFFER',
                'show_first'  => true,
                'is_active'   => true,
                'sort_order'  => 1,
                'created_at'  => now(),
                'updated_at'  => now(),
            ],
            [
                'text'        => 'SAVE 10% ON FAMILY PACKS',
                'icon'        => '🎉',
                'link_url'    => '/shop',
                'badge_text'  => 'DEAL',
                'show_first'  => false,
                'is_active'   => true,
                'sort_order'  => 2,
                'created_at'  => now(),
                'updated_at'  => now(),
            ],
            [
                'text'        => '100% SOAK-SPROUTED ANCIENT MILLET PURITY 🌱',
                'icon'        => '🌱',
                'link_url'    => '/science',
                'badge_text'  => 'PURE',
                'show_first'  => false,
                'is_active'   => true,
                'sort_order'  => 3,
                'created_at'  => now(),
                'updated_at'  => now(),
            ],
            [
                'text'        => 'FSSAI & UDYAM CERTIFIED HERITAGE FACILITY',
                'icon'        => '⭐',
                'link_url'    => '/about',
                'badge_text'  => 'CERTIFIED',
                'show_first'  => false,
                'is_active'   => true,
                'sort_order'  => 4,
                'created_at'  => now(),
                'updated_at'  => now(),
            ],
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('marquees');
    }
};
