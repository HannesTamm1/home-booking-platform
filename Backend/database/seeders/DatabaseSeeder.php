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
        // Admin account
        User::factory()->create([
            'name' => 'Admin',
            'email' => 'admin@example.com',
            'password' => 'password123',
            'role' => 'admin',
        ]);

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
            [
                'title' => 'Old Town Loft', 'destination' => 'Tallinn',
                'price_per_night_cents' => 16_000, 'max_guests' => 2,
                'status' => 'published', 'property_type' => 'loft',
                'bedrooms' => 1, 'beds' => 1, 'bathrooms' => 1,
                'amenities' => ['WiFi', 'Kitchen', 'Air conditioning', 'Workspace'],
                'booking_type' => 'instant', 'min_nights' => 2,
                'description' => 'Bright loft in the medieval old town with exposed brick walls and rooftop terrace.',
                'rating_average' => 4.95, 'rating_count' => 87,
            ],
            [
                'title' => 'Beach House', 'destination' => 'Parnu',
                'price_per_night_cents' => 24_000, 'max_guests' => 5,
                'status' => 'published', 'property_type' => 'house',
                'bedrooms' => 3, 'beds' => 4, 'bathrooms' => 2,
                'amenities' => ['WiFi', 'Kitchen', 'Free parking', 'Balcony', 'BBQ grill'],
                'booking_type' => 'instant', 'min_nights' => 3,
                'description' => 'Spacious family beach house 50 m from the sandy shore. Private garden and parking.',
                'rating_average' => 4.88, 'rating_count' => 42,
            ],
            [
                'title' => 'City Apartment', 'destination' => 'Riga',
                'price_per_night_cents' => 19_000, 'max_guests' => 3,
                'status' => 'published', 'property_type' => 'apartment',
                'bedrooms' => 2, 'beds' => 2, 'bathrooms' => 1,
                'amenities' => ['WiFi', 'Kitchen', 'TV', 'Washing machine', 'Dishwasher'],
                'booking_type' => 'request', 'min_nights' => 1,
                'description' => 'Stylish two-bedroom apartment in the Art Nouveau district, minutes from the central market.',
                'rating_average' => 4.72, 'rating_count' => 63,
            ],
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
