import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { AUTH_COOKIE_NAME, decodeAuthSession } from "@/lib/auth-session";
import { getBackendBaseUrl } from "@/lib/backend";

export async function GET() {
  const session = decodeAuthSession((await cookies()).get(AUTH_COOKIE_NAME)?.value);

  if (!session) {
    return NextResponse.json({ message: "Unauthenticated." }, { status: 401 });
  }

  try {
    const endpoint = new URL("/api/user/bookings", `${getBackendBaseUrl()}/`).toString();

    const response = await fetch(endpoint, {
      cache: "no-store",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${session.token}`,
      },
    });

    const payload = await response.json();
    return NextResponse.json(payload, { status: response.status });
  } catch {
    return NextResponse.json(
      { message: "Unable to reach the booking service right now." },
      { status: 500 },
    );
  }
}
