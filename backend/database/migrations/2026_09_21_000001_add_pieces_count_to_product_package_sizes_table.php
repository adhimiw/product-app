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
        if (Schema::hasTable('product_package_sizes') && !Schema::hasColumn('product_package_sizes', 'pieces_count')) {
            Schema::table('product_package_sizes', function (Blueprint $table) {
                $table->integer('pieces_count')->nullable()->after('size_unit');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('product_package_sizes') && Schema::hasColumn('product_package_sizes', 'pieces_count')) {
            Schema::table('product_package_sizes', function (Blueprint $table) {
                $table->dropColumn('pieces_count');
            });
        }
    }
};
