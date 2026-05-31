import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

import { AUTH_COOKIE_NAME, decodeAuthSession } from "@/lib/auth-session";

export async function POST(req: NextRequest): Promise<NextResponse> {
  const cookieStore = await cookies();
  const session = decodeAuthSession(cookieStore.get(AUTH_COOKIE_NAME)?.value);

  if (!session) {
    return NextResponse.json({ message: "Unauthenticated." }, { status: 401 });
  }

  const backendUrl = (process.env.BACKEND_URL ?? "").replace(/\/$/, "");
  const formData = await req.formData();

  const response = await fetch(`${backendUrl}/api/host/photos`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${session.token}`,
    },
    body: formData,
  });

  const data = await response.json();
  return NextResponse.json(data, { status: response.status });
}
