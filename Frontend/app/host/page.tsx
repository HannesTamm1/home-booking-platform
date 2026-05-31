import { cookies } from "next/headers";
import Link from "next/link";

import { AUTH_COOKIE_NAME, decodeAuthSession } from "@/lib/auth-session";
import { backendFetch } from "@/lib/backend";

export const metadata = { title: "Host dashboard — AirStay" };

type DashboardData = {
  monthRevenue: number;
  occupancyPercent: number;
  upcomingBookingsCount: number;
  averageRating: number | null;
  publishedListings: number;
  totalListings: number;
  upcomingBookings: Array<{
    id: number;
    listingTitle: string | null;
    startDate: string;
    endDate: string;
    nights: number;
    totalPrice: number;
    currency: string;
    status: string;
  }>;
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(value);
}

export default async function HostDashboardPage() {
  const session = decodeAuthSession((await cookies()).get(AUTH_COOKIE_NAME)?.value)!;

  let data: DashboardData | null = null;
  try {
    const res = await backendFetch("/api/host/dashboard", session.token);
    if (res.ok) {
      const payload = (await res.json()) as { data: DashboardData };
      data = payload.data;
    }
  } catch {}

  const firstName = session.name?.split(" ")[0] ?? "there";

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-8 dark:text-neutral-50">
        <h1 className="text-2xl font-semibold tracking-tight dark:text-neutral-50">Good morning, {firstName}</h1>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">Here's what's happening with your listings.</p>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: "Revenue this month", value: data ? formatCurrency(data.monthRevenue) : "—" },
          { label: "Occupancy", value: data ? `${data.occupancyPercent}%` : "—" },
          { label: "Upcoming stays", value: data?.upcomingBookingsCount.toString() ?? "—" },
          { label: "Avg. rating", value: data?.averageRating ? `★ ${data.averageRating.toFixed(2)}` : "—" },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
            <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400 dark:text-neutral-500">{label}</p>
            <p className="mt-2 text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">{value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
            Upcoming stays
          </h2>
          {data?.upcomingBookings.length === 0 || !data ? (
            <div className="rounded-[2rem] border border-dashed border-neutral-300 bg-white p-8 text-center dark:border-neutral-700 dark:bg-neutral-900">
              <p className="text-sm text-neutral-500 dark:text-neutral-400">No upcoming stays.</p>
              <Link href="/host/listings" className="mt-3 inline-block text-sm text-rose-500 underline">
                Manage your listings
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {data.upcomingBookings.map((booking) => (
                <div key={booking.id} className="flex items-center gap-4 rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
                  <div className="h-10 w-10 shrink-0 rounded-full bg-rose-100 text-rose-500 flex items-center justify-center text-sm font-bold">
                    {booking.nights}n
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate font-medium text-neutral-900 dark:text-neutral-50">{booking.listingTitle}</p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                      {booking.startDate} → {booking.endDate}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-50">
                      {formatCurrency(booking.totalPrice)}
                    </p>
                    <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">
                      confirmed
                    </span>
                  </div>
                </div>
              ))}
              <Link
                href="/host/bookings"
                className="block text-center text-sm text-rose-500 transition hover:underline"
              >
                View all reservations →
              </Link>
            </div>
          )}
        </div>

        <div>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
            Quick actions
          </h2>
          <div className="space-y-3">
            <Link
              href="/host/listings/new"
              className="flex items-center gap-3 rounded-2xl border border-neutral-200 bg-white p-4 transition hover:border-rose-300 hover:bg-rose-50 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-rose-800 dark:hover:bg-rose-950"
            >
              <span className="text-xl">➕</span>
              <div>
                <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-50">New listing</p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">Add a property to start hosting</p>
              </div>
            </Link>
            <Link
              href="/host/listings"
              className="flex items-center gap-3 rounded-2xl border border-neutral-200 bg-white p-4 transition hover:border-neutral-400 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-neutral-600"
            >
              <span className="text-xl">🏠</span>
              <div>
                <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-50">My listings</p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  {data?.publishedListings ?? 0} published · {(data?.totalListings ?? 0) - (data?.publishedListings ?? 0)} other
                </p>
              </div>
            </Link>
            <Link
              href="/host/bookings"
              className="flex items-center gap-3 rounded-2xl border border-neutral-200 bg-white p-4 transition hover:border-neutral-400 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-neutral-600"
            >
              <span className="text-xl">📋</span>
              <div>
                <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-50">All reservations</p>
                <p className="text-xs text-neutral-500">View full booking history</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
