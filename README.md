# ShraddhaSetu

Production-ready Next.js booking platform for pandit/pooja services with role-based auth, booking lifecycle, admin workflows, cart/checkout, payments placeholder, and SEO routes.

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
- `NEXT_PUBLIC_SITE_URL` (public base URL, used in metadata/sitemap/robots)

Example:

```bash
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DB_NAME?sslmode=require"
AUTH_SECRET="replace-with-a-strong-random-secret"
AUTH_COOKIE_SECURE="true"
RAZORPAY_KEY_ID="rzp_test_placeholder"
RAZORPAY_KEY_SECRET="replace-me"
NEXT_PUBLIC_SITE_URL="https://your-domain.vercel.app"
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

## Seeded Accounts (from seed script)

- Admin: `admin@shraddhasetu.in / Admin@123`
- User: `user@shraddhasetu.in / User@123`
- Pandit: `pandit@shraddhasetu.in / Pandit@123`
