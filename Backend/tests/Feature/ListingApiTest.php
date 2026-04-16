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

    public function test_it_returns_listings_with_host_and_booking_metrics(): void
    {
        $host = User::query()->create([
            'email' => 'host@example.com',
            'role' => 'host',
        ]);

        $guest = User::query()->create([
            'email' => 'guest@example.com',
            'role' => 'guest',
        ]);

        $listing = Listing::query()->create([
            'host_id' => $host->id,
            'title' => 'Seaside Loft',
            'price_per_night' => 225,
            'max_guests' => 4,
        ]);

        Booking::query()->create([
            'listing_id' => $listing->id,
            'user_id' => $guest->id,
            'start_date' => '2026-05-01',
            'end_date' => '2026-05-03',
            'total_price' => 450,
            'status' => 'confirmed',
        ]);

        Booking::query()->create([
            'listing_id' => $listing->id,
            'user_id' => $guest->id,
            'start_date' => '2026-06-10',
            'end_date' => '2026-06-11',
            'total_price' => 225,
            'status' => 'pending',
        ]);

        $response = $this->getJson('/api/listings');

        $response
            ->assertOk()
            ->assertJsonPath('meta.totalListings', 1)
            ->assertJsonPath('meta.averagePricePerNight', 225)
            ->assertJsonPath('data.0.title', 'Seaside Loft')
            ->assertJsonPath('data.0.pricePerNight', 225)
            ->assertJsonPath('data.0.maxGuests', 4)
            ->assertJsonPath('data.0.host.publicLabel', 'Managed by host')
            ->assertJsonPath('data.0.metrics.confirmedBookings', 1)
            ->assertJsonPath('data.0.metrics.confirmedRevenue', 450);
    }
}
