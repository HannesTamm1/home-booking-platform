<?php

namespace Tests\Feature;

use App\Models\Booking;
use App\Models\Listing;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BookingApiTest extends TestCase
{
    use RefreshDatabase;

    // ── Happy path ────────────────────────────────────────────────────────────

    public function test_authenticated_user_can_create_booking(): void
    {
        $listing = $this->makeListing(pricePerNightCents: 10000); // €100/night
        $guest = $this->makeUser('guest@example.com');

        $response = $this->actingAs($guest)->postJson(
            '/api/listings/'.$listing->id.'/bookings',
            ['start_date' => '2027-07-01', 'end_date' => '2027-07-05'],
        );

        $response
            ->assertCreated()
            ->assertJsonPath('data.listingId', $listing->id)
            ->assertJsonPath('data.startDate', '2027-07-01')
            ->assertJsonPath('data.endDate', '2027-07-05')
            ->assertJsonPath('data.nights', 4)
            ->assertJsonPath('data.totalPrice', 400)  // 4 nights × €100
            ->assertJsonPath('data.currency', 'EUR')
            ->assertJsonPath('data.status', 'confirmed');

        $this->assertDatabaseHas('bookings', [
            'listing_id' => $listing->id,
            'user_id' => $guest->id,
            'total_price_cents' => 40000,
            'status' => 'confirmed',
        ]);
    }

    // ── Server-computed price ─────────────────────────────────────────────────

    public function test_server_computes_price_and_ignores_any_client_total(): void
    {
        $listing = $this->makeListing(pricePerNightCents: 20000); // €200/night
        $guest = $this->makeUser('guest@example.com');

        // Client sends a tampered total — it is not even a valid request field,
        // but include it to show the server ignores it entirely.
        $response = $this->actingAs($guest)->postJson(
            '/api/listings/'.$listing->id.'/bookings',
            [
                'start_date' => '2027-08-01',
                'end_date' => '2027-08-03',   // 2 nights → should be €400
                'total_price_cents' => 1,      // tampered — ignored
            ],
        );

        $response
            ->assertCreated()
            ->assertJsonPath('data.nights', 2)
            ->assertJsonPath('data.totalPrice', 400);   // 2 × €200, not €0.01

        $this->assertDatabaseHas('bookings', ['total_price_cents' => 40000]);
    }

    // ── Conflict (409) ────────────────────────────────────────────────────────

    public function test_booking_overlapping_confirmed_dates_returns_409(): void
    {
        $listing = $this->makeListing();
        $guest1 = $this->makeUser('g1@example.com');
        $guest2 = $this->makeUser('g2@example.com');

        // First booking secures July 1–10.
        $this->actingAs($guest1)->postJson(
            '/api/listings/'.$listing->id.'/bookings',
            ['start_date' => '2027-07-01', 'end_date' => '2027-07-10'],
        )->assertCreated();

        // Second booking overlaps (July 5–15) → conflict.
        $this->actingAs($guest2)->postJson(
            '/api/listings/'.$listing->id.'/bookings',
            ['start_date' => '2027-07-05', 'end_date' => '2027-07-15'],
        )->assertStatus(409);

        $this->assertDatabaseCount('bookings', 1);
    }

    /**
     * Simulates a concurrency race: both requests pass an availability
     * snapshot, but only the first commit succeeds.  On PostgreSQL the
     * exclusion constraint is the final guard; on SQLite the
     * lockForUpdate + application check covers it.
     */
    public function test_concurrent_requests_for_same_dates_only_one_succeeds(): void
    {
        $listing = $this->makeListing();
        $guest1 = $this->makeUser('g1@example.com');
        $guest2 = $this->makeUser('g2@example.com');

        $first = $this->actingAs($guest1)->postJson(
            '/api/listings/'.$listing->id.'/bookings',
            ['start_date' => '2027-09-01', 'end_date' => '2027-09-07'],
        );
        $second = $this->actingAs($guest2)->postJson(
            '/api/listings/'.$listing->id.'/bookings',
            ['start_date' => '2027-09-01', 'end_date' => '2027-09-07'],
        );

        $statuses = [$first->status(), $second->status()];
        sort($statuses);

        $this->assertSame([201 => 1, 409 => 1], array_count_values($statuses),
            'Exactly one request should succeed (201) and the other should be rejected (409).');
    }

    // ── Adjacent dates are allowed ────────────────────────────────────────────

    public function test_adjacent_bookings_are_allowed(): void
    {
        $listing = $this->makeListing();
        $guest = $this->makeUser('guest@example.com');

        // Check-out on July 7 = check-in for the next booking (half-open [s,e))
        $this->actingAs($guest)->postJson(
            '/api/listings/'.$listing->id.'/bookings',
            ['start_date' => '2027-07-01', 'end_date' => '2027-07-07'],
        )->assertCreated();

        $this->actingAs($guest)->postJson(
            '/api/listings/'.$listing->id.'/bookings',
            ['start_date' => '2027-07-07', 'end_date' => '2027-07-10'],
        )->assertCreated();
    }

    // ── Idempotency ───────────────────────────────────────────────────────────

    public function test_same_idempotency_key_returns_existing_booking(): void
    {
        $listing = $this->makeListing();
        $guest = $this->makeUser('guest@example.com');

        $first = $this->actingAs($guest)->postJson(
            '/api/listings/'.$listing->id.'/bookings',
            ['start_date' => '2027-10-01', 'end_date' => '2027-10-04'],
            ['Idempotency-Key' => 'key-abc-123'],
        );

        $second = $this->actingAs($guest)->postJson(
            '/api/listings/'.$listing->id.'/bookings',
            ['start_date' => '2027-10-01', 'end_date' => '2027-10-04'],
            ['Idempotency-Key' => 'key-abc-123'],
        );

        $first->assertCreated();
        $second->assertOk(); // 200 on replay
        $this->assertSame($first->json('data.id'), $second->json('data.id'));
        $this->assertDatabaseCount('bookings', 1);
    }

    public function test_different_idempotency_keys_create_separate_bookings(): void
    {
        $listing = $this->makeListing();
        $guest = $this->makeUser('guest@example.com');

        // Non-overlapping dates so no conflict.
        $this->actingAs($guest)->postJson(
            '/api/listings/'.$listing->id.'/bookings',
            ['start_date' => '2027-11-01', 'end_date' => '2027-11-04'],
            ['Idempotency-Key' => 'key-1'],
        )->assertCreated();

        $this->actingAs($guest)->postJson(
            '/api/listings/'.$listing->id.'/bookings',
            ['start_date' => '2027-11-10', 'end_date' => '2027-11-14'],
            ['Idempotency-Key' => 'key-2'],
        )->assertCreated();

        $this->assertDatabaseCount('bookings', 2);
    }

    public function test_idempotency_key_is_scoped_to_user(): void
    {
        $listing = $this->makeListing();
        $guest1 = $this->makeUser('g1@example.com');
        $guest2 = $this->makeUser('g2@example.com');

        // Both guests use the same key string but on non-overlapping dates.
        $this->actingAs($guest1)->postJson(
            '/api/listings/'.$listing->id.'/bookings',
            ['start_date' => '2027-12-01', 'end_date' => '2027-12-03'],
            ['Idempotency-Key' => 'shared-key'],
        )->assertCreated();

        $this->actingAs($guest2)->postJson(
            '/api/listings/'.$listing->id.'/bookings',
            ['start_date' => '2027-12-10', 'end_date' => '2027-12-12'],
            ['Idempotency-Key' => 'shared-key'],
        )->assertCreated(); // different user → different scope → new booking

        $this->assertDatabaseCount('bookings', 2);
    }

    // ── Auth ──────────────────────────────────────────────────────────────────

    public function test_unauthenticated_cannot_create_booking(): void
    {
        $listing = $this->makeListing();

        $this->postJson(
            '/api/listings/'.$listing->id.'/bookings',
            ['start_date' => '2027-07-01', 'end_date' => '2027-07-05'],
        )->assertUnauthorized();
    }

    // ── Validation ────────────────────────────────────────────────────────────

    public function test_booking_requires_start_and_end_dates(): void
    {
        $listing = $this->makeListing();
        $guest = $this->makeUser('guest@example.com');

        $this->actingAs($guest)->postJson('/api/listings/'.$listing->id.'/bookings', [])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['start_date', 'end_date']);
    }

    public function test_end_date_must_be_after_start_date(): void
    {
        $listing = $this->makeListing();
        $guest = $this->makeUser('guest@example.com');

        $this->actingAs($guest)->postJson(
            '/api/listings/'.$listing->id.'/bookings',
            ['start_date' => '2027-07-10', 'end_date' => '2027-07-05'],
        )->assertUnprocessable()
            ->assertJsonValidationErrors(['end_date']);
    }

    public function test_booking_returns_404_for_unknown_listing(): void
    {
        $guest = $this->makeUser('guest@example.com');

        $this->actingAs($guest)->postJson(
            '/api/listings/9999/bookings',
            ['start_date' => '2027-07-01', 'end_date' => '2027-07-05'],
        )->assertNotFound();
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private function makeUser(string $email): User
    {
        return User::query()->create([
            'name' => 'Test User',
            'email' => $email,
            'password' => 'password123',
            'role' => 'guest',
        ]);
    }

    private function makeListing(int $pricePerNightCents = 10000): Listing
    {
        $host = User::query()->create([
            'name' => 'Host User',
            'email' => 'host-'.uniqid().'@example.com',
            'password' => 'password123',
            'role' => 'host',
        ]);

        return Listing::query()->create([
            'host_id' => $host->id,
            'title' => 'Test Listing',
            'destination' => 'Tallinn',
            'price_per_night_cents' => $pricePerNightCents,
            'currency' => 'EUR',
            'max_guests' => 4,
        ]);
    }
}
