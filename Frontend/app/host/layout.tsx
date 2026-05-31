import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import type { ReactNode } from "react";

import { AUTH_COOKIE_NAME, decodeAuthSession } from "@/lib/auth-session";

export default async function HostLayout({ children }: { children: ReactNode }) {
  const session = decodeAuthSession((await cookies()).get(AUTH_COOKIE_NAME)?.value);

  if (!session) {
    redirect("/login?redirect=/host");
  }

  if (session.role !== "host" && session.role !== "admin") {
    redirect("/become-a-host");
  }

  return (
    <div className="min-h-screen bg-stone-50 text-neutral-900">
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center gap-6 px-4 py-3 sm:px-6">
          <Link href="/" className="text-lg font-semibold tracking-tight text-rose-500">
            airbnb
          </Link>
          <span className="h-4 w-px bg-neutral-200" />
          <nav className="flex items-center gap-1 text-sm font-medium">
            {[
              { href: "/host", label: "Dashboard" },
              { href: "/host/listings", label: "Listings" },
              { href: "/host/bookings", label: "Reservations" },
              { href: "/host/earnings", label: "Earnings" },
            ].map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="rounded-lg px-3 py-2 text-neutral-600 transition hover:bg-neutral-100 hover:text-neutral-900"
              >
                {label}
              </Link>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-3">
            <Link
              href="/"
              className="text-sm text-neutral-500 transition hover:text-neutral-900"
            >
              Guest view
            </Link>
            <form action="/api/auth/logout" method="post">
              <button type="submit" className="text-sm text-neutral-500 transition hover:text-neutral-900">
                Log out
              </button>
            </form>
          </div>
        </div>
      </header>
      {children}
    </div>
  );
}
