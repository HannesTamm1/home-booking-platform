import { cookies } from "next/headers";
import Link from "next/link";

import { AUTH_COOKIE_NAME, decodeAuthSession } from "@/lib/auth-session";
import { backendFetch } from "@/lib/backend";
import { ConnectBanner } from "./connect-banner";

export const metadata = { title: "Earnings — AirStay Host" };

type MonthEntry = { label: string; grossRevenue: number; hostPayout: number; bookings: number };
type ListingEntry = {
  id: number; title: string; destination: string | null; status: string;
  coverPhotoUrl: string | null; totalBookings: number; grossRevenue: number; hostPayout: number;
};
type EarningsData = {
  connectComplete: boolean;
  connectId: string | null;
  platformFeePercent: number;
  allTime: { grossRevenue: number; hostPayout: number; platformFees: number; bookings: number };
  released: { amount: number; bookings: number };
  pending: { amount: number; bookings: number };
  monthly: MonthEntry[];
  perListing: ListingEntry[];
};

function euro(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);
}

export default async function HostEarningsPage() {
  const session = decodeAuthSession((await cookies()).get(AUTH_COOKIE_NAME)?.value)!;

  let data: EarningsData | null = null;
  try {
    const res = await backendFetch("/api/host/earnings", session.token);
    if (res.ok) {
      const payload = (await res.json()) as { data: EarningsData };
      data = payload.data;
    }
  } catch {}

  const maxPayout = Math.max(1, ...(data?.monthly.map((m) => m.hostPayout) ?? [1]));

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Earnings</h1>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          Platform fee: {data?.platformFeePercent ?? 15}% · You keep {100 - (data?.platformFeePercent ?? 15)}%.
        </p>
      </div>

      {data && !data.connectComplete && (
        <ConnectBanner />
      )}

      {/* Summary KPIs */}
      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: "Total earned (all-time)", value: euro(data?.allTime.hostPayout ?? 0), sub: `${data?.allTime.bookings ?? 0} bookings` },
          { label: "Released", value: euro(data?.released.amount ?? 0), sub: "Check-in passed" },
          { label: "Pending release", value: euro(data?.pending.amount ?? 0), sub: "Upcoming stays" },
          { label: "Platform fees paid", value: euro(data?.allTime.platformFees ?? 0), sub: `${data?.platformFeePercent ?? 15}% of gross` },
        ].map(({ label, value, sub }) => (
          <div key={label} className="rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
            <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400 dark:text-neutral-500">{label}</p>
            <p className="mt-2 text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">{value}</p>
            <p className="mt-0.5 text-xs text-neutral-400 dark:text-neutral-500">{sub}</p>
          </div>
        ))}
      </div>

      {/* Monthly chart */}
      <div className="mb-8 rounded-2xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
        <h2 className="mb-5 text-sm font-semibold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
          Monthly payout — last 12 months
        </h2>
        <div className="flex h-36 items-end gap-1.5">
          {data?.monthly.map((m) => (
            <div key={m.label} className="flex flex-1 flex-col items-center gap-1">
              <div
                className="w-full rounded-t-md bg-rose-400 transition-all dark:bg-rose-600"
                style={{ height: `${Math.round((m.hostPayout / maxPayout) * 100)}%`, minHeight: "3px" }}
                title={`${m.label}: ${euro(m.hostPayout)}`}
              />
              <span className="text-[9px] text-neutral-400 -rotate-45 origin-top-left translate-y-2 dark:text-neutral-500">
                {m.label.split(" ")[0]}
              </span>
            </div>
          )) ?? <p className="text-sm text-neutral-400 dark:text-neutral-500">No data</p>}
        </div>
      </div>

      {/* Per-listing breakdown */}
      {data && data.perListing.length > 0 && (
        <div>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
            By listing
          </h2>
          <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-100 dark:border-neutral-800">
                  {["Listing", "Status", "Bookings", "Gross", "Your payout"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-neutral-400 dark:text-neutral-500">
                      {h}
                    </th>
                  ))}
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {data.perListing.map((l) => (
                  <tr key={l.id} className="border-b border-neutral-50 last:border-0 hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-800">
                    <td className="px-4 py-3">
                      <p className="max-w-[200px] truncate font-medium text-neutral-900 dark:text-neutral-50">{l.title}</p>
                      <p className="text-xs text-neutral-400 dark:text-neutral-500">{l.destination}</p>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={l.status} />
                    </td>
                    <td className="px-4 py-3 text-neutral-700 dark:text-neutral-300">{l.totalBookings}</td>
                    <td className="px-4 py-3 text-neutral-700 dark:text-neutral-300">{euro(l.grossRevenue)}</td>
                    <td className="px-4 py-3 font-semibold text-neutral-900 dark:text-neutral-50">{euro(l.hostPayout)}</td>
                    <td className="px-4 py-3 text-right">
                      <Link href={`/host/listings/${l.id}/calendar`} className="text-xs text-rose-500 hover:underline">
                        Calendar
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </main>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    published: "bg-green-100 text-green-700",
    draft: "bg-neutral-100 text-neutral-500",
    pending_review: "bg-amber-100 text-amber-700",
    rejected: "bg-red-100 text-red-600",
    suspended: "bg-orange-100 text-orange-700",
  };
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${map[status] ?? "bg-neutral-100 text-neutral-600"}`}>
      {status.replace("_", " ")}
    </span>
  );
}
