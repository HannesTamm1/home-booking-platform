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

        $host = User::factory()->host()->create([
            'name' => 'Marco Rossi',
            'email' => 'renter@example.com',
            'password' => 'password123',
        ]);

        $host2 = User::factory()->host()->create([
            'name' => 'Lena Müller',
            'email' => 'host2@example.com',
            'password' => 'password123',
        ]);

        $guest = User::factory()->guest()->create([
            'name' => 'Demo Guest',
            'email' => 'user@example.com',
            'password' => 'password123',
        ]);

        User::factory(3)->host()->create();
        User::factory(8)->guest()->create();

        $demoListings = [
            [
                'host_id' => $host->id,
                'title' => 'Old Town Loft with Rooftop Terrace',
                'destination' => 'Tallinn',
                'address' => 'Pikk 28, 10133 Tallinn, Estonia',
                'latitude' => 59.4370,
                'longitude' => 24.7454,
                'price_per_night_cents' => 16_000,
                'weekend_price_per_night_cents' => 19_000,
                'max_guests' => 2,
                'status' => 'published',
                'property_type' => 'loft',
                'bedrooms' => 1,
                'beds' => 1,
                'bathrooms' => 1,
                'amenities' => ['WiFi', 'Kitchen', 'Air conditioning', 'Workspace', 'Rooftop terrace'],
                'booking_type' => 'instant',
                'min_nights' => 2,
                'description' => "Step into the medieval heart of Tallinn in this sun-drenched loft. Exposed limestone walls meet modern Scandinavian design, creating the perfect retreat after a day exploring cobblestone streets.\n\nThe rooftop terrace offers panoramic views of the old town spires — perfect for morning coffee or evening wine.",
                'house_rules' => "No smoking indoors.\nQuiet hours after 22:00.\nNo parties or events.",
                'rating_average' => 4.95,
                'rating_count' => 87,
                'photos' => [
                    ['url' => 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&auto=format&fit=crop', 'caption' => 'Bright open living space'],
                    ['url' => 'https://images.unsplash.com/photo-1560448204-603b3fc33ddc?w=1200&auto=format&fit=crop', 'caption' => 'Cosy bedroom with city view'],
                    ['url' => 'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=1200&auto=format&fit=crop', 'caption' => 'Fully equipped kitchen'],
                    ['url' => 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&auto=format&fit=crop', 'caption' => 'Rooftop terrace at golden hour'],
                ],
            ],
            [
                'host_id' => $host->id,
                'title' => 'Seaside Beach House with Private Garden',
                'destination' => 'Pärnu',
                'address' => 'Ranna puiestee 12, 80010 Pärnu, Estonia',
                'latitude' => 58.3859,
                'longitude' => 24.4971,
                'price_per_night_cents' => 24_000,
                'max_guests' => 6,
                'status' => 'published',
                'property_type' => 'house',
                'bedrooms' => 3,
                'beds' => 4,
                'bathrooms' => 2,
                'amenities' => ['WiFi', 'Kitchen', 'Free parking', 'Garden', 'BBQ grill', 'Beach access', 'Washer', 'Dryer'],
                'booking_type' => 'instant',
                'min_nights' => 3,
                'description' => "A classic Estonian summer house just 50 metres from the famous Pärnu white-sand beach. Sleeps six comfortably with three spacious bedrooms, two bathrooms, and a large private garden.\n\nFire up the BBQ, unwind in the garden hammock, or walk straight onto the beach. The perfect family escape.",
                'house_rules' => "No smoking.\nPets welcome with prior notice.\nCheck-in after 15:00, check-out before 11:00.",
                'rating_average' => 4.88,
                'rating_count' => 42,
                'photos' => [
                    ['url' => 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=1200&auto=format&fit=crop', 'caption' => 'Charming exterior with garden'],
                    ['url' => 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&auto=format&fit=crop', 'caption' => 'Spacious living room'],
                    ['url' => 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&auto=format&fit=crop', 'caption' => 'Master bedroom'],
                    ['url' => 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=1200&auto=format&fit=crop', 'caption' => 'Private garden with BBQ'],
                    ['url' => 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&auto=format&fit=crop', 'caption' => 'The beach, 50 m away'],
                ],
            ],
            [
                'host_id' => $host->id,
                'title' => 'Art Nouveau Apartment in the Centre',
                'destination' => 'Riga',
                'address' => 'Alberta iela 8, Centra rajons, Rīga, LV-1010, Latvia',
                'latitude' => 56.9609,
                'longitude' => 24.1186,
                'price_per_night_cents' => 19_000,
                'max_guests' => 3,
                'status' => 'published',
                'property_type' => 'apartment',
                'bedrooms' => 2,
                'beds' => 2,
                'bathrooms' => 1,
                'amenities' => ['WiFi', 'Kitchen', 'TV', 'Washing machine', 'Dishwasher', 'Air conditioning'],
                'booking_type' => 'request',
                'min_nights' => 1,
                'description' => "Live like a local in the heart of Riga's breathtaking Art Nouveau district. This carefully restored two-bedroom apartment sits in a registered heritage building on Alberta Street — one of the most photographed streets in the Baltic states.\n\nHigh ceilings, original parquet floors, and large sash windows fill the space with character and light.",
                'house_rules' => "No smoking.\nNo parties.\nGuests must present a valid ID at check-in.",
                'rating_average' => 4.72,
                'rating_count' => 63,
                'photos' => [
                    ['url' => 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1200&auto=format&fit=crop', 'caption' => 'Heritage living room with high ceilings'],
                    ['url' => 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=1200&auto=format&fit=crop', 'caption' => 'Light-filled bedroom'],
                    ['url' => 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200&auto=format&fit=crop', 'caption' => 'Modern kitchen'],
                    ['url' => 'https://images.unsplash.com/photo-1630699144867-37acec97df5a?w=1200&auto=format&fit=crop', 'caption' => 'Art Nouveau building exterior'],
                ],
            ],
            [
                'host_id' => $host2->id,
                'title' => 'Design Studio in the Creative Quarter',
                'destination' => 'Vilnius',
                'address' => 'Užupio g. 2, 01202 Vilnius, Lithuania',
                'latitude' => 54.6836,
                'longitude' => 25.2979,
                'price_per_night_cents' => 11_500,
                'max_guests' => 2,
                'status' => 'published',
                'property_type' => 'studio',
                'bedrooms' => 0,
                'beds' => 1,
                'bathrooms' => 1,
                'amenities' => ['WiFi', 'Kitchen', 'Workspace', 'Air conditioning', 'City view'],
                'booking_type' => 'instant',
                'min_nights' => 1,
                'description' => "A beautifully designed studio in Užupis — Vilnius's bohemian self-proclaimed republic, celebrated for its art, cafés, and the famous Užupis constitution carved in stone.\n\nMinimalist interiors, a dedicated workspace, and a leafy courtyard view make this ideal for remote workers and creatives.",
                'house_rules' => "No smoking.\nNo pets.\nSilent from 23:00.",
                'rating_average' => 4.91,
                'rating_count' => 34,
                'photos' => [
                    ['url' => 'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=1200&auto=format&fit=crop', 'caption' => 'Minimalist studio interior'],
                    ['url' => 'https://images.unsplash.com/photo-1618220048045-10a6dbdf83e0?w=1200&auto=format&fit=crop', 'caption' => 'Compact kitchen & dining'],
                    ['url' => 'https://images.unsplash.com/photo-1585412727339-54e4bae3bbf9?w=1200&auto=format&fit=crop', 'caption' => 'Courtyard view from the window'],
                ],
            ],
            [
                'host_id' => $host2->id,
                'title' => 'Lakeside Cabin with Sauna',
                'destination' => 'Lahemaa',
                'address' => 'Kolga-Aabla küla, Kuusalu vald, 74626 Harju maakond, Estonia',
                'latitude' => 59.5700,
                'longitude' => 25.4350,
                'price_per_night_cents' => 29_000,
                'max_guests' => 8,
                'status' => 'published',
                'property_type' => 'cabin',
                'bedrooms' => 4,
                'beds' => 6,
                'bathrooms' => 2,
                'amenities' => ['WiFi', 'Sauna', 'Lake access', 'Rowing boat', 'Fireplace', 'BBQ grill', 'Free parking'],
                'booking_type' => 'instant',
                'min_nights' => 2,
                'description' => "An authentic Estonian log cabin on the edge of a pristine lake in Lahemaa National Park. Swim from the private jetty, row out at dusk, or sweat it out in the traditional wood-fired sauna — then jump straight into the lake.\n\nSleeps eight; perfect for a family gathering or group of friends escaping the city.",
                'house_rules' => "No smoking indoors.\nSauna is available from 16:00.\nKeep noise levels reasonable after 23:00.",
                'rating_average' => 4.97,
                'rating_count' => 21,
                'photos' => [
                    ['url' => 'https://images.unsplash.com/photo-1542718610-a1d656d1884c?w=1200&auto=format&fit=crop', 'caption' => 'Log cabin by the lake'],
                    ['url' => 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1200&auto=format&fit=crop', 'caption' => 'Private lake & jetty'],
                    ['url' => 'https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=1200&auto=format&fit=crop', 'caption' => 'Cosy wood-panelled living room'],
                    ['url' => 'https://images.unsplash.com/photo-1574362848149-11496d93a7c7?w=1200&auto=format&fit=crop', 'caption' => 'Wood-fired sauna'],
                ],
            ],
            [
                'host_id' => $host2->id,
                'title' => 'Penthouse Suite with Panoramic City Views',
                'destination' => 'Helsinki',
                'address' => 'Eteläesplanadi 22, 00130 Helsinki, Finland',
                'latitude' => 60.1669,
                'longitude' => 24.9432,
                'price_per_night_cents' => 38_000,
                'weekend_price_per_night_cents' => 44_000,
                'max_guests' => 4,
                'status' => 'published',
                'property_type' => 'apartment',
                'bedrooms' => 2,
                'beds' => 2,
                'bathrooms' => 2,
                'amenities' => ['WiFi', 'Kitchen', 'Gym access', 'Concierge', 'Panoramic terrace', 'Air conditioning', 'TV', 'Dishwasher'],
                'booking_type' => 'instant',
                'min_nights' => 2,
                'description' => "Perched on the top floor of an Esplanadi landmark building, this contemporary penthouse offers breathtaking 360° views of Helsinki's rooftops, Market Square, and the Baltic Sea beyond.\n\nTwo en-suite bedrooms, an open-plan kitchen and living area, and a wraparound terrace make this the city's finest address for a memorable stay.",
                'house_rules' => "No smoking.\nNo events.\nPlease treat the space with care.",
                'rating_average' => 4.85,
                'rating_count' => 19,
                'photos' => [
                    ['url' => 'https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?w=1200&auto=format&fit=crop', 'caption' => 'Panoramic terrace with city views'],
                    ['url' => 'https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?w=1200&auto=format&fit=crop', 'caption' => 'Open-plan living room'],
                    ['url' => 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=1200&auto=format&fit=crop', 'caption' => 'Master bedroom'],
                    ['url' => 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=1200&auto=format&fit=crop', 'caption' => 'Luxury bathroom'],
                ],
            ],
        ];

        foreach ($demoListings as $attrs) {
            $photos = $attrs['photos'];
            unset($attrs['photos']);

            $listing = Listing::factory()->create($attrs);

            foreach ($photos as $idx => $photo) {
                Photo::create([
                    'listing_id' => $listing->id,
                    'url' => $photo['url'],
                    'caption' => $photo['caption'] ?? null,
                    'sort_order' => $idx,
                ]);
            }
        }

        // Confirmed demo booking for the Tallinn loft
        $tallinnListing = Listing::query()->where('title', 'Old Town Loft with Rooftop Terrace')->first();
        if ($tallinnListing) {
            Booking::factory()->confirmed()->create([
                'listing_id' => $tallinnListing->id,
                'user_id' => $guest->id,
                'start_date' => '2026-06-10',
                'end_date' => '2026-06-15',
                'total_price_cents' => 80_000,
            ]);
        }

        // Random listings for the extra hosts
        $allHosts = User::where('role', 'host')->whereNotIn('id', [$host->id, $host2->id])->get();
        foreach ($allHosts as $randomHost) {
            $listings = Listing::factory(fake()->numberBetween(1, 2))->create(['host_id' => $randomHost->id]);
            foreach ($listings as $randomListing) {
                Photo::factory(fake()->numberBetween(2, 4))->sequence(
                    fn ($seq) => ['sort_order' => $seq->index]
                )->create(['listing_id' => $randomListing->id]);
            }
        }

        // Random bookings spread across listings and guests
        $allListings = Listing::all();
        $allGuests = User::where('role', 'guest')->get();

        foreach ($allListings as $listing) {
            $count = fake()->numberBetween(0, 2);
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
