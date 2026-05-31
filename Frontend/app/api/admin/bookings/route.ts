import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

import { AUTH_COOKIE_NAME, decodeAuthSession } from "@/lib/auth-session";
import { backendFetch } from "@/lib/backend";

export async function GET(req: NextRequest): Promise<NextResponse> {
  const cookieStore = await cookies();
  const session = decodeAuthSession(cookieStore.get(AUTH_COOKIE_NAME)?.value);

  if (!session || session.role !== "admin") {
    return NextResponse.json({ message: "Forbidden." }, { status: 403 });
  }

  const qs = req.nextUrl.searchParams.toString();
  const response = await backendFetch(`/api/admin/bookings${qs ? `?${qs}` : ""}`, session.token);
  const data = await response.json();
  return NextResponse.json(data, { status: response.status });
}
