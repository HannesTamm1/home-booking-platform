"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

type CheckoutClientProps = {
  listingId: number;
  startDate: string;
  endDate: string;
};

export function CheckoutClient({ listingId, startDate, endDate }: CheckoutClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  function handleConfirm() {
    setError("");
    startTransition(async () => {
      const idempotencyKey = crypto.randomUUID();

      const response = await fetch(`/api/listings/${listingId}/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Idempotency-Key": idempotencyKey },
        body: JSON.stringify({ start_date: startDate, end_date: endDate }),
      });

      const result = (await response.json()) as { data?: { id: number }; message?: string };

      if (!response.ok) {
        setError(result.message ?? "Something went wrong. Please try again.");
        return;
      }

      const bookingId = result.data?.id;
      router.push(`/bookings/${bookingId}/confirmation`);
    });
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
          {error}
        </div>
      )}
      <button
        type="button"
        onClick={handleConfirm}
        disabled={isPending}
        className="w-full rounded-2xl bg-rose-500 py-4 text-sm font-semibold text-white transition hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isPending ? "Confirming..." : "Confirm reservation"}
      </button>
      <p className="text-center text-xs text-neutral-500">
        No charge is made in this demo. Your reservation will be instantly confirmed.
      </p>
    </div>
  );
}
