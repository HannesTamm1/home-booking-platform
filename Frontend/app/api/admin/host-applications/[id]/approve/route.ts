import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { AUTH_COOKIE_NAME, decodeAuthSession } from "@/lib/auth-session";
import { backendFetch } from "@/lib/backend";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = decodeAuthSession((await cookies()).get(AUTH_COOKIE_NAME)?.value);

    if (!session || session.role !== "admin") {
      return NextResponse.json({ message: "Forbidden." }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json().catch(() => ({}));

    const response = await backendFetch(
      `/api/admin/host-applications/${id}/approve`,
      session.token,
      { method: "PATCH", body: JSON.stringify(body) },
    );

    const payload = await response.json();

    return NextResponse.json(payload, { status: response.status });
  } catch {
    return NextResponse.json({ message: "Unable to reach the backend." }, { status: 500 });
  }
}
