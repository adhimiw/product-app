# Mangalam Healthy Foods - Project Guidelines & Invariants

## 1. Repository Architecture & Sync Mapping
- **Monorepo**: `C:\Users\Admin\Documents\Projects\MANGALAM-HEALTHY-FOODS-main` (`adhimiw/MANGALAM-HEALTHY-FOODS`)
- **Backend API**: `C:\Users\Admin\Documents\Projects\HealthMixApi (BackEnd)\HealthMixApi` (`adhimiw/HealthMixApi`)
- **Frontend App**: `C:\Users\Admin\Documents\Projects\product-app FrontEnd\product-app` (`adhimiw/product-app`)
- Always synchronize code changes across the monorepo and individual sub-repositories when completing major features.

## 2. Production Safety Invariants
- **NEVER** run destructive commands (`migrate:fresh`, `db:seed`, `TRUNCATE`) against production MySQL (`u244089748_df`) unless explicitly instructed by the user.
- **NEVER** overwrite live product catalog with mock/placeholder seeds; use genuine product assets and image URLs from `adhimiw/product-app`.

## 3. Hostinger Server Invariants
- **Domain**: `https://palegreen-dogfish-720166.hostingersite.com`
- **PHP CLI**: Always invoke `/opt/alt/php83/usr/bin/php` when running Artisan on the remote server.
- **Directory Layout**: Laravel root is `/home/u244089748/domains/palegreen-dogfish-720166.hostingersite.com/laravel_app` and Web root is `/public_html`.
- **Public Storage Symlink**: Must exist at `/public_html/storage` -> `/laravel_app/storage/app/public`.

## 4. UI/UX Design System Invariants
- **Typography**: Enforce `Plus Jakarta Sans` across all components and admin panels. Avoid raw browser font fallbacks.
- **Modal Reset State**: "Add Product" and creation modals must initialize with empty states (`variant_images: []`, `tags: []`, `actual_price: ""`), never retaining default or seed data.
- **Icons**: Use SVG icons from `lucide-react` for toolbar controls and modal buttons instead of plaintext glyphs.

## 5. Security & Session Standards
- Admin session tokens and cookie lifetimes must be set to 7 days (10,080 minutes) across backend (`sanctum.php`, `session.php`) and frontend (`adminAuthService.js`).
- All incoming requests must pass through `SecurityHeaders` middleware setting OWASP headers (`X-Frame-Options: SAMEORIGIN`, `X-Content-Type-Options: nosniff`, etc.).
- Authentication endpoints (`/api/login`, `/api/register`) must be throttled with `throttle:10,1`.
