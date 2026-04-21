<?php

namespace Database\Seeders;

use App\Models\Booking;
use App\Models\Listing;
use App\Models\User;
use Illuminate\Database\Seeder;

class DemoListingSeeder extends Seeder
{
    public function run(): void
    {
        $host = User::query()->where('email', 'renter@example.com')->first();
        $guest = User::query()->where('email', 'user@example.com')->first();

        if (! $host || ! $guest) {
            return;
        }

        $listings = [
            [
                'title' => 'Old Town Loft',
                'destination' => 'Tallinn',
                'price_per_night' => 160,
                'max_guests' => 2,
            ],
            [
                'title' => 'Beach House',
                'destination' => 'Parnu',
                'price_per_night' => 240,
                'max_guests' => 5,
            ],
            [
                'title' => 'City Apartment',
                'destination' => 'Riga',
                'price_per_night' => 190,
                'max_guests' => 3,
            ],
        ];

        foreach ($listings as $attributes) {
            Listing::query()->updateOrCreate(
                ['title' => $attributes['title']],
                ['host_id' => $host->id, ...$attributes],
            );
        }

        $tallinnListing = Listing::query()->where('title', 'Old Town Loft')->first();

        if ($tallinnListing) {
            Booking::query()->updateOrCreate(
                [
                    'listing_id' => $tallinnListing->id,
                    'user_id' => $guest->id,
                    'start_date' => '2026-06-10',
                    'end_date' => '2026-06-15',
                ],
                [
                    'total_price' => 800,
                    'status' => 'confirmed',
                ],
            );
        }
    }
}
