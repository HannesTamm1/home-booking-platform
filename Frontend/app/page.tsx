import Link from "next/link";
import { cookies } from "next/headers";

import { AUTH_COOKIE_NAME, decodeAuthSession } from "@/lib/auth-session";
import { fetchListingsWithFilters } from "@/lib/backend";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

type HomeProps = {
  searchParams?: Promise<{
    destination?: string;
    check_in?: string;
    check_out?: string;
    guests?: string;
  }>;
};

export default async function Home({ searchParams }: HomeProps) {
  const session = decodeAuthSession((await cookies()).get(AUTH_COOKIE_NAME)?.value);
  const params = (await searchParams) ?? {};
  const guests = params.guests ? Number.parseInt(params.guests, 10) : undefined;
  const checkIn = params.check_in?.trim() || undefined;
  const checkOut = params.check_out?.trim() || undefined;

  const { isConnected, error, listings } = await fetchListingsWithFilters({
    perPage: 12,
    destination: params.destination?.trim() || undefined,
    guests: Number.isNaN(guests) ? undefined : guests,
    checkIn: checkIn && checkOut ? checkIn : undefined,
    checkOut: checkIn && checkOut ? checkOut : undefined,
  });

  const availableDestinations = listings?.meta.filters.availableDestinations ?? [];
  const selectedDestination = availableDestinations.includes(params.destination ?? "")
    ? params.destination ?? ""
    : "";

  return (
    <main className="min-h-screen bg-stone-50 text-neutral-900">
      <div className="mx-auto flex w-full max-w-6xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        <header className="border-b border-neutral-200 pb-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <Link href="/" className="text-2xl font-semibold tracking-tight text-rose-500">
              airbnb
            </Link>

            {session ? (
              <div className="flex items-center gap-3 self-end lg:self-auto">
                <div className="hidden text-right sm:block">
                  <p className="text-sm font-medium text-neutral-900">
                    {session.name ?? session.email}
                  </p>
                  <p className="text-xs text-neutral-500">{session.role}</p>
                </div>
                <form action="/api/auth/logout" method="post">
                  <button
                    type="submit"
                    className="rounded-full border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 transition hover:border-neutral-900 hover:text-neutral-900"
                  >
                    Log out
                  </button>
                </form>
              </div>
            ) : (
              <div className="flex items-center gap-3 self-end lg:self-auto">
                <Link
                  href="/login"
                  className="rounded-full px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-100 hover:text-neutral-900"
                >
                  Log in
                </Link>
                <Link
                  href="/register"
                  className="rounded-full border border-neutral-900 bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-800"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          <form action="/" method="get" className="mt-6 grid gap-3 lg:grid-cols-[1.2fr_1fr_1fr_0.8fr_auto]">
            <select
              name="destination"
              defaultValue={selectedDestination}
              className="h-12 rounded-full border border-neutral-300 bg-white px-4 text-sm text-neutral-900 outline-none transition focus:border-neutral-900"
            >
              <option value="">Anywhere</option>
              {availableDestinations.map((destination) => (
                <option key={destination} value={destination}>
                  {destination}
                </option>
              ))}
            </select>

            <input
              type="date"
              name="check_in"
              defaultValue={checkIn}
              className="h-12 rounded-full border border-neutral-300 bg-white px-4 text-sm text-neutral-900 outline-none transition focus:border-neutral-900"
            />

            <input
              type="date"
              name="check_out"
              defaultValue={checkOut}
              className="h-12 rounded-full border border-neutral-300 bg-white px-4 text-sm text-neutral-900 outline-none transition focus:border-neutral-900"
            />

            <select
              name="guests"
              defaultValue={params.guests ?? ""}
              className="h-12 rounded-full border border-neutral-300 bg-white px-4 text-sm text-neutral-900 outline-none transition focus:border-neutral-900"
            >
              <option value="">Any guests</option>
              {Array.from({ length: 8 }, (_, index) => (
                <option key={index + 1} value={index + 1}>
                  {index + 1} guest{index === 0 ? "" : "s"}
                </option>
              ))}
            </select>

            <button
              type="submit"
              className="h-12 rounded-full bg-rose-500 px-6 text-sm font-semibold text-white transition hover:bg-rose-600"
            >
              Search
            </button>
          </form>
        </header>

        <section className="py-8">
          {isConnected && listings ? (
            <>
              <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-neutral-500">
                    Results
                  </p>
                  <h1 className="mt-2 text-3xl font-semibold tracking-tight text-neutral-900">
                    {listings.meta.totalListings} stay{listings.meta.totalListings === 1 ? "" : "s"} found
                  </h1>
                </div>
                <p className="text-sm text-neutral-500">
                  {listings.meta.filters.destination
                    ? `Destination: ${listings.meta.filters.destination}`
                    : "All destinations"}
                </p>
              </div>

              {listings.data.length ? (
                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {listings.data.map((listing) => (
                    <article
                      key={listing.id}
                      className="overflow-hidden rounded-[1.75rem] border border-neutral-200 bg-white shadow-[0_16px_48px_rgba(0,0,0,0.05)]"
                    >
                      <div className="aspect-[4/3] bg-gradient-to-br from-rose-100 via-orange-50 to-stone-100" />
                      <div className="space-y-4 p-5">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm text-neutral-500">
                              {listing.destination ?? "Unknown destination"}
                            </p>
                            <h2 className="text-lg font-semibold text-neutral-900">
                              {listing.title}
                            </h2>
                          </div>
                          <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold text-neutral-700">
                            {listing.maxGuests} guests
                          </span>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2">
                          <div className="rounded-2xl bg-neutral-50 p-3">
                            <p className="text-xs uppercase tracking-[0.18em] text-neutral-500">
                              Price
                            </p>
                            <p className="mt-2 text-base font-semibold text-neutral-900">
                              {formatCurrency(listing.pricePerNight)} / night
                            </p>
                          </div>
                          <div className="rounded-2xl bg-neutral-50 p-3">
                            <p className="text-xs uppercase tracking-[0.18em] text-neutral-500">
                              Host
                            </p>
                            <p className="mt-2 text-base font-semibold text-neutral-900">
                              {listing.host.publicLabel}
                            </p>
                          </div>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="rounded-[2rem] border border-dashed border-neutral-300 bg-white p-10 text-center">
                  <p className="text-sm text-neutral-500">
                    No stays match those filters right now.
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className="rounded-[2rem] border border-rose-200 bg-rose-50 p-6 text-sm text-rose-600">
              {error ?? "The backend is unavailable right now."}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
