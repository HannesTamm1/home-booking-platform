"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  address: string;
  lat?: number | null;
  lng?: number | null;
};

type LatLng = { lat: number; lng: number };

async function geocodeAddress(address: string): Promise<LatLng | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`;
    const res = await fetch(url, { headers: { "Accept-Language": "en" } });
    const data = (await res.json()) as Array<{ lat: string; lon: string }>;
    if (!data.length) return null;
    return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
  } catch {
    return null;
  }
}

export function ListingMap({ address, lat, lng }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<import("leaflet").Map | null>(null);
  const [coords, setCoords] = useState<LatLng | null>(
    lat != null && lng != null ? { lat, lng } : null,
  );
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (coords) return;
    geocodeAddress(address).then((result) => {
      if (result) setCoords(result);
      else setFailed(true);
    });
  }, [address, coords]);

  useEffect(() => {
    if (!coords || !mapRef.current) return;

    // Destroy any existing instance before re-initialising (handles Strict Mode double-invoke)
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    let cancelled = false;

    import("leaflet").then((L) => {
      if (cancelled || !mapRef.current) return;

      // Fix default icon paths broken by webpack
      // @ts-expect-error leaflet internal
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      const map = L.map(mapRef.current).setView([coords.lat, coords.lng], 15);
      mapInstanceRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      L.marker([coords.lat, coords.lng])
        .addTo(map)
        .bindPopup(address)
        .openPopup();
    });

    return () => {
      cancelled = true;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [coords, address]);

  if (failed) {
    return (
      <div className="flex aspect-[16/7] items-center justify-center rounded-2xl border border-neutral-200 bg-neutral-50 text-sm text-neutral-500">
        Map unavailable for this address
      </div>
    );
  }

  if (!coords) {
    return (
      <div className="flex aspect-[16/7] animate-pulse items-center justify-center rounded-2xl bg-neutral-100 text-sm text-neutral-400">
        Loading map…
      </div>
    );
  }

  return (
    <>
      {/* Leaflet CSS */}
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
      />
      <div
        ref={mapRef}
        className="aspect-[16/7] w-full overflow-hidden rounded-2xl border border-neutral-200"
        style={{ zIndex: 0 }}
      />
      <p className="mt-2 text-sm text-neutral-500">{address}</p>
    </>
  );
}
