import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { AUTH_COOKIE_NAME, decodeAuthSession } from "@/lib/auth-session";
import { backendFetch } from "@/lib/backend";

export async function POST(): Promise<NextResponse> {
  const cookieStore = await cookies();
  const session = decodeAuthSession(cookieStore.get(AUTH_COOKIE_NAME)?.value);

  if (!session) {
    return NextResponse.json({ message: "Unauthenticated." }, { status: 401 });
  }

  const response = await backendFetch("/api/host/connect/onboard", session.token, { method: "POST" });
  const data = await response.json();
  return NextResponse.json(data, { status: response.status });
}
