"use client";

import { useState, useTransition } from "react";
import type { AdminListing } from "./page";

const FLAG_LABELS: Record<string, string> = {
  price_outlier: "Price outlier",
};

type Props = { initialListings: AdminListing[] };

export function AdminListingsModerationClient({ initialListings }: Props) {
  const [listings, setListings] = useState(initialListings);
  const [notes, setNotes] = useState<Record<number, string>>({});
  const [isPending, startTransition] = useTransition();
  const [loading, setLoading] = useState<Record<number, string>>({});
  const [error, setError] = useState("");

  function act(id: number, action: "approve" | "reject") {
    setLoading((l) => ({ ...l, [id]: action }));
    setError("");
    startTransition(async () => {
      const res = await fetch(`/api/admin/listings/${id}/${action}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ admin_note: notes[id] ?? "" }),
      });

      if (!res.ok) {
        const data = (await res.json()) as { message?: string };
        setError(data.message ?? "Action failed.");
        setLoading((l) => { const n = { ...l }; delete n[id]; return n; });
        return;
      }

      setListings((prev) => prev.filter((l) => l.id !== id));
      setLoading((l) => { const n = { ...l }; delete n[id]; return n; });
    });
  }

  if (listings.length === 0) {
    return (
      <div className="rounded-[2rem] border border-dashed border-neutral-300 bg-white p-12 text-center dark:border-neutral-700 dark:bg-neutral-900">
        <p className="text-2xl">✅</p>
        <p className="mt-3 text-sm font-medium text-neutral-700 dark:text-neutral-300">No listings pending review</p>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">All caught up.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-400">
          {error}
        </div>
      )}
      {listings.map((listing) => {
        const busy = !!loading[listing.id];
        return (
          <div key={listing.id} className="overflow-hidden rounded-2xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
            <div className="p-5">
              <div className="flex flex-wrap items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-semibold text-neutral-900 truncate dark:text-neutral-50">{listing.title}</h3>
                    {listing.flags.map((flag) => (
                      <span key={flag} className="shrink-0 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
                        ⚠ {FLAG_LABELS[flag] ?? flag}
                      </span>
                    ))}
                  </div>
                  <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                    {listing.propertyType ?? "Property"} · {listing.destination ?? "Unknown"} ·{" "}
                    {listing.maxGuests} guests · €{listing.pricePerNight}/night
                  </p>
                  <p className="mt-1 text-xs text-neutral-400 dark:text-neutral-500">
                    Host: {listing.host.name ?? listing.host.publicLabel}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs text-neutral-400">Submitted</p>
                  <p className="text-xs font-medium text-neutral-700">
                    {listing.createdAt ? new Date(listing.createdAt).toLocaleDateString('en-GB') : "—"}
                  </p>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <textarea
                  placeholder="Note to host (optional)…"
                  value={notes[listing.id] ?? ""}
                  onChange={(e) => setNotes((n) => ({ ...n, [listing.id]: e.target.value }))}
                  rows={2}
                  className="w-full resize-none rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-neutral-400 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-50 dark:placeholder-neutral-500 dark:focus:border-neutral-600"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => act(listing.id, "approve")}
                    disabled={busy || isPending}
                    className="flex-1 rounded-xl bg-green-600 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700 disabled:opacity-50"
                  >
                    {loading[listing.id] === "approve" ? "Approving…" : "Approve & publish"}
                  </button>
                  <button
                    type="button"
                    onClick={() => act(listing.id, "reject")}
                    disabled={busy || isPending}
                    className="flex-1 rounded-xl bg-red-500 py-2.5 text-sm font-semibold text-white transition hover:bg-red-600 disabled:opacity-50"
                  >
                    {loading[listing.id] === "reject" ? "Rejecting…" : "Reject"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
