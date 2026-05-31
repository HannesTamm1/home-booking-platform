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

type PhotoInput = { url: string; caption: string };

type FormData = {
  propertyType: string;
  destination: string;
  latitude: string;
  longitude: string;
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
    latitude: l.latitude ? String(l.latitude) : "",
    longitude: l.longitude ? String(l.longitude) : "",
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
  latitude: "",
  longitude: "",
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

  function updatePhoto(index: number, field: keyof PhotoInput, value: string) {
    setForm((prev) => ({
      ...prev,
      photos: prev.photos.map((p, i) => (i === index ? { ...p, [field]: value } : p)),
    }));
  }

  function canProceed(): boolean {
    switch (step) {
      case 1: return !!form.propertyType;
      case 2: return !!form.destination;
      case 3: return form.maxGuests >= 1 && form.beds >= 1;
      case 4: return form.amenities.length >= 1;
      case 5: return form.photos.some((p) => p.url.trim() !== "");
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
      latitude: form.latitude ? Number(form.latitude) : undefined,
      longitude: form.longitude ? Number(form.longitude) : undefined,
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
    <div className="rounded-[2rem] border border-neutral-200 bg-white shadow-[0_16px_48px_rgba(0,0,0,0.05)]">
      {/* Header */}
      <div className="border-b border-neutral-100 p-6">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-lg font-semibold">
            {mode === "create" ? "Create a listing" : "Edit listing"}
          </h1>
          <span className="text-sm text-neutral-500">
            Step {step} of {STEPS.length}
          </span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-100">
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
                  ? "bg-rose-100 text-rose-600"
                  : "bg-neutral-100 text-neutral-400"
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
            latitude={form.latitude}
            longitude={form.longitude}
            onDestinationChange={(v) => update("destination", v)}
            onLatChange={(v) => update("latitude", v)}
            onLngChange={(v) => update("longitude", v)}
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
            onUpdate={updatePhoto}
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
        <div className="mx-6 mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
          {error}
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between border-t border-neutral-100 px-6 py-5">
        <button
          type="button"
          onClick={() => setStep((s) => Math.max(1, s - 1))}
          disabled={step === 1}
          className="rounded-2xl border border-neutral-300 px-5 py-2.5 text-sm font-medium text-neutral-700 transition hover:border-neutral-900 disabled:opacity-30"
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
                className="rounded-2xl border border-neutral-300 px-5 py-2.5 text-sm font-medium text-neutral-700 transition hover:border-neutral-900 disabled:opacity-70"
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
      <h2 className="text-lg font-semibold">What type of place are you hosting?</h2>
      <p className="mt-1 text-sm text-neutral-500">Select the option that best describes your space.</p>
      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {PROPERTY_TYPES.map((pt) => (
          <button
            key={pt.value}
            type="button"
            onClick={() => onChange(pt.value)}
            className={`flex flex-col items-center gap-2 rounded-2xl border-2 px-3 py-4 text-sm font-medium transition ${
              value === pt.value
                ? "border-rose-500 bg-rose-50 text-rose-600"
                : "border-neutral-200 text-neutral-700 hover:border-neutral-400"
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
  latitude,
  longitude,
  onDestinationChange,
  onLatChange,
  onLngChange,
}: {
  destination: string;
  latitude: string;
  longitude: string;
  onDestinationChange: (v: string) => void;
  onLatChange: (v: string) => void;
  onLngChange: (v: string) => void;
}) {
  return (
    <div>
      <h2 className="text-lg font-semibold">Where is your place located?</h2>
      <p className="mt-1 text-sm text-neutral-500">Guests will search for listings by city.</p>
      <div className="mt-5 space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-neutral-700">City / Destination</label>
          <select
            value={destination}
            onChange={(e) => onDestinationChange(e.target.value)}
            className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-100"
          >
            <option value="">Select a city…</option>
            {DESTINATIONS.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-neutral-700">
              Latitude <span className="text-neutral-400">(optional)</span>
            </label>
            <input
              type="number"
              step="any"
              placeholder="59.4370"
              value={latitude}
              onChange={(e) => onLatChange(e.target.value)}
              className="w-full rounded-2xl border border-neutral-300 px-4 py-3 text-sm focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-100"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-neutral-700">
              Longitude <span className="text-neutral-400">(optional)</span>
            </label>
            <input
              type="number"
              step="any"
              placeholder="24.7536"
              value={longitude}
              onChange={(e) => onLngChange(e.target.value)}
              className="w-full rounded-2xl border border-neutral-300 px-4 py-3 text-sm focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-100"
            />
          </div>
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
    <div className="flex items-center justify-between py-4 border-b border-neutral-100 last:border-0">
      <div>
        <p className="text-sm font-medium text-neutral-800">{label}</p>
        {sub && <p className="text-xs text-neutral-400">{sub}</p>}
      </div>
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          className="h-8 w-8 rounded-full border border-neutral-300 text-lg font-light text-neutral-600 transition hover:border-neutral-900 disabled:opacity-30"
        >
          −
        </button>
        <span className="w-6 text-center text-sm font-semibold">{value}</span>
        <button
          type="button"
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
          className="h-8 w-8 rounded-full border border-neutral-300 text-lg font-light text-neutral-600 transition hover:border-neutral-900 disabled:opacity-30"
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
      <h2 className="text-lg font-semibold">How many guests can stay?</h2>
      <p className="mt-1 text-sm text-neutral-500">Set the capacity for your space.</p>
      <div className="mt-5 rounded-2xl border border-neutral-200 px-5">
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
      <h2 className="text-lg font-semibold">What amenities do you offer?</h2>
      <p className="mt-1 text-sm text-neutral-500">Select all that apply. At least one is required.</p>
      <div className="mt-5 flex flex-wrap gap-2">
        {ALL_AMENITIES.map((amenity) => (
          <button
            key={amenity}
            type="button"
            onClick={() => onToggle(amenity)}
            className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
              selected.includes(amenity)
                ? "border-rose-500 bg-rose-50 text-rose-600"
                : "border-neutral-200 text-neutral-700 hover:border-neutral-400"
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
  onUpdate,
}: {
  photos: PhotoInput[];
  onAdd: () => void;
  onRemove: (i: number) => void;
  onUpdate: (i: number, field: keyof PhotoInput, value: string) => void;
}) {
  return (
    <div>
      <h2 className="text-lg font-semibold">Add photos of your space</h2>
      <p className="mt-1 text-sm text-neutral-500">
        Enter publicly accessible image URLs. The first photo will be the cover.
      </p>
      <div className="mt-5 space-y-3">
        {photos.map((photo, i) => (
          <div key={i} className="flex gap-3">
            <div className="flex-1 space-y-1.5">
              <input
                type="url"
                placeholder={`Photo ${i + 1} URL — https://…`}
                value={photo.url}
                onChange={(e) => onUpdate(i, "url", e.target.value)}
                className="w-full rounded-2xl border border-neutral-300 px-4 py-2.5 text-sm focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-100"
              />
              {photo.url && (
                <input
                  type="text"
                  placeholder="Caption (optional)"
                  value={photo.caption}
                  onChange={(e) => onUpdate(i, "caption", e.target.value)}
                  className="w-full rounded-2xl border border-neutral-200 px-4 py-2 text-sm focus:border-rose-400 focus:outline-none"
                />
              )}
            </div>
            {photos.length > 1 && (
              <button
                type="button"
                onClick={() => onRemove(i)}
                className="mt-0.5 h-10 w-10 shrink-0 rounded-full border border-neutral-200 text-neutral-400 transition hover:border-red-300 hover:text-red-500"
              >
                ✕
              </button>
            )}
          </div>
        ))}
        {photos.length < 10 && (
          <button
            type="button"
            onClick={onAdd}
            className="w-full rounded-2xl border border-dashed border-neutral-300 py-3 text-sm text-neutral-500 transition hover:border-neutral-500"
          >
            + Add another photo
          </button>
        )}
        <p className="text-xs text-neutral-400">Tip: use Unsplash or similar for placeholder images.</p>
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
      <h2 className="text-lg font-semibold">Give your listing a name and description</h2>
      <p className="mt-1 text-sm text-neutral-500">Help guests understand what makes your space special.</p>
      <div className="mt-5 space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-neutral-700">
            Listing title <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            maxLength={100}
            placeholder="e.g. Sunny loft in the heart of Tallinn"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            className="w-full rounded-2xl border border-neutral-300 px-4 py-3 text-sm focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-100"
          />
          <p className="mt-1 text-right text-xs text-neutral-400">{title.length}/100</p>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-neutral-700">
            Description <span className="text-rose-500">*</span>
          </label>
          <textarea
            rows={5}
            maxLength={2000}
            placeholder="Describe your place: what's special, nearby attractions, the neighbourhood…"
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            className="w-full resize-none rounded-2xl border border-neutral-300 px-4 py-3 text-sm focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-100"
          />
          <p className="mt-1 text-right text-xs text-neutral-400">{description.length}/2000</p>
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
      <h2 className="text-lg font-semibold">Set your pricing</h2>
      <p className="mt-1 text-sm text-neutral-500">Choose a competitive price for your area.</p>
      <div className="mt-5 space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-neutral-700">
            Base price per night (€) <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-neutral-400">€</span>
            <input
              type="number"
              min="1"
              step="0.01"
              placeholder="0.00"
              value={pricePerNight}
              onChange={(e) => onPriceChange(e.target.value)}
              className="w-full rounded-2xl border border-neutral-300 py-3 pl-8 pr-4 text-sm focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-100"
            />
          </div>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-neutral-700">
            Weekend price per night (€) <span className="text-neutral-400">(optional)</span>
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-neutral-400">€</span>
            <input
              type="number"
              min="1"
              step="0.01"
              placeholder="Leave blank to use base price"
              value={weekendPricePerNight}
              onChange={(e) => onWeekendPriceChange(e.target.value)}
              className="w-full rounded-2xl border border-neutral-300 py-3 pl-8 pr-4 text-sm focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-100"
            />
          </div>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-neutral-700">Minimum nights</label>
          <div className="flex items-center gap-4">
            <button type="button" onClick={() => onMinNightsChange(Math.max(1, minNights - 1))} className="h-10 w-10 rounded-full border border-neutral-300 text-neutral-600 transition hover:border-neutral-900 disabled:opacity-30" disabled={minNights <= 1}>−</button>
            <span className="w-8 text-center text-sm font-semibold">{minNights}</span>
            <button type="button" onClick={() => onMinNightsChange(Math.min(30, minNights + 1))} className="h-10 w-10 rounded-full border border-neutral-300 text-neutral-600 transition hover:border-neutral-900 disabled:opacity-30" disabled={minNights >= 30}>+</button>
            <span className="text-sm text-neutral-500">night{minNights !== 1 ? "s" : ""} minimum</span>
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
      <h2 className="text-lg font-semibold">House rules & booking</h2>
      <p className="mt-1 text-sm text-neutral-500">Let guests know what to expect.</p>
      <div className="mt-5 space-y-6">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-neutral-700">
            House rules <span className="text-neutral-400">(optional)</span>
          </label>
          <textarea
            rows={3}
            maxLength={500}
            placeholder="No smoking, no parties, check-in after 3pm…"
            value={houseRules}
            onChange={(e) => onHouseRulesChange(e.target.value)}
            className="w-full resize-none rounded-2xl border border-neutral-300 px-4 py-3 text-sm focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-100"
          />
        </div>
        <div>
          <p className="mb-3 text-sm font-medium text-neutral-700">Booking type</p>
          <div className="space-y-3">
            {(["instant", "request"] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => onBookingTypeChange(type)}
                className={`flex w-full items-start gap-4 rounded-2xl border-2 p-4 text-left transition ${
                  bookingType === type
                    ? "border-rose-500 bg-rose-50"
                    : "border-neutral-200 hover:border-neutral-300"
                }`}
              >
                <div className={`mt-0.5 h-4 w-4 shrink-0 rounded-full border-2 ${bookingType === type ? "border-rose-500 bg-rose-500" : "border-neutral-300"}`} />
                <div>
                  <p className="text-sm font-semibold capitalize">
                    {type === "instant" ? "⚡ Instant booking" : "📋 Request to book"}
                  </p>
                  <p className="mt-0.5 text-xs text-neutral-500">
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
