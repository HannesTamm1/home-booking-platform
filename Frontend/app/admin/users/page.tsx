import { cookies } from "next/headers";

import { AUTH_COOKIE_NAME, decodeAuthSession } from "@/lib/auth-session";
import { backendFetch } from "@/lib/backend";
import { AdminUsersClient } from "./admin-users-client";

export const metadata = { title: "Users — AirStay Admin" };

export type AdminUser = {
  id: number;
  name: string | null;
  email: string;
  role: string;
  isSuspended: boolean;
  suspensionReason: string | null;
  bookingCount: number;
  listingCount: number;
  createdAt: string | null;
};

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams?: Promise<{ search?: string; page?: string }>;
}) {
  const session = decodeAuthSession((await cookies()).get(AUTH_COOKIE_NAME)?.value)!;
  const sp = (await searchParams) ?? {};
  const search = sp.search ?? "";
  const page = sp.page ?? "1";

  let users: AdminUser[] = [];
  let meta = { currentPage: 1, lastPage: 1, total: 0 };

  try {
    const params = new URLSearchParams({ page });
    if (search) params.set("search", search);
    const res = await backendFetch(`/api/admin/users?${params}`, session.token);
    if (res.ok) {
      const payload = (await res.json()) as { data: AdminUser[]; meta: typeof meta };
      users = payload.data;
      meta = payload.meta;
    }
  } catch {}

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Users</h1>
          <p className="mt-1 text-sm text-neutral-500">{meta.total.toLocaleString()} total users</p>
        </div>
      </div>
      <AdminUsersClient initialUsers={users} initialMeta={meta} initialSearch={search} />
    </main>
  );
}
