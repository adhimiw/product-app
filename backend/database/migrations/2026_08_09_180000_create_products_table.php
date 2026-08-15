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
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->nullable()->index();
            $table->foreignId('category_id')->nullable()->constrained('categories')->nullOnDelete();
            $table->string('category')->nullable();
            $table->text('description')->nullable();
            $table->decimal('actual_price', 12, 2)->default(0.00);
            $table->integer('discount_type')->default(0);
            $table->decimal('discount_value', 12, 2)->default(0.00);
            $table->string('discount')->nullable();
            $table->integer('status')->default(1);
            $table->integer('stock')->default(0);
            $table->text('how_to_use')->nullable();
            $table->text('benefits')->nullable();
            $table->text('ingredients')->nullable();
            $table->json('tags')->nullable();
            $table->json('images')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
