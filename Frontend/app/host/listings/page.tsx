import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";

import { AUTH_COOKIE_NAME, decodeAuthSession } from "@/lib/auth-session";
import { fetchHostListings } from "@/lib/backend";
import { HostListingsClient } from "./host-listings-client";

export const metadata = { title: "My listings — AirStay" };

const STATUS_LABELS: Record<string, { label: string; classes: string }> = {
  draft: { label: "Draft", classes: "bg-neutral-100 text-neutral-600" },
  pending_review: { label: "In review", classes: "bg-amber-100 text-amber-700" },
  published: { label: "Published", classes: "bg-green-100 text-green-700" },
  rejected: { label: "Rejected", classes: "bg-red-100 text-red-600" },
  suspended: { label: "Suspended", classes: "bg-orange-100 text-orange-700" },
};

export default async function HostListingsPage() {
  const session = decodeAuthSession((await cookies()).get(AUTH_COOKIE_NAME)?.value);

  if (!session) {
    redirect("/login?redirect=/host/listings");
  }

  if (session.role !== "host" && session.role !== "admin") {
    redirect("/become-a-host");
  }

  const { listings, error } = await fetchHostListings(session.token);

  return (
    <main className="min-h-screen bg-stone-50 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-50">
      <div className="mx-auto flex w-full max-w-5xl flex-col px-4 py-8 sm:px-6">
        <header className="mb-8 flex items-center justify-between">
          <div>
            <Link href="/" className="text-xl font-semibold tracking-tight text-rose-500">
              airbaba
            </Link>
            <h1 className="mt-3 text-2xl font-semibold tracking-tight">My listings</h1>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              Manage your properties and track their performance.
            </p>
          </div>
          <Link
            href="/host/listings/new"
            className="rounded-2xl bg-rose-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-rose-600"
          >
            + New listing
          </Link>
        </header>

        {error && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-600 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-400">
            {error}
          </div>
        )}

        {!error && listings && listings.length === 0 && (
          <div className="rounded-[2rem] border border-dashed border-neutral-300 bg-white p-12 text-center dark:border-neutral-700 dark:bg-neutral-900">
            <p className="text-2xl">🏠</p>
            <p className="mt-3 text-sm font-medium text-neutral-700 dark:text-neutral-300">No listings yet</p>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              Create your first listing and start welcoming guests.
            </p>
            <Link
              href="/host/listings/new"
              className="mt-5 inline-block rounded-2xl bg-rose-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-rose-600"
            >
              Create a listing
            </Link>
          </div>
        )}

        {listings && listings.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {listings.map((listing) => {
              const status = STATUS_LABELS[listing.status] ?? { label: listing.status, classes: "bg-neutral-100 text-neutral-600" };
              return (
                <div
                  key={listing.id}
                  className="overflow-hidden rounded-[1.75rem] border border-neutral-200 bg-white shadow-[0_8px_24px_rgba(0,0,0,0.04)] dark:border-neutral-800 dark:bg-neutral-900 dark:shadow-none"
                >
                  <div className="relative aspect-[4/3] bg-gradient-to-br from-rose-100 via-orange-50 to-stone-100 dark:from-rose-950 dark:via-neutral-900 dark:to-neutral-800">
                    {listing.photos && listing.photos.length > 0 && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={listing.photos[0].url}
                        alt={listing.title}
                        className="h-full w-full object-cover"
                      />
                    )}
                    <span className={`absolute right-3 top-3 rounded-full px-3 py-1 text-xs font-semibold ${status.classes}`}>
                      {status.label}
                    </span>
                  </div>

                  <div className="p-5">
                    <h2 className="truncate text-base font-semibold text-neutral-900 dark:text-neutral-50">
                      {listing.title}
                    </h2>
                    <p className="mt-0.5 text-sm text-neutral-500 dark:text-neutral-400">
                      {listing.destination ?? "No destination"} &middot;{" "}
                      {listing.maxGuests} guests
                    </p>

                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                      <div className="rounded-xl bg-neutral-50 p-2.5 dark:bg-neutral-800">
                        <p className="text-neutral-400 dark:text-neutral-500">Price / night</p>
                        <p className="mt-1 font-semibold text-neutral-800 dark:text-neutral-100">
                          €{listing.pricePerNight.toFixed(0)}
                        </p>
                      </div>
                      <div className="rounded-xl bg-neutral-50 p-2.5 dark:bg-neutral-800">
                        <p className="text-neutral-400 dark:text-neutral-500">Confirmed bookings</p>
                        <p className="mt-1 font-semibold text-neutral-800 dark:text-neutral-100">
                          {listing.metrics.confirmedBookings}
                        </p>
                      </div>
                    </div>

                    <HostListingsClient listing={listing} />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-8 flex justify-start">
          <Link
            href="/"
            className="text-sm text-neutral-500 transition hover:text-neutral-900"
          >
            ← Back to home
          </Link>
        </div>
      </div>
    </main>
  );
}
