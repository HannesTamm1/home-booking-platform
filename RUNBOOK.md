# RUNBOOK — Home Booking Platform

> Architecture overview · Booking state machine · Environment setup · Demo credentials · Per-role click-through checklist

---

## Architecture overview

```
Browser
  │
  ▼
Next.js 16 (App Router)          http://127.0.0.1:3000
  ├── Server Components            fetch data at render time
  ├── Client Components            interactive islands
  └── /app/api/ routes             thin proxies to Laravel (attach Bearer token)
          │
          │  HTTP JSON (Bearer token via Authorization header)
          ▼
Laravel 13 API                   http://127.0.0.1:8000
  ├── Sanctum token auth           stateless, tokens in personal_access_tokens
  ├── Policy-based authorization   ListingPolicy, BookingPolicy
  ├── Actions/                     CreateBooking (concurrency-safe), PaginateListings
  └── PostgreSQL 15
        ├── users
        ├── listings + listing_photos + calendar_days
        ├── bookings
        ├── disputes
        ├── host_applications
        └── idempotency_keys
```

**Auth flow:**
1. Frontend POSTs credentials to `/api/auth/login` (proxied to Laravel).
2. Laravel returns a Sanctum token.
3. Next.js API route stores `{ id, name, email, role, token }` as a base64url-encoded `httpOnly` cookie.
4. Every subsequent server-side fetch reads this cookie and forwards `Authorization: Bearer <token>`.
5. All `/app/api/` proxy routes do the same from client-side fetches.

**Session cookie name:** `airstay_user`

---

## Booking state machine

```
Guest selects dates & clicks Reserve
              │
              ▼
        CONFIRMED ──── Guest cancels ──────► CANCELLED
              │
              │  Check-in date passes
              ▼
        (payout released)
              │
              │  After checkout date
              ▼
         COMPLETED
              │
              │  Dispute opened
              ▼
   (dispute record created, status = open)
              │
              │  Admin resolves
              ▼
         REFUNDED  ─── or stays COMPLETED (side with host)
```

**Booking statuses in DB:**

| Status | Meaning |
|--------|---------|
| `confirmed` | Booking active, nights held |
| `cancelled` | Cancelled by guest or host |
| `refunded` | Dispute resolved in guest's favour |
| `pending` | (seed only — legacy) |

**Listing statuses:**

| Status | Visible to guests | Action |
|--------|-------------------|--------|
| `draft` | No | Host created, not submitted |
| `pending_review` | No | Submitted, waiting admin |
| `published` | Yes | Admin approved |
| `rejected` | No | Admin rejected — host can re-submit |
| `suspended` | No | Admin unpublished |

**Dispute statuses:** `open` → `resolved`

**Dispute resolutions:** `refund_guest` · `side_with_host` · `partial`

---

## Running the app

```bash
# Install everything
make install

# Migrate + seed demo data
make seed

# Start backend (:8000) + frontend (:3000) together
make dev

# Or separately:
cd Backend && php artisan serve --host=127.0.0.1 --port=8000
cd Frontend && npm run dev
```

---

## Running tests

```bash
# TypeScript type-check (no servers needed)
cd Frontend && npm run type-check

# Playwright e2e (needs both servers running)
cd Frontend && npm run test:e2e

# Interactive Playwright UI
cd Frontend && npm run test:e2e:ui

# View last HTML report
cd Frontend && npm run test:e2e:report
```

**E2E test files:**

| File | What it covers |
|------|---------------|
| `e2e/01-guest-books.spec.ts` | Home → listing → checkout → trips → host sees booking → admin sees booking |
| `e2e/02-cancellation.spec.ts` | Book → cancel → nights re-bookable |
| `e2e/03-auth-isolation.spec.ts` | Cross-user data isolation, role gates, suspended user login blocked |

---

## Resetting demo data

```bash
make seed
# = cd Backend && php artisan migrate:fresh --seed
```

This drops all tables, re-runs migrations, and seeds fresh demo data every time.

---

## Demo credentials

| Role | Email | Password | Start at |
|------|-------|----------|----------|
| Guest | `user@example.com` | `password123` | `http://127.0.0.1:3000` |
| Host | `renter@example.com` | `password123` | `http://127.0.0.1:3000` |
| Admin | `admin@example.com` | `password123` | `http://127.0.0.1:3000/admin` |

