import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { AuthForm } from "@/components/auth-form";
import { AUTH_COOKIE_NAME, decodeAuthSession } from "@/lib/auth-session";

type RegisterPageProps = {
  searchParams?: Promise<{ redirect?: string }>;
};

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const session = decodeAuthSession((await cookies()).get(AUTH_COOKIE_NAME)?.value);
  const params = (await searchParams) ?? {};
  const redirectTo = params.redirect ?? undefined;

  if (session) {
    redirect(redirectTo ?? "/");
  }

  return (
    <main className="min-h-screen bg-stone-50 px-4 py-8 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-50">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl flex-col">
        <header className="flex items-center justify-between border-b border-neutral-200 pb-6 dark:border-neutral-800">
          <Link href="/" className="text-2xl font-semibold tracking-tight text-rose-500">
            airbaba
          </Link>
          <Link
            href={redirectTo ? `/login?redirect=${encodeURIComponent(redirectTo)}` : "/login"}
            className="rounded-full border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 transition hover:border-neutral-900 hover:text-neutral-900 dark:border-neutral-700 dark:text-neutral-300 dark:hover:border-neutral-400 dark:hover:text-white"
          >
            Log in
          </Link>
        </header>

        <div className="flex flex-1 items-center justify-center py-12">
          <AuthForm mode="register" redirectTo={redirectTo} />
        </div>
      </div>
    </main>
  );
}
