<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('product_package_sizes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained('products')->cascadeOnDelete();
            $table->string('size_key')->nullable();
            $table->decimal('size_number', 12, 2)->default(0);
            $table->string('size_unit', 20)->default('g');
            $table->decimal('variant_price', 12, 2)->default(0.00);
            $table->integer('variant_badge')->default(0);
            $table->integer('discount_type')->default(1);
            $table->decimal('discount_value', 12, 2)->default(0.00);
            $table->integer('stock')->default(0);
            $table->json('images')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('product_package_sizes');
    }
};
