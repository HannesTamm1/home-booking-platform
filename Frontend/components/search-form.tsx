"use client";

import { useRef, useState } from "react";

type SearchFormProps = {
  availableDestinations: string[];
  selectedDestination: string;
  defaultCheckIn?: string;
  defaultCheckOut?: string;
  defaultGuests?: string;
};

export function SearchForm({
  availableDestinations,
  selectedDestination,
  defaultCheckIn,
  defaultCheckOut,
  defaultGuests,
}: SearchFormProps) {
  const today = new Date().toISOString().split("T")[0];
  const [checkIn, setCheckIn] = useState(defaultCheckIn ?? "");
  const [checkOut, setCheckOut] = useState(defaultCheckOut ?? "");
  const checkOutRef = useRef<HTMLInputElement>(null);

  const nights =
    checkIn && checkOut
      ? Math.round(
          (new Date(checkOut).getTime() - new Date(checkIn).getTime()) /
            (1000 * 60 * 60 * 24),
        )
      : 0;

  function handleCheckInChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setCheckIn(value);
    if (value) {
      if (checkOut && checkOut <= value) {
        setCheckOut("");
      }
      if (checkOutRef.current) {
        checkOutRef.current.focus();
        try {
          checkOutRef.current.showPicker();
        } catch {}
      }
    }
  }

  const fieldClass =
    "h-12 w-full rounded-full border border-neutral-300 bg-white px-4 text-sm text-neutral-900 outline-none transition focus:border-neutral-900 focus-visible:ring-2 focus-visible:ring-rose-300";

  return (
    <form action="/" method="get" aria-label="Search for stays" className="mt-6 flex flex-col gap-3">
      <div className="grid gap-3 lg:grid-cols-[1.2fr_1fr_1fr_0.8fr_auto]">
        <div>
          <label htmlFor="search-destination" className="sr-only">Destination</label>
          <select id="search-destination" name="destination" defaultValue={selectedDestination} className={fieldClass}>
            <option value="">Anywhere</option>
            {availableDestinations.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>

        <div>
          <label htmlFor="search-check-in" className="sr-only">Check-in date</label>
          <input id="search-check-in" type="date" name="check_in" value={checkIn} min={today}
            onChange={handleCheckInChange} aria-label="Check-in date" className={fieldClass} />
        </div>

        <div>
          <label htmlFor="search-check-out" className="sr-only">Check-out date</label>
          <input id="search-check-out" ref={checkOutRef} type="date" name="check_out" value={checkOut}
            min={checkIn || today} onChange={(e) => setCheckOut(e.target.value)}
            aria-label="Check-out date" className={fieldClass} />
        </div>

        <div>
          <label htmlFor="search-guests" className="sr-only">Number of guests</label>
          <select id="search-guests" name="guests" defaultValue={defaultGuests ?? ""} className={fieldClass}>
            <option value="">Any guests</option>
            {Array.from({ length: 8 }, (_, i) => (
              <option key={i + 1} value={i + 1}>{i + 1} guest{i === 0 ? "" : "s"}</option>
            ))}
          </select>
        </div>

        <button type="submit"
          className="h-12 rounded-full bg-rose-500 px-6 text-sm font-semibold text-white transition hover:bg-rose-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2">
          Search
        </button>
      </div>

      {nights > 0 && (
        <p role="status" aria-live="polite" className="flex items-center justify-center gap-2 rounded-full bg-blue-500 px-5 py-2 text-sm font-medium text-white shadow-sm">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 shrink-0 opacity-80" aria-hidden="true">
            <path fillRule="evenodd" d="M5.75 2a.75.75 0 0 1 .75.75V4h7V2.75a.75.75 0 0 1 1.5 0V4h.25A2.75 2.75 0 0 1 18 6.75v8.5A2.75 2.75 0 0 1 15.25 18H4.75A2.75 2.75 0 0 1 2 15.25v-8.5A2.75 2.75 0 0 1 4.75 4H5V2.75A.75.75 0 0 1 5.75 2Zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75Z" clipRule="evenodd" />
          </svg>
          {nights} night{nights === 1 ? "" : "s"} selected
        </p>
      )}
    </form>
  );
}
