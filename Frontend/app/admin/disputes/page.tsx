import { cookies } from "next/headers";

import { AUTH_COOKIE_NAME, decodeAuthSession } from "@/lib/auth-session";
import { backendFetch } from "@/lib/backend";
import { AdminDisputesClient } from "./admin-disputes-client";

export const metadata = { title: "Disputes — AirStay Admin" };

export type AdminDispute = {
  id: number;
  status: "open" | "resolved";
  resolution: string | null;
  refundAmount: number | null;
  description: string;
  adminNote: string | null;
  resolvedAt: string | null;
  createdAt: string | null;
  booking: {
    id: number;
    listingTitle: string | null;
    listingDestination: string | null;
    startDate: string;
    endDate: string;
    totalPrice: number;
    currency: string;
    status: string;
    guestName: string | null;
    guestEmail: string | null;
  } | null;
  openedBy: { id: number; name: string | null; email: string } | null;
  resolvedBy: { id: number; name: string | null } | null;
};

export default async function AdminDisputesPage() {
  const session = decodeAuthSession((await cookies()).get(AUTH_COOKIE_NAME)?.value)!;

  let disputes: AdminDispute[] = [];
  try {
    const res = await backendFetch("/api/admin/disputes", session.token);
    if (res.ok) {
      const payload = (await res.json()) as { data: AdminDispute[] };
      disputes = payload.data;
    }
  } catch {}

  const open = disputes.filter((d) => d.status === "open");
  const resolved = disputes.filter((d) => d.status === "resolved");

  return (
    <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Disputes</h1>
        <p className="mt-1 text-sm text-neutral-500">
          {open.length} open · {resolved.length} resolved
        </p>
      </div>
      <AdminDisputesClient initialDisputes={disputes} />
    </main>
  );
}
