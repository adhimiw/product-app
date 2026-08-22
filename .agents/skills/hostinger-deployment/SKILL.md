---
name: hostinger-deployment
description: >-
  Step-by-step procedures and scripts for building and deploying Laravel backend,
  React frontend, database updates, and storage symlinks to Hostinger Cloud/cPanel servers.
---

# Hostinger Deployment Guide for Mangalam Healthy Foods

## 1. Remote Server & Credentials Reference
- **SSH Host**: `145.79.210.59`
- **SSH Port**: `65002`
- **SSH Username**: `u244089748`
- **SSH Password**: `Idlypoda@12`
- **Live Site URL**: `https://palegreen-dogfish-720166.hostingersite.com`
- **PHP 8.3 CLI Binary**: `/opt/alt/php83/usr/bin/php`
- **MySQL Database**: `u244089748_df` | User: `u244089748_df` | Pass: `idlypoDa@12`

## 2. Remote Directory Layout
```text
/home/u244089748/domains/palegreen-dogfish-720166.hostingersite.com/
├── laravel_app/         # Backend: app, config, database, routes, vendor, storage, .env
└── public_html/         # Web Root: index.php, .htaccess, Vite build assets (assets/, index.html)
    └── storage/         # Symlink -> ../laravel_app/storage/app/public
```

## 3. Storage Symlink Command
Ensure the symbolic link exists so images uploaded to `storage/app/public` are served via web:
```bash
ln -s /home/u244089748/domains/palegreen-dogfish-720166.hostingersite.com/laravel_app/storage/app/public /home/u244089748/domains/palegreen-dogfish-720166.hostingersite.com/public_html/storage
```

## 4. Reliable Deployment Workflow (Paramiko Base64 Chunked Transfer)
Direct SFTP connections can timeout on large folders. Use chunked streaming over SSH:

1. **Build Frontend**:
   ```bash
   npm run build
   ```
2. **Package Backend**:
   Archive `app/`, `routes/`, `config/`, `database/`, and `bootstrap/` into a `.tar.gz`.
3. **Stream & Extract Over SSH**:
   Use a Python helper script to encode into base64, send chunks over SSH shell, and pipe into `base64 -d | tar -xzf -` inside `/laravel_app`.
4. **Deploy Frontend Build**:
   Copy `dist/*` files into `/public_html`.
5. **Clear Laravel Cache**:
   ```bash
   /opt/alt/php83/usr/bin/php artisan config:clear
   /opt/alt/php83/usr/bin/php artisan route:clear
   /opt/alt/php83/usr/bin/php artisan view:clear
   ```
