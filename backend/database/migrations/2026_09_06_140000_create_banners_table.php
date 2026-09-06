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
        Schema::create('banners', function (Blueprint $table) {
            $table->id();
            $table->string('title', 255)->nullable();
            $table->text('description')->nullable();
            $table->string('pill_badge', 100)->nullable();
            $table->string('button_text', 50)->default('Shop Now');
            $table->string('button_link', 255)->default('/shop');
            $table->string('image_url', 500)->nullable();
            $table->string('bg_gradient', 255)->default('linear-gradient(135deg, #073820 0%, #0d4a2b 50%, #062b18 100%)');
            $table->enum('banner_type', ['split', 'full_image'])->default('split');
            $table->boolean('is_active')->default(true);
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });

        // Seed initial default hero banners
        DB::table('banners')->insert([
            [
                'title'        => 'Traditional Sprouted Grains For Everyday Energy',
                'description'  => '100% Soak-Sprouted Ancient Grains Bio-Activated For Pure Wellness',
                'pill_badge'   => 'HERITAGE SPECIAL 20% OFF',
                'button_text'  => 'Shop Now',
                'button_link'  => '/shop',
                'image_url'    => '/assets/images/300g_mangalam/Black Ulundhu Mix-10cm 12cm outline-01.jpg',
                'bg_gradient'  => 'linear-gradient(135deg, #073820 0%, #0d4a2b 50%, #062b18 100%)',
                'banner_type'  => 'split',
                'is_active'    => true,
                'sort_order'   => 1,
                'created_at'   => now(),
                'updated_at'   => now(),
            ],
            [
                'title'        => "Organic Sprouted Food For Your Family's Health",
                'description'  => 'Save 25% on Freshly Prepared Sprouted Health Mix & Porridge',
                'pill_badge'   => 'LIMITED OFFER 25% OFF',
                'button_text'  => 'Shop Now',
                'button_link'  => '/shop',
                'image_url'    => '/assets/images/300g_amutham/amutham-01.jpg',
                'bg_gradient'  => 'linear-gradient(135deg, #0a4427 0%, #155e37 50%, #073820 100%)',
                'banner_type'  => 'split',
                'is_active'    => true,
                'sort_order'   => 2,
                'created_at'   => now(),
                'updated_at'   => now(),
            ]
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('banners');
    }
};
