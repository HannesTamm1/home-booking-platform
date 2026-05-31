import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { AUTH_COOKIE_NAME, decodeAuthSession } from "@/lib/auth-session";
import { SettingsClient } from "./settings-client";

export default async function SettingsPage() {
  const session = decodeAuthSession((await cookies()).get(AUTH_COOKIE_NAME)?.value);

  if (!session) {
    redirect("/login");
  }

  let application = null;

  try {
    const { backendFetch } = await import("@/lib/backend");
    const res = await backendFetch("/api/user/host-application", session.token);
    if (res.ok) {
      const data = await res.json();
      application = data.application;
    }
  } catch {}

  return <SettingsClient session={session} initialApplication={application} />;
}
