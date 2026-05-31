"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import type { CalendarData } from "./page";

const DAYS_OF_WEEK = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function daysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate();
}

function firstDayOfMonth(year: number, month: number): number {
  const d = new Date(year, month - 1, 1).getDay();
  return d === 0 ? 6 : d - 1; // Mon=0 … Sun=6
}

function formatDate(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function isBooked(date: string, ranges: CalendarData["bookedRanges"]): boolean {
  return ranges.some((r) => r.startDate <= date && r.endDate > date);
}

type Props = {
  listingId: number;
  data: CalendarData;
  year: number;
  month: number;
};

export function CalendarClient({ listingId, data, year, month }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [blockedDates, setBlockedDates] = useState(new Set(data.blockedDates));
  const [error, setError] = useState("");
  const [loadingDate, setLoadingDate] = useState<string | null>(null);

  const totalDays = daysInMonth(year, month);
  const firstDay = firstDayOfMonth(year, month);
  const today = new Date().toISOString().slice(0, 10);

  function prevMonth() {
    let y = year;
    let m = month - 1;
    if (m < 1) { m = 12; y--; }
    router.push(`/host/listings/${listingId}/calendar?year=${y}&month=${m}`);
  }

  function nextMonth() {
    let y = year;
    let m = month + 1;
    if (m > 12) { m = 1; y++; }
    router.push(`/host/listings/${listingId}/calendar?year=${y}&month=${m}`);
  }

  function toggleBlock(dateStr: string) {
    if (dateStr < today) return;
    if (isBooked(dateStr, data.bookedRanges)) return;

    setLoadingDate(dateStr);
    setError("");
    startTransition(async () => {
      const res = await fetch(`/api/host/calendar/${listingId}/toggle-block`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: dateStr }),
      });

      if (!res.ok) {
        const d = (await res.json()) as { message?: string };
        setError(d.message ?? "Failed to update calendar.");
        setLoadingDate(null);
        return;
      }

      const payload = (await res.json()) as { data: { isBlocked: boolean } };
      setBlockedDates((prev) => {
        const next = new Set(prev);
        if (payload.data.isBlocked) next.add(dateStr);
        else next.delete(dateStr);
        return next;
      });
      setLoadingDate(null);
    });
  }

  const cells: (number | null)[] = [
    ...Array<null>(firstDay).fill(null),
    ...Array.from({ length: totalDays }, (_, i) => i + 1),
  ];

  return (
    <div className="space-y-6">
      {/* Month nav */}
      <div className="flex items-center justify-between rounded-2xl border border-neutral-200 bg-white px-5 py-4">
        <button
          type="button"
          onClick={prevMonth}
          className="rounded-xl border border-neutral-200 px-4 py-2 text-sm font-medium transition hover:border-neutral-400"
        >
          ← Prev
        </button>
        <h2 className="text-base font-semibold">
          {MONTH_NAMES[month - 1]} {year}
        </h2>
        <button
          type="button"
          onClick={nextMonth}
          className="rounded-xl border border-neutral-200 px-4 py-2 text-sm font-medium transition hover:border-neutral-400"
        >
          Next →
        </button>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs text-neutral-500">
        <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-white border border-neutral-300" /> Available</span>
        <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-rose-200" /> Booked</span>
        <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-neutral-200" /> Blocked by you</span>
        <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-neutral-100 opacity-50 border border-dashed border-neutral-300" /> Past</span>
      </div>

      {/* Pricing info */}
      <div className="grid grid-cols-3 gap-3 text-center">
        {[
          { label: "Base price", value: `€${data.basePrice}/night` },
          { label: "Weekend price", value: data.weekendPrice ? `€${data.weekendPrice}/night` : "Same as base" },
          { label: "Min stay", value: `${data.minNights} night${data.minNights !== 1 ? "s" : ""}` },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-xl border border-neutral-200 bg-white p-3">
            <p className="text-xs text-neutral-400">{label}</p>
            <p className="mt-1 text-sm font-semibold text-neutral-900">{value}</p>
          </div>
        ))}
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
          {error}
        </div>
      )}

      {/* Calendar grid */}
      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
        <div className="grid grid-cols-7 border-b border-neutral-100">
          {DAYS_OF_WEEK.map((d) => (
            <div key={d} className="py-2 text-center text-xs font-semibold text-neutral-400">
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {cells.map((day, i) => {
            if (day === null) {
              return <div key={`empty-${i}`} className="border-r border-t border-neutral-50 p-2" />;
            }

            const dateStr = formatDate(year, month, day);
            const isPast = dateStr < today;
            const booked = isBooked(dateStr, data.bookedRanges);
            const blocked = blockedDates.has(dateStr);
            const isLoading = loadingDate === dateStr;
            const isSat = new Date(dateStr).getDay() === 6;
            const isSun = new Date(dateStr).getDay() === 0;
            const isWeekend = isSat || isSun;

            let bg = "bg-white hover:bg-neutral-50 cursor-pointer";
            let textColor = "text-neutral-900";
            if (isPast) {
              bg = "bg-neutral-50 cursor-default";
              textColor = "text-neutral-300";
            } else if (booked) {
              bg = "bg-rose-100 cursor-not-allowed";
              textColor = "text-rose-700";
            } else if (blocked) {
              bg = "bg-neutral-200 hover:bg-neutral-300 cursor-pointer";
              textColor = "text-neutral-500";
            } else if (isWeekend && data.weekendPrice) {
              bg = "bg-amber-50 hover:bg-amber-100 cursor-pointer";
            }

            const price = data.customPrices[dateStr]
              ?? (isWeekend && data.weekendPrice ? data.weekendPrice : data.basePrice);

            return (
              <div
                key={dateStr}
                onClick={() => !isPast && !booked && toggleBlock(dateStr)}
                className={`relative border-r border-t border-neutral-100 p-1.5 text-center transition ${bg} ${isLoading ? "opacity-50" : ""}`}
                title={booked ? "Booked" : blocked ? "Blocked — click to unblock" : isPast ? "Past" : "Click to block"}
              >
                <span className={`block text-xs font-semibold ${textColor}`}>{day}</span>
                {!isPast && (
                  <span className={`block text-[10px] ${booked ? "text-rose-400" : blocked ? "text-neutral-400" : "text-neutral-400"}`}>
                    {booked ? "booked" : blocked ? "blocked" : `€${Math.round(price)}`}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <p className="text-xs text-neutral-400">
        Click any future available date to block it. Click a blocked date to unblock. Booked dates cannot be changed.
      </p>
    </div>
  );
}
