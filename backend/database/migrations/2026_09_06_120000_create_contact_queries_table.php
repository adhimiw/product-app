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
        if (!Schema::hasTable('contact_queries')) {
            Schema::create('contact_queries', function (Blueprint $table) {
                $table->id();
                $table->string('name', 150);
                $table->string('email', 150);
                $table->string('phone', 30)->nullable();
                $table->string('subject', 200)->nullable();
                $table->text('message');
                $table->enum('status', ['pending', 'in_progress', 'resolved', 'archived'])->default('pending');
                $table->text('admin_notes')->nullable();
                $table->string('ip_address', 45)->nullable();
                $table->timestamps();

                $table->index('status');
                $table->index('created_at');
                $table->index('email');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('contact_queries');
    }
};
