---
name: laravel-security
description: >-
  Security hardening standards for Laravel 11 applications, including OWASP security headers,
  long-lived admin sessions, Sanctum authentication tokens, rate limiting, and mass assignment protection.
---

# Laravel Security & Session Standards

## 1. 7-Day Long-Lived Admin Sessions
Maintain synchronized token and session lifetime across all layers:
- **Sanctum Config (`backend/config/sanctum.php`)**: `'expiration' => 10080` (7 days in minutes)
- **Session Config (`backend/config/session.php`)**: `'lifetime' => 10080`, `'expire_on_close' => false`
- **Frontend Auth (`src/admin/services/adminAuthService.js`)**: Enforce `7 * 24 * 60 * 60 * 1000` ms client validity expiration.

## 2. OWASP Security Headers Middleware
Located in `backend/app/Http/Middleware/SecurityHeaders.php`:
```php
<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SecurityHeaders
{
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        $response->headers->set('X-Frame-Options', 'SAMEORIGIN');
        $response->headers->set('X-Content-Type-Options', 'nosniff');
        $response->headers->set('X-XSS-Protection', '1; mode=block');
        $response->headers->set('Referrer-Policy', 'strict-origin-when-cross-origin');
        $response->headers->set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

        return $response;
    }
}
```

Registered in `backend/bootstrap/app.php`:
```php
->withMiddleware(function (Middleware $middleware) {
    $middleware->append(\App\Http\Middleware\SecurityHeaders::class);
})
```

## 3. Rate Limiting & Mass Assignment
- Throttle authentication routes (`backend/routes/api.php`):
  ```php
  Route::middleware('throttle:10,1')->group(function () {
      Route::post('/login', [AuthController::class, 'login']);
      Route::post('/register', [AuthController::class, 'register']);
  });
  ```
- Explicitly define `$fillable` and `$casts` on Eloquent models.
- Format responses via API Resources (`CategoryResource`, `ProductResource`) to properly resolve dynamic asset URLs (`asset('storage/' . $this->image)`).
