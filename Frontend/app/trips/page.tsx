import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { AUTH_COOKIE_NAME, decodeAuthSession } from "@/lib/auth-session";
import { fetchUserBookings, type Booking } from "@/lib/backend";
import { CancelBookingButton } from "./trips-client";

function formatCurrency(value: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(value);
}

function fmtDate(date: string) {
  return new Date(date + "T00:00:00").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    confirmed: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400",
    cancelled: "bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400",
    pending: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
  };
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${styles[status] ?? "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"}`}>
      {status}
    </span>
  );
}

function TripCard({ booking, isPast }: { booking: Booking; isPast: boolean }) {
  const listing = booking.listing;
  return (
    <article className="overflow-hidden rounded-[1.75rem] border border-neutral-200 bg-white shadow-[0_8px_32px_rgba(0,0,0,0.04)] dark:border-neutral-800 dark:bg-neutral-900 dark:shadow-none">
      <div className="flex gap-0">
        <div className="min-h-[120px] h-full w-36 shrink-0 bg-gradient-to-br from-rose-100 via-orange-50 to-stone-100 dark:from-rose-950 dark:via-neutral-900 dark:to-neutral-800" />
        <div className="flex flex-1 flex-col justify-between p-5">
          <div>
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">{listing?.destination ?? "Unknown destination"}</p>
                <h3 className="mt-0.5 text-base font-semibold text-neutral-900 dark:text-neutral-50">
                  {listing ? (
                    <Link href={`/listings/${listing.id}`} className="hover:text-rose-500 hover:underline">
                      {listing.title}
                    </Link>
                  ) : (
                    `Booking #${booking.id}`
                  )}
                </h3>
              </div>
              <StatusBadge status={booking.status} />
            </div>

            <div className="mt-3 flex flex-wrap gap-4 text-sm text-neutral-600 dark:text-neutral-400">
              <span>{fmtDate(booking.startDate)} – {fmtDate(booking.endDate)}</span>
              <span>{booking.nights} night{booking.nights === 1 ? "" : "s"}</span>
              <span className="font-medium text-neutral-900 dark:text-neutral-200">
                {formatCurrency(booking.totalPrice, booking.currency)}
              </span>
            </div>
          </div>

          {!isPast && booking.status === "confirmed" && (
            <div className="mt-4">
              <CancelBookingButton bookingId={booking.id} />
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

export default async function TripsPage() {
  const session = decodeAuthSession((await cookies()).get(AUTH_COOKIE_NAME)?.value);

  if (!session) {
    redirect("/login?redirect=/trips");
  }

  const { bookings, error } = await fetchUserBookings(session.token);

  const today = new Date().toISOString().split("T")[0];
  const upcoming = (bookings ?? []).filter(
    (b) => b.status !== "cancelled" && b.endDate >= today,
  );
  const past = (bookings ?? []).filter(
    (b) => b.status === "cancelled" || b.endDate < today,
  );

  return (
    <main className="min-h-screen bg-stone-50 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-50">
      <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 lg:px-8">
        <header className="flex items-center justify-between border-b border-neutral-200 pb-6 dark:border-neutral-800">
          <Link href="/" className="text-2xl font-semibold tracking-tight text-rose-500">
            airbaba
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/settings"
              className="rounded-full border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 transition hover:border-neutral-900 hover:text-neutral-900 dark:border-neutral-700 dark:text-neutral-300 dark:hover:border-neutral-400 dark:hover:text-neutral-100"
            >
              Settings
            </Link>
            <form action="/api/auth/logout" method="post">
              <button
                type="submit"
                className="rounded-full border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 transition hover:border-neutral-900 hover:text-neutral-900 dark:border-neutral-700 dark:text-neutral-300 dark:hover:border-neutral-400 dark:hover:text-neutral-100"
              >
                Log out
              </button>
            </form>
          </div>
        </header>

        <div className="mt-8">
          <h1 className="text-3xl font-semibold tracking-tight">Your trips</h1>
        </div>

        {error && (
          <div className="mt-6 rounded-[1.5rem] border border-rose-200 bg-rose-50 p-4 text-sm text-rose-600 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-400">
            {error}
          </div>
        )}

        {!error && (
          <>
            <section className="mt-8">
              <h2 className="text-xs font-semibold uppercase tracking-[0.24em] text-neutral-500 dark:text-neutral-400">
                Upcoming
              </h2>
              {upcoming.length ? (
                <div className="mt-4 space-y-4">
                  {upcoming.map((b) => (
                    <TripCard key={b.id} booking={b} isPast={false} />
                  ))}
                </div>
              ) : (
                <div className="mt-4 rounded-[1.75rem] border border-dashed border-neutral-300 bg-white p-8 text-center dark:border-neutral-700 dark:bg-neutral-900">
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">No upcoming trips.</p>
                  <Link
                    href="/"
                    className="mt-3 inline-block text-sm font-medium text-rose-500 hover:text-rose-600"
                  >
                    Browse stays →
                  </Link>
                </div>
              )}
            </section>

            {past.length > 0 && (
              <section className="mt-10">
                <h2 className="text-xs font-semibold uppercase tracking-[0.24em] text-neutral-500 dark:text-neutral-400">
                  Past & cancelled
                </h2>
                <div className="mt-4 space-y-4">
                  {past.map((b) => (
                    <TripCard key={b.id} booking={b} isPast />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </main>
  );
}
