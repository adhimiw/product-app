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
        Schema::table('product_package_sizes', function (Blueprint $table) {
            if (!Schema::hasColumn('product_package_sizes', 'package_size')) {
                $table->string('package_size')->nullable()->after('pieces_count');
            }
            if (!Schema::hasColumn('product_package_sizes', 'status')) {
                $table->tinyInteger('status')->default(1)->after('package_size');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('product_package_sizes', function (Blueprint $table) {
            if (Schema::hasColumn('product_package_sizes', 'package_size')) {
                $table->dropColumn('package_size');
            }
            if (Schema::hasColumn('product_package_sizes', 'status')) {
                $table->dropColumn('status');
            }
        });
    }
};
