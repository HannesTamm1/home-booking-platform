"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export function CancelBookingButton({ bookingId }: { bookingId: number }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [confirmed, setConfirmed] = useState(false);

  function handleCancel() {
    if (!confirmed) {
      setConfirmed(true);
      return;
    }

    setError("");
    startTransition(async () => {
      const response = await fetch(`/api/user/bookings/${bookingId}/cancel`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const result = (await response.json()) as { message?: string };
        setError(result.message ?? "Could not cancel booking.");
        setConfirmed(false);
        return;
      }

      router.refresh();
    });
  }

  return (
    <div className="space-y-1">
      {error && <p className="text-xs text-rose-600">{error}</p>}
      <button
        type="button"
        onClick={handleCancel}
        disabled={isPending}
        className={`rounded-full border px-4 py-2 text-sm font-medium transition disabled:opacity-60 ${
          confirmed
            ? "border-rose-500 bg-rose-500 text-white hover:bg-rose-600"
            : "border-neutral-300 text-neutral-700 hover:border-rose-400 hover:text-rose-600"
        }`}
      >
        {isPending ? "Cancelling..." : confirmed ? "Tap again to confirm" : "Cancel stay"}
      </button>
    </div>
  );
}
