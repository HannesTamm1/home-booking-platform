import Link from "next/link";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";

import { AUTH_COOKIE_NAME, decodeAuthSession } from "@/lib/auth-session";
import { fetchListing, fetchListingAvailability } from "@/lib/backend";
import { BookingPanel } from "./booking-panel";
import { PhotoGallery } from "@/components/photo-gallery";
import { ListingMap } from "@/components/listing-map";
import { ContactHostModal } from "@/components/contact-host-modal";
import { ThemeToggle } from "@/components/theme-toggle";

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
  const photos = listing.photos ?? [];

  return (
    <main className="min-h-screen bg-stone-50 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-50">
      <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <header className="flex items-center justify-between border-b border-neutral-200 pb-6 dark:border-neutral-800">
          <Link href="/" className="text-2xl font-semibold tracking-tight text-rose-500">
            airbaba
          </Link>
          <div className="flex items-center gap-3">
            {session ? (
              <>
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
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="rounded-full px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-white"
                >
                  Log in
                </Link>
                <Link
                  href="/register"
                  className="rounded-full border border-neutral-900 bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-800 dark:border-neutral-100 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-white"
                >
                  Register
                </Link>
              </>
            )}
            <ThemeToggle />
          </div>
        </header>

        <nav className="mt-4 mb-6 text-sm text-neutral-500 dark:text-neutral-400">
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
        <div className="mt-1 flex items-center gap-3 text-sm text-neutral-500">
          {listing.ratingAverage && (
            <span className="flex items-center gap-1 font-medium text-neutral-900">
              ★ {listing.ratingAverage.toFixed(2)}
              <span className="font-normal text-neutral-500">({listing.ratingCount} reviews)</span>
            </span>
          )}
          {listing.ratingAverage && listing.address && <span>·</span>}
          {listing.address && <span>{listing.address}</span>}
          {!listing.address && listing.destination && <span>{listing.destination}</span>}
        </div>

        <PhotoGallery photos={photos} title={listing.title} />

        <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_380px]">
          <div className="space-y-8">
            {/* Host section */}
            <div className="flex items-center justify-between border-b border-neutral-100 pb-6 dark:border-neutral-800">
              <div>
                <h2 className="text-xl font-semibold text-neutral-900">
                  Hosted by {listing.host.publicLabel}
                </h2>
                <p className="mt-1 text-sm text-neutral-500">
                  Up to {listing.maxGuests} guest{listing.maxGuests === 1 ? "" : "s"} ·{" "}
                  {listing.bedrooms} bedroom{listing.bedrooms === 1 ? "" : "s"} ·{" "}
                  {listing.beds} bed{listing.beds === 1 ? "" : "s"}
                </p>
              </div>
              <div className="h-14 w-14 rounded-full bg-gradient-to-br from-rose-400 to-orange-300 flex items-center justify-center text-white text-xl font-semibold shadow-sm">
                {listing.host.publicLabel.charAt(0).toUpperCase()}
              </div>
            </div>

            {listing.description && (
              <div>
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">About this place</h3>
                <p className="mt-3 text-sm leading-7 text-neutral-600 whitespace-pre-line dark:text-neutral-400">
                  {listing.description}
                </p>
              </div>
            )}

            <div>
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">Details</h3>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {[
                  { label: "Guests", value: `${listing.maxGuests} max` },
                  { label: "Bedrooms", value: String(listing.bedrooms ?? 1) },
                  { label: "Beds", value: String(listing.beds ?? 1) },
                  { label: "Bathrooms", value: String(listing.bathrooms ?? 1) },
                  { label: "Price", value: `${formatCurrency(listing.pricePerNight, listing.currency)} / night` },
                  ...(listing.minNights > 1 ? [{ label: "Min stay", value: `${listing.minNights} nights` }] : []),
                  ...(listing.bookingType === "request" ? [{ label: "Booking", value: "Request required" }] : []),
                  ...(listing.weekendPricePerNight ? [{ label: "Weekend", value: `${formatCurrency(listing.weekendPricePerNight, listing.currency)} / night` }] : []),
                ].map(({ label, value }) => (
                  <div key={label} className="rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-800">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500 dark:text-neutral-400">{label}</p>
                    <p className="mt-2 text-sm font-semibold text-neutral-900 dark:text-neutral-50">{value}</p>
                  </div>
                ))}
              </div>
            </div>

            {listing.amenities && listing.amenities.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">What this place offers</h3>
                <div className="mt-4 flex flex-wrap gap-2">
                  {listing.amenities.map((a) => (
                    <span key={a} className="rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm text-neutral-700 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
                      {a}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {listing.houseRules && (
              <div>
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">House rules</h3>
                <p className="mt-3 text-sm leading-7 text-neutral-600 whitespace-pre-line dark:text-neutral-400">{listing.houseRules}</p>
              </div>
            )}

            {blockedPeriods.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">Availability</h3>
                <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
                  The following date ranges are already booked:
                </p>
                <ul className="mt-3 space-y-2">
                  {blockedPeriods.map((p, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300">
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-rose-400" />
                      {p.startDate} → {p.endDate}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Map */}
            {(listing.address || (listing.latitude != null && listing.longitude != null)) && (
              <div>
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">Location</h3>
                <div className="mt-3">
                  <ListingMap
                    address={listing.address ?? listing.destination ?? ""}
                    lat={listing.latitude}
                    lng={listing.longitude}
                  />
                </div>
              </div>
            )}

            {/* Contact host */}
            <div className="rounded-[1.75rem] border border-neutral-200 bg-white p-6 dark:border-neutral-700 dark:bg-neutral-900">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-rose-400 to-orange-300 text-lg font-semibold text-white">
                  {listing.host.publicLabel.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-neutral-900 dark:text-neutral-50">{listing.host.publicLabel}</p>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">Your host</p>
                </div>
              </div>
              <p className="mt-4 text-sm text-neutral-600 dark:text-neutral-400">
                Have questions about this listing? Send {listing.host.publicLabel.split(" ")[0]} a message.
              </p>
              <div className="mt-4">
                <ContactHostModal
                  listingId={listing.id}
                  hostName={listing.host.publicLabel}
                  listingTitle={listing.title}
                  isLoggedIn={!!session}
                />
              </div>
            </div>
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
