"use client";

import { useRef, useState, useEffect } from "react";

type Props = {
  listingId: number;
  hostName: string;
  listingTitle: string;
  isLoggedIn: boolean;
};

export function ContactHostModal({ listingId, hostName, listingTitle, isLoggedIn }: Props) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (open && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [open]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    if (open) document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim()) return;
    setSending(true);
    setError(null);

    try {
      const res = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listing_id: listingId, message: message.trim() }),
      });

      if (!res.ok) {
        const body = (await res.json()) as { message?: string };
        throw new Error(body.message ?? "Failed to send message");
      }

      setSent(true);
      setMessage("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => { setOpen(true); setSent(false); setError(null); }}
        className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm font-medium text-neutral-700 transition hover:border-neutral-900 hover:text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
      >
        Contact host
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="contact-host-title"
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm dark:bg-black/60"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-md overflow-hidden rounded-[1.75rem] bg-white shadow-2xl dark:bg-neutral-900"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="border-b border-neutral-100 px-6 py-5 dark:border-neutral-800">
              <div className="flex items-start justify-between">
                <div>
                  <h2 id="contact-host-title" className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">
                    Contact {hostName}
                  </h2>
                  <p className="mt-0.5 text-sm text-neutral-500 dark:text-neutral-400">{listingTitle}</p>
                </div>
                <button
                  type="button"
                  aria-label="Close"
                  onClick={() => setOpen(false)}
                  className="rounded-full p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
                    <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="px-6 py-5">
              {!isLoggedIn ? (
                <div className="text-center">
                  <p className="text-sm text-neutral-600">You need to be logged in to contact the host.</p>
                  <a
                    href="/login"
                    className="mt-4 inline-block rounded-2xl bg-rose-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-rose-600"
                  >
                    Log in
                  </a>
                </div>
              ) : sent ? (
                <div className="text-center py-4">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-6 w-6 text-green-600">
                      <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="font-medium text-neutral-900">Message sent!</p>
                  <p className="mt-1 text-sm text-neutral-500">
                    {hostName} will be in touch. You can view the conversation in your{" "}
                    <a href="/messages" className="text-rose-500 hover:underline">messages</a>.
                  </p>
                  <button
                    type="button"
                    onClick={() => { setSent(false); setOpen(false); }}
                    className="mt-4 rounded-2xl border border-neutral-300 px-5 py-2 text-sm font-medium hover:border-neutral-900"
                  >
                    Close
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="contact-message" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                      Your message
                    </label>
                    <textarea
                      id="contact-message"
                      ref={textareaRef}
                      rows={5}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder={`Hi ${hostName}, I'm interested in your listing and would like to ask…`}
                      maxLength={2000}
                      className="mt-1.5 w-full resize-none rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-900 placeholder-neutral-400 focus:border-neutral-400 focus:bg-white focus:outline-none focus:ring-0 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-50 dark:placeholder-neutral-500 dark:focus:bg-neutral-800"
                      required
                    />
                    <p className="mt-1 text-right text-xs text-neutral-400 dark:text-neutral-500">{message.length}/2000</p>
                  </div>

                  {error && (
                    <p role="alert" className="rounded-xl bg-rose-50 px-4 py-2.5 text-sm text-rose-600">
                      {error}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={sending || !message.trim()}
                    className="w-full rounded-2xl bg-rose-500 py-3 text-sm font-semibold text-white transition hover:bg-rose-600 disabled:opacity-50"
                  >
                    {sending ? "Sending…" : "Send message"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
