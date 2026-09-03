<?php

use App\Http\Controllers\Api\AddressController;
use App\Http\Controllers\Api\Admin\AnalyticsController as AdminAnalyticsController;
use App\Http\Controllers\Api\Admin\CategoryController as AdminCategoryController;
use App\Http\Controllers\Api\Admin\OrderController as AdminOrderController;
use App\Http\Controllers\Api\Admin\ProductController as AdminProductController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CartController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\FavoriteController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\V1\HealthController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Authentication routes (Throttled for security against brute-force)
Route::middleware('throttle:10,1')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
});

// Dynamic Cart APIs (Support both Authenticated and Guest Users)
Route::prefix('cart')->group(function () {
    Route::get('/', [CartController::class, 'index']);
    Route::post('/', [CartController::class, 'store']);
    Route::get('/count', [CartController::class, 'count']);
    Route::put('/{id}', [CartController::class, 'update']);
    Route::delete('/{id}', [CartController::class, 'destroy']);
    Route::delete('/', [CartController::class, 'clear']);
    Route::post('/merge', [CartController::class, 'merge']);
});

// Dynamic Favourite / Wishlist APIs (Support both Authenticated and Guest Users)
Route::prefix('favorites')->group(function () {
    Route::get('/', [FavoriteController::class, 'index']);
    Route::post('/', [FavoriteController::class, 'store']);
    Route::post('/toggle', [FavoriteController::class, 'toggle']);
    Route::get('/count', [FavoriteController::class, 'count']);
    Route::delete('/{productId}', [FavoriteController::class, 'destroy']);
    Route::post('/merge', [FavoriteController::class, 'merge']);
});

// User Profile & Address routes
Route::get('/user/profile', [UserController::class, 'getProfile']);
Route::post('/user/profile', [UserController::class, 'updateProfile']);
Route::put('/user/profile', [UserController::class, 'updateProfile']);

// Address Management API
Route::get('/user/addresses', [AddressController::class, 'index']);
Route::post('/user/addresses', [AddressController::class, 'store']);
Route::put('/user/addresses/{id}', [AddressController::class, 'update']);
Route::delete('/user/addresses/{id}', [AddressController::class, 'destroy']);
Route::post('/user/addresses/{id}/set-default', [AddressController::class, 'setDefault']);

// Orders API
Route::get('/user/orders', [OrderController::class, 'index']);
Route::post('/user/orders', [OrderController::class, 'store']);
Route::get('/user/orders/{id}', [OrderController::class, 'show']);
Route::post('/orders', [OrderController::class, 'store']);

// Category API Resource routes (Single & Plural)
Route::apiResource('category', CategoryController::class);
Route::apiResource('categories', CategoryController::class);

// Product API Resource routes (Single & Plural)
Route::apiResource('product', ProductController::class);
Route::apiResource('products', ProductController::class);

use App\Http\Controllers\Api\Admin\UserController as AdminUserController;
use App\Http\Controllers\Api\Admin\BrandingSettingController as AdminBrandingSettingController;
use App\Http\Controllers\Api\BrandingController;
use App\Http\Controllers\Api\Admin\WhatsAppController as AdminWhatsAppController;
use App\Http\Controllers\Api\WhatsAppWebhookController;

// Public Branding Configuration API
Route::get('/branding', [BrandingController::class, 'index']);

// Public Webhook for OpenWA Inbound Messages
Route::post('/webhooks/openwa', [WhatsAppWebhookController::class, 'handle']);

// Admin routes
Route::prefix('admin')->group(function () {
    Route::apiResource('categories', AdminCategoryController::class);

    // Admin Branding & Logo Settings routes
    Route::prefix('settings')->group(function () {
        Route::get('branding', [AdminBrandingSettingController::class, 'index']);
        Route::post('branding', [AdminBrandingSettingController::class, 'update']);
        Route::delete('branding/{key}', [AdminBrandingSettingController::class, 'destroy']);
        Route::post('branding/reset', [AdminBrandingSettingController::class, 'reset']);
    });

    // Admin Product routes
    Route::apiResource('products', AdminProductController::class);
    Route::post('products/{id}', [AdminProductController::class, 'update']);

    // Admin Order routes
    Route::get('orders', [AdminOrderController::class, 'index']);
    Route::get('orders/{id}', [AdminOrderController::class, 'show']);
    Route::put('orders/{id}/status', [AdminOrderController::class, 'updateStatus']);
    Route::put('orders/{id}', [AdminOrderController::class, 'updateStatus']);
    Route::delete('orders/{id}', [AdminOrderController::class, 'destroy']);

    // Admin User Management routes
    Route::get('users', [AdminUserController::class, 'index']);
    Route::get('users/{id}', [AdminUserController::class, 'show']);
    Route::put('users/{id}', [AdminUserController::class, 'update']);
    Route::post('users/{id}/toggle-block', [AdminUserController::class, 'toggleBlock']);
    Route::delete('users/{id}', [AdminUserController::class, 'destroy']);

    // Admin Analytics routes
    Route::prefix('analytics')->group(function () {
        Route::get('overview', [AdminAnalyticsController::class, 'getOverview']);
        Route::get('timeline', [AdminAnalyticsController::class, 'getTimeline']);
        Route::get('revenue', [AdminAnalyticsController::class, 'getRevenue']);
        Route::get('status-distribution', [AdminAnalyticsController::class, 'getStatusDistribution']);
        Route::get('performance', [AdminAnalyticsController::class, 'getPerformance']);
    });

    // Admin WhatsApp & Live Chat CRM routes
    Route::prefix('whatsapp')->group(function () {
        Route::get('status', [AdminWhatsAppController::class, 'getStatus']);
        Route::get('qr', [AdminWhatsAppController::class, 'getQrCode']);
        Route::get('conversations', [AdminWhatsAppController::class, 'getConversations']);
        Route::get('conversations/{id}/messages', [AdminWhatsAppController::class, 'getMessages']);
        Route::post('messages/send', [AdminWhatsAppController::class, 'sendMessage']);
        Route::get('settings', [AdminWhatsAppController::class, 'getSettings']);
        Route::put('settings', [AdminWhatsAppController::class, 'updateSettings']);
        Route::post('settings', [AdminWhatsAppController::class, 'updateSettings']);
        Route::post('test-notification', [AdminWhatsAppController::class, 'sendTestNotification']);
        Route::post('session/request-logout-otp', [AdminWhatsAppController::class, 'requestLogoutOtp']);
        Route::post('session/verify-logout-otp', [AdminWhatsAppController::class, 'verifyLogoutOtp']);
        Route::post('session/disconnect', [AdminWhatsAppController::class, 'disconnect']);
        Route::get('ping', [AdminWhatsAppController::class, 'pingGateway']);
        Route::post('ping', [AdminWhatsAppController::class, 'pingGateway']);
        Route::get('keepalive-logs', [AdminWhatsAppController::class, 'getKeepaliveLogs']);
    });
});

// V1 API routes
Route::prefix('v1')->group(function () {
    Route::get('/ping', [HealthController::class, 'ping']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/user', function (Request $request) {
            return $request->user();
        });
        Route::get('/user/profile', [UserController::class, 'getProfile']);
        Route::post('/user/profile', [UserController::class, 'updateProfile']);
        Route::put('/user/profile', [UserController::class, 'updateProfile']);
    });
});
