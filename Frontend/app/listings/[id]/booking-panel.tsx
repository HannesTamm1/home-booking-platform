"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

type BookingPanelProps = {
  listingId: number;
  pricePerNight: number;
  currency: string;
  maxGuests: number;
  isLoggedIn: boolean;
  defaultCheckIn?: string;
  defaultCheckOut?: string;
  defaultGuests?: number;
  blockedPeriods: Array<{ startDate: string; endDate: string }>;
};

function formatCurrency(value: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

function isDateInBlockedPeriod(
  date: string,
  blocked: Array<{ startDate: string; endDate: string }>,
): boolean {
  return blocked.some((p) => date >= p.startDate && date < p.endDate);
}

function rangeOverlapsBlocked(
  start: string,
  end: string,
  blocked: Array<{ startDate: string; endDate: string }>,
): boolean {
  return blocked.some((p) => start < p.endDate && end > p.startDate);
}

export function BookingPanel({
  listingId,
  pricePerNight,
  currency,
  maxGuests,
  isLoggedIn,
  defaultCheckIn = "",
  defaultCheckOut = "",
  defaultGuests = 1,
  blockedPeriods,
}: BookingPanelProps) {
  const router = useRouter();
  const today = new Date().toISOString().split("T")[0];
  const checkOutRef = useRef<HTMLInputElement>(null);

  const [checkIn, setCheckIn] = useState(defaultCheckIn);
  const [checkOut, setCheckOut] = useState(defaultCheckOut);
  const [guests, setGuests] = useState(Math.min(defaultGuests, maxGuests));

  const nights =
    checkIn && checkOut
      ? Math.max(0, Math.round((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000))
      : 0;

  const hasConflict = checkIn && checkOut ? rangeOverlapsBlocked(checkIn, checkOut, blockedPeriods) : false;
  const subtotal = pricePerNight * nights;

  function handleCheckInChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setCheckIn(value);
    if (value && checkOut && checkOut <= value) {
      setCheckOut("");
    }
    if (value && checkOutRef.current) {
      checkOutRef.current.focus();
      try { checkOutRef.current.showPicker(); } catch {}
    }
  }

  function handleReserve() {
    if (!checkIn || !checkOut || nights <= 0 || hasConflict) return;

    const checkoutUrl = `/listings/${listingId}/checkout?start_date=${checkIn}&end_date=${checkOut}&guests=${guests}`;

    if (!isLoggedIn) {
      router.push(`/login?redirect=${encodeURIComponent(checkoutUrl)}`);
    } else {
      router.push(checkoutUrl);
    }
  }

  const canReserve = checkIn && checkOut && nights > 0 && !hasConflict;

  return (
    <div className="rounded-[2rem] border border-neutral-200 bg-white p-6 shadow-[0_16px_48px_rgba(0,0,0,0.08)]">
      <div className="mb-5">
        <span className="text-2xl font-semibold text-neutral-900">
          {formatCurrency(pricePerNight, currency)}
        </span>
        <span className="ml-1 text-sm text-neutral-500">/ night</span>
      </div>

      <div className="space-y-3">
        <div className="grid grid-cols-2 overflow-hidden rounded-2xl border border-neutral-300">
          <div className="border-r border-neutral-300 p-3">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">
              Check-in
            </p>
            <input
              type="date"
              value={checkIn}
              min={today}
              onChange={handleCheckInChange}
              className="mt-1 w-full text-sm font-medium text-neutral-900 outline-none"
            />
          </div>
          <div className="p-3">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">
              Check-out
            </p>
            <input
              ref={checkOutRef}
              type="date"
              value={checkOut}
              min={checkIn || today}
              onChange={(e) => setCheckOut(e.target.value)}
              className="mt-1 w-full text-sm font-medium text-neutral-900 outline-none"
            />
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-neutral-300 p-3">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">
            Guests
          </p>
          <select
            value={guests}
            onChange={(e) => setGuests(Number(e.target.value))}
            className="mt-1 w-full text-sm font-medium text-neutral-900 outline-none"
          >
            {Array.from({ length: maxGuests }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>
                {n} guest{n === 1 ? "" : "s"}
              </option>
            ))}
          </select>
        </div>

        {hasConflict && (
          <p className="text-sm text-rose-600">
            These dates overlap with an existing booking. Please choose different dates.
          </p>
        )}

        <button
          type="button"
          onClick={handleReserve}
          disabled={!canReserve}
          className="w-full rounded-2xl bg-rose-500 py-3.5 text-sm font-semibold text-white transition hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {!checkIn || !checkOut
            ? "Select dates"
            : hasConflict
            ? "Dates unavailable"
            : isLoggedIn
            ? "Reserve"
            : "Reserve — sign in to book"}
        </button>

        {nights > 0 && !hasConflict && (
          <div className="space-y-2 border-t border-neutral-100 pt-4">
            <div className="flex justify-between text-sm text-neutral-700">
              <span>
                {formatCurrency(pricePerNight, currency)} × {nights} night{nights === 1 ? "" : "s"}
              </span>
              <span>{formatCurrency(subtotal, currency)}</span>
            </div>
            <div className="flex justify-between border-t border-neutral-200 pt-2 text-sm font-semibold text-neutral-900">
              <span>Total</span>
              <span>{formatCurrency(subtotal, currency)}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
