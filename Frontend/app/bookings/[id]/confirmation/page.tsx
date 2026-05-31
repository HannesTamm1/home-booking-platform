import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { AUTH_COOKIE_NAME, decodeAuthSession } from "@/lib/auth-session";
import { fetchUserBooking } from "@/lib/backend";

type Params = { id: string };

export default async function ConfirmationPage({ params }: { params: Promise<Params> }) {
  const { id } = await params;
  const session = decodeAuthSession((await cookies()).get(AUTH_COOKIE_NAME)?.value);

  if (!session) {
    redirect("/");
  }

  const { booking } = await fetchUserBooking(id, session.token);

  function fmt(date: string) {
    return new Date(date + "T00:00:00").toLocaleDateString("en-US", {
      weekday: "short",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  }

  function formatCurrency(value: number, currency: string) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
    }).format(value);
  }

  return (
    <main className="min-h-screen bg-stone-50 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-50">
      <div className="mx-auto w-full max-w-2xl px-4 py-6 sm:px-6 lg:px-8">
        <header className="flex items-center justify-between border-b border-neutral-200 pb-6 dark:border-neutral-800">
          <Link href="/" className="text-2xl font-semibold tracking-tight text-rose-500">
            airbaba
          </Link>
          <Link
            href="/trips"
            className="rounded-full border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 transition hover:border-neutral-900 hover:text-neutral-900 dark:border-neutral-700 dark:text-neutral-300 dark:hover:border-neutral-400 dark:hover:text-neutral-100"
          >
            My trips
          </Link>
        </header>

        <div className="mt-10 flex flex-col items-center text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-8 w-8 text-green-600">
              <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z" clipRule="evenodd" />
            </svg>
          </div>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight">
            {booking ? "You're confirmed!" : "Booking submitted!"}
          </h1>
          <p className="mt-2 text-sm text-neutral-500">
            {booking
              ? `Reservation #${booking.id} — get ready for your stay.`
              : "Your reservation has been created."}
          </p>
        </div>

        {booking && (
          <div className="mt-8 rounded-[2rem] border border-neutral-200 bg-white p-6 shadow-[0_16px_48px_rgba(0,0,0,0.06)] dark:border-neutral-800 dark:bg-neutral-900 dark:shadow-none">
            {booking.listing && (
              <div className="mb-6 flex gap-4">
                <div className="h-20 w-20 shrink-0 rounded-xl bg-gradient-to-br from-rose-100 via-orange-50 to-stone-100 dark:from-rose-950 dark:via-neutral-900 dark:to-neutral-800" />
                <div>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">{booking.listing.destination ?? "Unknown destination"}</p>
                  <p className="mt-0.5 text-sm font-semibold text-neutral-900 dark:text-neutral-50">{booking.listing.title}</p>
                </div>
              </div>
            )}

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-500 dark:text-neutral-400">Check-in</span>
                <span className="font-medium text-neutral-900 dark:text-neutral-100">{fmt(booking.startDate)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500 dark:text-neutral-400">Check-out</span>
                <span className="font-medium text-neutral-900 dark:text-neutral-100">{fmt(booking.endDate)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500 dark:text-neutral-400">Duration</span>
                <span className="font-medium text-neutral-900 dark:text-neutral-100">
                  {booking.nights} night{booking.nights === 1 ? "" : "s"}
                </span>
              </div>
              <div className="flex justify-between border-t border-neutral-100 pt-3 dark:border-neutral-800">
                <span className="text-neutral-500 dark:text-neutral-400">Total paid</span>
                <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                  {formatCurrency(booking.totalPrice, booking.currency)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500 dark:text-neutral-400">Status</span>
                <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-0.5 text-xs font-semibold text-green-700 capitalize dark:bg-green-950 dark:text-green-400">
                  {booking.status}
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/trips"
            className="flex-1 rounded-2xl border border-neutral-900 bg-neutral-900 py-3 text-center text-sm font-semibold text-white transition hover:bg-neutral-800"
          >
            View all trips
          </Link>
          <Link
            href="/"
            className="flex-1 rounded-2xl border border-neutral-300 py-3 text-center text-sm font-medium text-neutral-700 transition hover:border-neutral-900 hover:text-neutral-900 dark:border-neutral-700 dark:text-neutral-300 dark:hover:border-neutral-400 dark:hover:text-neutral-100"
          >
            Browse more stays
          </Link>
        </div>
      </div>
    </main>
  );
}
