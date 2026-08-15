# Deployment Guide — Mangalam Healthy Foods

Full stack: React storefront + Django API + OpenWA WhatsApp gateway.
Every order placed on the site is saved in Django and forwarded as a WhatsApp
message to the shop owner's phone.

```
Customer browser
      |
      v
Vercel ── serves React frontend (dist/)
      └── runs Django as serverless functions (/api/*, /admin/*)
                 |
                 v  HTTPS (public URL required)
        OpenWA gateway (Docker, always-on host)
                 |
                 v  linked via QR scan
        Owner's WhatsApp phone
```

Vercel hosts the frontend and Django (both defined in `vercel.json`).
OpenWA **cannot** run on Vercel — a WhatsApp session is a persistent,
always-connected process — so it lives on any always-on machine
(VPS, home server, Raspberry Pi) that Vercel's functions can reach over HTTPS.

---

## Part 1 — OpenWA gateway (always-on host)

### 1.1 Install and start

```bash
# On the VPS / always-on machine
git clone https://github.com/rmyndharis/OpenWA.git
cd OpenWA
docker compose -f docker-compose.dev.yml up -d      # simple single-container setup
# or: docker compose up -d                          # full production stack
```

- Dashboard + API serve on port **2785**.
- Session data persists in `./data` (mounted into the container). Back this
  folder up — losing it means re-scanning the QR.

### 1.2 Get the API key

OpenWA generates an admin API key on first boot and prints it in the logs:

```bash
docker logs openwa-api 2>&1 | grep -m1 -A1 "API Key"
# -> owa_k1_...
```

This key logs you into the dashboard and authorizes all REST calls
(`X-API-Key` header).

### 1.3 Create the WhatsApp session and scan the QR

Via dashboard (easiest):

1. Open `http://<host>:2785`, log in with the API key.
2. Create a session (any name), press **Start** — a QR code appears.
3. On the phone that will SEND the messages:
   WhatsApp → **Settings → Linked Devices → Link a Device** → scan the QR.
4. Session status becomes `ready`.

Or via API:

```bash
BASE=http://localhost:2785
K=owa_k1_yourkey

# create + start
curl -s -X POST "$BASE/api/sessions" -H "X-API-Key: $K" \
  -H "Content-Type: application/json" -d '{"name":"default"}'
# note the returned "id" (a UUID) — you need it later
curl -s -X POST "$BASE/api/sessions/<uuid>/start" -H "X-API-Key: $K"
# then scan the QR from the dashboard session page
```

> **Important:** API routes identify sessions by their **UUID**, not their
> name. `GET /api/sessions` lists them if you lose the UUID.

### 1.4 Expose it publicly (HTTPS)

Vercel's Django functions must reach the gateway. Options:

- **VPS with a domain**: put OpenWA behind a reverse proxy
  (Caddy/nginx) with TLS, e.g. `https://wa.yourdomain.com` → `localhost:2785`.
- **Home machine**: use a Cloudflare Tunnel
  (`cloudflared tunnel --url http://localhost:2785`) and use the generated
  HTTPS URL.

Never expose port 2785 raw over plain HTTP to the internet — the API key
would travel unencrypted.

---

## Part 2 — Vercel (frontend + Django API)

`vercel.json` is already configured: static build of the React app plus
`@vercel/python` for Django. Routes `/api/*` and `/admin/*` go to Django;
everything else serves the SPA.

### 2.1 Database — required change for production

Serverless filesystems are ephemeral: **SQLite will not persist on Vercel.**
Provision a free Postgres (Neon, Supabase, or Vercel Postgres) and set
`DATABASE_URL`. `backend/config/settings.py` already reads it.

Migrate and create the admin user against the production database once,
from your local machine:

```bash
cd backend
DATABASE_URL=postgres://... venv/bin/python manage.py migrate
DATABASE_URL=postgres://... venv/bin/python manage.py createsuperuser
```

### 2.2 Environment variables (Vercel project settings)

