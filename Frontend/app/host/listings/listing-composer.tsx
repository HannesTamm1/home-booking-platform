"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import type { Listing } from "@/lib/backend";

const PROPERTY_TYPES = [
  { value: "apartment", label: "Apartment", icon: "🏢" },
  { value: "house", label: "House", icon: "🏠" },
  { value: "villa", label: "Villa", icon: "🏡" },
  { value: "cabin", label: "Cabin", icon: "🪵" },
  { value: "cottage", label: "Cottage", icon: "🌿" },
  { value: "loft", label: "Loft", icon: "🏙️" },
  { value: "studio", label: "Studio", icon: "🎨" },
];

const ALL_AMENITIES = [
  "WiFi", "Kitchen", "Air conditioning", "Heating",
  "Washing machine", "Dryer", "Free parking", "Pool",
  "Hot tub", "Gym", "Workspace", "TV",
  "Dishwasher", "Balcony", "Garden", "BBQ grill",
  "Baby crib", "Pet-friendly", "Wheelchair accessible",
];

const DESTINATIONS = [
  "Tallinn", "Riga", "Vilnius", "Helsinki",
  "Stockholm", "Copenhagen", "Oslo", "Tartu", "Parnu",
];

const STEPS = [
  { id: 1, label: "Property type" },
  { id: 2, label: "Location" },
  { id: 3, label: "Capacity" },
  { id: 4, label: "Amenities" },
  { id: 5, label: "Photos" },
  { id: 6, label: "Details" },
  { id: 7, label: "Pricing" },
  { id: 8, label: "Rules & booking" },
];

type PhotoInput = { url: string; caption: string; uploading?: boolean; error?: string };

type FormData = {
  propertyType: string;
  destination: string;
  address: string;
  maxGuests: number;
  bedrooms: number;
  beds: number;
  bathrooms: number;
  amenities: string[];
  photos: PhotoInput[];
  title: string;
  description: string;
  pricePerNight: string;
  weekendPricePerNight: string;
  minNights: number;
  houseRules: string;
  bookingType: "instant" | "request";
};

type Props = {
  mode: "create";
  initialData?: never;
  listingId?: never;
} | {
  mode: "edit";
  initialData: Listing;
  listingId: number;
};

function listingToFormData(l: Listing): FormData {
  return {
    propertyType: l.propertyType ?? "",
    destination: l.destination ?? "",
    address: l.address ?? "",
    maxGuests: l.maxGuests,
    bedrooms: l.bedrooms,
    beds: l.beds,
    bathrooms: l.bathrooms,
    amenities: l.amenities,
    photos: (l.photos ?? []).map(p => ({ url: p.url, caption: p.caption ?? "" })),
    title: l.title,
    description: l.description ?? "",
    pricePerNight: String(l.pricePerNight),
    weekendPricePerNight: l.weekendPricePerNight ? String(l.weekendPricePerNight) : "",
    minNights: l.minNights,
    houseRules: l.houseRules ?? "",
    bookingType: (l.bookingType as "instant" | "request") ?? "instant",
  };
}

const defaultFormData: FormData = {
  propertyType: "",
  destination: "",
  address: "",
  maxGuests: 2,
  bedrooms: 1,
  beds: 1,
  bathrooms: 1,
  amenities: [],
  photos: [{ url: "", caption: "" }],
  title: "",
  description: "",
  pricePerNight: "",
  weekendPricePerNight: "",
  minNights: 1,
  houseRules: "",
  bookingType: "instant",
};

