import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { AUTH_COOKIE_NAME, decodeAuthSession } from "@/lib/auth-session";
import { getBackendBaseUrl } from "@/lib/backend";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const session = decodeAuthSession((await cookies()).get(AUTH_COOKIE_NAME)?.value);

  if (!session) {
    return NextResponse.json({ message: "Unauthenticated." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const idempotencyKey = request.headers.get("Idempotency-Key");

    const endpoint = new URL(`/api/listings/${id}/bookings`, `${getBackendBaseUrl()}/`).toString();

    const headers: Record<string, string> = {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.token}`,
    };

    if (idempotencyKey) {
      headers["Idempotency-Key"] = idempotencyKey;
    }

    const response = await fetch(endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
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
