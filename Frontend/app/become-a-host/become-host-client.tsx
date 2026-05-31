"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export function BecomeHostClient() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  function handleBecomeHost() {
    setError("");
    startTransition(async () => {
      const response = await fetch("/api/user/become-host", { method: "POST" });
      const data = (await response.json()) as { message?: string };

      if (!response.ok) {
        setError(data.message ?? "Something went wrong. Please try again.");
        return;
      }

      router.push("/host/listings");
      router.refresh();
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
        onClick={handleBecomeHost}
        disabled={isPending}
        className="w-full rounded-2xl bg-rose-500 py-4 text-sm font-semibold text-white transition hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isPending ? "Setting up your account…" : "Get started as a host"}
      </button>
      <p className="text-center text-xs text-neutral-400">
        By continuing you agree to our hosting terms of service.
      </p>
    </div>
  );
}
