import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { AUTH_COOKIE_NAME, decodeAuthSession } from "@/lib/auth-session";
import { getBackendBaseUrl } from "@/lib/backend";
import { ReplyInput } from "./reply-input";

type Message = {
  id: number;
  body: string;
  senderId: number;
  senderName: string;
  isMine: boolean;
  createdAt: string | null;
};

type Conversation = {
  id: number;
  listing: { id: number; title: string; destination: string | null };
  otherParty: { id: number; name: string };
  lastMessage: { body: string; createdAt: string | null } | null;
  createdAt: string | null;
};

type ConversationDetail = {
  id: number;
  listing: { id: number; title: string; destination: string | null };
  guest: { id: number; name: string; email: string };
  host: { id: number; name: string; email: string };
  messages: Message[];
};

async function getConversations(token: string): Promise<Conversation[]> {
  try {
    const res = await fetch(new URL("/api/conversations", getBackendBaseUrl()), {
      headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!res.ok) return [];
    const data = (await res.json()) as { data: Conversation[] };
    return data.data;
  } catch {
    return [];
  }
}

async function getConversation(id: string, token: string): Promise<ConversationDetail | null> {
  try {
    const res = await fetch(new URL(`/api/conversations/${id}`, getBackendBaseUrl()), {
      headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { data: ConversationDetail };
    return data.data;
  } catch {
    return null;
  }
}

type Props = { searchParams?: Promise<{ id?: string }> };

export default async function MessagesPage({ searchParams }: Props) {
  const sp = (await searchParams) ?? {};
  const session = decodeAuthSession((await cookies()).get(AUTH_COOKIE_NAME)?.value);

  if (!session) redirect("/login");

  const [conversations, activeConvo] = await Promise.all([
    getConversations(session.token),
    sp.id ? getConversation(sp.id, session.token) : Promise.resolve(null),
  ]);

  return (
    <main className="min-h-screen bg-stone-50 dark:bg-neutral-950">
      <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <header className="flex items-center justify-between border-b border-neutral-200 pb-6 dark:border-neutral-800">
          <Link href="/" className="text-2xl font-semibold tracking-tight text-rose-500">
            airbaba
          </Link>
          <Link
            href={session.role === "host" ? "/host" : "/trips"}
            className="rounded-full border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 hover:border-neutral-900"
          >
            {session.role === "host" ? "Host dashboard" : "My trips"}
          </Link>
        </header>

        <h1 className="mt-6 text-2xl font-semibold text-neutral-900 dark:text-neutral-50">Messages</h1>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[320px_1fr]">
          {/* Sidebar: conversation list */}
          <div className="space-y-2">
            {conversations.length === 0 && (
              <div className="rounded-2xl border border-dashed border-neutral-200 p-6 text-center text-sm text-neutral-500">
                No conversations yet.
              </div>
            )}
            {conversations.map((c) => (
              <Link
                key={c.id}
                href={`/messages?id=${c.id}`}
                className={`block rounded-2xl border p-4 transition hover:border-neutral-400 ${
                  sp.id === String(c.id)
                    ? "border-rose-300 bg-rose-50 dark:border-rose-800 dark:bg-rose-950"
                    : "border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900"
                }`}
              >
                <p className="font-medium text-neutral-900 line-clamp-1 dark:text-neutral-50">{c.listing.title}</p>
                <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">With {c.otherParty.name}</p>
                {c.lastMessage && (
                  <p className="mt-2 text-sm text-neutral-600 line-clamp-2 dark:text-neutral-400">{c.lastMessage.body}</p>
                )}
              </Link>
            ))}
          </div>

          {/* Thread */}
          <div className="overflow-hidden rounded-[1.75rem] border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
            {activeConvo ? (
              <ConversationThread convo={activeConvo} userId={session.id} />
            ) : (
              <div className="flex h-64 items-center justify-center text-sm text-neutral-400">
                Select a conversation to read it
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

function ConversationThread({
  convo,
  userId,
}: {
  convo: ConversationDetail;
  userId: number;
}) {
  const otherParty = convo.guest.id === userId ? convo.host : convo.guest;

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-neutral-100 px-6 py-4 dark:border-neutral-800">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="font-semibold text-neutral-900 dark:text-neutral-50">{otherParty.name}</p>
            <Link
              href={`/listings/${convo.listing.id}`}
              className="text-sm text-rose-500 hover:underline"
            >
              {convo.listing.title}
            </Link>
          </div>
          <p className="shrink-0 text-sm text-neutral-500 dark:text-neutral-400">{otherParty.email}</p>
        </div>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto p-6">
        {convo.messages.length === 0 && (
          <p className="text-center text-sm text-neutral-400">No messages yet.</p>
        )}
        {convo.messages.map((m) => (
          <div
            key={m.id}
            className={`flex ${m.isMine ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`flex max-w-[75%] flex-col gap-1 ${m.isMine ? "items-end" : "items-start"}`}
            >
              <p className="text-xs text-neutral-400">
                {m.isMine ? "You" : m.senderName}
              </p>
              <div
                className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  m.isMine
                    ? "bg-rose-500 text-white"
                    : "bg-neutral-100 text-neutral-900"
                }`}
              >
                {m.body}
              </div>
              {m.createdAt && (
                <p className="text-xs text-neutral-400">
                  {new Date(m.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-neutral-100 px-6 py-4 dark:border-neutral-800">
        <ReplyInput conversationId={convo.id} />
      </div>
    </div>
  );
}
