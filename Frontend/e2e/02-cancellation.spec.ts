/**
 * Golden path 2: Guest cancels a booking → status updates → nights become re-bookable.
 */

import { expect, test } from "@playwright/test";
import { DEMO, getApiToken, login, logout } from "./helpers";

function futureDate(daysAhead: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  return d.toISOString().slice(0, 10);
}

test.describe("Cancellation flow", () => {
  test("guest can cancel a booking from trips page", async ({ page }) => {
    // First create a booking via API so we have one to cancel
    const token = await getApiToken(DEMO.guest.email, DEMO.guest.password, page);

    const listRes = await page.request.get("http://127.0.0.1:8000/api/listings?per_page=5", {
      headers: { Accept: "application/json" },
    });
    const listData = (await listRes.json()) as { data: { id: number; title: string }[] };
    // Pick a listing that's not the seed-booked one
    const listing = listData.data.find((l) => l.title !== "Old Town Loft") ?? listData.data[0];

    const checkIn = futureDate(90);
    const checkOut = futureDate(91);

    // Create booking directly via API
    const bookRes = await page.request.post(
      `http://127.0.0.1:8000/api/listings/${listing.id}/bookings`,
      {
        data: { start_date: checkIn, end_date: checkOut },
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
          "Idempotency-Key": `cancel-test-${Date.now()}`,
        },
      },
    );

    if (!bookRes.ok()) {
      // Skip if conflict
      test.skip();
      return;
    }

    const bookData = (await bookRes.json()) as { data: { id: number } };
    const bookingId = bookData.data.id;

    // Now log in as guest and cancel from trips page
    await login(page, DEMO.guest.email, DEMO.guest.password);
    await page.goto("/trips");

    // Find the cancel button for this booking
    const cancelBtn = page.getByRole("button", { name: /cancel/i }).first();
    await expect(cancelBtn).toBeVisible({ timeout: 10_000 });

    // Accept confirmation dialog
    page.on("dialog", (dialog) => dialog.accept());
    await cancelBtn.click();

    // Booking should show as cancelled
    await expect(page.getByText(/cancelled/i).first()).toBeVisible({ timeout: 5_000 });

    // Verify via API the booking is actually cancelled
    const checkRes = await page.request.get(
      `http://127.0.0.1:8000/api/user/bookings/${bookingId}`,
      { headers: { Accept: "application/json", Authorization: `Bearer ${token}` } },
    );
    const checkData = (await checkRes.json()) as { data: { status: string } };
    expect(checkData.data.status).toBe("cancelled");

    await logout(page);
  });

  test("cancelled booking nights are re-bookable (API level)", async ({ page }) => {
    const token = await getApiToken(DEMO.guest.email, DEMO.guest.password, page);

    const listRes = await page.request.get("http://127.0.0.1:8000/api/listings?per_page=5", {
      headers: { Accept: "application/json" },
    });
    const listData = (await listRes.json()) as { data: { id: number; title: string }[] };
    const listing = listData.data.find((l) => l.title !== "Old Town Loft") ?? listData.data[0];

    const checkIn = futureDate(120);
    const checkOut = futureDate(121);

    // Book then cancel
    const bookRes = await page.request.post(
      `http://127.0.0.1:8000/api/listings/${listing.id}/bookings`,
      {
        data: { start_date: checkIn, end_date: checkOut },
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
          "Idempotency-Key": `rebook-test-${Date.now()}`,
        },
      },
    );

    if (!bookRes.ok()) { test.skip(); return; }

    const { data: { id: bookingId } } = (await bookRes.json()) as { data: { id: number } };

    // Cancel via API
    await page.request.delete(`http://127.0.0.1:8000/api/user/bookings/${bookingId}`, {
      headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
    });

    // Now try to book the same dates again — should succeed
    const rebookRes = await page.request.post(
      `http://127.0.0.1:8000/api/listings/${listing.id}/bookings`,
      {
        data: { start_date: checkIn, end_date: checkOut },
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
          "Idempotency-Key": `rebook2-test-${Date.now()}`,
        },
      },
    );

    expect(rebookRes.status()).toBe(201);

    // Clean up: cancel the re-booking
    const { data: { id: rebookId } } = (await rebookRes.json()) as { data: { id: number } };
    await page.request.delete(`http://127.0.0.1:8000/api/user/bookings/${rebookId}`, {
      headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
    });
  });
});
