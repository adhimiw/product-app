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
        Schema::create('carts', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id')->nullable()->index();
            $table->string('guest_token', 64)->nullable()->index();
            $table->unsignedBigInteger('product_id')->index();
            $table->unsignedBigInteger('package_size_id')->nullable()->index();
            $table->unsignedInteger('quantity')->default(1);
            $table->timestamps();

            // Foreign keys
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('product_id')->references('id')->on('products')->onDelete('cascade');
            $table->foreign('package_size_id')->references('id')->on('product_package_sizes')->onDelete('set null');

            // Unique constraints so that the same item cannot be duplicated for the same user or guest
            $table->unique(['user_id', 'product_id', 'package_size_id'], 'user_cart_unique_item');
            $table->unique(['guest_token', 'product_id', 'package_size_id'], 'guest_cart_unique_item');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('carts');
    }
};
