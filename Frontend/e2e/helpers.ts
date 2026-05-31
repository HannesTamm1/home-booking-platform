import type { Page } from "@playwright/test";

export const DEMO = {
  guest: { email: "user@example.com", password: "password123" },
  host: { email: "renter@example.com", password: "password123" },
  admin: { email: "admin@example.com", password: "password123" },
};

export async function login(page: Page, email: string, password: string) {
  await page.goto("/login");
  await page.getByLabel(/email/i).fill(email);
  await page.getByLabel(/password/i).fill(password);
  await page.getByRole("button", { name: /log in|sign in/i }).click();
  await page.waitForURL("/");
}

export async function logout(page: Page) {
  await page.goto("/");
  const logoutBtn = page.getByRole("button", { name: /log out/i });
  if (await logoutBtn.isVisible()) {
    await logoutBtn.click();
    await page.waitForURL("/");
  }
}

/** Returns the first published listing ID from the API. */
export async function getFirstListingId(page: Page): Promise<number> {
  const response = await page.request.get(
    "http://127.0.0.1:8000/api/listings?per_page=1",
    { headers: { Accept: "application/json" } },
  );
  const data = (await response.json()) as { data: { id: number }[] };
  return data.data[0].id;
}

/** Seed-reset helper — calls the backend to get a fresh token for testing. */
export async function getApiToken(email: string, password: string, page: Page): Promise<string> {
  const res = await page.request.post("http://127.0.0.1:8000/api/auth/login", {
    data: { email, password },
    headers: { "Content-Type": "application/json", Accept: "application/json" },
  });
  const body = (await res.json()) as { token: string };
  return body.token;
}
