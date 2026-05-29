# Database Schema

## Conventions

- Money is stored as **unsigned integers in cents** (e.g. €160.00 → `16000`) alongside a `currency CHAR(3)` column (default `'EUR'`).
- All timestamps are stored in UTC.
- The `listings` table carries a `geography(Point,4326)` column on PostgreSQL with a GiST index for spatial queries. Tests run against SQLite and skip this column.

---

## users

| Column       | Type             | Constraints                      |
|--------------|------------------|----------------------------------|
| id           | bigint unsigned  | PK, auto-increment               |
| name         | varchar(255)     | nullable                         |
| email        | varchar(255)     | unique, not null                 |
| password     | varchar(255)     | nullable                         |
| role         | varchar(255)     | not null, indexed (`guest\|host`)|
| created_at   | timestamp (UTC)  |                                  |
| updated_at   | timestamp (UTC)  |                                  |

---

## listings

| Column               | Type                     | Constraints                        |
|----------------------|--------------------------|------------------------------------|
| id                   | bigint unsigned          | PK, auto-increment                 |
| host_id              | bigint unsigned          | FK → users.id, cascade delete      |
| title                | varchar(255)             | not null                           |
| destination          | varchar(255)             | nullable, indexed                  |
| description          | text                     | nullable                           |
| price_per_night_cents| unsigned int             | not null, ≥ 0                      |
| currency             | char(3)                  | not null, default `'EUR'`          |
| max_guests           | unsigned smallint        | not null, > 0                      |
| latitude             | decimal(10,7)            | nullable                           |
| longitude            | decimal(11,7)            | nullable                           |
| coordinates          | geography(Point,4326)    | nullable, PostgreSQL only (GiST)   |
| created_at           | timestamp (UTC)          |                                    |
| updated_at           | timestamp (UTC)          |                                    |

---

## listing_photos

| Column     | Type            | Constraints                   |
|------------|-----------------|-------------------------------|
| id         | bigint unsigned | PK, auto-increment            |
| listing_id | bigint unsigned | FK → listings.id, cascade del |
| url        | varchar(255)    | not null                      |
| caption    | varchar(255)    | nullable                      |
| sort_order | unsigned small  | not null, default 0           |
| created_at | timestamp (UTC) |                               |
| updated_at | timestamp (UTC) |                               |

Index: `(listing_id, sort_order)`.

---

## bookings

| Column            | Type            | Constraints                        |
|-------------------|-----------------|------------------------------------|
| id                | bigint unsigned | PK, auto-increment                 |
| listing_id        | bigint unsigned | FK → listings.id, cascade delete   |
| user_id           | bigint unsigned | FK → users.id, cascade delete      |
| start_date        | date            | not null                           |
| end_date          | date            | not null, ≥ start_date             |
| total_price_cents | unsigned int    | not null, ≥ 0                      |
| currency          | char(3)         | not null, default `'EUR'`          |
| status            | varchar(255)    | not null, indexed (`pending\|confirmed\|cancelled`) |
| created_at        | timestamp (UTC) |                                    |
| updated_at        | timestamp (UTC) |                                    |

Composite index: `(listing_id, start_date, end_date)` for availability queries.
