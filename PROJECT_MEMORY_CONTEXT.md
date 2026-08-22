# 🧠 Antigravity Persistent Project Memory & Context Documentation

> **Project Name:** Mangalam Healthy Foods (Amutham Sprouted Health Mix)  
> **Last System Synchronization:** 2026-08-22  
> **Environment:** Production (Hostinger Cloud) & Local Windows Monorepo  

---

## 1. 🏗️ Repository & Architecture Sitemap

### Repositories
- **Primary Monorepo**: `C:\Users\Admin\Documents\Projects\MANGALAM-HEALTHY-FOODS-main` (`adhimiw/MANGALAM-HEALTHY-FOODS`)
- **Backend API Repository**: `C:\Users\Admin\Documents\Projects\HealthMixApi (BackEnd)\HealthMixApi` (`adhimiw/HealthMixApi`)
- **Frontend App Repository**: `C:\Users\Admin\Documents\Projects\product-app FrontEnd\product-app` (`adhimiw/product-app`)

### Tech Stack
- **Frontend**: React 18, Vite 8, Lucide Icons, `Plus Jakarta Sans` typography, CSS Design System (`src/admin/admin.css`, `src/index.css`).
- **Backend**: Laravel 11 API Framework, Sanctum Authentication, OWASP Security Headers Middleware.
- **Database**: MySQL (`u244089748_df`).

---

## 2. 🚀 Hostinger Production Environment Specifications

- **Server IP / Host**: `145.79.210.59` (Port: `65002`)
- **SSH Username**: `u244089748`
- **SSH Password**: `Idlypoda@12`
- **Live Site URL**: `https://palegreen-dogfish-720166.hostingersite.com`
- **PHP 8.3 CLI Binary**: `/opt/alt/php83/usr/bin/php`
- **Remote Paths**:
  - **Laravel Application Directory**: `/home/u244089748/domains/palegreen-dogfish-720166.hostingersite.com/laravel_app`
  - **Public Web Root**: `/home/u244089748/domains/palegreen-dogfish-720166.hostingersite.com/public_html`
  - **Storage Symbolic Link**: `/public_html/storage` -> `/laravel_app/storage/app/public` (Created via `ln -s`)

### Production MySQL Database
- **Database Name**: `u244089748_df`
- **DB User**: `u244089748_df`
- **DB Password**: `idlypoDa@12`

---

## 3. 🔒 Security & Session Configuration

1. **1-Week Admin Session & Token Lifetime**:
   - `backend/config/sanctum.php`: `'expiration' => 10080` (7 days / 10,080 minutes).
   - `backend/config/session.php`: `'lifetime' => 10080` (7 days / 10,080 minutes).
   - `src/admin/services/adminAuthService.js`: Enforces 7-day client validity window (`7 * 24 * 60 * 60 * 1000` ms).

2. **OWASP HTTP Security Headers Middleware (`App\Http\Middleware\SecurityHeaders.php`)**:
   - `X-Frame-Options: SAMEORIGIN` (prevents clickjacking)
   - `X-Content-Type-Options: nosniff` (prevents MIME sniffing)
   - `X-XSS-Protection: 1; mode=block` (browser XSS filter)
   - `Referrer-Policy: strict-origin-when-cross-origin`
   - `Permissions-Policy: camera=(), microphone=(), geolocation=()`
   - Registered globally in `backend/bootstrap/app.php`.

3. **Brute-Force Protection (`backend/routes/api.php`)**:
   - Wrapped `/api/login` and `/api/register` with `throttle:10,1` (10 requests/min limit).

4. **Mass Assignment Protection**:
   - Models (`User.php`, `Category.php`, `Product.php`) enforce strict `$fillable` & `$casts`.

---

## 4. 🎨 Admin Panel UI & Modal Features

1. **Add Product Modal Clean Initial State**:
   - `handleOpenAddModal()` starts with clean inputs (`variant_images: []`, `images: []`, `tags: []`, `actual_price: ""`).

2. **Modal Step Navigation Bar**:
   - Styled with `Plus Jakarta Sans` typography, step badges (`1`, `2`, `3`), clean spacing (`8px 16px`), and active highlight states.

3. **Variant Images & Gallery Reorder Controls**:
   - Overlay actions: Move Left (`←`), Move Right (`→`), View Full (`👁️`), Replace Image (`✏️`), Remove (`🗑️`).

4. **Rich Text Editor Component (`RichTextEditor`)**:
   - Upgraded with Lucide SVG Icons (`Bold`, `Italic`, `Underline`, `Strikethrough`, `Heading3`, `Type`, `List`, `ListOrdered`, `Eraser`).
   - Active state highlighting (`document.queryCommandState`).
   - Border focus glow & clean spacing.

5. **Sticky Modal Footer Actions**:
   - Fixed sticky at bottom of modal card.
   - Buttons: `Cancel` (`<X size={15} />`), `Next Step` (`<ArrowRight size={15} />`), `Save & Publish Product` (`<CheckCircle2 size={16} />`).

---

## 5. ⚡ Deployment Automation

- **Fast Base64 Gzip Chunked Upload Script**: `scratch/upload_vendor_chunked.py`
  - Compresses frontend JS/CSS bundles and uploads via base64 chunking over SSH to bypass SFTP dropouts.

---

## 6. 📝 Recommended Antigravity Command

To persist key corrections and rules across future agent sessions, use the `/learn` slash command:
> Type `/learn` in chat to record project rules and hostinger configs into permanent memory.
