# Mangalam Healthy Foods — Complete Deployment Plan

**Prepared:** 2026-08-02 · **Target:** Production (Vercel + Postgres + OpenWA)
**Source project:** `C:\Users\Admin\Documents\Projects\MANGALAM-HEALTHY-FOODS-main`

---

## 1. Target Architecture

```
Customer browser
      │
      ▼
Vercel (edge) ── serves React storefront (dist/)
      └── Django as serverless functions (/api/*, /admin/*, /static/admin/*)
                 │
                 ▼ HTTPS
        OpenWA gateway (Docker on an always-on host)
                 │
                 ▼ linked via QR
        Owner's WhatsApp phone  ──►  order alerts
```

- **Frontend:** Vite + React (already configured via `vercel.json` static build)
- **Backend:** Django REST + whitenoise, serverless via `@vercel/python`
- **DB:** PostgreSQL (SQLite does NOT persist on Vercel — mandatory change)
- **WhatsApp:** OpenWA gateway (Docker, persistent session — cannot run on Vercel)
- **Admin panel:** Django admin at `/admin/` (the separate `admin/` React app is dev-only, not part of the Vercel build)

---

## 2. Preflight Checklist (do these first)

| Item | Status | Notes |
|---|---|---|
| Vercel account + CLI (`npx vercel login`) | ☐ | Free tier fine |
| GitHub repo (or push directly via CLI) | ☐ | **Project has no `.git` yet — must init** |
| Neon / Supabase / Vercel Postgres account | ☐ | Free tier fine; get `DATABASE_URL` |
| Domain for production site (optional) | ☐ | Needed for `ALLOWED_HOSTS`/CORS; vercel.app works to start |
| Always-on host for OpenWA | ☐ | This Windows machine (Docker always up) + Cloudflare Tunnel, or a VPS |
| Cloudflare account (for tunnel, if home-hosting) | ☐ | Free |
| Owner WhatsApp number (country code, no `+`) | ☐ | e.g. `9198XXXXXXXX` — receiver ≠ sender phone in prod |

---

## 3. Phase 0 — Local repo hygiene

```powershell
cd C:\Users\Admin\Documents\Projects\MANGALAM-HEALTHY-FOODS-main

# 1. Make sure local build passes before anything else
npm run build          # runs vite build + prerender postbuild

# 2. Init git (project has NO repo yet)
git init
git add -A
git commit -m "init: mangalam healthy foods"
git branch -M main

# 3. Create GitHub repo and push (or skip if deploying via CLI --yes)
gh repo create mangalam-healthy-foods --private --source . --push
```

> `.gitignore` already excludes `node_modules`, `backend/venv`, `dist`, `db.sqlite3`. Verify `backend/db.sqlite3` and `OpenWA/` are ignored — **never commit the local SQLite dev DB or the OpenWA session data.**

---

## 4. Phase 1 — Provision PostgreSQL

1. Create a Neon (or Supabase) project → get connection string:
   `postgres://user:password@host:5432/neondb?sslmode=require`
2. Store it — you'll need it in Phase 3 and Phase 4.

---

## 5. Phase 2 — OpenWA WhatsApp gateway (always-on host)

### Option A (recommended for now): this machine + Cloudflare Tunnel
Docker is already running on this box, so the gateway can live here.

```powershell
# 1. Start OpenWA (repo already cloned at .\OpenWA)
cd C:\Users\Admin\Documents\Projects\MANGALAM-HEALTHY-FOODS-main\OpenWA
docker compose -f docker-compose.dev.yml up -d

# 2. Grab the admin API key from logs
docker logs openwa-api 2>&1 | Select-String "API Key"   # -> owa_k1_...
```

3. Open `http://localhost:2785`, log in with the key → create session (any name, e.g. `mangalam`) → **Start** → scan QR with WhatsApp → Settings → Linked Devices → Link a Device.
4. Get the session **UUID** (not the name): `GET /api/sessions` with `X-API-Key` header, or the dashboard session page URL.
5. Expose over HTTPS (never raw HTTP — API key would leak):

```powershell
# Cloudflare Tunnel (quick, free, no open ports)
cloudflared tunnel --url http://localhost:2785
# -> gives https://xxxx.trycloudflare.com  (use this as OPENWA_API_URL)
```

> ⚠️ If the machine reboots, `docker compose up` needs to restart automatically — set Docker Desktop → Settings → "Start Docker when you sign in" + restart policy `unless-stopped` on the container, or run `cloudflared` as a scheduled task/service.
>
> **Long-term:** a small VPS (₹300–500/mo) with Caddy reverse proxy + TLS is more reliable than a home tunnel. Session survives both as long as `./data` is backed up.

