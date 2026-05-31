"use client";

import { useState, useTransition } from "react";
import type { AdminDispute } from "./page";

const RESOLUTION_LABELS: Record<string, string> = {
  refund_guest: "Full refund to guest",
  side_with_host: "Side with host — no refund",
  partial: "Partial refund",
};

type Props = { initialDisputes: AdminDispute[] };

export function AdminDisputesClient({ initialDisputes }: Props) {
  const [disputes, setDisputes] = useState(initialDisputes);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [resolution, setResolution] = useState<Record<number, string>>({});
  const [partialAmount, setPartialAmount] = useState<Record<number, string>>({});
  const [notes, setNotes] = useState<Record<number, string>>({});
  const [isPending, startTransition] = useTransition();
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [error, setError] = useState("");

  function resolve(dispute: AdminDispute) {
    const res = resolution[dispute.id];
    if (!res) return;
    setLoadingId(dispute.id);
    setError("");
    startTransition(async () => {
      const body: Record<string, unknown> = {
        resolution: res,
        admin_note: notes[dispute.id] ?? "",
      };
      if (res === "partial") {
        body.refund_amount_cents = Math.round(Number(partialAmount[dispute.id] ?? 0) * 100);
      }

      const response = await fetch(`/api/admin/disputes/${dispute.id}/resolve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const d = (await response.json()) as { message?: string };
        setError(d.message ?? "Failed to resolve dispute.");
        setLoadingId(null);
        return;
      }

      const payload = (await response.json()) as { data: AdminDispute };
      setDisputes((prev) => prev.map((d) => d.id === dispute.id ? payload.data : d));
      setLoadingId(null);
      setExpandedId(null);
    });
  }

  const open = disputes.filter((d) => d.status === "open");
  const resolved = disputes.filter((d) => d.status === "resolved");

  return (
    <div className="space-y-8">
      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-400">{error}</div>
      )}

      {open.length === 0 && (
        <div className="rounded-[2rem] border border-dashed border-neutral-300 bg-white p-10 text-center dark:border-neutral-700 dark:bg-neutral-900">
          <p className="text-2xl">⚖️</p>
          <p className="mt-3 text-sm font-medium text-neutral-700 dark:text-neutral-300">No open disputes</p>
        </div>
      )}

      {open.length > 0 && (
        <section>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
            Open ({open.length})
          </h2>
          <div className="space-y-3">
            {open.map((d) => (
              <DisputeCard
                key={d.id}
                dispute={d}
                expanded={expandedId === d.id}
                onToggle={() => setExpandedId(expandedId === d.id ? null : d.id)}
                resolution={resolution[d.id] ?? ""}
                onResolutionChange={(v) => setResolution((p) => ({ ...p, [d.id]: v }))}
                partialAmount={partialAmount[d.id] ?? ""}
                onPartialAmountChange={(v) => setPartialAmount((p) => ({ ...p, [d.id]: v }))}
                note={notes[d.id] ?? ""}
                onNoteChange={(v) => setNotes((p) => ({ ...p, [d.id]: v }))}
                onResolve={() => resolve(d)}
                loading={loadingId === d.id || isPending}
              />
            ))}
          </div>
        </section>
      )}

      {resolved.length > 0 && (
        <section>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
            Resolved ({resolved.length})
          </h2>
          <div className="space-y-2">
            {resolved.map((d) => (
              <div key={d.id} className="rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-neutral-900 dark:text-neutral-50">{d.booking?.listingTitle}</p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                      {d.booking?.guestName} · {d.booking?.startDate} → {d.booking?.endDate}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-700">
                      {RESOLUTION_LABELS[d.resolution ?? ""] ?? d.resolution}
                    </span>
                    {d.refundAmount && (
                      <p className="mt-0.5 text-xs text-neutral-500">Refund: €{d.refundAmount}</p>
                    )}
                  </div>
                </div>
                {d.adminNote && (
                  <p className="mt-2 text-xs text-neutral-400 dark:text-neutral-500">Note: {d.adminNote}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function DisputeCard({
  dispute,
  expanded,
  onToggle,
  resolution,
  onResolutionChange,
  partialAmount,
  onPartialAmountChange,
  note,
  onNoteChange,
  onResolve,
  loading,
}: {
  dispute: AdminDispute;
  expanded: boolean;
  onToggle: () => void;
  resolution: string;
  onResolutionChange: (v: string) => void;
  partialAmount: string;
  onPartialAmountChange: (v: string) => void;
  note: string;
  onNoteChange: (v: string) => void;
  onResolve: () => void;
  loading: boolean;
}) {
  const b = dispute.booking;
  return (
    <div className="overflow-hidden rounded-2xl border border-red-200 bg-white dark:border-red-900 dark:bg-neutral-900">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-start justify-between gap-4 p-5 text-left hover:bg-neutral-50 dark:hover:bg-neutral-800"
      >
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-600">
              Open
            </span>
            <span className="text-xs text-neutral-400">#{dispute.id}</span>
          </div>
          <p className="mt-1 truncate font-medium text-neutral-900 dark:text-neutral-50">{b?.listingTitle ?? "Unknown listing"}</p>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Guest: {b?.guestName ?? b?.guestEmail ?? "?"} ·{" "}
            {b?.startDate} → {b?.endDate} ·{" "}
            Total: €{b?.totalPrice.toFixed(0)}
          </p>
        </div>
        <span className="shrink-0 text-neutral-400 dark:text-neutral-500">{expanded ? "▲" : "▼"}</span>
      </button>

      {expanded && (
        <div className="border-t border-neutral-100 px-5 pb-5 pt-4 dark:border-neutral-800">
          <div className="mb-4 rounded-xl bg-neutral-50 p-4 dark:bg-neutral-800">
            <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">Description</p>
            <p className="mt-1 text-sm text-neutral-700 dark:text-neutral-300">{dispute.description}</p>
            <p className="mt-2 text-xs text-neutral-400 dark:text-neutral-500">
              Opened by {dispute.openedBy?.name ?? dispute.openedBy?.email ?? "unknown"} ·{" "}
              {dispute.createdAt ? new Date(dispute.createdAt).toLocaleDateString('en-GB') : ""}
            </p>
          </div>

          <div className="space-y-3">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">Resolution</label>
              <div className="space-y-2">
                {(["refund_guest", "side_with_host", "partial"] as const).map((opt) => (
                  <label key={opt} className="flex cursor-pointer items-center gap-3 rounded-xl border border-neutral-200 p-3 hover:border-neutral-400 dark:border-neutral-700 dark:hover:border-neutral-500">
                    <input
                      type="radio"
                      name={`resolution-${dispute.id}`}
                      value={opt}
                      checked={resolution === opt}
                      onChange={() => onResolutionChange(opt)}
                      className="accent-rose-500"
                    />
                    <div>
                      <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200">{RESOLUTION_LABELS[opt]}</p>
                      {opt === "refund_guest" && b && (
                        <p className="text-xs text-neutral-500 dark:text-neutral-400">Full €{b.totalPrice.toFixed(0)}</p>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {resolution === "partial" && (
              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">Refund amount (€)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  max={b?.totalPrice}
                  value={partialAmount}
                  onChange={(e) => onPartialAmountChange(e.target.value)}
                  placeholder="0.00"
                  className="w-full rounded-xl border border-neutral-300 px-4 py-2.5 text-sm focus:border-rose-400 focus:outline-none"
                />
              </div>
            )}

            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">Admin note (optional)</label>
              <textarea
                rows={2}
                value={note}
                onChange={(e) => onNoteChange(e.target.value)}
                placeholder="Internal note on this resolution…"
                className="w-full resize-none rounded-xl border border-neutral-200 px-3 py-2 text-sm focus:border-neutral-400 focus:outline-none"
              />
            </div>

            <button
              type="button"
              onClick={onResolve}
              disabled={!resolution || loading}
              className="w-full rounded-xl bg-neutral-900 py-3 text-sm font-semibold text-white transition hover:bg-neutral-700 disabled:opacity-50"
            >
              {loading ? "Resolving…" : "Confirm resolution"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
