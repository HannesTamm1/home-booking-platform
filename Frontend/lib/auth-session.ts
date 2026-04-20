import type { AuthUser } from "@/lib/backend";

export const AUTH_COOKIE_NAME = "airstay_user";

export function encodeAuthSession(user: AuthUser) {
  return Buffer.from(JSON.stringify(user)).toString("base64url");
}

export function decodeAuthSession(value?: string) {
  if (!value) {
    return null;
  }

  try {
    const parsed = JSON.parse(Buffer.from(value, "base64url").toString("utf8"));

    if (
      typeof parsed === "object" &&
      parsed !== null &&
      typeof parsed.email === "string" &&
      typeof parsed.role === "string"
    ) {
      return parsed as AuthUser;
    }

    return null;
  } catch {
    return null;
  }
}
