import Link from "next/link";
import { cookies } from "next/headers";

import { AUTH_COOKIE_NAME, decodeAuthSession } from "@/lib/auth-session";
import { fetchListingsWithFilters } from "@/lib/backend";
import { SearchForm } from "@/components/search-form";
import { ThemeToggle } from "@/components/theme-toggle";
import { CategoryBar } from "@/components/category-bar";

function formatCurrency(value: number, currency = "EUR") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

type HomeProps = {
  searchParams?: Promise<{
    destination?: string;
    check_in?: string;
    check_out?: string;
    guests?: string;
    page?: string;
    property_type?: string;
  }>;
};

export default async function Home({ searchParams }: HomeProps) {
  const session = decodeAuthSession((await cookies()).get(AUTH_COOKIE_NAME)?.value);
  const params = (await searchParams) ?? {};
  const guests = params.guests ? Number.parseInt(params.guests, 10) : undefined;
  const checkIn = params.check_in?.trim() || undefined;
  const checkOut = params.check_out?.trim() || undefined;
  const page = params.page ? Number.parseInt(params.page, 10) : 1;
  const propertyType = params.property_type?.trim() || undefined;

  const hasFilters = !!(params.destination || checkIn || guests || propertyType);

  const { isConnected, error, listings } = await fetchListingsWithFilters({
    perPage: 12,
    destination: params.destination?.trim() || undefined,
    guests: Number.isNaN(guests) ? undefined : guests,
    checkIn: checkIn && checkOut ? checkIn : undefined,
    checkOut: checkIn && checkOut ? checkOut : undefined,
    page,
    propertyType,
  });

  const availableDestinations = listings?.meta.filters.availableDestinations ?? [];
  const selectedDestination = availableDestinations.includes(params.destination ?? "")
    ? params.destination ?? ""
    : "";

  const pagination = listings?.meta.pagination;

  function buildPageUrl(targetPage: number) {
    const sp = new URLSearchParams();
    if (params.destination) sp.set("destination", params.destination);
    if (params.check_in) sp.set("check_in", params.check_in);
    if (params.check_out) sp.set("check_out", params.check_out);
    if (params.guests) sp.set("guests", params.guests);
    if (params.property_type) sp.set("property_type", params.property_type);
    if (targetPage > 1) sp.set("page", String(targetPage));
    const qs = sp.toString();
    return qs ? `/?${qs}` : "/";
  }

  return (
    <main className="min-h-screen bg-stone-50 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-50">
      <div className="mx-auto flex w-full max-w-6xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        <header className="border-b border-neutral-200 pb-6 dark:border-neutral-800">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <Link href="/" className="text-2xl font-semibold tracking-tight text-rose-500">
              airbaba
            </Link>

            {session ? (
              <div className="flex items-center gap-3 self-end lg:self-auto">
                <div className="hidden text-right sm:block">
                  <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                    {session.name ?? session.email}
                  </p>
                  <p className="text-xs text-neutral-500 capitalize dark:text-neutral-400">{session.role}</p>
                </div>
                {session.role === "admin" && (
                  <Link
                    href="/admin"
                    className="rounded-full border border-amber-300 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-700 transition hover:bg-amber-100 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-400 dark:hover:bg-amber-900"
                  >
                    Admin
                  </Link>
                )}
                {session.role === "host" && (
                  <Link
                    href="/host"
                    className="rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-medium text-rose-600 transition hover:bg-rose-100 dark:border-rose-800 dark:bg-rose-950 dark:text-rose-400 dark:hover:bg-rose-900"
                  >
                    Host dashboard
                  </Link>
                )}
                {session.role === "guest" && (
                  <Link
                    href="/become-a-host"
                    className="rounded-full border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 transition hover:border-neutral-900 hover:text-neutral-900 dark:border-neutral-700 dark:text-neutral-300 dark:hover:border-neutral-400 dark:hover:text-white"
                  >
                    Become a host
                  </Link>
                )}
                <Link
                  href="/messages"
                  className="rounded-full border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 transition hover:border-neutral-900 hover:text-neutral-900 dark:border-neutral-700 dark:text-neutral-300 dark:hover:border-neutral-400 dark:hover:text-white"
                >
                  Messages
                </Link>
                <Link
                  href="/trips"
                  className="rounded-full border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 transition hover:border-neutral-900 hover:text-neutral-900 dark:border-neutral-700 dark:text-neutral-300 dark:hover:border-neutral-400 dark:hover:text-white"
                >
                  Trips
                </Link>
                <Link
                  href="/settings"
                  className="rounded-full border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 transition hover:border-neutral-900 hover:text-neutral-900 dark:border-neutral-700 dark:text-neutral-300 dark:hover:border-neutral-400 dark:hover:text-white"
                >
                  Settings
                </Link>
                <ThemeToggle />
                <form action="/api/auth/logout" method="post">
                  <button
                    type="submit"
                    className="rounded-full border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 transition hover:border-neutral-900 hover:text-neutral-900 dark:border-neutral-700 dark:text-neutral-300 dark:hover:border-neutral-400 dark:hover:text-white"
                  >
                    Log out
                  </button>
                </form>
              </div>
            ) : (
              <div className="flex items-center gap-3 self-end lg:self-auto">
                <Link
                  href="/become-a-host"
                  className="rounded-full px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-white"
                >
                  Become a host
                </Link>
                <Link
                  href="/login"
                  className="rounded-full px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-white"
                >
                  Log in
                </Link>
                <ThemeToggle />
                <Link
                  href="/register"
                  className="rounded-full border border-neutral-900 bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-800 dark:border-neutral-100 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-white"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          <SearchForm
            availableDestinations={availableDestinations}
            selectedDestination={selectedDestination}
            defaultCheckIn={checkIn}
            defaultCheckOut={checkOut}
            defaultGuests={params.guests}
          />
          <CategoryBar selected={propertyType} />
        </header>

        <section className="py-8">
          {!isConnected && (
            <div className="rounded-[2rem] border border-rose-200 bg-rose-50 p-6 text-sm text-rose-600">
              {error ?? "The backend is unavailable right now."}
            </div>
          )}

          {isConnected && listings && (
            <>
              <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-neutral-500 dark:text-neutral-400">
                    {hasFilters ? "Results" : "All stays"}
                  </p>
                  <h1 className="mt-2 text-3xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">
                    {listings.meta.totalListings} stay{listings.meta.totalListings === 1 ? "" : "s"}{hasFilters ? " found" : " available"}
                  </h1>
                </div>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  {listings.meta.filters.destination
                    ? `in ${listings.meta.filters.destination}`
                    : listings.meta.filters.propertyType
                    ? `${listings.meta.filters.propertyType}s`
                    : "All destinations"}
                </p>
              </div>

              {listings.data.length ? (
                <>
                  <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {listings.data.map((listing) => (
                      <Link
                        key={listing.id}
                        href={`/listings/${listing.id}${checkIn && checkOut ? `?check_in=${checkIn}&check_out=${checkOut}${guests ? `&guests=${guests}` : ""}` : ""}`}
                        className="group overflow-hidden rounded-[1.75rem] border border-neutral-200 bg-white shadow-[0_16px_48px_rgba(0,0,0,0.05)] transition hover:border-neutral-300 hover:shadow-[0_24px_64px_rgba(0,0,0,0.1)] dark:border-neutral-800 dark:bg-neutral-900 dark:shadow-none dark:hover:border-neutral-700"
                      >
                        {listing.photos && listing.photos.length > 0 && listing.photos[0].url.startsWith("http") ? (
                          <div className="aspect-[4/3] overflow-hidden">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={listing.photos[0].url}
                              alt={listing.photos[0].caption ?? listing.title}
                              className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                            />
                          </div>
                        ) : (
                          <div className="aspect-[4/3] bg-gradient-to-br from-rose-100 via-orange-50 to-stone-100 transition group-hover:opacity-90 dark:from-rose-950 dark:via-neutral-900 dark:to-neutral-800" />
                        )}
                        <div className="space-y-4 p-5">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                {listing.destination ?? "Unknown destination"}
                              </p>
                              <h2 className="text-lg font-semibold text-neutral-900 transition group-hover:text-rose-500 dark:text-neutral-50">
                                {listing.title}
                              </h2>
                            </div>
                            <span className="shrink-0 rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
                              {listing.maxGuests} guests
                            </span>
                          </div>

                          <div className="grid gap-3 sm:grid-cols-2">
                            <div className="rounded-2xl bg-neutral-50 p-3 dark:bg-neutral-800">
                              <p className="text-xs uppercase tracking-[0.18em] text-neutral-500 dark:text-neutral-400">
                                Price
                              </p>
                              <p className="mt-2 text-base font-semibold text-neutral-900 dark:text-neutral-50">
                                {formatCurrency(listing.pricePerNight, listing.currency)} / night
                              </p>
                            </div>
                            <div className="rounded-2xl bg-neutral-50 p-3 dark:bg-neutral-800">
                              <p className="text-xs uppercase tracking-[0.18em] text-neutral-500 dark:text-neutral-400">
                                Host
                              </p>
                              <p className="mt-2 text-base font-semibold text-neutral-900 dark:text-neutral-50">
                                {listing.host.publicLabel}
                              </p>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>

                  {pagination && pagination.lastPage > 1 && (
                    <div className="mt-10 flex items-center justify-center gap-3">
                      {pagination.currentPage > 1 && (
                        <Link
                          href={buildPageUrl(pagination.currentPage - 1)}
                          className="rounded-full border border-neutral-300 px-5 py-2 text-sm font-medium text-neutral-700 transition hover:border-neutral-900 hover:text-neutral-900 dark:border-neutral-700 dark:text-neutral-300 dark:hover:border-neutral-400 dark:hover:text-white"
                        >
                          Previous
                        </Link>
                      )}
                      <span className="text-sm text-neutral-500 dark:text-neutral-400">
                        Page {pagination.currentPage} of {pagination.lastPage}
                      </span>
                      {pagination.hasMorePages && (
                        <Link
                          href={buildPageUrl(pagination.currentPage + 1)}
                          className="rounded-full border border-neutral-300 px-5 py-2 text-sm font-medium text-neutral-700 transition hover:border-neutral-900 hover:text-neutral-900 dark:border-neutral-700 dark:text-neutral-300 dark:hover:border-neutral-400 dark:hover:text-white"
                        >
                          Next
                        </Link>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <div className="rounded-[2rem] border border-dashed border-neutral-300 bg-white p-10 text-center dark:border-neutral-700 dark:bg-neutral-900">
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    No stays match those filters right now.
                  </p>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </main>
  );
}
