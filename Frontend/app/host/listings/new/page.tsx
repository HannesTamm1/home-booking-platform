import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";

import { AUTH_COOKIE_NAME, decodeAuthSession } from "@/lib/auth-session";
import { ListingComposer } from "../listing-composer";

export const metadata = { title: "New listing — AirStay" };

export default async function NewListingPage() {
  const session = decodeAuthSession((await cookies()).get(AUTH_COOKIE_NAME)?.value);

  if (!session) {
    redirect("/login?redirect=/host/listings/new");
  }

  if (session.role !== "host" && session.role !== "admin") {
    redirect("/become-a-host");
  }

  return (
    <main className="min-h-screen bg-stone-50 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-50">
      <div className="mx-auto flex w-full max-w-2xl flex-col px-4 py-8 sm:px-6">
        <div className="mb-8 flex items-center justify-between">
          <Link href="/" className="text-xl font-semibold tracking-tight text-rose-500">
            airbaba
          </Link>
          <Link
            href="/host/listings"
            className="text-sm text-neutral-500 transition hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
          >
            ← Back to listings
          </Link>
        </div>
        <ListingComposer mode="create" />
      </div>
    </main>
  );
}
