import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { AUTH_COOKIE_NAME, decodeAuthSession } from "@/lib/auth-session";
import { backendFetch } from "@/lib/backend";

export async function PUT(request: Request) {
  try {
    const session = decodeAuthSession((await cookies()).get(AUTH_COOKIE_NAME)?.value);

    if (!session) {
      return NextResponse.json({ message: "Unauthenticated." }, { status: 401 });
    }

    const body = await request.json();

    const response = await backendFetch("/api/user/password", session.token, {
      method: "PUT",
      body: JSON.stringify(body),
    });

    const payload = await response.json();

    if (!response.ok) {
      return NextResponse.json(payload, { status: response.status });
    }

    // Re-issue cookie with the new token the backend rotated
    const cookieStore = await cookies();
    const { encodeAuthSession } = await import("@/lib/auth-session");
    cookieStore.set({
      name: AUTH_COOKIE_NAME,
      value: encodeAuthSession({ ...session, token: (payload as { token: string }).token }),
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return NextResponse.json({ message: payload.message });
  } catch {
    return NextResponse.json({ message: "Unable to reach the backend." }, { status: 500 });
  }
}
