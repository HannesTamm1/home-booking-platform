import { fetchListings } from "@/lib/backend";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatTimestamp(timestamp: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(timestamp));
}

export default async function Home() {
  const { backendUrl, endpoint, error, payload } = await fetchListings();
  const listings = payload?.data ?? [];
  const totalRevenue = listings.reduce(
    (sum, listing) => sum + listing.metrics.confirmedRevenue,
    0,
  );
  const totalBookings = listings.reduce(
    (sum, listing) => sum + listing.metrics.confirmedBookings,
    0,
  );

  return (
    <main className="min-h-screen px-6 py-8 md:px-10 md:py-12">
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <section
          className="overflow-hidden rounded-[2rem] border border-white/50 p-8 shadow-[var(--shadow)] backdrop-blur md:p-10"
          style={{ background: "var(--surface)" }}
        >
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl space-y-5">
              <span className="inline-flex w-fit items-center rounded-full border px-3 py-1 text-sm font-semibold tracking-[0.18em] uppercase">
                Frontend + backend connected
              </span>
              <div className="space-y-4">
                <p className="font-[family:var(--font-display)] text-5xl leading-none md:text-7xl">
                  Home booking data is now flowing into the frontend.
                </p>
                <p className="max-w-2xl text-base leading-7 text-[color:var(--muted)] md:text-lg">
                  The Next.js homepage is reading live listing inventory from the
                  Laravel API so hosts, pricing, and booking performance are all
                  coming from one source of truth.
                </p>
              </div>
            </div>

            <div
              className="w-full max-w-md rounded-[1.75rem] border p-5"
              style={{ background: "var(--surface-strong)" }}
            >
              <p className="text-sm font-semibold tracking-[0.16em] uppercase text-[color:var(--muted)]">
                Connection status
              </p>
              <p className="mt-3 text-2xl font-semibold">
                {error ? "Backend unavailable" : "Backend responding"}
              </p>
              <p className="mt-3 break-all text-sm leading-6 text-[color:var(--muted)]">
                {endpoint}
              </p>
              <p className="mt-4 text-sm leading-6 text-[color:var(--muted)]">
                Base URL: {backendUrl}
              </p>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <article className="rounded-[1.5rem] border p-5 shadow-[var(--shadow)] backdrop-blur">
            <p className="text-sm font-semibold tracking-[0.16em] uppercase text-[color:var(--muted)]">
              Listings
            </p>
            <p className="mt-3 font-[family:var(--font-display)] text-4xl">
              {payload?.meta.totalListings ?? 0}
            </p>
            <p className="mt-2 text-sm text-[color:var(--muted)]">
              Active homes returned by Laravel
            </p>
          </article>

          <article className="rounded-[1.5rem] border p-5 shadow-[var(--shadow)] backdrop-blur">
            <p className="text-sm font-semibold tracking-[0.16em] uppercase text-[color:var(--muted)]">
              Confirmed bookings
            </p>
            <p className="mt-3 font-[family:var(--font-display)] text-4xl">
              {totalBookings}
            </p>
            <p className="mt-2 text-sm text-[color:var(--muted)]">
              Aggregated from each listing card
            </p>
          </article>

          <article className="rounded-[1.5rem] border p-5 shadow-[var(--shadow)] backdrop-blur">
            <p className="text-sm font-semibold tracking-[0.16em] uppercase text-[color:var(--muted)]">
              Revenue
            </p>
            <p className="mt-3 font-[family:var(--font-display)] text-4xl">
              {formatCurrency(totalRevenue)}
            </p>
            <p className="mt-2 text-sm text-[color:var(--muted)]">
              Confirmed booking revenue from the backend
            </p>
          </article>
        </section>

        {error ? (
          <section className="rounded-[1.5rem] border border-red-300/70 bg-red-50/80 p-6 text-red-900 shadow-[var(--shadow)]">
            <p className="text-lg font-semibold">
              The frontend could not reach Laravel.
            </p>
            <p className="mt-3 max-w-3xl text-sm leading-6">
              {error}. Start the backend on{" "}
              <span className="font-semibold">http://127.0.0.1:8000</span> or set{" "}
              <code className="rounded bg-black/5 px-1 py-0.5">BACKEND_URL</code>{" "}
              in{" "}
              <code className="rounded bg-black/5 px-1 py-0.5">
                Frontend/.env.local
              </code>
              .
            </p>
          </section>
        ) : listings.length === 0 ? (
          <section className="rounded-[1.5rem] border p-6 shadow-[var(--shadow)] backdrop-blur">
            <p className="text-lg font-semibold">
              Connection is healthy, but there are no listings yet.
            </p>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-[color:var(--muted)]">
              Add records to the backend database and they will appear here
              automatically on the next request.
            </p>
          </section>
        ) : (
          <section className="space-y-4">
            <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-sm font-semibold tracking-[0.16em] uppercase text-[color:var(--muted)]">
                  Live inventory
                </p>
                <h2 className="font-[family:var(--font-display)] text-3xl">
                  Listings pulled from the Laravel API
                </h2>
              </div>
              <p className="text-sm text-[color:var(--muted)]">
                Snapshot generated{" "}
                {payload ? formatTimestamp(payload.meta.generatedAt) : "just now"}
              </p>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              {listings.map((listing) => (
                <article
                  key={listing.id}
                  className="rounded-[1.75rem] border p-6 shadow-[var(--shadow)] backdrop-blur"
                  style={{ background: "var(--surface)" }}
                >
                  <div className="flex flex-col gap-5">
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div>
                        <p className="text-sm font-semibold tracking-[0.14em] uppercase text-[color:var(--muted)]">
                          {listing.host.publicLabel}
                        </p>
                        <h3 className="mt-2 font-[family:var(--font-display)] text-3xl leading-tight">
                          {listing.title}
                        </h3>
                      </div>
                      <div className="rounded-full border px-4 py-2 text-sm font-semibold">
                        {formatCurrency(listing.pricePerNight)} / night
                      </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-3">
                      <div className="rounded-2xl border p-4">
                        <p className="text-xs font-semibold tracking-[0.16em] uppercase text-[color:var(--muted)]">
                          Guests
                        </p>
                        <p className="mt-2 text-2xl font-semibold">{listing.maxGuests}</p>
                      </div>
                      <div className="rounded-2xl border p-4">
                        <p className="text-xs font-semibold tracking-[0.16em] uppercase text-[color:var(--muted)]">
                          Confirmed bookings
                        </p>
                        <p className="mt-2 text-2xl font-semibold">
                          {listing.metrics.confirmedBookings}
                        </p>
                      </div>
                      <div className="rounded-2xl border p-4">
                        <p className="text-xs font-semibold tracking-[0.16em] uppercase text-[color:var(--muted)]">
                          Confirmed revenue
                        </p>
                        <p className="mt-2 text-2xl font-semibold">
                          {formatCurrency(listing.metrics.confirmedRevenue)}
                        </p>
                      </div>
                    </div>

                    <p className="text-sm text-[color:var(--muted)]">
                      Created{" "}
                      {listing.createdAt
                        ? formatTimestamp(listing.createdAt)
                        : "recently"}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
