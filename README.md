# Home Booking Platform

Simple local setup guide for anyone who wants to work on this project.

This repo has 2 parts:

- `Frontend` = Next.js app
- `Backend` = Laravel API

## What you need

- Git
- Node.js and npm
- PHP 8.3+
- Composer
- PostgreSQL

## Get the project

```bash
git clone <repo-url>
cd home-booking-platform
```

## Backend setup

```bash
cd Backend
cp .env.example .env
composer install
bun install
php artisan key:generate
```

Update the database settings in `Backend/.env` so they match your local PostgreSQL setup:


Then run the migrations:

```bash
php artisan migrate
```

## Frontend setup

```bash
cd ../Frontend
bun install
cp .env.example .env.local
```

The default frontend backend URL is:

```env
BACKEND_URL=http://127.0.0.1:8000
```

You only need to change it if your Laravel app runs somewhere else.

## Run the project

Start the backend in one terminal:

```bash
cd Backend
php artisan serve --host=127.0.0.1 --port=8000
```

Start the frontend in another terminal:

```bash
cd Frontend
bun run dev
```

Open `http://127.0.0.1:3000` in your browser.

## Notes

- The frontend reads data from the Laravel API at `http://127.0.0.1:8000`.
- After a fresh migration, the database will be empty unless you add records yourself.
