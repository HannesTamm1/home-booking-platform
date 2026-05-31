import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";

import { AUTH_COOKIE_NAME, decodeAuthSession } from "@/lib/auth-session";
import { backendFetch, fetchListing } from "@/lib/backend";
import { CalendarClient } from "./calendar-client";

export const metadata = { title: "Calendar — AirStay Host" };

export type CalendarData = {
  listingId: number;
  basePrice: number;
  weekendPrice: number | null;
  minNights: number;
  blockedDates: string[];
  customPrices: Record<string, number>;
  bookedRanges: Array<{ bookingId: number; startDate: string; endDate: string }>;
};

export default async function ListingCalendarPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ year?: string; month?: string }>;
}) {
  const { id } = await params;
  const sp = (await searchParams) ?? {};

  const session = decodeAuthSession((await cookies()).get(AUTH_COOKIE_NAME)?.value);
  if (!session) redirect(`/login?redirect=/host/listings/${id}/calendar`);
  if (session.role !== "host" && session.role !== "admin") redirect("/become-a-host");

  const now = new Date();
  const year = sp.year ? Number(sp.year) : now.getFullYear();
  const month = sp.month ? Number(sp.month) : now.getMonth() + 1;

  const { listing } = await fetchListing(id);
  if (!listing) notFound();

  let calendarData: CalendarData | null = null;
  try {
    const res = await backendFetch(
      `/api/host/listings/${id}/calendar?year=${year}&month=${month}`,
      session.token,
    );
    if (res.ok) {
      const payload = (await res.json()) as { data: CalendarData };
      calendarData = payload.data;
    }
  } catch {}

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Link href="/host/listings" className="text-sm text-neutral-500 hover:text-neutral-900">
            ← My listings
          </Link>
          <h1 className="mt-2 text-xl font-semibold tracking-tight">{listing.title}</h1>
          <p className="text-sm text-neutral-500">Calendar & availability</p>
        </div>
        <Link
          href={`/host/listings/${id}/edit`}
          className="rounded-2xl border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 transition hover:border-neutral-900"
        >
          Edit listing
        </Link>
      </div>

      {calendarData ? (
        <CalendarClient
          listingId={Number(id)}
          data={calendarData}
          year={year}
          month={month}
        />
      ) : (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-600">
          Could not load calendar data.
        </div>
      )}
    </main>
  );
}
