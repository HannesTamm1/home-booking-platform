import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { AUTH_COOKIE_NAME, decodeAuthSession } from "@/lib/auth-session";
import { getBackendBaseUrl } from "@/lib/backend";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = decodeAuthSession((await cookies()).get(AUTH_COOKIE_NAME)?.value);
  if (!session) return NextResponse.json({ message: "Unauthorised" }, { status: 401 });

  const res = await fetch(new URL(`/api/conversations/${id}`, getBackendBaseUrl()), {
    headers: { Accept: "application/json", Authorization: `Bearer ${session.token}` },
    cache: "no-store",
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