| Variable | Value |
| --- | --- |
| `SECRET_KEY` | generate: `python -c "from django.core.management.utils import get_random_secret_key as k; print(k())"` |
| `DEBUG` | `False` |
| `ALLOWED_HOSTS` | `your-project.vercel.app,yourdomain.com` |
| `CORS_ALLOWED_ORIGINS` | `https://yourdomain.com` (scheme + host of the frontend) |
| `CSRF_TRUSTED_ORIGINS` | `https://yourdomain.com` (needed for /admin login) |
| `DATABASE_URL` | `postgres://user:pass@host:5432/dbname` |

### 2.3 Deploy

```bash
# from the repo root — or just connect the GitHub repo in the Vercel dashboard
npx vercel --prod
```

The frontend auto-detects its API base: on localhost it calls
`http://localhost:8000`, on any deployed domain it calls the same origin
(`/api/...`), which `vercel.json` routes to Django. No frontend env needed.

---

## Part 3 — Wire them together (SiteConfig)

All WhatsApp settings live in one database row, editable in Django admin.

1. Open `https://<your-domain>/admin/` and log in.
2. Go to **Site configs** → the single row.
3. Set:

| Field | Value |
| --- | --- |
| Owner whatsapp number | where orders arrive — digits with country code, e.g. `9198XXXXXXXX` |
| Openwa api url | public gateway URL, e.g. `https://wa.yourdomain.com` (no trailing slash needed) |
| Openwa api key | the `owa_k1_...` key from step 1.2 |
| Openwa session id | the session **UUID** from step 1.3 |

> The **sender** (the phone that scanned the QR) and the **receiver**
> (owner number) should be different numbers in production. Sending to the
> session's own number works but OpenWA reports a false error on it (see
> troubleshooting).

---

## Part 4 — Local development

```bash
# Terminal 1 — OpenWA
cd OpenWA && docker compose -f docker-compose.dev.yml up -d

# Terminal 2 — Django (http://localhost:8000)
cd backend && venv/bin/python manage.py runserver

# Terminal 3 — frontend (Vite, http://localhost:517x)
npm run dev
```

Local SiteConfig can point at `http://localhost:2785`. CORS is open when
`DEBUG=True`.

---

## Part 5 — End-to-end test checklist

1. Open the deployed site → add a product to the cart.
2. Cart drawer opens → **Secure Checkout** → fill name, mobile, address.
3. (Optional) apply a coupon — codes are managed in Django admin → Coupons.
4. **Buy & Send to WhatsApp** → success screen appears.
5. Order summary arrives on the owner's WhatsApp within seconds.
6. Django admin → **Orders**: row exists, `Whatsapp sent` is ticked.
   If not, the `Whatsapp error` column contains the exact failure reason.

---

## Troubleshooting

| Symptom | Cause / fix |
| --- | --- |
| `Whatsapp error: 401 API key is required` | Wrong or missing key in SiteConfig. Re-copy from `docker logs openwa-api`. |
| `400` on send, session route | SiteConfig has the session *name*; routes need the **UUID**. |
| `500 Internal server error` but the message still arrives | Owner number equals the sender phone (self-send). Harmless quirk of the WhatsApp engine; use a different receiver number and it reports success correctly. |
| Orders save but no message, error mentions timeout | Gateway URL unreachable from Vercel. Must be public HTTPS, not `localhost`. |
| Session shows `disconnected` | Phone lost internet or was unlinked. Re-open dashboard, restart session, re-scan QR if asked. |
| Everything works locally, admin login fails on Vercel | Missing `CSRF_TRUSTED_ORIGINS`. |
| Data disappears after redeploy | Still on SQLite. Set `DATABASE_URL` (Part 2.1). |
| Coupon rejected unexpectedly | Check active flag / min order value in admin → Coupons. |

---

## Operational notes

- **WhatsApp send is synchronous** in the order request (adds ~2-4 s to
  checkout). Fine at current volume; move to a background task if it grows.
- **OpenWA updates**: `cd OpenWA && git pull && docker compose up -d --build`.
  Session survives updates as long as `./data` is intact.
- **Key rotation**: create a new API key in the OpenWA dashboard, update
  SiteConfig, then delete the old key.
- The API validates prices server-side — the totals sent by the browser are
  ignored and recomputed from the product table, so tampered carts are safe.
