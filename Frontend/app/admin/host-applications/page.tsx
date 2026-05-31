import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { AUTH_COOKIE_NAME, decodeAuthSession } from "@/lib/auth-session";
import { AdminApplicationsClient } from "./admin-applications-client";

export default async function AdminHostApplicationsPage() {
  const session = decodeAuthSession((await cookies()).get(AUTH_COOKIE_NAME)?.value);

  if (!session || session.role !== "admin") {
    redirect("/");
  }

  let applications: unknown[] = [];

  try {
    const { backendFetch } = await import("@/lib/backend");
    const res = await backendFetch("/api/admin/host-applications", session.token);
    if (res.ok) {
      const data = await res.json();
      applications = data.data;
    }
  } catch {}

  return <AdminApplicationsClient initialApplications={applications as Application[]} />;
}

type Application = {
  id: number;
  status: "pending" | "approved" | "rejected";
  note: string | null;
  admin_note: string | null;
  created_at: string;
  user: { id: number; name: string | null; email: string };
  reviewed_by: { id: number; name: string | null } | null;
};
