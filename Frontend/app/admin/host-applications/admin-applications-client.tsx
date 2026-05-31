"use client";

import Link from "next/link";
import { useState } from "react";

export type Application = {
  id: number;
  status: "pending" | "approved" | "rejected";
  note: string | null;
  admin_note: string | null;
  created_at: string;
  user: { id: number; name: string | null; email: string };
  reviewed_by: { id: number; name: string | null } | null;
};

type Props = { initialApplications: Application[] };

const statusStyles: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-600",
};

export function AdminApplicationsClient({ initialApplications }: Props) {
  const [applications, setApplications] = useState<Application[]>(initialApplications);
  const [adminNotes, setAdminNotes] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState<Record<number, string>>({});
  const [error, setError] = useState<string | null>(null);

  async function act(id: number, action: "approve" | "reject") {
    setLoading((l) => ({ ...l, [id]: action }));
    setError(null);

    try {
      const res = await fetch(`/api/admin/host-applications/${id}/${action}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ admin_note: adminNotes[id] ?? "" }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data?.message ?? "Something went wrong.");
        return;
      }

      setApplications((prev) =>
        prev.map((a) =>
          a.id === id
            ? { ...a, status: action === "approve" ? "approved" : "rejected" }
            : a,
        ),
      );
    } catch {
      setError("Unable to reach the server.");
    } finally {
      setLoading((l) => {
        const next = { ...l };
        delete next[id];
        return next;
      });
    }
  }

  const pending = applications.filter((a) => a.status === "pending");
  const reviewed = applications.filter((a) => a.status !== "pending");

  return (
    <main className="min-h-screen bg-stone-50 text-neutral-900">
      <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
        <div className="mb-8 flex items-center gap-4">
          <Link href="/" className="text-sm text-neutral-500 transition hover:text-neutral-900">
            ← Back
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight">Host applications</h1>
        </div>

        {error && (
          <div className="mb-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
        )}

        {pending.length === 0 && (
          <div className="mb-8 rounded-2xl border border-dashed border-neutral-300 bg-white p-8 text-center text-sm text-neutral-500">
            No pending applications.
          </div>
        )}

        {pending.length > 0 && (
          <div className="mb-8 space-y-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500">
              Pending ({pending.length})
            </p>
            {pending.map((a) => (
              <ApplicationCard
                key={a.id}
                application={a}
                adminNote={adminNotes[a.id] ?? ""}
                onNoteChange={(v) => setAdminNotes((n) => ({ ...n, [a.id]: v }))}
                onApprove={() => act(a.id, "approve")}
                onReject={() => act(a.id, "reject")}
                approveLoading={loading[a.id] === "approve"}
                rejectLoading={loading[a.id] === "reject"}
              />
            ))}
          </div>
        )}

        {reviewed.length > 0 && (
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500">
              Reviewed ({reviewed.length})
            </p>
            {reviewed.map((a) => (
              <div
                key={a.id}
                className="rounded-2xl border border-neutral-200 bg-white p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">{a.user.name ?? a.user.email}</p>
                    <p className="text-xs text-neutral-500">{a.user.email}</p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-0.5 text-xs font-semibold ${statusStyles[a.status]}`}
                  >
                    {a.status}
                  </span>
                </div>
                {a.note && (
                  <p className="mt-2 text-sm text-neutral-600">"{a.note}"</p>
                )}
                {a.admin_note && (
                  <p className="mt-1 text-xs text-neutral-400">Admin note: {a.admin_note}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

function ApplicationCard({
  application,
  adminNote,
  onNoteChange,
  onApprove,
  onReject,
  approveLoading,
  rejectLoading,
}: {
  application: Application;
  adminNote: string;
  onNoteChange: (v: string) => void;
  onApprove: () => void;
  onReject: () => void;
  approveLoading: boolean;
  rejectLoading: boolean;
}) {
  const busy = approveLoading || rejectLoading;

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-medium">{application.user.name ?? application.user.email}</p>
          <p className="text-xs text-neutral-500">{application.user.email}</p>
          <p className="mt-0.5 text-xs text-neutral-400">
            Applied {new Date(application.created_at).toLocaleDateString()}
          </p>
        </div>
        <span className="rounded-full bg-amber-100 px-3 py-0.5 text-xs font-semibold text-amber-700">
          pending
        </span>
      </div>

      {application.note && (
        <p className="mt-3 rounded-xl bg-neutral-50 px-4 py-3 text-sm text-neutral-700">
          "{application.note}"
        </p>
      )}

      <div className="mt-4 space-y-2">
        <textarea
          placeholder="Optional note to applicant…"
          value={adminNote}
          onChange={(e) => onNoteChange(e.target.value)}
          rows={2}
          className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm outline-none transition focus:border-neutral-400"
        />
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onApprove}
            disabled={busy}
            className="flex-1 rounded-xl bg-green-600 py-2 text-sm font-semibold text-white transition hover:bg-green-700 disabled:opacity-50"
          >
            {approveLoading ? "Approving…" : "Approve"}
          </button>
          <button
            type="button"
            onClick={onReject}
            disabled={busy}
            className="flex-1 rounded-xl bg-red-500 py-2 text-sm font-semibold text-white transition hover:bg-red-600 disabled:opacity-50"
          >
            {rejectLoading ? "Rejecting…" : "Reject"}
          </button>
        </div>
      </div>
    </div>
  );
}
