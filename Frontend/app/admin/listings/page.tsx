import { cookies } from "next/headers";

import { AUTH_COOKIE_NAME, decodeAuthSession } from "@/lib/auth-session";
import { backendFetch } from "@/lib/backend";
import { AdminListingsModerationClient } from "./admin-listings-client";

export const metadata = { title: "Listing moderation — AirStay Admin" };

export type AdminListing = {
  id: number;
  status: string;
  title: string;
  destination: string | null;
  propertyType: string | null;
  pricePerNight: number;
  currency: string;
  maxGuests: number;
  adminNote: string | null;
  flags: string[];
  host: { id?: number; name?: string | null; publicLabel: string };
  metrics: { confirmedBookings: number; confirmedRevenue: number };
  createdAt: string | null;
};

export default async function AdminListingsModerationPage() {
  const session = decodeAuthSession((await cookies()).get(AUTH_COOKIE_NAME)?.value)!;

  let listings: AdminListing[] = [];
  try {
    const res = await backendFetch("/api/admin/listings", session.token);
    if (res.ok) {
      const payload = (await res.json()) as { data: AdminListing[] };
      listings = payload.data;
    }
  } catch {}

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Listing moderation</h1>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          {listings.length} listing{listings.length !== 1 ? "s" : ""} pending review.
        </p>
      </div>
      <AdminListingsModerationClient initialListings={listings} />
    </main>
  );
}
