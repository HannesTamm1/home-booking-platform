import { cookies } from "next/headers";
import Link from "next/link";

import { AUTH_COOKIE_NAME, decodeAuthSession } from "@/lib/auth-session";
import { backendFetch } from "@/lib/backend";

export const metadata = { title: "Reservations — AirStay Host" };

type HostBooking = {
  id: number;
  listingId: number;
  listingTitle: string | null;
  listingDestination: string | null;
  startDate: string;
  endDate: string;
  nights: number;
  totalPrice: number;
  currency: string;
  status: string;
  createdAt: string | null;
};

const STATUS_STYLES: Record<string, string> = {
  confirmed: "bg-green-100 text-green-700",
  cancelled: "bg-neutral-100 text-neutral-500",
  pending: "bg-amber-100 text-amber-700",
};

export default async function HostBookingsPage() {
  const session = decodeAuthSession((await cookies()).get(AUTH_COOKIE_NAME)?.value)!;

  let bookings: HostBooking[] = [];
  try {
    const res = await backendFetch("/api/host/bookings", session.token);
    if (res.ok) {
      const payload = (await res.json()) as { data: HostBooking[] };
      bookings = payload.data;
    }
  } catch {}

  const upcoming = bookings.filter(
    (b) => b.status === "confirmed" && new Date(b.startDate) >= new Date(),
  );
  const past = bookings.filter(
    (b) => b.status === "confirmed" && new Date(b.startDate) < new Date(),
  );
  const other = bookings.filter((b) => b.status !== "confirmed");

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Reservations</h1>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          All bookings across your listings.
        </p>
      </div>

      {bookings.length === 0 && (
        <div className="rounded-[2rem] border border-dashed border-neutral-300 bg-white p-12 text-center dark:border-neutral-700 dark:bg-neutral-900">
          <p className="text-sm text-neutral-500 dark:text-neutral-400">No reservations yet.</p>
        </div>
      )}

      {upcoming.length > 0 && (
        <BookingSection title="Upcoming" bookings={upcoming} />
      )}
      {past.length > 0 && (
        <BookingSection title="Past stays" bookings={past} />
      )}
      {other.length > 0 && (
        <BookingSection title="Cancelled / other" bookings={other} />
      )}
    </main>
  );
}

function BookingSection({ title, bookings }: { title: string; bookings: HostBooking[] }) {
  return (
    <div className="mb-8">
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
        {title} ({bookings.length})
      </h2>
      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-100 dark:border-neutral-800">
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-neutral-400 dark:text-neutral-500">Listing</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-neutral-400 dark:text-neutral-500">Dates</th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-widest text-neutral-400 dark:text-neutral-500">Revenue</th>
              <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-widest text-neutral-400 dark:text-neutral-500">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
              <tr key={b.id} className="border-b border-neutral-50 last:border-0 hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-800">
                <td className="px-4 py-3">
                  <p className="max-w-[200px] truncate font-medium text-neutral-900 dark:text-neutral-50">{b.listingTitle}</p>
                  <p className="text-xs text-neutral-400 dark:text-neutral-500">{b.listingDestination}</p>
                </td>
                <td className="px-4 py-3 text-neutral-700 dark:text-neutral-300">
                  {b.startDate} → {b.endDate}
                  <span className="ml-1 text-xs text-neutral-400 dark:text-neutral-500">({b.nights}n)</span>
                </td>
                <td className="px-4 py-3 text-right font-semibold text-neutral-900 dark:text-neutral-50">
                  €{b.totalPrice.toFixed(0)}
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLES[b.status] ?? "bg-neutral-100 text-neutral-600"}`}>
                    {b.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/host/listings/${b.listingId}/calendar`}
                    className="text-xs text-rose-500 hover:underline"
                  >
                    Calendar
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
