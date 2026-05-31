import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { AUTH_COOKIE_NAME, decodeAuthSession, encodeAuthSession } from "@/lib/auth-session";
import { backendFetch } from "@/lib/backend";

export async function POST(): Promise<NextResponse> {
  const cookieStore = await cookies();
  const session = decodeAuthSession(cookieStore.get(AUTH_COOKIE_NAME)?.value);

  if (!session) {
    return NextResponse.json({ message: "Unauthenticated." }, { status: 401 });
  }

  const response = await backendFetch("/api/user/become-host", session.token, {
    method: "POST",
  });

  const data = (await response.json()) as {
    message: string;
    user?: { id: number; name: string | null; email: string; role: string };
  };

  if (!response.ok) {
    return NextResponse.json({ message: data.message }, { status: response.status });
  }

  if (data.user) {
    const updatedSession = encodeAuthSession({
      id: data.user.id,
      name: data.user.name,
      email: data.user.email,
      role: data.user.role,
      token: session.token,
    });

    const res = NextResponse.json({ message: data.message });
    res.cookies.set(AUTH_COOKIE_NAME, updatedSession, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
    return res;
  }

  return NextResponse.json({ message: data.message });
}
