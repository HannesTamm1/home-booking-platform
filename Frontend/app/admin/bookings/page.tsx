import { cookies } from "next/headers";

import { AUTH_COOKIE_NAME, decodeAuthSession } from "@/lib/auth-session";
import { backendFetch } from "@/lib/backend";
import { AdminBookingsClient } from "./admin-bookings-client";

export const metadata = { title: "Bookings — AirStay Admin" };

export type AdminBooking = {
  id: number;
  listingId: number;
  listingTitle: string | null;
  listingDestination: string | null;
  guestName: string | null;
  guestEmail: string | null;
  startDate: string;
  endDate: string;
  nights: number;
  totalPrice: number;
  hostPayout: number | null;
  currency: string;
  status: string;
  createdAt: string | null;
  hasDispute: boolean;
};

export default async function AdminBookingsPage({
  searchParams,
}: {
  searchParams?: Promise<{ status?: string; search?: string; page?: string }>;
}) {
  const session = decodeAuthSession((await cookies()).get(AUTH_COOKIE_NAME)?.value)!;
  const sp = (await searchParams) ?? {};

  const params = new URLSearchParams({ page: sp.page ?? "1" });
  if (sp.status) params.set("status", sp.status);
  if (sp.search) params.set("search", sp.search);

  let bookings: AdminBooking[] = [];
  let meta = { currentPage: 1, lastPage: 1, total: 0 };
  try {
    const res = await backendFetch(`/api/admin/bookings?${params}`, session.token);
    if (res.ok) {
      const payload = (await res.json()) as { data: AdminBooking[]; meta: typeof meta };
      bookings = payload.data;
      meta = payload.meta;
    }
  } catch {}

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Bookings</h1>
        <p className="mt-1 text-sm text-neutral-500">{meta.total.toLocaleString()} total bookings</p>
      </div>
      <AdminBookingsClient
        initialBookings={bookings}
        initialMeta={meta}
        initialStatus={sp.status ?? ""}
        initialSearch={sp.search ?? ""}
      />
    </main>
  );
}
