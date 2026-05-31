"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

export function ReplyInput({ conversationId }: { conversationId: number }) {
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const router = useRouter();
  const inputRef = useRef<HTMLTextAreaElement>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    setSending(true);

    try {
      await fetch(`/api/conversations/${conversationId}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: body.trim() }),
      });
      setBody("");
      router.refresh();
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full gap-3">
      <textarea
        ref={inputRef}
        rows={2}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Write a message…"
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e as unknown as React.FormEvent);
          }
        }}
        className="flex-1 resize-none rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm focus:border-neutral-400 focus:bg-white focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-50 dark:placeholder-neutral-500 dark:focus:bg-neutral-800"
      />
      <button
        type="submit"
        disabled={sending || !body.trim()}
        className="self-end rounded-2xl bg-rose-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-rose-600 disabled:opacity-50"
      >
        {sending ? "…" : "Send"}
      </button>
    </form>
  );
}