---

## Per-role click-through checklist

Work through each section after `make seed` + `make dev`. Everything listed is wired to real data.

---

### Guest role (`user@example.com`)

**Search & browse**
- [ ] Open `http://127.0.0.1:3000` — listings grid loads with "X stays found"
- [ ] Change destination dropdown → results filter to that city
- [ ] Pick check-in / check-out dates → "N nights selected" pill appears; grid shows only available listings
- [ ] Click a listing card → detail page opens with title, photo area, amenities chips, capacity, rating
- [ ] Scroll to sticky booking panel on detail page → price breakdown shows correct total

**Booking**
- [ ] Without logging in, click "Reserve" → redirected to `/login?redirect=...`
- [ ] Log in as guest → returned to listing detail
- [ ] Select dates and click "Reserve" → `/checkout` page shows dates + price breakdown
- [ ] Click "Confirm reservation" → redirected to `/bookings/<id>/confirmation`
- [ ] Confirmation page shows "Confirmed" badge, listing title, dates, total

**Trips & cancellation**
- [ ] Navigate to `/trips` (or "Trips" nav link) → booking appears under upcoming
- [ ] Click "Cancel stay" → "Tap again to confirm" prompt → confirm → status changes to cancelled
- [ ] Cancelled booking no longer blocks those dates (re-search to verify)

**Become a host**
- [ ] Click "Become a host" in nav → `/become-a-host` upgrade page
- [ ] Click "Get started as a host" → role upgrades to host, redirected to `/host/listings`

---

### Host role (`renter@example.com`)

**Dashboard**
- [ ] Click "Host dashboard" in nav → `/host` dashboard
- [ ] KPIs show: Revenue this month, Occupancy %, Upcoming stays count, Average rating
- [ ] Upcoming stays list shows next confirmed bookings with dates + revenue

**Listings management**
- [ ] Click "Listings" in host nav → `/host/listings`
- [ ] All own listings shown with status badges (Published / Draft / In review)
- [ ] Published listing has an "Edit" button and a "Calendar" button
- [ ] Click "+ New listing" → multi-step composer opens
  - Step 1: Select "Apartment"
  - Step 2: Select "Tallinn"
  - Step 3: Set 2 guests, 1 bedroom
  - Step 4: Toggle "WiFi" and "Kitchen"
  - Step 5: Enter a photo URL (e.g. `https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800`)
  - Step 6: Title "Test Loft" · Description (min 20 chars)
  - Step 7: Price €95
  - Step 8: Instant booking
  - Click "Submit for review" → redirected back to listings with "In review" badge

**Calendar**
- [ ] Click "Calendar" on a published listing → monthly grid
- [ ] Confirmed bookings show in red as "booked" (cannot click)
- [ ] Click an available future date → turns grey "blocked"
- [ ] Click again → unblocks, turns back to available
- [ ] Month navigation → Prev/Next cycles through months

**Earnings**
- [ ] Click "Earnings" in host nav → `/host/earnings`
- [ ] KPIs: Total earned, Released, Pending release, Platform fees paid
- [ ] Monthly bar chart shows last 12 months
- [ ] Per-listing table shows bookings count, gross revenue, host payout
- [ ] "Connect Stripe" banner visible (not connected yet) → click it → banner replaced by ✓ confirmation

**Reservations**
- [ ] Click "Reservations" → `/host/bookings`
- [ ] Table grouped: Upcoming / Past stays / Cancelled
- [ ] Each row shows listing, dates, revenue, status badge

---

### Admin role (`admin@example.com`)

**Overview**
- [ ] Open `http://127.0.0.1:3000/admin` or click "Admin" nav link
- [ ] KPIs: Active users, Live listings, Pending review (amber if >0), Open disputes (amber if >0), GMV this month
- [ ] 7-day bar chart renders (may all be 0 for fresh seed)
- [ ] If pending listings exist: amber alert card with link to moderation queue

**Listing moderation**
- [ ] Click "Moderation" → `/admin/listings`
- [ ] Any listings in pending_review state shown with price-outlier flag if applicable
- [ ] Submit the "Test Loft" created in host walkthrough if you haven't already
- [ ] Approve it → disappears from queue; guest search now shows it
- [ ] Create another listing and reject it → host sees "Rejected" badge, can re-submit

