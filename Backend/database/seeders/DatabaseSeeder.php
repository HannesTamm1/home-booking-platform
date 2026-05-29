<?php

namespace Database\Seeders;

use App\Models\Booking;
use App\Models\Listing;
use App\Models\Photo;
use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Known demo accounts for manual testing
        $host = User::factory()->host()->create([
            'name' => 'Demo Host',
            'email' => 'renter@example.com',
            'password' => 'password123',
        ]);

        $guest = User::factory()->guest()->create([
            'name' => 'Demo Guest',
            'email' => 'user@example.com',
            'password' => 'password123',
        ]);

        // Additional random users
        User::factory(4)->host()->create();
        User::factory(8)->guest()->create();

        // Fixed demo listings with known prices for QA
        $demoListings = [
            ['title' => 'Old Town Loft', 'destination' => 'Tallinn', 'price_per_night_cents' => 16_000, 'max_guests' => 2],
            ['title' => 'Beach House', 'destination' => 'Parnu', 'price_per_night_cents' => 24_000, 'max_guests' => 5],
            ['title' => 'City Apartment', 'destination' => 'Riga', 'price_per_night_cents' => 19_000, 'max_guests' => 3],
        ];

        foreach ($demoListings as $attrs) {
            $listing = Listing::factory()->create(['host_id' => $host->id, ...$attrs]);
            Photo::factory(fake()->numberBetween(2, 5))->sequence(
                fn ($seq) => ['sort_order' => $seq->index]
            )->create(['listing_id' => $listing->id]);
        }

        // Confirmed demo booking for the Tallinn loft
        $tallinnListing = Listing::query()->where('title', 'Old Town Loft')->first();
        if ($tallinnListing) {
            Booking::factory()->confirmed()->create([
                'listing_id' => $tallinnListing->id,
                'user_id' => $guest->id,
                'start_date' => '2026-06-10',
                'end_date' => '2026-06-15',
                'total_price_cents' => 80_000,
            ]);
        }

        // Random listings across all hosts
        $allHosts = User::where('role', 'host')->get();
        foreach ($allHosts as $randomHost) {
            $listings = Listing::factory(fake()->numberBetween(1, 3))->create(['host_id' => $randomHost->id]);
            foreach ($listings as $randomListing) {
                Photo::factory(fake()->numberBetween(1, 4))->sequence(
                    fn ($seq) => ['sort_order' => $seq->index]
                )->create(['listing_id' => $randomListing->id]);
            }
        }

        // Random bookings spread across listings and guests
        $allListings = Listing::all();
        $allGuests = User::where('role', 'guest')->get();

        foreach ($allListings as $listing) {
            $count = fake()->numberBetween(0, 3);
            for ($i = 0; $i < $count; $i++) {
                $nights = fake()->numberBetween(1, 7);
                $start = fake()->dateTimeBetween('-3 months', '+6 months');
                $end = (clone $start)->modify("+{$nights} days");

                Booking::factory()->create([
                    'listing_id' => $listing->id,
                    'user_id' => $allGuests->random()->id,
                    'start_date' => $start->format('Y-m-d'),
                    'end_date' => $end->format('Y-m-d'),
                    'total_price_cents' => $nights * $listing->price_per_night_cents,
                ]);
            }
        }
    }
}
