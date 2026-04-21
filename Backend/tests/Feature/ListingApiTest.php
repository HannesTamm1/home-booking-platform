<?php

namespace Tests\Feature;

use App\Models\Booking;
use App\Models\Listing;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ListingApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_returns_paginated_listings_with_host_and_booking_metrics(): void
    {
        $host = $this->createUser('host@example.com', 'host');
        $guest = $this->createUser('guest@example.com', 'guest');
        $listing = $this->createListing($host, 'Seaside Loft', 'Tallinn', 225, 4);

        $this->createBooking($listing, $guest, [
            'start_date' => '2026-05-01',
            'end_date' => '2026-05-03',
            'total_price' => 450,
            'status' => 'confirmed',
        ]);

        $this->createBooking($listing, $guest, [
            'start_date' => '2026-06-10',
            'end_date' => '2026-06-11',
            'total_price' => 225,
            'status' => 'pending',
        ]);

        $response = $this->getJson('/api/listings?per_page=10');

        $response
            ->assertOk()
            ->assertJsonPath('meta.totalListings', 1)
            ->assertJsonPath('meta.averagePricePerNight', 225)
            ->assertJsonPath('meta.pagination.currentPage', 1)
            ->assertJsonPath('meta.pagination.perPage', 10)
            ->assertJsonPath('meta.pagination.lastPage', 1)
            ->assertJsonPath('meta.pagination.hasMorePages', false)
            ->assertJsonPath('meta.filters.availableDestinations.0', 'Tallinn')
            ->assertJsonPath('data.0.title', 'Seaside Loft')
            ->assertJsonPath('data.0.destination', 'Tallinn')
            ->assertJsonPath('data.0.pricePerNight', 225)
            ->assertJsonPath('data.0.maxGuests', 4)
            ->assertJsonPath('data.0.host.publicLabel', 'Managed by host')
            ->assertJsonPath('data.0.metrics.confirmedBookings', 1)
            ->assertJsonPath('data.0.metrics.confirmedRevenue', 450);
    }

    public function test_it_validates_pagination_query_parameters(): void
    {
        $response = $this->getJson('/api/listings?page=0&per_page=999');

        $response
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['page', 'per_page']);
    }

    public function test_it_paginates_listing_results(): void
    {
        $host = $this->createUser('host@example.com', 'host');

        $this->createListing($host, 'Seaside Loft', 'Tallinn', 225, 4);
        $this->createListing($host, 'Forest Cabin', 'Riga', 180, 3);
        $this->createListing($host, 'City Studio', 'Vilnius', 120, 2);

        $response = $this->getJson('/api/listings?per_page=2');

        $response
            ->assertOk()
            ->assertJsonCount(2, 'data')
            ->assertJsonPath('meta.totalListings', 3)
            ->assertJsonPath('meta.averagePricePerNight', 175)
            ->assertJsonPath('meta.pagination.currentPage', 1)
            ->assertJsonPath('meta.pagination.perPage', 2)
            ->assertJsonPath('meta.pagination.lastPage', 2)
            ->assertJsonPath('meta.pagination.hasMorePages', true);
    }

    public function test_it_filters_by_destination_guests_and_dates(): void
    {
        $host = $this->createUser('host@example.com', 'host');
        $guest = $this->createUser('guest@example.com', 'guest');

        $tallinnAvailable = $this->createListing($host, 'Tallinn Loft', 'Tallinn', 210, 4);
        $tallinnBooked = $this->createListing($host, 'Tallinn Old Town Flat', 'Tallinn', 260, 2);
        $this->createListing($host, 'Riga Riverside', 'Riga', 180, 5);

        $this->createBooking($tallinnBooked, $guest, [
            'start_date' => '2026-06-10',
            'end_date' => '2026-06-15',
            'total_price' => 1300,
            'status' => 'confirmed',
        ]);

        $response = $this->getJson('/api/listings?destination=Tallinn&guests=3&check_in=2026-06-12&check_out=2026-06-14');

        $response
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('meta.totalListings', 1)
            ->assertJsonPath('meta.filters.destination', 'Tallinn')
            ->assertJsonPath('meta.filters.guests', 3)
            ->assertJsonPath('meta.filters.checkIn', '2026-06-12')
            ->assertJsonPath('meta.filters.checkOut', '2026-06-14')
            ->assertJsonPath('data.0.id', $tallinnAvailable->id)
            ->assertJsonPath('data.0.destination', 'Tallinn');
    }

    public function test_it_ignores_unknown_destination_filters(): void
    {
        $host = $this->createUser('host@example.com', 'host');

        $this->createListing($host, 'Tallinn Loft', 'Tallinn', 210, 4);
        $this->createListing($host, 'Riga Riverside', 'Riga', 180, 5);

        $response = $this->getJson('/api/listings?destination=Berlin');

        $response
            ->assertOk()
            ->assertJsonPath('meta.totalListings', 2)
            ->assertJsonCount(2, 'data');
    }

    public function test_it_applies_security_headers_to_api_responses(): void
    {
        $response = $this->getJson('/api/listings');

        $response
            ->assertOk()
            ->assertHeader('Cache-Control', 'no-store, private')
            ->assertHeader('Content-Security-Policy', "default-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'")
            ->assertHeader('Referrer-Policy', 'no-referrer')
            ->assertHeader('X-Content-Type-Options', 'nosniff')
            ->assertHeader('X-Frame-Options', 'DENY')
            ->assertHeader('X-Permitted-Cross-Domain-Policies', 'none');
    }

    public function test_it_rate_limits_the_api(): void
    {
        config(['api.rate_limit_per_minute' => 2]);

        $client = $this->withServerVariables([
            'REMOTE_ADDR' => '203.0.113.10',
        ]);

        $client->getJson('/api/listings')->assertOk();
        $client->getJson('/api/listings')->assertOk();
        $client->getJson('/api/listings')->assertTooManyRequests();
    }

    private function createUser(string $email, string $role): User
    {
        return User::query()->create([
            'name' => ucfirst($role).' Demo',
            'email' => $email,
            'password' => 'password123',
            'role' => $role,
        ]);
    }

    private function createListing(User $host, string $title, string $destination, float $pricePerNight, int $maxGuests): Listing
    {
        return Listing::query()->create([
            'host_id' => $host->id,
            'title' => $title,
            'destination' => $destination,
            'price_per_night' => $pricePerNight,
            'max_guests' => $maxGuests,
        ]);
    }

    /**
     * @param  array<string, mixed>  $attributes
     */
    private function createBooking(Listing $listing, User $guest, array $attributes): Booking
    {
        return Booking::query()->create([
            'listing_id' => $listing->id,
            'user_id' => $guest->id,
            ...$attributes,
        ]);
    }
}