### Option B: VPS (recommended long-term)
```bash
git clone https://github.com/rmyndharis/OpenWA.git && cd OpenWA
docker compose -f docker-compose.dev.yml up -d
# reverse proxy: https://wa.yourdomain.com -> localhost:2785 (Caddy/nginx + TLS)
```

---

## 6. Phase 3 — Deploy to Vercel

```powershell
cd C:\Users\Admin\Documents\Projects\MANGALAM-HEALTHY-FOODS-main

npx vercel login
npx vercel --prod          # first run: link/create project, detect settings from vercel.json
```

`vercel.json` is already correct (static build + `@vercel/python` for Django, routes for `/api/*`, `/admin/*`, `/static/*`).

### Environment variables (Vercel project → Settings → Environment Variables)

| Variable | Value | Why |
|---|---|---|
| `SECRET_KEY` | `python -c "from django.core.management.utils import get_random_secret_key as k; print(k())"` | Django secret |
| `DEBUG` | `False` | prod |
| `ALLOWED_HOSTS` | `mangalam-healthy-foods.vercel.app,yourdomain.com` | host allowlist |
| `CORS_ALLOWED_ORIGINS` | `https://mangalam-healthy-foods.vercel.app` | frontend origin |
| `CSRF_TRUSTED_ORIGINS` | `https://mangalam-healthy-foods.vercel.app` | `/admin` login works |
| `DATABASE_URL` | Neon connection string | prod DB |

Add to **Production** (and Preview if wanted). Redeploy after setting:
```powershell
npx vercel --prod
```

---

## 7. Phase 4 — Migrate prod DB + create admin (one time, from local machine)

```powershell
cd C:\Users\Admin\Documents\Projects\MANGALAM-HEALTHY-FOODS-main\backend

# venv
python -m venv venv
venv\Scripts\pip install -r requirements.txt

$env:DATABASE_URL = "postgres://user:password@host:5432/neondb?sslmode=require"
venv\Scripts\python manage.py migrate
venv\Scripts\python manage.py createsuperuser    # e.g. admin / strong-password
```

---

## 8. Phase 5 — Wire SiteConfig (the single source of truth)

1. Open `https://<your-domain>/admin/` → log in (user from Phase 4).
2. **Site configs** → the single row:

| Field | Value |
|---|---|
| Owner whatsapp number | `9198XXXXXXXX` (receiver; must differ from the sender phone) |
| Openwa api url | `https://xxxx.trycloudflare.com` (or `https://wa.yourdomain.com`) |
| Openwa api key | `owa_k1_...` from Phase 2 step 2 |
| Openwa session id | session **UUID** from Phase 2 step 4 |

3. Check **Coupons** exist / active flags as desired. Products are managed here too.

---

## 9. Phase 6 — End-to-end test checklist

1. ☐ Deployed site loads, products visible from DB
2. ☐ Add to cart → drawer opens → Secure Checkout → name/mobile/address
3. ☐ Apply a coupon → discount applied correctly
4. ☐ Buy & Send to WhatsApp → success screen
5. ☐ Order summary arrives on owner's WhatsApp (≤ a few seconds)
6. ☐ Django admin → Orders: row exists, `Whatsapp sent` ticked (else check `Whatsapp error` column)
7. ☐ `/admin/` login works on the deployed domain (CSRF ok)
8. ☐ Redeploy once more → data still present (proves Postgres, not SQLite)

---

## 10. Operations (post-launch)

- **Backups:** Neon auto-backups; also export SiteConfig row occasionally. Back up OpenWA `./data` folder (losing it = re-scan QR).
- **OpenWA updates:** `cd OpenWA && git pull && docker compose up -d --build` — session survives if `./data` intact.
- **Key rotation:** new key in OpenWA dashboard → update SiteConfig → delete old key.
- **Monitoring:** check OpenWA session status (`/api/sessions`); if `disconnected`, restart session / re-link phone.
- **Rollback:** `vercel rollback` (Vercel dashboard) to previous deployment — DB is untouched, so it's safe.
- **Scale note:** WhatsApp send is synchronous in the order request (+2–4 s). Fine at current volume; move to Celery/queue if traffic grows.
- **Security:** never expose port 2785 raw; keep `DEBUG=False`; rotate SECRET_KEY if ever leaked; API validates prices server-side (tampered carts ignored).

---

## 11. Open decisions (need your input before executing)

1. **Hosting for OpenWA:** this machine + Cloudflare tunnel (start now) vs VPS (long-term)? I'd do machine + tunnel now, VPS later.
2. **Domain:** custom domain or `*.vercel.app` for launch?
3. **Postgres provider:** Neon vs Supabase vs Vercel Postgres (all free; I'd take Neon — simplest).
4. **GitHub:** create private repo `mangalam-healthy-foods` and push?
5. **Owner WhatsApp number** and which phone links the QR (sender ≠ receiver).

Answer these and I can execute the whole thing end-to-end.
