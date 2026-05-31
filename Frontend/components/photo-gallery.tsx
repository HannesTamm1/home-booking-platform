"use client";

import { useState } from "react";

type Photo = { id: number; url: string; caption: string | null; sortOrder: number };

type Props = { photos: Photo[]; title: string };

function isRemoteUrl(url: string) {
  return url.startsWith("http://") || url.startsWith("https://");
}

export function PhotoGallery({ photos, title }: Props) {
  const [current, setCurrent] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  const validPhotos = photos.filter((p) => isRemoteUrl(p.url));

  if (!validPhotos.length) {
    return (
      <div className="aspect-[16/7] overflow-hidden rounded-[2rem] bg-gradient-to-br from-rose-100 via-orange-50 to-stone-100" />
    );
  }

  const prev = () => setCurrent((c) => (c - 1 + validPhotos.length) % validPhotos.length);
  const next = () => setCurrent((c) => (c + 1) % validPhotos.length);

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") prev();
    if (e.key === "ArrowRight") next();
    if (e.key === "Escape") setLightbox(false);
  };

  return (
    <>
      <div className="relative mt-6 overflow-hidden rounded-[2rem] aspect-[16/7] bg-neutral-100 group dark:bg-neutral-800">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={validPhotos[current].url}
          alt={validPhotos[current].caption ?? title}
          className="h-full w-full object-cover cursor-zoom-in transition duration-300 group-hover:scale-[1.01]"
          onClick={() => setLightbox(true)}
          loading={current === 0 ? "eager" : "lazy"}
        />

        {validPhotos.length > 1 && (
          <>
            <button
              type="button"
              aria-label="Previous photo"
              onClick={prev}
              className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 shadow-lg backdrop-blur-sm transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5 text-neutral-700">
                <path fillRule="evenodd" d="M11.78 5.22a.75.75 0 0 1 0 1.06L8.06 10l3.72 3.72a.75.75 0 1 1-1.06 1.06l-4.25-4.25a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0Z" clipRule="evenodd" />
              </svg>
            </button>
            <button
              type="button"
              aria-label="Next photo"
              onClick={next}
              className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 shadow-lg backdrop-blur-sm transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5 text-neutral-700">
                <path fillRule="evenodd" d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 1 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
              </svg>
            </button>

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
              {validPhotos.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`Photo ${i + 1}`}
                  onClick={() => setCurrent(i)}
                  className={`h-1.5 rounded-full transition-all ${i === current ? "w-5 bg-white" : "w-1.5 bg-white/60"}`}
                />
              ))}
            </div>

            <div className="absolute bottom-4 right-4 rounded-full bg-black/40 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm">
              {current + 1} / {validPhotos.length}
            </div>
          </>
        )}

        {validPhotos[current].caption && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent px-5 py-4">
            <p className="text-sm text-white/90">{validPhotos[current].caption}</p>
          </div>
        )}
      </div>

      {validPhotos.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {validPhotos.map((p, i) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setCurrent(i)}
              className={`relative h-16 w-24 shrink-0 overflow-hidden rounded-xl border-2 transition ${i === current ? "border-rose-400" : "border-transparent opacity-70 hover:opacity-100"}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.url} alt={p.caption ?? `Photo ${i + 1}`} className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {lightbox && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Photo lightbox"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
          onClick={() => setLightbox(false)}
          onKeyDown={handleKey}
          tabIndex={-1}
        >
          <button
            type="button"
            aria-label="Close lightbox"
            onClick={() => setLightbox(false)}
            className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
              <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
            </svg>
          </button>
          <div
            className="relative max-h-[90vh] max-w-[90vw]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={validPhotos[current].url}
              alt={validPhotos[current].caption ?? title}
              className="max-h-[85vh] w-auto rounded-lg object-contain"
            />
          </div>
          {validPhotos.length > 1 && (
            <>
              <button
                type="button"
                aria-label="Previous photo"
                onClick={(e) => { e.stopPropagation(); prev(); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white hover:bg-white/20"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-6 w-6">
                  <path fillRule="evenodd" d="M11.78 5.22a.75.75 0 0 1 0 1.06L8.06 10l3.72 3.72a.75.75 0 1 1-1.06 1.06l-4.25-4.25a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0Z" clipRule="evenodd" />
                </svg>
              </button>
              <button
                type="button"
                aria-label="Next photo"
                onClick={(e) => { e.stopPropagation(); next(); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white hover:bg-white/20"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-6 w-6">
                  <path fillRule="evenodd" d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 1 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
                </svg>
              </button>
            </>
          )}
        </div>
      )}
    </>
  );
}
