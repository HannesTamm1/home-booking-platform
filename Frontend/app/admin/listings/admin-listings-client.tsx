"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import type { AdminListing } from "./page";

const FLAG_LABELS: Record<string, string> = {
  price_outlier: "Price outlier",
};

const AMENITY_ICONS: Record<string, string> = {
  wifi: "WiFi",
  pool: "Pool",
  parking: "Parking",
  gym: "Gym",
  kitchen: "Kitchen",
  washer: "Washer",
  dryer: "Dryer",
  air_conditioning: "A/C",
  heating: "Heating",
  tv: "TV",
  hot_tub: "Hot tub",
  ev_charger: "EV charger",
  bbq: "BBQ",
  fireplace: "Fireplace",
  beach_access: "Beach access",
  ski_in_out: "Ski in/out",
};

function PhotoGallery({ photos }: { photos: AdminListing["photos"] }) {
  const [active, setActive] = useState(0);
  const sorted = [...photos].sort((a, b) => a.sortOrder - b.sortOrder);

  if (sorted.length === 0) return null;

  return (
    <div className="space-y-2">
      <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl bg-neutral-100 dark:bg-neutral-800">
        <Image
          src={sorted[active].url}
          alt={sorted[active].caption ?? "Listing photo"}
          fill
          className="object-cover"
          unoptimized
        />
        {sorted.length > 1 && (
          <>
            <button
              onClick={() => setActive((i) => (i - 1 + sorted.length) % sorted.length)}
              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-1.5 text-white hover:bg-black/70"
              aria-label="Previous photo"
            >
              ‹
            </button>
            <button
              onClick={() => setActive((i) => (i + 1) % sorted.length)}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-1.5 text-white hover:bg-black/70"
              aria-label="Next photo"
            >
              ›
            </button>
            <span className="absolute bottom-2 right-2 rounded-full bg-black/50 px-2 py-0.5 text-xs text-white">
              {active + 1}/{sorted.length}
            </span>
          </>
        )}
      </div>
      {sorted.length > 1 && (
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {sorted.map((p, i) => (
            <button
              key={p.id}
              onClick={() => setActive(i)}
              className={`relative h-14 w-20 shrink-0 overflow-hidden rounded-lg border-2 transition ${
                i === active
                  ? "border-neutral-900 dark:border-neutral-50"
                  : "border-transparent opacity-60 hover:opacity-100"
              }`}
            >
              <Image src={p.url} alt="" fill className="object-cover" unoptimized />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ListingDetails({ listing }: { listing: AdminListing }) {
  return (
    <div className="space-y-4 text-sm">
      {listing.photos.length > 0 && <PhotoGallery photos={listing.photos} />}

      <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-neutral-700 dark:text-neutral-300 sm:grid-cols-4">
        {listing.bedrooms != null && (
          <div>
            <span className="block text-xs text-neutral-400">Bedrooms</span>
            <span className="font-medium">{listing.bedrooms}</span>
          </div>
        )}
        {listing.beds != null && (
          <div>
            <span className="block text-xs text-neutral-400">Beds</span>
            <span className="font-medium">{listing.beds}</span>
          </div>
        )}
        {listing.bathrooms != null && (
          <div>
            <span className="block text-xs text-neutral-400">Bathrooms</span>
            <span className="font-medium">{listing.bathrooms}</span>
          </div>
        )}
        {listing.minNights != null && (
          <div>
            <span className="block text-xs text-neutral-400">Min nights</span>
            <span className="font-medium">{listing.minNights}</span>
          </div>
        )}
      </div>

      {listing.address && (
        <div>
          <span className="block text-xs text-neutral-400">Address</span>
          <p className="mt-0.5 text-neutral-700 dark:text-neutral-300">{listing.address}</p>
        </div>
      )}

      {listing.description && (
        <div>
          <span className="block text-xs text-neutral-400">Description</span>
          <p className="mt-0.5 leading-relaxed text-neutral-700 dark:text-neutral-300">{listing.description}</p>
        </div>
      )}

      {listing.amenities.length > 0 && (
        <div>
          <span className="block text-xs text-neutral-400">Amenities</span>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {listing.amenities.map((a) => (
              <span
                key={a}
                className="rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs font-medium text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
              >
                {AMENITY_ICONS[a] ?? a}
              </span>
            ))}
          </div>
        </div>
      )}

      {listing.houseRules && (
        <div>
          <span className="block text-xs text-neutral-400">House rules</span>
          <p className="mt-0.5 leading-relaxed text-neutral-700 dark:text-neutral-300">{listing.houseRules}</p>
        </div>
      )}
    </div>
  );
}

type Props = { initialListings: AdminListing[] };

export function AdminListingsModerationClient({ initialListings }: Props) {
  const [listings, setListings] = useState(initialListings);
  const [notes, setNotes] = useState<Record<number, string>>({});
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});
  const [isPending, startTransition] = useTransition();
  const [loading, setLoading] = useState<Record<number, string>>({});
  const [error, setError] = useState("");

  function act(id: number, action: "approve" | "reject") {
    setLoading((l) => ({ ...l, [id]: action }));
    setError("");
    startTransition(async () => {
      const res = await fetch(`/api/admin/listings/${id}/${action}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ admin_note: notes[id] ?? "" }),
      });

      if (!res.ok) {
        const data = (await res.json()) as { message?: string };
        setError(data.message ?? "Action failed.");
        setLoading((l) => { const n = { ...l }; delete n[id]; return n; });
        return;
      }

      setListings((prev) => prev.filter((l) => l.id !== id));
      setLoading((l) => { const n = { ...l }; delete n[id]; return n; });
    });
  }

  if (listings.length === 0) {
    return (
      <div className="rounded-[2rem] border border-dashed border-neutral-300 bg-white p-12 text-center dark:border-neutral-700 dark:bg-neutral-900">
        <p className="text-2xl">✅</p>
        <p className="mt-3 text-sm font-medium text-neutral-700 dark:text-neutral-300">No listings pending review</p>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">All caught up.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-400">
          {error}
        </div>
      )}
      {listings.map((listing) => {
        const busy = !!loading[listing.id];
        const isExpanded = !!expanded[listing.id];
        const coverPhoto = listing.photos.find((p) => p.isCover) ?? listing.photos[0];

        return (
          <div key={listing.id} className="overflow-hidden rounded-2xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
            {/* Cover photo strip — always visible if photos exist */}
            {coverPhoto && !isExpanded && (
              <div className="relative h-48 w-full overflow-hidden bg-neutral-100 dark:bg-neutral-800">
                <Image
                  src={coverPhoto.url}
                  alt={listing.title}
                  fill
                  className="object-cover"
                  unoptimized
                />
                {listing.photos.length > 1 && (
                  <span className="absolute bottom-2 right-2 rounded-full bg-black/50 px-2 py-0.5 text-xs text-white">
                    {listing.photos.length} photos
                  </span>
                )}
              </div>
            )}

            <div className="p-5">
              <div className="flex flex-wrap items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-semibold text-neutral-900 truncate dark:text-neutral-50">{listing.title}</h3>
                    {listing.flags.map((flag) => (
                      <span key={flag} className="shrink-0 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
                        ⚠ {FLAG_LABELS[flag] ?? flag}
                      </span>
                    ))}
                  </div>
                  <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                    {listing.propertyType ?? "Property"} · {listing.destination ?? "Unknown"} ·{" "}
                    {listing.maxGuests} guests · €{listing.pricePerNight}/night
                  </p>
                  <p className="mt-1 text-xs text-neutral-400 dark:text-neutral-500">
                    Host: {listing.host.name ?? listing.host.publicLabel}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <div className="text-right">
                    <p className="text-xs text-neutral-400">Submitted</p>
                    <p className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                      {listing.createdAt ? new Date(listing.createdAt).toLocaleDateString("en-GB") : "—"}
                    </p>
                  </div>
                  <button
                    onClick={() => setExpanded((e) => ({ ...e, [listing.id]: !e[listing.id] }))}
                    className="text-xs font-medium text-blue-600 hover:underline dark:text-blue-400"
                  >
                    {isExpanded ? "Hide details ↑" : "View details ↓"}
                  </button>
                </div>
              </div>

              {isExpanded && (
                <div className="mt-4 border-t border-neutral-100 pt-4 dark:border-neutral-800">
                  <ListingDetails listing={listing} />
                </div>
              )}

              <div className="mt-4 space-y-2">
                <textarea
                  placeholder="Note to host (optional)…"
                  value={notes[listing.id] ?? ""}
                  onChange={(e) => setNotes((n) => ({ ...n, [listing.id]: e.target.value }))}
                  rows={2}
                  className="w-full resize-none rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-neutral-400 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-50 dark:placeholder-neutral-500 dark:focus:border-neutral-600"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => act(listing.id, "approve")}
                    disabled={busy || isPending}
                    className="flex-1 rounded-xl bg-green-600 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700 disabled:opacity-50"
                  >
                    {loading[listing.id] === "approve" ? "Approving…" : "Approve & publish"}
                  </button>
                  <button
                    type="button"
                    onClick={() => act(listing.id, "reject")}
                    disabled={busy || isPending}
                    className="flex-1 rounded-xl bg-red-500 py-2.5 text-sm font-semibold text-white transition hover:bg-red-600 disabled:opacity-50"
                  >
                    {loading[listing.id] === "reject" ? "Rejecting…" : "Reject"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
