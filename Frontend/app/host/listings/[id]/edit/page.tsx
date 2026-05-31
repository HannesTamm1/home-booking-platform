import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";

import { AUTH_COOKIE_NAME, decodeAuthSession } from "@/lib/auth-session";
import { fetchListing } from "@/lib/backend";
import { ListingComposer } from "../../listing-composer";

export const metadata = { title: "Edit listing — AirStay" };

export default async function EditListingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = decodeAuthSession((await cookies()).get(AUTH_COOKIE_NAME)?.value);

  if (!session) {
    redirect(`/login?redirect=/host/listings/${id}/edit`);
  }

  if (session.role !== "host" && session.role !== "admin") {
    redirect("/become-a-host");
  }

  const { listing, error } = await fetchListing(id);

  if (!listing || error) {
    notFound();
  }

  // Only the owner or admin can edit
  if (listing.host.id !== session.id && session.role !== "admin") {
    redirect("/host/listings");
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
        <ListingComposer mode="edit" initialData={listing} listingId={Number(id)} />
      </div>
    </main>
  );
}
