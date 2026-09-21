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
        // 1. WhatsApp Settings Table
        Schema::create('whatsapp_settings', function (Blueprint $table) {
            $table->id();
            $table->string('admin_phone_number')->default('9025192863');
            $table->string('session_name')->default('mangalam-admin');
            $table->string('api_base_url')->default('http://localhost:2785');
            $table->string('api_key')->default('mangalam_secret_wa_api_key_2026');
            $table->boolean('is_enabled')->default(true);
            $table->boolean('auto_reply_enabled')->default(true);
            $table->boolean('notify_customer_on_order')->default(true);
            $table->boolean('notify_admin_on_order')->default(true);
            $table->timestamps();
        });

        // 2. WhatsApp Conversations Table
        Schema::create('whatsapp_conversations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('customer_name')->default('Valued Customer');
            $table->string('customer_phone')->index();
            $table->text('last_message')->nullable();
            $table->timestamp('last_message_at')->nullable();
            $table->integer('unread_count')->default(0);
            $table->string('status')->default('active'); // active, archived, resolved
            $table->timestamps();
        });

        // 3. WhatsApp Messages Table
        Schema::create('whatsapp_messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('conversation_id')->constrained('whatsapp_conversations')->cascadeOnDelete();
            $table->enum('sender_type', ['customer', 'admin', 'system'])->default('system');
            $table->text('message');
            $table->enum('status', ['pending', 'sent', 'delivered', 'read', 'failed'])->default('sent');
            $table->foreignId('order_id')->nullable()->constrained('orders')->nullOnDelete();
            $table->string('media_url')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('whatsapp_messages');
        Schema::dropIfExists('whatsapp_conversations');
        Schema::dropIfExists('whatsapp_settings');
    }
};
