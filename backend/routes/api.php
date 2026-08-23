<?php

use App\Http\Controllers\Api\AddressController;
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

// Admin routes
Route::prefix('admin')->group(function () {
    Route::apiResource('categories', AdminCategoryController::class);

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