export function ListingComposer({ mode, initialData, listingId }: Props) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [form, setForm] = useState<FormData>(
    mode === "edit" && initialData ? listingToFormData(initialData) : defaultFormData,
  );

  function update<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function toggleAmenity(amenity: string) {
    setForm((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }));
  }

  function addPhoto() {
    setForm((prev) => ({ ...prev, photos: [...prev.photos, { url: "", caption: "" }] }));
  }

  function removePhoto(index: number) {
    setForm((prev) => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index),
    }));
  }

  function updatePhotoCaption(index: number, caption: string) {
    setForm((prev) => ({
      ...prev,
      photos: prev.photos.map((p, i) => (i === index ? { ...p, caption } : p)),
    }));
  }

  function startPhotoUpload(index: number) {
    setForm((prev) => ({
      ...prev,
      photos: prev.photos.map((p, i) =>
        i === index ? { ...p, uploading: true, error: undefined } : p,
      ),
    }));
  }

  function finishPhotoUpload(index: number, url: string) {
    setForm((prev) => ({
      ...prev,
      photos: prev.photos.map((p, i) =>
        i === index ? { ...p, url, uploading: false, error: undefined } : p,
      ),
    }));
  }

  function failPhotoUpload(index: number, error: string) {
    setForm((prev) => ({
      ...prev,
      photos: prev.photos.map((p, i) =>
        i === index ? { ...p, uploading: false, error } : p,
      ),
    }));
  }

  function canProceed(): boolean {
    switch (step) {
      case 1: return !!form.propertyType;
      case 2: return !!form.destination;
      case 3: return form.maxGuests >= 1 && form.beds >= 1;
      case 4: return form.amenities.length >= 1;
      case 5: return form.photos.some((p) => p.url.trim() !== "") && form.photos.every((p) => !p.uploading);
      case 6: return form.title.trim().length >= 5 && form.description.trim().length >= 20;
      case 7: return Number(form.pricePerNight) >= 1;
      case 8: return true;
      default: return false;
    }
  }

  function buildPayload(submitForReview = false) {
    const pricePerNightCents = Math.round(Number(form.pricePerNight) * 100);
    const weekendPricePerNightCents = form.weekendPricePerNight
      ? Math.round(Number(form.weekendPricePerNight) * 100)
      : undefined;

    return {
      title: form.title,
      destination: form.destination || undefined,
      address: form.address || undefined,
      description: form.description || undefined,
      house_rules: form.houseRules || undefined,
      property_type: form.propertyType || undefined,
      price_per_night_cents: pricePerNightCents,
      weekend_price_per_night_cents: weekendPricePerNightCents,
      currency: "EUR",
      max_guests: form.maxGuests,
      bedrooms: form.bedrooms,
      beds: form.beds,
      bathrooms: form.bathrooms,
      amenities: form.amenities,
      booking_type: form.bookingType,
      min_nights: form.minNights,
      photos: form.photos.filter((p) => p.url.trim()).map((p) => ({
        url: p.url.trim(),
        caption: p.caption.trim() || undefined,
      })),
      ...(submitForReview ? {} : {}),
    };
  }

  function handleSubmit(submitForReview: boolean) {
    setError("");
    startTransition(async () => {
      const payload = buildPayload(submitForReview);

      let listingIdResult: number | null = listingId ?? null;

      if (mode === "create") {
        const response = await fetch("/api/host/listings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const data = (await response.json()) as { data?: { id: number }; message?: string };

        if (!response.ok) {
          setError(data.message ?? "Failed to create listing.");
          return;
        }

        listingIdResult = data.data?.id ?? null;
      } else if (mode === "edit" && listingId) {
        const response = await fetch(`/api/host/listings/${listingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const data = (await response.json()) as { data?: { id: number }; message?: string };

        if (!response.ok) {
          setError(data.message ?? "Failed to update listing.");
          return;
        }
      }

      if (submitForReview && listingIdResult) {
        const submitResponse = await fetch(`/api/host/listings/${listingIdResult}/submit`, {
          method: "POST",
        });

        if (!submitResponse.ok) {
          const data = (await submitResponse.json()) as { message?: string };
          setError(data.message ?? "Saved but failed to submit for review.");
          return;
        }
      }

      router.push("/host/listings");
      router.refresh();
    });
  }

  const progress = ((step - 1) / (STEPS.length - 1)) * 100;

  return (
    <div className="rounded-[2rem] border border-neutral-200 bg-white shadow-[0_16px_48px_rgba(0,0,0,0.05)] dark:border-neutral-800 dark:bg-neutral-900 dark:shadow-[0_16px_48px_rgba(0,0,0,0.4)]">
      {/* Header */}
      <div className="border-b border-neutral-100 p-6 dark:border-neutral-800">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-lg font-semibold dark:text-neutral-50">
            {mode === "create" ? "Create a listing" : "Edit listing"}
          </h1>
          <span className="text-sm text-neutral-500 dark:text-neutral-400">
            Step {step} of {STEPS.length}
          </span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
          <div
            className="h-full rounded-full bg-rose-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="mt-3 flex gap-1 overflow-x-auto">
          {STEPS.map((s) => (
            <span
              key={s.id}
              className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium transition ${
                s.id === step
                  ? "bg-rose-500 text-white"
                  : s.id < step
                  ? "bg-rose-100 text-rose-600 dark:bg-rose-900 dark:text-rose-300"
                  : "bg-neutral-100 text-neutral-400 dark:bg-neutral-800 dark:text-neutral-500"
              }`}
            >
              {s.label}
            </span>
          ))}
        </div>
      </div>

      {/* Step content */}
      <div className="p-6">
        {step === 1 && (
          <StepPropertyType value={form.propertyType} onChange={(v) => update("propertyType", v)} />
        )}
        {step === 2 && (
          <StepLocation
            destination={form.destination}
            address={form.address}
            onDestinationChange={(v) => update("destination", v)}
            onAddressChange={(v) => update("address", v)}
          />
        )}
        {step === 3 && (
          <StepCapacity
            maxGuests={form.maxGuests}
            bedrooms={form.bedrooms}
            beds={form.beds}
            bathrooms={form.bathrooms}
            onChange={(field, val) => update(field, val)}
          />
        )}
        {step === 4 && (
          <StepAmenities selected={form.amenities} onToggle={toggleAmenity} />
        )}
        {step === 5 && (
          <StepPhotos
            photos={form.photos}
            onAdd={addPhoto}
            onRemove={removePhoto}
            onUpdateCaption={updatePhotoCaption}
            onStartUpload={startPhotoUpload}
            onFinishUpload={finishPhotoUpload}
            onFailUpload={failPhotoUpload}
          />
        )}
        {step === 6 && (
          <StepDetails
            title={form.title}
            description={form.description}
            onTitleChange={(v) => update("title", v)}
            onDescriptionChange={(v) => update("description", v)}
          />
        )}
        {step === 7 && (
          <StepPricing
            pricePerNight={form.pricePerNight}
            weekendPricePerNight={form.weekendPricePerNight}
            minNights={form.minNights}
            onPriceChange={(v) => update("pricePerNight", v)}
            onWeekendPriceChange={(v) => update("weekendPricePerNight", v)}
            onMinNightsChange={(v) => update("minNights", v)}
          />
        )}
        {step === 8 && (
          <StepRulesBooking
            houseRules={form.houseRules}
            bookingType={form.bookingType}
            onHouseRulesChange={(v) => update("houseRules", v)}
            onBookingTypeChange={(v) => update("bookingType", v)}
          />
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="mx-6 mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-400">
          {error}
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between border-t border-neutral-100 px-6 py-5 dark:border-neutral-800">
        <button
          type="button"
          onClick={() => setStep((s) => Math.max(1, s - 1))}
          disabled={step === 1}
          className="rounded-2xl border border-neutral-300 px-5 py-2.5 text-sm font-medium text-neutral-700 transition hover:border-neutral-900 disabled:opacity-30 dark:border-neutral-700 dark:text-neutral-300 dark:hover:border-neutral-400"
        >
          Back
        </button>

        <div className="flex gap-3">
          {step === STEPS.length ? (
            <>
              <button
                type="button"
                onClick={() => handleSubmit(false)}
                disabled={isPending}
                className="rounded-2xl border border-neutral-300 px-5 py-2.5 text-sm font-medium text-neutral-700 transition hover:border-neutral-900 disabled:opacity-70 dark:border-neutral-700 dark:text-neutral-300 dark:hover:border-neutral-400"
              >
                {isPending ? "Saving…" : "Save as draft"}
              </button>
              <button
                type="button"
                onClick={() => handleSubmit(true)}
                disabled={isPending}
                className="rounded-2xl bg-rose-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-600 disabled:opacity-70"
              >
                {isPending ? "Submitting…" : "Submit for review"}
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setStep((s) => s + 1)}
              disabled={!canProceed()}
              className="rounded-2xl bg-rose-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Step components ────────────────────────────────────────────────────────

function StepPropertyType({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <h2 className="text-lg font-semibold dark:text-neutral-50">What type of place are you hosting?</h2>
      <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">Select the option that best describes your space.</p>
      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {PROPERTY_TYPES.map((pt) => (
          <button
            key={pt.value}
            type="button"
            onClick={() => onChange(pt.value)}
            className={`flex flex-col items-center gap-2 rounded-2xl border-2 px-3 py-4 text-sm font-medium transition ${
              value === pt.value
                ? "border-rose-500 bg-rose-50 text-rose-600 dark:bg-rose-950"
                : "border-neutral-200 text-neutral-700 hover:border-neutral-400 dark:border-neutral-700 dark:text-neutral-300 dark:hover:border-neutral-500"
            }`}
          >
            <span className="text-2xl">{pt.icon}</span>
            {pt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function StepLocation({
  destination,
  address,
  onDestinationChange,
  onAddressChange,
}: {
  destination: string;
  address: string;
  onDestinationChange: (v: string) => void;
  onAddressChange: (v: string) => void;
}) {
  return (
    <div>
      <h2 className="text-lg font-semibold dark:text-neutral-50">Where is your place located?</h2>
      <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">Guests will search by city and see a map of your exact address.</p>
      <div className="mt-5 space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">City / Destination</label>
          <select
            value={destination}
            onChange={(e) => onDestinationChange(e.target.value)}
            className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-100 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-50 dark:[color-scheme:dark] dark:focus:border-rose-500"
          >
            <option value="">Select a city…</option>
            {DESTINATIONS.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Full address <span className="text-neutral-400">(shown on the listing map)</span>
          </label>
          <input
            type="text"
            placeholder="e.g. Pikk 28, 10133 Tallinn, Estonia"
            value={address}
            onChange={(e) => onAddressChange(e.target.value)}
            className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-100 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-50 dark:placeholder-neutral-500 dark:focus:border-rose-500"
          />
          <p className="mt-1.5 text-xs text-neutral-400 dark:text-neutral-500">
            Include street, city, and country for best map accuracy.
          </p>
        </div>
      </div>
    </div>
  );
}

function Counter({
  label,
  sub,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  sub?: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-neutral-100 last:border-0 dark:border-neutral-800">
      <div>
        <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200">{label}</p>
        {sub && <p className="text-xs text-neutral-400 dark:text-neutral-500">{sub}</p>}
      </div>
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          className="h-8 w-8 rounded-full border border-neutral-300 text-lg font-light text-neutral-600 transition hover:border-neutral-900 disabled:opacity-30 dark:border-neutral-700 dark:text-neutral-400 dark:hover:border-neutral-400"
        >
          −
        </button>
        <span className="w-6 text-center text-sm font-semibold dark:text-neutral-50">{value}</span>
        <button
          type="button"
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
          className="h-8 w-8 rounded-full border border-neutral-300 text-lg font-light text-neutral-600 transition hover:border-neutral-900 disabled:opacity-30 dark:border-neutral-700 dark:text-neutral-400 dark:hover:border-neutral-400"
        >
          +
        </button>
      </div>
    </div>
  );
}

function StepCapacity({
  maxGuests,
  bedrooms,
  beds,
  bathrooms,
  onChange,
}: {
  maxGuests: number;
  bedrooms: number;
  beds: number;
  bathrooms: number;
  onChange: (field: "maxGuests" | "bedrooms" | "beds" | "bathrooms", val: number) => void;
}) {
  return (
    <div>
      <h2 className="text-lg font-semibold dark:text-neutral-50">How many guests can stay?</h2>
      <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">Set the capacity for your space.</p>
      <div className="mt-5 rounded-2xl border border-neutral-200 px-5 dark:border-neutral-800">
        <Counter label="Guests" value={maxGuests} min={1} max={20} onChange={(v) => onChange("maxGuests", v)} />
        <Counter label="Bedrooms" value={bedrooms} min={0} max={10} onChange={(v) => onChange("bedrooms", v)} />
        <Counter label="Beds" value={beds} min={1} max={20} onChange={(v) => onChange("beds", v)} />
        <Counter label="Bathrooms" sub="Includes private and shared" value={Math.round(bathrooms)} min={1} max={10} onChange={(v) => onChange("bathrooms", v)} />
      </div>
    </div>
  );
}

function StepAmenities({ selected, onToggle }: { selected: string[]; onToggle: (a: string) => void }) {
  return (
    <div>
      <h2 className="text-lg font-semibold dark:text-neutral-50">What amenities do you offer?</h2>
      <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">Select all that apply. At least one is required.</p>
      <div className="mt-5 flex flex-wrap gap-2">
        {ALL_AMENITIES.map((amenity) => (
          <button
            key={amenity}
            type="button"
            onClick={() => onToggle(amenity)}
            className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
              selected.includes(amenity)
                ? "border-rose-500 bg-rose-50 text-rose-600 dark:bg-rose-950"
                : "border-neutral-200 text-neutral-700 hover:border-neutral-400 dark:border-neutral-700 dark:text-neutral-300 dark:hover:border-neutral-500"
            }`}
          >
            {amenity}
          </button>
        ))}
      </div>
    </div>
  );
}

function StepPhotos({
  photos,
  onAdd,
  onRemove,
  onUpdateCaption,
  onStartUpload,
  onFinishUpload,
  onFailUpload,
}: {
  photos: PhotoInput[];
  onAdd: () => void;
  onRemove: (i: number) => void;
  onUpdateCaption: (i: number, caption: string) => void;
  onStartUpload: (i: number) => void;
  onFinishUpload: (i: number, url: string) => void;
  onFailUpload: (i: number, error: string) => void;
}) {
  async function handleFile(index: number, file: File) {
    onStartUpload(index);
    try {
      const fd = new FormData();
      fd.append("photo", file);
      const res = await fetch("/api/host/photos", { method: "POST", body: fd });
      const data = await res.json() as { url?: string; message?: string };
      if (!res.ok) throw new Error(data.message ?? "Upload failed");
      onFinishUpload(index, data.url!);
    } catch (e) {
      onFailUpload(index, e instanceof Error ? e.message : "Upload failed");
    }
  }

  const allFilled = photos.every((p) => p.url && !p.uploading);

  return (
    <div>
      <h2 className="text-lg font-semibold dark:text-neutral-50">Add photos of your space</h2>
      <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
        Upload images from your device. The first photo will be the cover.
      </p>
      <div className="mt-5 space-y-3">
        {photos.map((photo, i) => (
          <div key={i}>
            {photo.uploading ? (
              <div className="flex h-24 items-center justify-center rounded-2xl border border-neutral-200 dark:border-neutral-700">
                <svg className="h-5 w-5 animate-spin text-rose-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span className="ml-2 text-sm text-neutral-500 dark:text-neutral-400">Uploading…</span>
              </div>
            ) : photo.url ? (
              <div className="flex gap-3">
                <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-neutral-100 dark:bg-neutral-800">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={photo.url} alt="" className="h-full w-full object-cover" />
                  {i === 0 && (
                    <span className="absolute bottom-1 left-1 rounded-full bg-black/50 px-1.5 py-0.5 text-[10px] font-medium text-white">
                      Cover
                    </span>
                  )}
                </div>
                <div className="flex flex-1 flex-col justify-between gap-1.5">
                  <input
                    type="text"
                    placeholder="Caption (optional)"
                    value={photo.caption}
                    onChange={(e) => onUpdateCaption(i, e.target.value)}
                    className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-2.5 text-sm focus:border-rose-400 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-50 dark:placeholder-neutral-500"
                  />
                  {photos.length > 1 && (
                    <button
                      type="button"
                      onClick={() => onRemove(i)}
                      className="self-start text-xs text-neutral-400 transition hover:text-red-500 dark:text-neutral-500 dark:hover:text-red-400"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-neutral-300 py-6 text-center transition hover:border-rose-400 dark:border-neutral-700 dark:hover:border-rose-600">
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                  className="sr-only"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFile(i, file);
                  }}
                />
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="h-8 w-8 text-neutral-400 dark:text-neutral-500">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                    {i === 0 ? "Upload a photo" : `Photo ${i + 1}`}
                  </p>
                  <p className="text-xs text-neutral-400 dark:text-neutral-500">JPG, PNG, WebP — max 5 MB</p>
                </div>
                {photo.error && (
                  <p className="text-xs text-red-500 dark:text-red-400">{photo.error}</p>
                )}
              </label>
            )}
          </div>
        ))}
        {photos.length < 10 && allFilled && (
          <button
            type="button"
            onClick={onAdd}
            className="w-full rounded-2xl border border-dashed border-neutral-300 py-3 text-sm text-neutral-500 transition hover:border-neutral-500 dark:border-neutral-700 dark:text-neutral-400 dark:hover:border-neutral-500"
          >
            + Add another photo
          </button>
        )}
      </div>
    </div>
  );
}

function StepDetails({
  title,
  description,
  onTitleChange,
  onDescriptionChange,
}: {
  title: string;
  description: string;
  onTitleChange: (v: string) => void;
  onDescriptionChange: (v: string) => void;
}) {
  return (
    <div>
      <h2 className="text-lg font-semibold dark:text-neutral-50">Give your listing a name and description</h2>
      <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">Help guests understand what makes your space special.</p>
      <div className="mt-5 space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Listing title <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            maxLength={100}
            placeholder="e.g. Sunny loft in the heart of Tallinn"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-100 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-50 dark:placeholder-neutral-500 dark:focus:border-rose-500"
          />
          <p className="mt-1 text-right text-xs text-neutral-400 dark:text-neutral-500">{title.length}/100</p>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Description <span className="text-rose-500">*</span>
          </label>
          <textarea
            rows={5}
            maxLength={2000}
            placeholder="Describe your place: what's special, nearby attractions, the neighbourhood…"
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            className="w-full resize-none rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-100 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-50 dark:placeholder-neutral-500 dark:focus:border-rose-500"
          />
          <p className="mt-1 text-right text-xs text-neutral-400 dark:text-neutral-500">{description.length}/2000</p>
        </div>
      </div>
    </div>
  );
}

function StepPricing({
  pricePerNight,
  weekendPricePerNight,
  minNights,
  onPriceChange,
  onWeekendPriceChange,
  onMinNightsChange,
}: {
  pricePerNight: string;
  weekendPricePerNight: string;
  minNights: number;
  onPriceChange: (v: string) => void;
  onWeekendPriceChange: (v: string) => void;
  onMinNightsChange: (v: number) => void;
}) {
  return (
    <div>
      <h2 className="text-lg font-semibold dark:text-neutral-50">Set your pricing</h2>
      <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">Choose a competitive price for your area.</p>
      <div className="mt-5 space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Base price per night (€) <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-neutral-400 dark:text-neutral-500">€</span>
            <input
              type="number"
              min="1"
              step="0.01"
              placeholder="0.00"
              value={pricePerNight}
              onChange={(e) => onPriceChange(e.target.value)}
              className="w-full rounded-2xl border border-neutral-300 bg-white py-3 pl-8 pr-4 text-sm focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-100 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-50 dark:placeholder-neutral-500 dark:focus:border-rose-500"
            />
          </div>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Weekend price per night (€) <span className="text-neutral-400">(optional)</span>
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-neutral-400 dark:text-neutral-500">€</span>
            <input
              type="number"
              min="1"
              step="0.01"
              placeholder="Leave blank to use base price"
              value={weekendPricePerNight}
              onChange={(e) => onWeekendPriceChange(e.target.value)}
              className="w-full rounded-2xl border border-neutral-300 bg-white py-3 pl-8 pr-4 text-sm focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-100 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-50 dark:placeholder-neutral-500 dark:focus:border-rose-500"
            />
          </div>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">Minimum nights</label>
          <div className="flex items-center gap-4">
            <button type="button" onClick={() => onMinNightsChange(Math.max(1, minNights - 1))} className="h-10 w-10 rounded-full border border-neutral-300 text-neutral-600 transition hover:border-neutral-900 disabled:opacity-30 dark:border-neutral-700 dark:text-neutral-400 dark:hover:border-neutral-400" disabled={minNights <= 1}>−</button>
            <span className="w-8 text-center text-sm font-semibold dark:text-neutral-50">{minNights}</span>
            <button type="button" onClick={() => onMinNightsChange(Math.min(30, minNights + 1))} className="h-10 w-10 rounded-full border border-neutral-300 text-neutral-600 transition hover:border-neutral-900 disabled:opacity-30 dark:border-neutral-700 dark:text-neutral-400 dark:hover:border-neutral-400" disabled={minNights >= 30}>+</button>
            <span className="text-sm text-neutral-500 dark:text-neutral-400">night{minNights !== 1 ? "s" : ""} minimum</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function StepRulesBooking({
  houseRules,
  bookingType,
  onHouseRulesChange,
  onBookingTypeChange,
}: {
  houseRules: string;
  bookingType: "instant" | "request";
  onHouseRulesChange: (v: string) => void;
  onBookingTypeChange: (v: "instant" | "request") => void;
}) {
  return (
    <div>
      <h2 className="text-lg font-semibold dark:text-neutral-50">House rules & booking</h2>
      <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">Let guests know what to expect.</p>
      <div className="mt-5 space-y-6">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
            House rules <span className="text-neutral-400">(optional)</span>
          </label>
          <textarea
            rows={3}
            maxLength={500}
            placeholder="No smoking, no parties, check-in after 3pm…"
            value={houseRules}
            onChange={(e) => onHouseRulesChange(e.target.value)}
            className="w-full resize-none rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-100 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-50 dark:placeholder-neutral-500 dark:focus:border-rose-500"
          />
        </div>
        <div>
          <p className="mb-3 text-sm font-medium text-neutral-700 dark:text-neutral-300">Booking type</p>
          <div className="space-y-3">
            {(["instant", "request"] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => onBookingTypeChange(type)}
                className={`flex w-full items-start gap-4 rounded-2xl border-2 p-4 text-left transition dark:text-neutral-50 ${
                  bookingType === type
                    ? "border-rose-500 bg-rose-50"
                    : "border-neutral-200 hover:border-neutral-300 dark:border-neutral-700 dark:hover:border-neutral-600"
                }`}
              >
                <div className={`mt-0.5 h-4 w-4 shrink-0 rounded-full border-2 ${bookingType === type ? "border-rose-500 bg-rose-500" : "border-neutral-300"}`} />
                <div>
                  <p className="text-sm font-semibold capitalize">
                    {type === "instant" ? "⚡ Instant booking" : "📋 Request to book"}
                  </p>
                  <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
                    {type === "instant"
                      ? "Guests can book instantly without your approval."
                      : "You approve or decline each booking request within 24 hours."}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
