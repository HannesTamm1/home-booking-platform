"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { AdminUser } from "./page";

const ROLE_STYLES: Record<string, string> = {
  admin: "bg-amber-100 text-amber-700",
  host: "bg-blue-100 text-blue-700",
  guest: "bg-neutral-100 text-neutral-600",
};

type Props = {
  initialUsers: AdminUser[];
  initialMeta: { currentPage: number; lastPage: number; total: number };
  initialSearch: string;
};

export function AdminUsersClient({ initialUsers, initialMeta, initialSearch }: Props) {
  const router = useRouter();
  const [users, setUsers] = useState(initialUsers);
  const [search, setSearch] = useState(initialSearch);
  const [isPending, startTransition] = useTransition();
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [error, setError] = useState("");

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    router.push(`/admin/users?${params.toString()}`);
  }

  function act(user: AdminUser, action: "suspend" | "reinstate") {
    setLoadingId(user.id);
    setError("");
    startTransition(async () => {
      const res = await fetch(`/api/admin/users/${user.id}/${action}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: action === "suspend" ? JSON.stringify({ reason: "" }) : "{}",
      });

      if (!res.ok) {
        const data = (await res.json()) as { message?: string };
        setError(data.message ?? "Action failed.");
        setLoadingId(null);
        return;
      }

      setUsers((prev) =>
        prev.map((u) =>
          u.id === user.id ? { ...u, isSuspended: action === "suspend" } : u,
        ),
      );
      setLoadingId(null);
    });
  }

  return (
    <div>
      <form onSubmit={handleSearch} className="mb-6 flex gap-2">
        <input
          type="search"
          placeholder="Search by name or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 rounded-2xl border border-neutral-300 px-4 py-2.5 text-sm focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-100"
        />
        <button
          type="submit"
          className="rounded-2xl bg-neutral-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-neutral-700"
        >
          Search
        </button>
      </form>

      {error && (
        <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-100">
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-neutral-500">User</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-neutral-500">Role</th>
              <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-widest text-neutral-500">Bookings</th>
              <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-widest text-neutral-500">Listings</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-neutral-500">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b border-neutral-50 last:border-0 hover:bg-neutral-50">
                <td className="px-4 py-3">
                  <p className="font-medium text-neutral-900">{user.name ?? "—"}</p>
                  <p className="text-xs text-neutral-400">{user.email}</p>
                </td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${ROLE_STYLES[user.role] ?? "bg-neutral-100 text-neutral-600"}`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-4 py-3 text-center text-neutral-700">{user.bookingCount}</td>
                <td className="px-4 py-3 text-center text-neutral-700">{user.listingCount}</td>
                <td className="px-4 py-3">
                  {user.isSuspended ? (
                    <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-600">
                      Suspended
                    </span>
                  ) : (
                    <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-700">
                      Active
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  {user.role !== "admin" && (
                    <button
                      type="button"
                      disabled={loadingId === user.id || isPending}
                      onClick={() => act(user, user.isSuspended ? "reinstate" : "suspend")}
                      className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition disabled:opacity-50 ${
                        user.isSuspended
                          ? "bg-green-600 text-white hover:bg-green-700"
                          : "bg-red-500 text-white hover:bg-red-600"
                      }`}
                    >
                      {loadingId === user.id
                        ? "…"
                        : user.isSuspended
                        ? "Reinstate"
                        : "Suspend"}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {users.length === 0 && (
          <div className="p-8 text-center text-sm text-neutral-400">No users found.</div>
        )}
      </div>

      {initialMeta.lastPage > 1 && (
        <div className="mt-4 flex items-center justify-center gap-3 text-sm">
          <span className="text-neutral-500">
            Page {initialMeta.currentPage} of {initialMeta.lastPage}
          </span>
        </div>
      )}
    </div>
  );
}
