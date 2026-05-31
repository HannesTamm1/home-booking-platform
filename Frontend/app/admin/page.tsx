import { cookies } from "next/headers";

import { AUTH_COOKIE_NAME, decodeAuthSession } from "@/lib/auth-session";
import { backendFetch } from "@/lib/backend";

export const metadata = { title: "Admin overview — AirStay" };

type OverviewData = {
  activeUsers: number;
  liveListings: number;
  pendingListings: number;
  openDisputes: number;
  gmv: number;
  bookingCount: number;
  weeklyBookings: { date: string; count: number }[];
};

export default async function AdminOverviewPage() {
  const session = decodeAuthSession((await cookies()).get(AUTH_COOKIE_NAME)?.value)!;

  let data: OverviewData | null = null;
  try {
    const res = await backendFetch("/api/admin/overview", session.token);
    if (res.ok) {
      const payload = (await res.json()) as { data: OverviewData };
      data = payload.data;
    }
  } catch {}

  const maxCount = Math.max(1, ...(data?.weeklyBookings.map((d) => d.count) ?? [1]));

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Platform overview</h1>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">Real-time snapshot of the marketplace.</p>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
            { label: "Active users", value: data?.activeUsers.toLocaleString() ?? "—" },
          { label: "Live listings", value: data?.liveListings.toLocaleString() ?? "—" },
          {
            label: "Pending review",
            value: data?.pendingListings.toLocaleString() ?? "—",
            alert: (data?.pendingListings ?? 0) > 0,
            href: "/admin/listings",
          },
          {
            label: "Open disputes",
            value: data?.openDisputes.toLocaleString() ?? "—",
            alert: (data?.openDisputes ?? 0) > 0,
            href: "/admin/disputes",
          },
          { label: "GMV this month", value: data ? `€${data.gmv.toLocaleString()}` : "—" },
        ].map(({ label, value, alert, href }) => (
          <div
            key={label}
            className={`rounded-2xl border p-5 ${alert ? "border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950" : "border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900"}`}
          >
            <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">{label}</p>
            <p className="mt-2 text-2xl font-bold tracking-tight dark:text-neutral-50">{value}</p>
            {href && alert && (
              <a href={href} className="mt-1 block text-xs text-amber-700 underline dark:text-amber-400">View →</a>
            )}
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
        <h2 className="mb-5 text-sm font-semibold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
          Confirmed bookings — last 7 days
        </h2>
        <div className="flex h-32 items-end gap-3">
          {data?.weeklyBookings.map(({ date, count }) => (
            <div key={date} className="flex flex-1 flex-col items-center gap-1">
              <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">{count}</span>
              <div
                className="w-full rounded-t-lg bg-rose-400 transition-all dark:bg-rose-600"
                style={{ height: `${Math.round((count / maxCount) * 100)}%`, minHeight: "4px" }}
              />
              <span className="text-xs text-neutral-400 dark:text-neutral-500">{date}</span>
            </div>
          )) ?? (
            <p className="text-sm text-neutral-400 dark:text-neutral-500">No data</p>
          )}
        </div>
      </div>

      {(data?.pendingListings ?? 0) > 0 && (
        <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5 dark:border-amber-800 dark:bg-amber-950">
          <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
            {data!.pendingListings} listing{data!.pendingListings !== 1 ? "s" : ""} waiting for review.
          </p>
          <a href="/admin/listings" className="mt-1 text-sm text-amber-700 underline dark:text-amber-400">
            Go to moderation queue →
          </a>
        </div>
      )}
    </main>
  );
}
