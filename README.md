# ShraddhaSetu

Production-ready Next.js booking platform for pandit/pooja services with role-based auth, booking lifecycle, admin workflows, cart/checkout, Razorpay payment flow, WhatsApp notifications, and SEO routes.

## Stack

- Next.js 15 (App Router)
- Prisma ORM + Prisma Client
- Managed PostgreSQL (production-ready)

## Required Environment Variables

Use `.env.example` as the template.

- `DATABASE_URL` (PostgreSQL connection string)
- `AUTH_SECRET` (strong random secret for auth sessions)
- `AUTH_COOKIE_SECURE` (`true` on HTTPS production)
- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`
- `RAZORPAY_WEBHOOK_SECRET`
- `NEXT_PUBLIC_WHATSAPP_NUMBER` (for floating WhatsApp chat button)
- `WHATSAPP_ADMIN_PHONE` (for booking alerts)
- `WHATSAPP_API_URL` (optional)
- `WHATSAPP_API_TOKEN` (optional)
- `NEXT_PUBLIC_SITE_URL` (public base URL, used in metadata/sitemap/robots)
- `KUNDLI_API_PROVIDER` (`prokerala` recommended)
- `PROKERALA_CLIENT_ID` (server-side Prokerala OAuth client id)
- `PROKERALA_CLIENT_SECRET` (server-side Prokerala OAuth client secret)
- `KUNDLI_API_BASE_URL` (optional override, default: `https://api.prokerala.com/v2`)
- `KUNDLI_API_KEY` (optional, only for non-Prokerala providers)
- `OPENAI_API_KEY` (server-side key for AI Kundli interpretation)
- `KUNDLI_AI_PROVIDER` (`openai`)
- `OPENAI_MODEL` (example: `gpt-4o-mini`)

Example:

```bash
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DB_NAME?sslmode=require"
AUTH_SECRET="replace-with-a-strong-random-secret"
AUTH_COOKIE_SECURE="true"
RAZORPAY_KEY_ID="rzp_test_placeholder"
RAZORPAY_KEY_SECRET="replace-me"
RAZORPAY_WEBHOOK_SECRET="replace-with-webhook-secret"
NEXT_PUBLIC_WHATSAPP_NUMBER="919000000000"
WHATSAPP_ADMIN_PHONE="919000000000"
WHATSAPP_API_URL=""
WHATSAPP_API_TOKEN=""
NEXT_PUBLIC_SITE_URL="https://your-domain.vercel.app"
PROKERALA_CLIENT_ID=""
PROKERALA_CLIENT_SECRET=""
KUNDLI_API_PROVIDER="prokerala"
KUNDLI_API_BASE_URL="https://api.prokerala.com/v2"
KUNDLI_API_KEY=""
OPENAI_API_KEY=""
KUNDLI_AI_PROVIDER="openai"
OPENAI_MODEL="gpt-4o-mini"
```

## Local Development

1. Install dependencies:

```bash
npm install
```

2. Generate Prisma client:

```bash
npm run prisma:generate
```

3. Run migrations on your PostgreSQL database:

```bash
npm run prisma:migrate:dev
```

4. Seed sample data:

```bash
npm run db:seed
```

5. Start dev server:

```bash
npm run dev
```

## Seed Commands

- Dev/QA seed:

```bash
npm run db:seed
```

- Production seed (explicit opt-in guard):

```bash
npm run db:seed:prod
```

The seed script refuses to run in `NODE_ENV=production` unless one of these is used:

- `npm run db:seed:prod`
- `ALLOW_PROD_SEED=true node prisma/seed.js`

## Init Commands

- Initialize DB schema + seed for non-production:

```bash
npm run db:init
```

- Initialize DB schema + seed for production:

```bash
npm run db:init:prod
```

## Vercel Deployment Steps

### 1) Provision PostgreSQL

Use any managed PostgreSQL provider (Neon, Supabase, RDS, etc.) and copy its connection string.

### 2) Configure Vercel Project

1. Import this repository into Vercel.
2. Framework preset: Next.js.
3. Build command: `npm run vercel-build` (already set via `vercel.json`).

### 3) Set Environment Variables in Vercel

In Project Settings -> Environment Variables, set:

