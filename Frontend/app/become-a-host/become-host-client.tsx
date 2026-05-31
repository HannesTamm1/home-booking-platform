"use client";

import { useState, useTransition } from "react";

type Application = {
  id: number;
  status: string;
  note: string | null;
  created_at: string;
} | null;

export function BecomeHostClient({ initialApplication }: { initialApplication: Application }) {
  const [isPending, startTransition] = useTransition();
  const [application, setApplication] = useState<Application>(initialApplication);
  const [note, setNote] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      const response = await fetch("/api/user/host-application", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note: note.trim() }),
      });
      const data = (await response.json()) as { message?: string; application?: Application };
      if (!response.ok) {
        setError(data.message ?? "Something went wrong. Please try again.");
        return;
      }
      setApplication(data.application ?? null);
    });
  }

  if (application?.status === "pending") {
    return (
      <div className="space-y-4">
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 dark:border-amber-800 dark:bg-amber-950">
          <p className="font-semibold text-amber-800 dark:text-amber-300">Application under review</p>
          <p className="mt-1 text-sm text-amber-700 dark:text-amber-400">
            Your application has been submitted and is waiting for admin review. We'll update your account once a decision is made.
          </p>
        </div>
        <p className="text-center text-xs text-neutral-400 dark:text-neutral-500">
          Questions? Contact support.
        </p>
      </div>
    );
  }

  if (application?.status === "approved") {
    return (
      <div className="rounded-2xl border border-green-200 bg-green-50 px-5 py-4 dark:border-green-900 dark:bg-green-950">
        <p className="font-semibold text-green-800 dark:text-green-300">Application approved!</p>
        <p className="mt-1 text-sm text-green-700 dark:text-green-400">
          Your account has been upgraded. Log out and back in to access host features.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {application?.status === "rejected" && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900 dark:bg-red-950 dark:text-red-400">
          Your previous application was rejected. You can apply again below.
        </div>
      )}

      <div>
        <label htmlFor="host-note" className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
          Tell us about yourself <span className="font-normal text-neutral-400">(optional)</span>
        </label>
        <textarea
          id="host-note"
          rows={3}
          maxLength={1000}
          placeholder="What kind of space do you want to host? Any experience with hosting guests?"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="w-full resize-none rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-rose-400 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-50 dark:placeholder-neutral-500 dark:focus:border-rose-500"
        />
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-400">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-2xl bg-rose-500 py-4 text-sm font-semibold text-white transition hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isPending ? "Submitting application…" : "Apply to become a host"}
      </button>
      <p className="text-center text-xs text-neutral-400 dark:text-neutral-500">
        Applications are reviewed by our team within 24 hours.
      </p>
    </form>
  );
}