**Bookings**
- [ ] Click "Bookings" → `/admin/bookings`
- [ ] All bookings visible in paginated table
- [ ] Filter by status "confirmed" → only confirmed rows
- [ ] Search by guest email → filters rows

**Disputes**
- [ ] Click "Disputes" → `/admin/disputes`
- [ ] If no disputes: "No open disputes" empty state
- [ ] To create a test dispute: use API directly or the "Dispute" link from `/admin/bookings`
- [ ] Open dispute shows expandable card; select "Full refund to guest" + note → "Confirm resolution"
- [ ] Dispute moves to Resolved section; booking status becomes "refunded"

**Users**
- [ ] Click "Users" → `/admin/users`
- [ ] All users in table with role badges, booking count, listing count
- [ ] Search "renter" → finds `renter@example.com`
- [ ] Click "Suspend" on a guest → status badge changes to "Suspended"
- [ ] Try logging in as that guest in another tab → 403 "account suspended"
- [ ] Click "Reinstate" → guest can log in again

**Host applications**
- [ ] Click "Host apps" → `/admin/host-applications`
- [ ] Any pending host applications shown for approval/rejection

---

## API quick reference

### Public

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/listings` | Published listings (paginated, filterable) |
| `GET` | `/api/listings/{id}` | Single listing detail |
| `GET` | `/api/listings/{id}/availability` | Booked + blocked date ranges |
| `POST` | `/api/auth/login` | Get token (10/min rate limit) |
| `POST` | `/api/auth/register` | Create account (10/min rate limit) |

### Guest (Bearer token)

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/listings/{id}/bookings` | Create booking (20/min rate limit) |
| `GET` | `/api/user/bookings` | Own bookings |
| `DELETE` | `/api/user/bookings/{id}` | Cancel booking |
| `POST` | `/api/user/become-host` | Upgrade role to host |

### Host (Bearer token, role=host)

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/host/dashboard` | KPIs |
| `GET` | `/api/host/earnings` | Earnings breakdown |
| `GET` | `/api/host/listings` | Own listings (all statuses) |
| `POST` | `/api/listings` | Create listing (→ draft) |
| `PUT` | `/api/listings/{id}` | Update listing |
| `POST` | `/api/listings/{id}/submit` | Submit for review |
| `DELETE` | `/api/listings/{id}` | Delete listing |
| `GET` | `/api/host/listings/{id}/calendar` | Monthly calendar data |
| `POST` | `/api/host/listings/{id}/calendar/toggle-block` | Block/unblock a date |

### Admin (Bearer token, role=admin)

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/admin/overview` | Platform KPIs |
| `GET` | `/api/admin/listings` | Moderation queue |
| `PATCH` | `/api/admin/listings/{id}/approve` | Approve listing |
| `PATCH` | `/api/admin/listings/{id}/reject` | Reject listing |
| `PATCH` | `/api/admin/listings/{id}/unpublish` | Suspend listing |
| `GET` | `/api/admin/bookings` | All bookings (searchable) |
| `GET` | `/api/admin/disputes` | All disputes |
| `POST` | `/api/admin/disputes/{id}/resolve` | Resolve dispute |
| `GET` | `/api/admin/users` | All users |
| `PATCH` | `/api/admin/users/{id}/suspend` | Suspend user |
| `PATCH` | `/api/admin/users/{id}/reinstate` | Reinstate user |

---

## Not yet implemented (known gaps)

| Feature | Phase | Notes |
|---------|-------|-------|
| Stripe payments | 3 | Checkout creates booking without charge. Set `STRIPE_SECRET_KEY` to enable. |
| Stripe refunds | 4 | Cancellations mark status only; no real refund issued. |
| Stripe Connect payouts | 7 | Connect onboarding is stubbed — no real transfer. |
| Request-to-book approval | 6 | Booking type `request` creates a confirmed booking directly (same as instant). |
| Messaging | 6 | No in-app messaging thread. |
| Host / guest reviews | 4/6 | No review submission UI. |
| Email notifications | 3+ | No email sent on booking/cancellation. |
| CI pipeline | 10 | No GitHub Actions config. Add `npm run type-check` + `npm run test:e2e`. |
