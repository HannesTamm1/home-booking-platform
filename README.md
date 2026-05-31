# Home Booking Platform

An Airbnb-style short-term rental marketplace. Guests browse and book stays; hosts manage listings and track earnings; admins moderate content and resolve disputes.

**Stack:** Next.js 16 (App Router) · Laravel 13 · PostgreSQL · Sanctum token auth

---

## What you need

| Tool | Version |
|------|---------|
| Node.js | 20+ |
| PHP | 8.3+ |
| Composer | 2+ |
| PostgreSQL | 15+ |

---

## Quick start (5 minutes)

```bash
# 1. Clone
git clone <repo-url> && cd home-booking-platform

# 2. Install dependencies
make install
# or manually:
#   cd Backend && composer install
#   cd Frontend && npm install

# 3. Configure backend
cd Backend
cp .env.example .env
php artisan key:generate
# Edit .env — set DB_DATABASE, DB_USERNAME, DB_PASSWORD

# 4. Configure frontend
cd ../Frontend
cp .env.example .env.local   # contains BACKEND_URL=http://127.0.0.1:8000

# 5. Migrate + seed demo data
make seed
# or: cd Backend && php artisan migrate:fresh --seed

# 6. Start both servers
make dev
# or in two terminals:
#   cd Backend  && php artisan serve --host=127.0.0.1 --port=8000
#   cd Frontend && npm run dev
```

Open **http://127.0.0.1:3000**

---

## Environment variables

### Backend (`Backend/.env`)

| Variable | Required | Example | Notes |
|----------|----------|---------|-------|
| `DB_CONNECTION` | yes | `pgsql` | |
| `DB_HOST` | yes | `127.0.0.1` | |
| `DB_PORT` | yes | `5432` | |
| `DB_DATABASE` | yes | `home_booking_platform` | |
| `DB_USERNAME` | yes | `postgres` | |
| `DB_PASSWORD` | yes | `secret` | |
| `APP_KEY` | yes | generated | `php artisan key:generate` |
| `STRIPE_SECRET_KEY` | no | `sk_test_...` | Phase 3/4: real payments |
| `STRIPE_WEBHOOK_SECRET` | no | `whsec_...` | Stripe webhook verification |

### Frontend (`Frontend/.env.local`)

| Variable | Required | Example | Notes |
|----------|----------|---------|-------|
| `BACKEND_URL` | yes | `http://127.0.0.1:8000` | Laravel API base URL |

---

## Demo credentials

| Role | Email | Password |
|------|-------|----------|
| Guest | `user@example.com` | `password123` |
| Host | `renter@example.com` | `password123` |
| Admin | `admin@example.com` | `password123` |

---

## Useful commands

```bash
# Reset database to clean seed state
make seed                       # or: cd Backend && php artisan migrate:fresh --seed

# Type-check frontend
cd Frontend && npm run type-check

# Run e2e tests (requires servers running)
cd Frontend && npm run test:e2e

# View e2e report
cd Frontend && npm run test:e2e:report
```

---

## Project structure

```
home-booking-platform/
├── Backend/                 Laravel API
│   ├── app/
│   │   ├── Actions/         Business logic (CreateBooking, PaginateListings)
│   │   ├── Http/Controllers/Api/
│   │   ├── Models/          Eloquent models
│   │   └── Policies/        Authorization gates
│   ├── database/
│   │   ├── migrations/
│   │   ├── factories/
│   │   └── seeders/
│   └── routes/api.php
├── Frontend/                Next.js App Router
│   ├── app/
│   │   ├── (pages)/         Server Components (page.tsx)
│   │   ├── api/             Next.js API route handlers (proxy to Laravel)
│   │   ├── admin/           Admin section
│   │   └── host/            Host section
│   ├── components/          Shared UI
│   ├── lib/
│   │   ├── backend.ts       Typed fetch helpers + API types
│   │   └── auth-session.ts  Cookie-based session codec
│   └── e2e/                 Playwright tests
├── Makefile                 Convenience targets
└── RUNBOOK.md               Architecture + per-role walkthrough
```

---

See **RUNBOOK.md** for the full architecture, booking state machine, and per-role click-through verification guide.
