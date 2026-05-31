import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { AUTH_COOKIE_NAME, decodeAuthSession } from "@/lib/auth-session";
import { getBackendBaseUrl } from "@/lib/backend";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const session = decodeAuthSession((await cookies()).get(AUTH_COOKIE_NAME)?.value);

  if (!session) {
    return NextResponse.json({ message: "Unauthenticated." }, { status: 401 });
  }

  try {
    const endpoint = new URL(`/api/user/bookings/${id}`, `${getBackendBaseUrl()}/`).toString();

    const response = await fetch(endpoint, {
      method: "DELETE",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${session.token}`,
      },
    });

    if (response.status === 204) {
      return new NextResponse(null, { status: 204 });
    }

    const payload = await response.json();
    return NextResponse.json(payload, { status: response.status });
  } catch {
    return NextResponse.json(
      { message: "Unable to cancel the booking right now." },
      { status: 500 },
    );
  }
}
