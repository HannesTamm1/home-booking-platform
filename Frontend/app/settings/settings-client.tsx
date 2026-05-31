"use client";

import Link from "next/link";
import { useState } from "react";

import type { AuthUser } from "@/lib/backend";

type Application = {
  id: number;
  status: "pending" | "approved" | "rejected";
  note: string | null;
  admin_note: string | null;
  created_at: string;
} | null;

type Props = {
  session: AuthUser;
  initialApplication: Application;
};

export function SettingsClient({ session, initialApplication }: Props) {
  const [passwordForm, setPasswordForm] = useState({
    current_password: "",
    password: "",
    password_confirmation: "",
  });
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const [application, setApplication] = useState<Application>(initialApplication);
  const [noteInput, setNoteInput] = useState("");
  const [applyError, setApplyError] = useState<string | null>(null);
  const [applyLoading, setApplyLoading] = useState(false);

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(false);
    setPasswordLoading(true);

    try {
      const res = await fetch("/api/user/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(passwordForm),
      });

      const data = await res.json();

      if (!res.ok) {
        const errors = data?.errors as Record<string, string[]> | undefined;
        const first = errors
          ? Object.values(errors).flat()[0]
          : (data?.message ?? "Something went wrong.");
        setPasswordError(first);
      } else {
        setPasswordSuccess(true);
        setPasswordForm({ current_password: "", password: "", password_confirmation: "" });
      }
    } catch {
      setPasswordError("Unable to reach the server.");
    } finally {
      setPasswordLoading(false);
    }
  }

  async function handleApply(e: React.FormEvent) {
    e.preventDefault();
    setApplyError(null);
    setApplyLoading(true);

    try {
      const res = await fetch("/api/user/host-application", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note: noteInput }),
      });

      const data = await res.json();

      if (!res.ok) {
        const errors = data?.errors as Record<string, string[]> | undefined;
        const first = errors
          ? Object.values(errors).flat()[0]
          : (data?.message ?? "Something went wrong.");
        setApplyError(first);
      } else {
        setApplication(data.application);
        setNoteInput("");
      }
    } catch {
      setApplyError("Unable to reach the server.");
    } finally {
      setApplyLoading(false);
    }
  }

  const roleLabel: Record<string, string> = {
    guest: "Guest",
    host: "Host",
    admin: "Admin",
  };

  return (
    <main className="min-h-screen bg-stone-50 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-50">
      <div className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6">
        <div className="mb-8 flex items-center gap-4">
          <Link
            href="/"
            className="text-sm text-neutral-500 transition hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
          >
            ← Back
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight">Account settings</h1>
        </div>

        {/* Profile card */}
        <div className="mb-6 rounded-2xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
          <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
            Profile
          </p>
          <div className="mt-3 space-y-1">
            <p className="font-medium dark:text-neutral-50">{session.name ?? "—"}</p>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">{session.email}</p>
            <span className="inline-block rounded-full bg-neutral-100 px-3 py-0.5 text-xs font-semibold text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
              {roleLabel[session.role] ?? session.role}
            </span>
          </div>
        </div>

        {/* Change password */}
        <section className="mb-6 rounded-2xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
          <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
            Change password
          </p>

          {passwordSuccess && (
            <div className="mb-4 rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700 dark:bg-green-950 dark:text-green-400">
              Password updated successfully.
            </div>
          )}
          {passwordError && (
            <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-950 dark:text-red-400">
              {passwordError}
            </div>
          )}

          <form onSubmit={handlePasswordSubmit} className="space-y-3">
            <input
              type="password"
              placeholder="Current password"
              value={passwordForm.current_password}
              onChange={(e) =>
                setPasswordForm((f) => ({ ...f, current_password: e.target.value }))
              }
              required
              className="h-11 w-full rounded-xl border border-neutral-300 bg-white px-4 text-sm outline-none transition focus:border-neutral-900 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-50 dark:placeholder-neutral-500 dark:focus:border-neutral-500"
            />
            <input
              type="password"
              placeholder="New password"
              value={passwordForm.password}
              onChange={(e) => setPasswordForm((f) => ({ ...f, password: e.target.value }))}
              required
              minLength={8}
              className="h-11 w-full rounded-xl border border-neutral-300 bg-white px-4 text-sm outline-none transition focus:border-neutral-900 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-50 dark:placeholder-neutral-500 dark:focus:border-neutral-500"
            />
            <input
              type="password"
              placeholder="Confirm new password"
              value={passwordForm.password_confirmation}
              onChange={(e) =>
                setPasswordForm((f) => ({ ...f, password_confirmation: e.target.value }))
              }
              required
              className="h-11 w-full rounded-xl border border-neutral-300 bg-white px-4 text-sm outline-none transition focus:border-neutral-900 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-50 dark:placeholder-neutral-500 dark:focus:border-neutral-500"
            />
            <button
              type="submit"
              disabled={passwordLoading}
              className="h-11 w-full rounded-xl bg-neutral-900 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:opacity-50 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-white"
            >
              {passwordLoading ? "Saving…" : "Update password"}
            </button>
          </form>
        </section>

        {/* Host application section — hidden for admins */}
        {session.role !== "admin" && (
          <section className="rounded-2xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
              Host access
            </p>

            {session.role === "host" ? (
              <p className="text-sm text-neutral-700 dark:text-neutral-300">
                You already have host access and can create listings.
              </p>
            ) : application?.status === "pending" ? (
              <div className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:bg-amber-950 dark:text-amber-400">
                Your application is under review. We'll update your role once an admin
                decides.
                {application.admin_note && (
                  <p className="mt-1 font-medium">Note: {application.admin_note}</p>
                )}
              </div>
            ) : application?.status === "approved" ? (
              <div className="rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700 dark:bg-green-950 dark:text-green-400">
                Your application was approved. Your role has been upgraded to Host.
              </div>
            ) : (
              <>
                {application?.status === "rejected" && (
                  <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-950 dark:text-red-400">
                    Your previous application was rejected.
                    {application.admin_note && (
                      <p className="mt-1 font-medium">Reason: {application.admin_note}</p>
                    )}
                    <p className="mt-1">You can apply again below.</p>
                  </div>
                )}
                <p className="mb-4 text-sm text-neutral-600 dark:text-neutral-400">
                  Apply to become a host and start listing your properties.
                </p>

                {applyError && (
                  <div className="mb-3 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-950 dark:text-red-400">
                    {applyError}
                  </div>
                )}

                <form onSubmit={handleApply} className="space-y-3">
                  <textarea
                    placeholder="Tell us why you'd like to become a host (optional)"
                    value={noteInput}
                    onChange={(e) => setNoteInput(e.target.value)}
                    rows={3}
                    maxLength={1000}
                    className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-neutral-900 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-50 dark:placeholder-neutral-500 dark:focus:border-neutral-500"
                  />
                  <button
                    type="submit"
                    disabled={applyLoading}
                    className="h-11 w-full rounded-xl bg-rose-500 text-sm font-semibold text-white transition hover:bg-rose-600 disabled:opacity-50"
                  >
                    {applyLoading ? "Submitting…" : "Apply to become a host"}
                  </button>
                </form>
              </>
            )}
          </section>
        )}
      </div>
    </main>
  );
}
