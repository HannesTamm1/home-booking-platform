import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

import { AUTH_COOKIE_NAME, decodeAuthSession } from "@/lib/auth-session";
import { getBackendBaseUrl } from "@/lib/backend";

export async function GET() {
  const session = decodeAuthSession((await cookies()).get(AUTH_COOKIE_NAME)?.value);
  if (!session) return NextResponse.json({ message: "Unauthorised" }, { status: 401 });

  const res = await fetch(new URL("/api/conversations", getBackendBaseUrl()), {
    headers: { Accept: "application/json", Authorization: `Bearer ${session.token}` },
    cache: "no-store",
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

export async function POST(req: NextRequest) {
  const session = decodeAuthSession((await cookies()).get(AUTH_COOKIE_NAME)?.value);
  if (!session) return NextResponse.json({ message: "Unauthorised" }, { status: 401 });

  const body = await req.json();

  const res = await fetch(new URL("/api/conversations", getBackendBaseUrl()), {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.token}`,
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
