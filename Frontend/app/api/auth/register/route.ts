import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { AUTH_COOKIE_NAME, encodeAuthSession } from "@/lib/auth-session";
import { getBackendBaseUrl, type AuthResponse } from "@/lib/backend";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      name?: string;
      email?: string;
      password?: string;
      password_confirmation?: string;
    };

    const endpoint = new URL("/api/auth/register", `${getBackendBaseUrl()}/`).toString();

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const payload = (await response.json()) as AuthResponse | { errors?: Record<string, string[]> };

    if (!response.ok) {
      return NextResponse.json(payload, { status: response.status });
    }

    const authPayload = payload as AuthResponse;

    const cookieStore = await cookies();
    cookieStore.set({
      name: AUTH_COOKIE_NAME,
      value: encodeAuthSession(authPayload.user),
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return NextResponse.json(authPayload, { status: response.status });
  } catch {
    return NextResponse.json(
      { message: "Unable to reach the backend auth service right now." },
      { status: 500 },
    );
  }
}
