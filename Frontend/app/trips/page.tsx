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
    confirmed: "bg-green-100 text-green-700",
    cancelled: "bg-neutral-100 text-neutral-500",
    pending: "bg-amber-100 text-amber-700",
  };
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${styles[status] ?? "bg-neutral-100 text-neutral-700"}`}>
      {status}
    </span>
  );
}

function TripCard({ booking, isPast }: { booking: Booking; isPast: boolean }) {
  const listing = booking.listing;
  return (
    <article className="overflow-hidden rounded-[1.75rem] border border-neutral-200 bg-white shadow-[0_8px_32px_rgba(0,0,0,0.04)]">
      <div className="flex gap-0">
        <div className="h-full w-36 shrink-0 bg-gradient-to-br from-rose-100 via-orange-50 to-stone-100 min-h-[120px]" />
        <div className="flex flex-1 flex-col justify-between p-5">
          <div>
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-xs text-neutral-500">{listing?.destination ?? "Unknown destination"}</p>
                <h3 className="mt-0.5 text-base font-semibold text-neutral-900">
                  {listing ? (
                    <Link href={`/listings/${listing.id}`} className="hover:text-rose-600 hover:underline">
                      {listing.title}
                    </Link>
                  ) : (
                    `Booking #${booking.id}`
                  )}
                </h3>
              </div>
              <StatusBadge status={booking.status} />
            </div>

            <div className="mt-3 flex flex-wrap gap-4 text-sm text-neutral-600">
              <span>{fmtDate(booking.startDate)} – {fmtDate(booking.endDate)}</span>
              <span>{booking.nights} night{booking.nights === 1 ? "" : "s"}</span>
              <span className="font-medium text-neutral-900">
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
    <main className="min-h-screen bg-stone-50 text-neutral-900">
      <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 lg:px-8">
        <header className="flex items-center justify-between border-b border-neutral-200 pb-6">
          <Link href="/" className="text-2xl font-semibold tracking-tight text-rose-500">
            airbnb
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/settings"
              className="rounded-full border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 transition hover:border-neutral-900 hover:text-neutral-900"
            >
              Settings
            </Link>
            <form action="/api/auth/logout" method="post">
              <button
                type="submit"
                className="rounded-full border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 transition hover:border-neutral-900 hover:text-neutral-900"
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
          <div className="mt-6 rounded-[1.5rem] border border-rose-200 bg-rose-50 p-4 text-sm text-rose-600">
            {error}
          </div>
        )}

        {!error && (
          <>
            <section className="mt-8">
              <h2 className="text-xs font-semibold uppercase tracking-[0.24em] text-neutral-500">
                Upcoming
              </h2>
              {upcoming.length ? (
                <div className="mt-4 space-y-4">
                  {upcoming.map((b) => (
                    <TripCard key={b.id} booking={b} isPast={false} />
                  ))}
                </div>
              ) : (
                <div className="mt-4 rounded-[1.75rem] border border-dashed border-neutral-300 bg-white p-8 text-center">
                  <p className="text-sm text-neutral-500">No upcoming trips.</p>
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
                <h2 className="text-xs font-semibold uppercase tracking-[0.24em] text-neutral-500">
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
