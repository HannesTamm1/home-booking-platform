import Link from "next/link";
import { cookies } from "next/headers";
import { redirect, notFound } from "next/navigation";

import { AUTH_COOKIE_NAME, decodeAuthSession } from "@/lib/auth-session";
import { fetchListing } from "@/lib/backend";
import { CheckoutClient } from "./checkout-client";

function formatCurrency(value: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(value);
}

type Params = { id: string };
type SearchParams = { start_date?: string; end_date?: string; guests?: string };

export default async function CheckoutPage({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams?: Promise<SearchParams>;
}) {
  const { id } = await params;
  const sp = (await searchParams) ?? {};
  const session = decodeAuthSession((await cookies()).get(AUTH_COOKIE_NAME)?.value);

  if (!session) {
    const checkoutUrl = `/listings/${id}/checkout?${new URLSearchParams(sp as Record<string, string>).toString()}`;
    redirect(`/login?redirect=${encodeURIComponent(checkoutUrl)}`);
  }

  const startDate = sp.start_date;
  const endDate = sp.end_date;

  if (!startDate || !endDate) {
    redirect(`/listings/${id}`);
  }

  const { listing } = await fetchListing(id);
  if (!listing) notFound();

  const nights = Math.max(0, Math.round(
    (new Date(endDate).getTime() - new Date(startDate).getTime()) / 86400000,
  ));

  if (nights <= 0) {
    redirect(`/listings/${id}`);
  }

  const guests = sp.guests ? Number.parseInt(sp.guests, 10) : 1;
  const baseTotal = listing.pricePerNight * nights;

  function fmt(date: string) {
    return new Date(date + "T00:00:00").toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  return (
    <main className="min-h-screen bg-stone-50 text-neutral-900">
      <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 lg:px-8">
        <header className="flex items-center justify-between border-b border-neutral-200 pb-6">
          <Link href="/" className="text-2xl font-semibold tracking-tight text-rose-500">
            airbnb
          </Link>
          <Link
            href={`/listings/${id}`}
            className="text-sm text-neutral-500 hover:text-neutral-900"
          >
            ← Back to listing
          </Link>
        </header>

        <div className="mt-8">
          <span className="text-xs font-semibold uppercase tracking-[0.24em] text-rose-500">
            Step 3 of 3
          </span>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Confirm your reservation</h1>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
          <div className="space-y-6">
            <div className="rounded-[1.75rem] border border-neutral-200 bg-white p-6">
              <h2 className="text-base font-semibold text-neutral-900">Your trip</h2>
              <div className="mt-4 space-y-3">
                <div className="flex justify-between">
                  <div>
                    <p className="text-sm font-medium text-neutral-700">Dates</p>
                    <p className="text-sm text-neutral-500">
                      {fmt(startDate)} – {fmt(endDate)}
                    </p>
                  </div>
                  <Link
                    href={`/listings/${id}?check_in=${startDate}&check_out=${endDate}&guests=${guests}`}
                    className="text-sm font-medium text-neutral-900 underline underline-offset-4"
                  >
                    Edit
                  </Link>
                </div>
                <div className="flex justify-between">
                  <div>
                    <p className="text-sm font-medium text-neutral-700">Guests</p>
                    <p className="text-sm text-neutral-500">
                      {guests} guest{guests === 1 ? "" : "s"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-neutral-200 bg-white p-6">
              <h2 className="text-base font-semibold text-neutral-900">Cancellation policy</h2>
              <p className="mt-2 text-sm text-neutral-600 leading-6">
                Free cancellation before check-in. After that, this reservation is non-refundable.
              </p>
            </div>

            <div className="rounded-[1.75rem] border border-neutral-200 bg-white p-6">
              <h2 className="text-base font-semibold text-neutral-900">Rules</h2>
              <p className="mt-2 text-sm text-neutral-600 leading-6">
                By selecting the button below, I agree to the host&apos;s rules and the platform&apos;s terms of service.
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-[1.75rem] border border-neutral-200 bg-white p-6">
              <div className="flex gap-4">
                <div className="h-20 w-20 shrink-0 rounded-xl bg-gradient-to-br from-rose-100 via-orange-50 to-stone-100" />
                <div>
                  <p className="text-xs text-neutral-500">{listing.destination ?? "Unknown destination"}</p>
                  <p className="mt-0.5 text-sm font-semibold text-neutral-900">{listing.title}</p>
                  <p className="mt-1 text-xs text-neutral-500">Up to {listing.maxGuests} guests</p>
                </div>
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-neutral-200 bg-white p-6">
              <h2 className="text-base font-semibold text-neutral-900">Price breakdown</h2>
              <div className="mt-4 space-y-3">
                <div className="flex justify-between text-sm text-neutral-700">
                  <span>
                    {formatCurrency(listing.pricePerNight, listing.currency)} × {nights} night{nights === 1 ? "" : "s"}
                  </span>
                  <span>{formatCurrency(baseTotal, listing.currency)}</span>
                </div>
                <div className="flex justify-between border-t border-neutral-100 pt-3 text-sm font-semibold text-neutral-900">
                  <span>Total</span>
                  <span>{formatCurrency(baseTotal, listing.currency)}</span>
                </div>
              </div>
            </div>

            <CheckoutClient
              listingId={listing.id}
              startDate={startDate}
              endDate={endDate}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
