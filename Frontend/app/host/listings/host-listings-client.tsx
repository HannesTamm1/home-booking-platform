"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import type { Listing } from "@/lib/backend";

type Props = { listing: Listing };

export function HostListingsClient({ listing }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  function handleDelete() {
    if (!confirm(`Delete "${listing.title}"? This cannot be undone.`)) return;
    setError("");
    startTransition(async () => {
      const response = await fetch(`/api/host/listings/${listing.id}`, { method: "DELETE" });
      if (!response.ok) {
        const data = (await response.json()) as { message?: string };
        setError(data.message ?? "Failed to delete listing.");
        return;
      }
      router.refresh();
    });
  }

  function handleSubmit() {
    setError("");
    startTransition(async () => {
      const response = await fetch(`/api/host/listings/${listing.id}/submit`, { method: "POST" });
      if (!response.ok) {
        const data = (await response.json()) as { message?: string };
        setError(data.message ?? "Failed to submit for review.");
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="mt-4 space-y-2">
      {error && (
        <p className="text-xs text-rose-600">{error}</p>
      )}
      <div className="flex gap-2">
        <Link
          href={`/host/listings/${listing.id}/edit`}
          className="flex-1 rounded-xl border border-neutral-300 px-3 py-2 text-center text-xs font-semibold text-neutral-700 transition hover:border-neutral-900 hover:text-neutral-900 dark:border-neutral-700 dark:text-neutral-300 dark:hover:border-neutral-400 dark:hover:text-white"
        >
          Edit
        </Link>
        {listing.status === "published" && (
          <Link
            href={`/host/listings/${listing.id}/calendar`}
            className="flex-1 rounded-xl border border-neutral-300 px-3 py-2 text-center text-xs font-semibold text-neutral-700 transition hover:border-neutral-900 hover:text-neutral-900 dark:border-neutral-700 dark:text-neutral-300 dark:hover:border-neutral-400 dark:hover:text-white"
          >
            Calendar
          </Link>
        )}
        {(listing.status === "draft" || listing.status === "rejected") && (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isPending}
            className="flex-1 rounded-xl bg-rose-500 px-3 py-2 text-xs font-semibold text-white transition hover:bg-rose-600 disabled:opacity-70"
          >
            {isPending ? "…" : "Submit for review"}
          </button>
        )}
        <button
          type="button"
          onClick={handleDelete}
          disabled={isPending}
          className="rounded-xl border border-neutral-200 px-3 py-2 text-xs font-semibold text-neutral-400 transition hover:border-red-300 hover:text-red-500 disabled:opacity-70 dark:border-neutral-700 dark:text-neutral-500 dark:hover:border-red-700"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
