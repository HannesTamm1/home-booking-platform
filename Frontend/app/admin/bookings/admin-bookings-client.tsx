"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { AdminBooking } from "./page";

const STATUS_OPTS = ["", "confirmed", "cancelled", "refunded", "pending"];
const STATUS_STYLES: Record<string, string> = {
  confirmed: "bg-green-100 text-green-700",
  cancelled: "bg-neutral-100 text-neutral-500",
  refunded: "bg-blue-100 text-blue-700",
  pending: "bg-amber-100 text-amber-700",
};

type Props = {
  initialBookings: AdminBooking[];
  initialMeta: { currentPage: number; lastPage: number; total: number };
  initialStatus: string;
  initialSearch: string;
};

export function AdminBookingsClient({ initialBookings, initialMeta, initialStatus, initialSearch }: Props) {
  const router = useRouter();
  const [status, setStatus] = useState(initialStatus);
  const [search, setSearch] = useState(initialSearch);

  function applyFilters(e?: React.FormEvent) {
    e?.preventDefault();
    const p = new URLSearchParams();
    if (status) p.set("status", status);
    if (search) p.set("search", search);
    router.push(`/admin/bookings?${p}`);
  }

  function navPage(page: number) {
    const p = new URLSearchParams();
    if (status) p.set("status", status);
    if (search) p.set("search", search);
    p.set("page", String(page));
    router.push(`/admin/bookings?${p}`);
  }

  return (
    <div>
      {/* Filters */}
      <form onSubmit={applyFilters} className="mb-6 flex flex-wrap gap-3">
        <input
          type="search"
          placeholder="Guest name or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-[200px] rounded-2xl border border-neutral-300 bg-white px-4 py-2.5 text-sm focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-100 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-50 dark:placeholder-neutral-500"
        />
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); }}
          className="rounded-2xl border border-neutral-300 px-4 py-2.5 text-sm focus:border-rose-400 focus:outline-none"
        >
          {STATUS_OPTS.map((s) => (
            <option key={s} value={s}>{s || "All statuses"}</option>
          ))}
        </select>
        <button
          type="submit"
          className="rounded-2xl bg-neutral-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-neutral-700"
        >
          Filter
        </button>
      </form>

      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-100 dark:border-neutral-800">
              {["#", "Guest", "Listing", "Dates", "Revenue", "Payout", "Status", ""].map((h) => (
                <th key={h} className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-widest text-neutral-400 dark:text-neutral-500">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {initialBookings.map((b) => (
              <tr key={b.id} className="border-b border-neutral-50 last:border-0 hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-800">
                <td className="px-3 py-3 text-xs text-neutral-400 dark:text-neutral-500">#{b.id}</td>
                <td className="px-3 py-3">
                  <p className="max-w-[140px] truncate font-medium text-neutral-900 dark:text-neutral-50">{b.guestName ?? "—"}</p>
                  <p className="max-w-[140px] truncate text-xs text-neutral-400 dark:text-neutral-500">{b.guestEmail}</p>
                </td>
                <td className="px-3 py-3">
                  <p className="max-w-[150px] truncate text-neutral-700 dark:text-neutral-300">{b.listingTitle}</p>
                  <p className="text-xs text-neutral-400 dark:text-neutral-500">{b.listingDestination}</p>
                </td>
                <td className="px-3 py-3 text-xs whitespace-nowrap text-neutral-700 dark:text-neutral-300">
                  {b.startDate}<br />{b.endDate}
                  <span className="text-neutral-400"> ({b.nights}n)</span>
                </td>
                <td className="px-3 py-3 font-semibold text-neutral-900 dark:text-neutral-50">€{b.totalPrice.toFixed(0)}</td>
                <td className="px-3 py-3 text-neutral-600 dark:text-neutral-400">{b.hostPayout ? `€${b.hostPayout.toFixed(0)}` : "—"}</td>
                <td className="px-3 py-3">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLES[b.status] ?? "bg-neutral-100 text-neutral-600"}`}>
                    {b.status}
                  </span>
                  {b.hasDispute && (
                    <span className="ml-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-600">
                      dispute
                    </span>
                  )}
                </td>
                <td className="px-3 py-3 text-right">
                  <Link href={`/admin/disputes?booking=${b.id}`} className="text-xs text-rose-500 hover:underline">
                    Dispute
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {initialBookings.length === 0 && (
          <div className="p-8 text-center text-sm text-neutral-400 dark:text-neutral-500">No bookings match those filters.</div>
        )}
      </div>

      {initialMeta.lastPage > 1 && (
        <div className="mt-4 flex items-center justify-center gap-3">
          {initialMeta.currentPage > 1 && (
            <button
              type="button"
              onClick={() => navPage(initialMeta.currentPage - 1)}
              className="rounded-xl border border-neutral-300 px-4 py-2 text-sm hover:border-neutral-900"
            >
              ← Prev
            </button>
          )}
          <span className="text-sm text-neutral-500 dark:text-neutral-400">
            Page {initialMeta.currentPage} of {initialMeta.lastPage}
          </span>
          {initialMeta.currentPage < initialMeta.lastPage && (
            <button
              type="button"
              onClick={() => navPage(initialMeta.currentPage + 1)}
              className="rounded-xl border border-neutral-300 px-4 py-2 text-sm hover:border-neutral-900"
            >
              Next →
            </button>
          )}
        </div>
      )}
    </div>
  );
}
