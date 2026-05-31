import Link from "next/link";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";

import { AUTH_COOKIE_NAME, decodeAuthSession } from "@/lib/auth-session";
import { fetchListing, fetchListingAvailability } from "@/lib/backend";
import { BookingPanel } from "./booking-panel";

function formatCurrency(value: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

type Params = { id: string };
type SearchParams = { check_in?: string; check_out?: string; guests?: string };

export default async function ListingDetailPage({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams?: Promise<SearchParams>;
}) {
  const { id } = await params;
  const sp = (await searchParams) ?? {};
  const session = decodeAuthSession((await cookies()).get(AUTH_COOKIE_NAME)?.value);

  const [listingResult, availabilityResult] = await Promise.all([
    fetchListing(id),
    fetchListingAvailability(id),
  ]);

  if (!listingResult.listing) {
    notFound();
  }

  const listing = listingResult.listing;
  const blockedPeriods = availabilityResult.data;
  const defaultGuests = sp.guests ? Number.parseInt(sp.guests, 10) : 1;

  return (
    <main className="min-h-screen bg-stone-50 text-neutral-900">
      <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <header className="flex items-center justify-between border-b border-neutral-200 pb-6">
          <Link href="/" className="text-2xl font-semibold tracking-tight text-rose-500">
            airbnb
          </Link>
          <div className="flex items-center gap-3">
            {session ? (
              <>
                <Link
                  href="/trips"
                  className="rounded-full border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 transition hover:border-neutral-900 hover:text-neutral-900"
                >
                  Trips
                </Link>
                <Link
                  href="/settings"
                  className="rounded-full border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 transition hover:border-neutral-900 hover:text-neutral-900"
                >
                  Settings
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="rounded-full px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-100"
                >
                  Log in
                </Link>
                <Link
                  href="/register"
                  className="rounded-full border border-neutral-900 bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-800"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </header>

        <nav className="mt-4 mb-6 text-sm text-neutral-500">
          <Link href="/" className="hover:text-neutral-900 hover:underline">
            Home
          </Link>
          <span className="mx-2">/</span>
          {listing.destination && (
            <>
              <Link
                href={`/?destination=${encodeURIComponent(listing.destination)}`}
                className="hover:text-neutral-900 hover:underline"
              >
                {listing.destination}
              </Link>
              <span className="mx-2">/</span>
            </>
          )}
          <span className="text-neutral-900">{listing.title}</span>
        </nav>

        <h1 className="text-3xl font-semibold tracking-tight text-neutral-900">{listing.title}</h1>
        <p className="mt-1 text-sm text-neutral-500">{listing.destination ?? "Unknown destination"}</p>

        <div className="mt-6 overflow-hidden rounded-[2rem] bg-gradient-to-br from-rose-100 via-orange-50 to-stone-100 aspect-[16/7]" />

        <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_380px]">
          <div className="space-y-8">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-6">
              <div>
                <h2 className="text-xl font-semibold text-neutral-900">
                  {listing.host.publicLabel}
                </h2>
                <p className="mt-1 text-sm text-neutral-500">
                  Up to {listing.maxGuests} guest{listing.maxGuests === 1 ? "" : "s"}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-neutral-200 flex items-center justify-center text-neutral-500">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
                  <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clipRule="evenodd" />
                </svg>
              </div>
            </div>

            {listing.description && (
              <div>
                <h3 className="text-lg font-semibold text-neutral-900">About this place</h3>
                <p className="mt-3 text-sm leading-7 text-neutral-600 whitespace-pre-line">
                  {listing.description}
                </p>
              </div>
            )}

            <div>
              <h3 className="text-lg font-semibold text-neutral-900">Details</h3>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                <div className="rounded-2xl bg-white border border-neutral-200 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">Guests</p>
                  <p className="mt-2 text-sm font-semibold text-neutral-900">{listing.maxGuests} max</p>
                </div>
                <div className="rounded-2xl bg-white border border-neutral-200 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">Price</p>
                  <p className="mt-2 text-sm font-semibold text-neutral-900">
                    {formatCurrency(listing.pricePerNight, listing.currency)} / night
                  </p>
                </div>
                {listing.destination && (
                  <div className="rounded-2xl bg-white border border-neutral-200 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">Location</p>
                    <p className="mt-2 text-sm font-semibold text-neutral-900">{listing.destination}</p>
                  </div>
                )}
              </div>
            </div>

            {blockedPeriods.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-neutral-900">Availability</h3>
                <p className="mt-2 text-sm text-neutral-500">
                  The following date ranges are already booked:
                </p>
                <ul className="mt-3 space-y-2">
                  {blockedPeriods.map((p, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-neutral-700">
                      <span className="h-1.5 w-1.5 rounded-full bg-rose-400 shrink-0" />
                      {p.startDate} → {p.endDate}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {listing.latitude !== null && listing.longitude !== null && (
              <div>
                <h3 className="text-lg font-semibold text-neutral-900">Location</h3>
                <div className="mt-3 overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-100 aspect-[16/7] flex items-center justify-center">
                  <a
                    href={`https://www.google.com/maps?q=${listing.latitude},${listing.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center gap-2 text-sm font-medium text-rose-500 hover:text-rose-600"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-8 w-8">
                      <path fillRule="evenodd" d="m11.54 22.351.07.04.028.016a.76.76 0 0 0 .723 0l.028-.015.071-.041a16.975 16.975 0 0 0 1.144-.742 19.58 19.58 0 0 0 2.683-2.282c1.944-2.003 3.5-4.697 3.5-8.333 0-4.645-3.51-8.25-8-8.25S4 2.659 4 7.333c0 3.636 1.556 6.33 3.5 8.333a19.58 19.58 0 0 0 2.683 2.282 16.975 16.975 0 0 0 1.144.742ZM12 13.25a3.75 3.75 0 1 0 0-7.5 3.75 3.75 0 0 0 0 7.5Z" clipRule="evenodd" />
                    </svg>
                    View on Google Maps
                  </a>
                </div>
              </div>
            )}
          </div>

          <div className="lg:sticky lg:top-6 lg:self-start">
            <BookingPanel
              listingId={listing.id}
              pricePerNight={listing.pricePerNight}
              currency={listing.currency}
              maxGuests={listing.maxGuests}
              isLoggedIn={!!session}
              defaultCheckIn={sp.check_in}
              defaultCheckOut={sp.check_out}
              defaultGuests={Number.isNaN(defaultGuests) ? 1 : defaultGuests}
              blockedPeriods={blockedPeriods}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
