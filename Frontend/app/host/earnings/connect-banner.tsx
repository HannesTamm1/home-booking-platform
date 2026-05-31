"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export function ConnectBanner() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [done, setDone] = useState(false);

  function handleConnect() {
    startTransition(async () => {
      const res = await fetch("/api/host/connect/onboard", { method: "POST" });
      if (res.ok) {
        setDone(true);
        router.refresh();
      }
    });
  }

  if (done) {
    return (
      <div className="mb-6 rounded-2xl border border-green-200 bg-green-50 p-4">
        <p className="text-sm font-semibold text-green-800">✓ Stripe Connect account set up (demo mode).</p>
      </div>
    );
  }

  return (
    <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-amber-900">Connect your Stripe account to receive payouts</p>
          <p className="mt-1 text-sm text-amber-700">
            In production this would redirect you to Stripe's onboarding flow.
            Click below to simulate the setup in demo mode.
          </p>
        </div>
        <button
          type="button"
          onClick={handleConnect}
          disabled={isPending}
          className="shrink-0 rounded-xl bg-amber-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-700 disabled:opacity-70"
        >
          {isPending ? "Setting up…" : "Connect Stripe"}
        </button>
      </div>
    </div>
  );
}
