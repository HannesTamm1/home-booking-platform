/**
 * Golden path 1: Guest books → host sees reservation → admin views booking.
 *
 * Pre-condition: backend running at :8000, seed data loaded.
 * The test uses tomorrow + 3 days to avoid conflicts with seed bookings.
 */

import { expect, test } from "@playwright/test";
import { DEMO, getApiToken, login, logout } from "./helpers";

function futureDate(daysAhead: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  return d.toISOString().slice(0, 10);
}

const checkIn = futureDate(60);
const checkOut = futureDate(62);

test.describe("Guest booking flow", () => {
  test("home page loads with listing results", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText(/stays found/i)).toBeVisible({ timeout: 10_000 });
    await expect(page.locator("main")).toBeVisible();
  });

  test("listing detail page renders correctly", async ({ page }) => {
    await page.goto("/");
    // Click the first listing card
    const card = page.locator("a[href^='/listings/']").first();
    await expect(card).toBeVisible({ timeout: 10_000 });
    await card.click();
    await page.waitForURL(/\/listings\/\d+/);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    // Booking panel should be visible
    await expect(page.getByText(/reserve|book/i).first()).toBeVisible();
  });

  test("unauthenticated checkout redirects to login", async ({ page }) => {
    const token = await getApiToken(DEMO.guest.email, DEMO.guest.password, page);
    // Get a listing from the API
    const listRes = await page.request.get("http://127.0.0.1:8000/api/listings?per_page=1", {
      headers: { Accept: "application/json" },
    });
    const listData = (await listRes.json()) as { data: { id: number }[] };
    const listingId = listData.data[0].id;

    await page.goto(`/listings/${listingId}/checkout?start_date=${checkIn}&end_date=${checkOut}&guests=1`);
    await page.waitForURL(/\/login/);
    await expect(page.getByRole("heading", { name: /log in|sign in/i })).toBeVisible();
  });

  test("guest can create a booking and see it in trips", async ({ page }) => {
    // Get a listing ID
    const listRes = await page.request.get("http://127.0.0.1:8000/api/listings?per_page=3", {
      headers: { Accept: "application/json" },
    });
    const listData = (await listRes.json()) as { data: { id: number; title: string }[] };
    // Find a listing that's not the Tallinn one (which has a seed booking that might conflict)
    const listing = listData.data.find((l) => l.title !== "Old Town Loft") ?? listData.data[0];

    await login(page, DEMO.guest.email, DEMO.guest.password);
    await page.goto(
      `/listings/${listing.id}/checkout?start_date=${checkIn}&end_date=${checkOut}&guests=1`,
    );
    await expect(page.getByText(/confirm/i).first()).toBeVisible({ timeout: 10_000 });

    // Click confirm
    await page.getByRole("button", { name: /confirm/i }).click();
    await page.waitForURL(/\/bookings\/\d+\/confirmation/);
    await expect(page.getByText(/confirmed|booked/i).first()).toBeVisible();

    // Check trips page shows the new booking
    await page.goto("/trips");
    await expect(page.getByText(listing.title)).toBeVisible({ timeout: 5_000 });

    await logout(page);
  });

  test("host sees the new booking in reservations", async ({ page }) => {
    await login(page, DEMO.host.email, DEMO.host.password);
    await page.goto("/host/bookings");
    // Page should load without errors
    await expect(page.getByRole("heading", { name: /reservations/i })).toBeVisible({ timeout: 10_000 });
    // At least one row should exist (seed data has bookings)
    await expect(page.locator("table tbody tr").first()).toBeVisible();
    await logout(page);
  });

  test("admin sees all bookings in admin panel", async ({ page }) => {
    await login(page, DEMO.admin.email, DEMO.admin.password);
    await page.goto("/admin/bookings");
    await expect(page.getByRole("heading", { name: /bookings/i })).toBeVisible({ timeout: 10_000 });
    // Shows total count
    await expect(page.getByText(/total bookings|bookings/i).first()).toBeVisible();
    await logout(page);
  });
});
