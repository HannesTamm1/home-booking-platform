import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";

import { AUTH_COOKIE_NAME, decodeAuthSession } from "@/lib/auth-session";
import { BecomeHostClient } from "./become-host-client";

export const metadata = { title: "Become a host — AirStay" };

export default async function BecomeHostPage() {
  const session = decodeAuthSession((await cookies()).get(AUTH_COOKIE_NAME)?.value);

  if (!session) {
    redirect("/login?redirect=/become-a-host");
  }

  if (session.role === "host" || session.role === "admin") {
    redirect("/host/listings");
  }

  return (
    <main className="min-h-screen bg-stone-50 text-neutral-900">
      <div className="mx-auto flex w-full max-w-2xl flex-col px-4 py-12 sm:px-6">
        <Link href="/" className="mb-10 text-2xl font-semibold tracking-tight text-rose-500">
          airbnb
        </Link>

        <div className="rounded-[2rem] border border-neutral-200 bg-white p-10 shadow-[0_16px_48px_rgba(0,0,0,0.05)]">
          <div className="mb-8">
            <h1 className="text-3xl font-semibold tracking-tight">Become a host</h1>
            <p className="mt-3 text-neutral-500">
              Share your space and earn extra income. List your property in minutes and start welcoming guests from around the world.
            </p>
          </div>

          <div className="mb-8 grid grid-cols-3 gap-4 text-center">
            {[
              { icon: "🏠", title: "List your space", desc: "Share any type of accommodation" },
              { icon: "📅", title: "Set your schedule", desc: "Choose when you're available" },
              { icon: "💶", title: "Earn money", desc: "Get paid for every stay" },
            ].map((item) => (
              <div key={item.title} className="rounded-2xl bg-stone-50 p-4">
                <div className="text-2xl">{item.icon}</div>
                <p className="mt-2 text-sm font-semibold">{item.title}</p>
                <p className="mt-1 text-xs text-neutral-500">{item.desc}</p>
              </div>
            ))}
          </div>

          <BecomeHostClient />
        </div>
      </div>
    </main>
  );
}