- `DATABASE_URL`
- `AUTH_SECRET`
- `AUTH_COOKIE_SECURE=true`
- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`
- `NEXT_PUBLIC_SITE_URL` (your production domain)

Apply these to Production (and Preview if needed).

### 4) Apply Database Migrations

After first deployment (or before go-live), run migrations against production DB:

```bash
npm run prisma:migrate:deploy
```

Run from CI, a secure admin machine, or a one-off job with production `DATABASE_URL`.

### 5) Seed Initial Data (Optional)

If you want starter cities/services/demo accounts in production:

```bash
npm run db:seed:prod
```

Only run once on a fresh environment unless you intend to reset data.

## Build / Production Check

```bash
npm install
npm run prisma:generate
npm run build
```

## Kundli API Setup

ShraddhaSetu includes server-side Kundli generation endpoints:

- `POST /api/kundli/generate`
- `POST /api/kundli/match` (future-ready structure for compatibility matching)

### Required Kundli env variables

```bash
PROKERALA_CLIENT_ID="your-prokerala-client-id"
PROKERALA_CLIENT_SECRET="your-prokerala-client-secret"
KUNDLI_API_PROVIDER="prokerala"
KUNDLI_API_BASE_URL="https://api.prokerala.com/v2"
OPENAI_API_KEY="your-openai-api-key"
KUNDLI_AI_PROVIDER="openai"
OPENAI_MODEL="gpt-4o-mini"
```

Notes:

- Keep `PROKERALA_CLIENT_ID` / `PROKERALA_CLIENT_SECRET` only in server environments (never in client code).
- Keep `OPENAI_API_KEY` only in server environments (never in client code).
- If Prokerala call fails, `/api/kundli/generate` returns a demo Kundli preview.
- If OpenAI key is missing or AI call fails, API returns real Prokerala Kundli data without AI explanation.
- API response includes explicit `mode`: `hybrid` (Prokerala + AI), `real` (Prokerala only), or `demo` (fallback).
- Latitude/longitude fields are hidden from UI; backend resolves coordinates from common city mapping and falls back to Ballia (`25.7585`, `84.1489`) when city is unknown.

### Prokerala setup steps

1. Create/login at [api.prokerala.com](https://api.prokerala.com/).
2. Create an app in your Prokerala API dashboard.
3. Copy `Client ID` and `Client Secret`.
4. Add these in Vercel Project Settings -> Environment Variables:
   - `PROKERALA_CLIENT_ID`
   - `PROKERALA_CLIENT_SECRET`
   - `KUNDLI_API_PROVIDER=prokerala`
   - `OPENAI_API_KEY`
   - `KUNDLI_AI_PROVIDER=openai`
   - `OPENAI_MODEL=gpt-4o-mini`
5. Redeploy the project.

### OpenAI key setup steps

1. Open [OpenAI API keys](https://platform.openai.com/api-keys) and create a secret key.
2. In Vercel Project Settings -> Environment Variables, set:
   - `OPENAI_API_KEY`
   - `KUNDLI_AI_PROVIDER=openai`
   - `OPENAI_MODEL=gpt-4o-mini`
3. Redeploy.

## Production SEO Checklist

Use this checklist before and after every production deployment.

1. Verify sitemap URL is reachable:

```bash
curl -I https://your-domain/sitemap.xml
```

Expected: `200 OK`

2. Verify robots.txt is reachable:

```bash
curl -I https://your-domain/robots.txt
```

Expected: `200 OK`

3. Verify robots.txt contains host + sitemap:

- `Host: https://your-domain`
- `Sitemap: https://your-domain/sitemap.xml`

4. Confirm `NEXT_PUBLIC_SITE_URL` is set correctly in Vercel:

- Must be your canonical production URL (no trailing slash), for example:
  - `NEXT_PUBLIC_SITE_URL=https://shraddhasetu-six.vercel.app`
- This value is used by:
  - `app/sitemap.js`
  - `app/robots.js`
  - page metadata canonical base

5. Confirm sitemap includes all key page types:

- city pages: `/cities/<city-slug>`
- puja pages: `/services/<puja-slug>`
- city+puja pages: `/cities/<city-slug>/<puja-slug>`

Quick manual checks:

- open `https://your-domain/sitemap.xml`
- search for:
  - `/cities/mumbai`
  - `/services/navratri-puja`
  - `/cities/mumbai/navratri-puja`

6. Google Search Console setup steps:

1. Go to [Google Search Console](https://search.google.com/search-console).
2. Add property:
   - preferred: `Domain` property (covers all protocols/subdomains), or
   - `URL prefix` property for your exact production URL.
3. Verify ownership (DNS TXT for Domain property is recommended).
4. Open `Sitemaps` and submit:
   - `https://your-domain/sitemap.xml`
5. Open `URL Inspection` and request indexing for:
   - homepage
   - one city page
   - one puja page
   - one city+puja page
6. Monitor `Pages` and `Sitemaps` reports for crawl/index issues.

## Android App Readiness

- API-first mobile wrappers are available under `/api/mobile/*`.
- Route documentation: `docs/mobile-api.md`

## Seeded Accounts (from seed script)

- Admin: `admin@shraddhasetu.in / Admin@123`
- User: `user@shraddhasetu.in / User@123`
- Pandit: `pandit@shraddhasetu.in / Pandit@123`
