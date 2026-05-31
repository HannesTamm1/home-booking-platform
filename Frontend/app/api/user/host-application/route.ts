import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { AUTH_COOKIE_NAME, decodeAuthSession } from "@/lib/auth-session";
import { backendFetch } from "@/lib/backend";

export async function GET() {
  try {
    const session = decodeAuthSession((await cookies()).get(AUTH_COOKIE_NAME)?.value);

    if (!session) {
      return NextResponse.json({ message: "Unauthenticated." }, { status: 401 });
    }

    const response = await backendFetch("/api/user/host-application", session.token);
    const payload = await response.json();

    return NextResponse.json(payload, { status: response.status });
  } catch {
    return NextResponse.json({ message: "Unable to reach the backend." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = decodeAuthSession((await cookies()).get(AUTH_COOKIE_NAME)?.value);

    if (!session) {
      return NextResponse.json({ message: "Unauthenticated." }, { status: 401 });
    }

    const body = await request.json();

    const response = await backendFetch("/api/user/host-application", session.token, {
      method: "POST",
      body: JSON.stringify(body),
    });

    const payload = await response.json();

    return NextResponse.json(payload, { status: response.status });
  } catch {
    return NextResponse.json({ message: "Unable to reach the backend." }, { status: 500 });
  }
}
