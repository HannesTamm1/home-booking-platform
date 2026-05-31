import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import type { ReactNode } from "react";

import { AUTH_COOKIE_NAME, decodeAuthSession } from "@/lib/auth-session";
import { ThemeToggle } from "@/components/theme-toggle";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = decodeAuthSession((await cookies()).get(AUTH_COOKIE_NAME)?.value);

  if (!session || session.role !== "admin") {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-stone-50 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-50">
      <header className="border-b border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
        <div className="mx-auto flex max-w-7xl items-center gap-6 px-4 py-3 sm:px-6">
          <Link href="/" className="text-lg font-semibold tracking-tight text-rose-500">
            airbaba
          </Link>
          <span className="h-4 w-px bg-neutral-200 dark:bg-neutral-700" />
          <nav className="flex items-center gap-1 text-sm font-medium">
            {[
              { href: "/admin", label: "Overview" },
              { href: "/admin/listings", label: "Moderation" },
              { href: "/admin/bookings", label: "Bookings" },
              { href: "/admin/disputes", label: "Disputes" },
              { href: "/admin/users", label: "Users" },
              { href: "/admin/host-applications", label: "Host apps" },
            ].map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="rounded-lg px-3 py-2 text-neutral-600 transition hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
              >
                {label}
              </Link>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-3">
            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-900 dark:text-amber-300">
              Admin
            </span>
            <ThemeToggle />
            <form action="/api/auth/logout" method="post">
              <button
                type="submit"
                className="text-sm text-neutral-500 transition hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
              >
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
