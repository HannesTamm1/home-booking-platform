<?php

namespace Database\Seeders;

use App\Models\Listing;
use App\Models\Photo;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class HostListingSeeder extends Seeder
{
    public function run(): void
    {
        // Remove Maarja
        User::where('name', 'like', '%Maarja%')->delete();

        // Create hosts
        $peeter = User::firstOrCreate(
            ['email' => 'peeter@example.com'],
            ['name' => 'Peeter', 'password' => Hash::make('password123'), 'role' => 'host']
        );

        $margus = User::firstOrCreate(
            ['email' => 'margus@example.com'],
            ['name' => 'Margus', 'password' => Hash::make('password123'), 'role' => 'host']
        );

        $martin = User::firstOrCreate(
            ['email' => 'martin@example.com'],
            ['name' => 'Martin', 'password' => Hash::make('password123'), 'role' => 'host']
        );

        $listings = [
            // Image 1: ornate mosaic floor, deep blue velvet sofa — opulent penthouse
            [
                'host_id' => $peeter->id,
                'title' => 'Opulent Penthouse with Mosaic Grand Salon',
                'destination' => 'Tallinn',
                'address' => 'Viru väljak 4, 10111 Tallinn, Estonia',
                'latitude' => 59.4365,
                'longitude' => 24.7536,
                'price_per_night_cents' => 52_000,
                'weekend_price_per_night_cents' => 62_000,
                'max_guests' => 6,
                'status' => 'pending_review',
                'property_type' => 'villa',
                'bedrooms' => 3,
                'beds' => 4,
                'bathrooms' => 3,
                'amenities' => ['WiFi', 'Kitchen', 'Air conditioning', 'TV', 'Gym access', 'Concierge', 'Dishwasher'],
                'booking_type' => 'request',
                'min_nights' => 2,
                'description' => "An extraordinary penthouse where art and architecture collide. The centrepiece is a hand-laid marble mosaic rotunda spanning the entire grand salon — a bespoke work commissioned from a Florentine studio.\n\nDeep blue velvet sofas, ebony lacquered furniture, and floor-to-ceiling windows overlooking the medieval city create an atmosphere unlike anything else in the Baltics.",
                'house_rules' => "No smoking.\nNo events without prior approval.\nCheck-in from 15:00.",
                'photos' => [
                    ['url' => 'https://images.unsplash.com/photo-1600210491892-03d54079b6ac?w=1200&auto=format&fit=crop', 'caption' => 'Grand salon with mosaic rotunda'],
                    ['url' => 'https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=1200&auto=format&fit=crop', 'caption' => 'Master suite'],
                    ['url' => 'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=1200&auto=format&fit=crop', 'caption' => 'Panoramic terrace'],
                    ['url' => 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=1200&auto=format&fit=crop', 'caption' => 'Spa bathroom'],
                ],
            ],
            // Image 2: curved glass balcony tower at night — modern high-rise apartment
            [
                'host_id' => $margus->id,
                'title' => 'Curved Glass Tower — Harbour View Apartment',
                'destination' => 'Riga',
                'address' => 'Eksporta iela 12, LV-1010 Rīga, Latvia',
                'latitude' => 56.9565,
                'longitude' => 24.1059,
                'price_per_night_cents' => 22_000,
                'weekend_price_per_night_cents' => 27_000,
                'max_guests' => 4,
                'status' => 'pending_review',
                'property_type' => 'apartment',
                'bedrooms' => 2,
                'beds' => 2,
                'bathrooms' => 2,
                'amenities' => ['WiFi', 'Air conditioning', 'TV', 'Dishwasher', 'Gym access', 'Balcony', 'Free parking'],
                'booking_type' => 'instant',
                'min_nights' => 1,
                'description' => "Stay in one of Riga's most architecturally striking towers, where every floor wraps in a continuous wave of glass balconies. By night the building glows amber and blue against the harbour sky — it is as spectacular from the outside as it is from within.\n\nTwo generous bedrooms, two bathrooms, and a wide curved balcony with unobstructed water views.",
                'house_rules' => "No smoking on the balcony.\nNo parties.\nQuiet hours 23:00–08:00.",
                'photos' => [
                    ['url' => 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&auto=format&fit=crop', 'caption' => 'Tower exterior at dusk'],
                    ['url' => 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&auto=format&fit=crop', 'caption' => 'Living room with harbour view'],
                    ['url' => 'https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?w=1200&auto=format&fit=crop', 'caption' => 'Curved glass balcony'],
                    ['url' => 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=1200&auto=format&fit=crop', 'caption' => 'Bedroom with city view'],
                ],
            ],
            // Image 3: dark industrial shelving, leather sofa, Captain America shield — unique loft
            [
                'host_id' => $margus->id,
                'title' => 'Industrial Collector\'s Loft',
                'destination' => 'Vilnius',
                'address' => 'Šaltinių g. 29, 03227 Vilnius, Lithuania',
                'latitude' => 54.6906,
                'longitude' => 25.2630,
                'price_per_night_cents' => 14_500,
                'max_guests' => 2,
                'status' => 'pending_review',
                'property_type' => 'loft',
                'bedrooms' => 1,
                'beds' => 1,
                'bathrooms' => 1,
                'amenities' => ['WiFi', 'Workspace', 'Kitchen', 'TV', 'Washing machine'],
                'booking_type' => 'instant',
                'min_nights' => 1,
                'description' => "A truly one-of-a-kind space: a converted industrial workshop turned into a designer's personal showcase. Raw steel shelving runs floor-to-ceiling across the entire back wall, lined with curated collectibles, art prints, and plants.\n\nA poured-concrete desk, Chesterfield leather sofa, and corrugated-glass partitions make this the ultimate stay for creatives and collectors alike.",
                'house_rules' => "Please do not rearrange the displays.\nNo smoking.\nNo pets.",
                'photos' => [
                    ['url' => 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=1200&auto=format&fit=crop', 'caption' => 'Industrial shelving wall & workspace'],
                    ['url' => 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&auto=format&fit=crop', 'caption' => 'Leather sofa lounge area'],
                    ['url' => 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=1200&auto=format&fit=crop', 'caption' => 'Concrete desk & reading nook'],
                ],
            ],
            // Image 4: warm gold luxury open-plan living room, floor-to-ceiling windows
            [
                'host_id' => $martin->id,
                'title' => 'Gold & Velvet Luxury Villa',
                'destination' => 'Tallinn',
                'address' => 'Kadrioru park, Weizenbergi 34a, 10127 Tallinn, Estonia',
                'latitude' => 59.4383,
                'longitude' => 24.7928,
                'price_per_night_cents' => 68_000,
                'weekend_price_per_night_cents' => 80_000,
                'max_guests' => 8,
                'status' => 'pending_review',
                'property_type' => 'villa',
                'bedrooms' => 4,
                'beds' => 5,
                'bathrooms' => 4,
                'amenities' => ['WiFi', 'Kitchen', 'Air conditioning', 'Pool', 'Gym', 'TV', 'Dishwasher', 'Washer', 'Dryer', 'Free parking', 'Balcony'],
                'booking_type' => 'request',
                'min_nights' => 3,
                'description' => "A statement of contemporary luxury at the edge of Kadriorg Park. The open-plan ground floor is finished in hand-brushed brass panelling, Italian marble, and bespoke velvet furniture — all bathed in natural light from floor-to-ceiling glazing that frames the park and sea beyond.\n\nA sculptural chandelier anchors the dining space; a chef's kitchen runs the full length of the rear. Four bedrooms, each an en-suite retreat.",
                'house_rules' => "No events without written approval.\nNo smoking.\nCheck-in from 16:00, check-out by 12:00.",
                'photos' => [
                    ['url' => 'https://images.unsplash.com/photo-1615873968403-89e068629265?w=1200&auto=format&fit=crop', 'caption' => 'Grand open-plan living room'],
                    ['url' => 'https://images.unsplash.com/photo-1600607687644-c7171b42498b?w=1200&auto=format&fit=crop', 'caption' => 'Floor-to-ceiling windows & garden'],
                    ['url' => 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=1200&auto=format&fit=crop', 'caption' => 'Master bedroom suite'],
                    ['url' => 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=1200&auto=format&fit=crop', 'caption' => 'Spa bathroom'],
                    ['url' => 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200&auto=format&fit=crop', 'caption' => 'Chef\'s kitchen'],
                ],
            ],
            // Image 5: stone cottage, lush overgrown garden, bench on lawn
            [
                'host_id' => $peeter->id,
                'title' => 'Secluded Stone Cottage with Wild Garden',
                'destination' => 'Tartu',
                'address' => 'Tamme puiestee 6, 50407 Tartu, Estonia',
                'latitude' => 58.3627,
                'longitude' => 26.7068,
                'price_per_night_cents' => 12_000,
                'max_guests' => 4,
                'status' => 'pending_review',
                'property_type' => 'cottage',
                'bedrooms' => 2,
                'beds' => 3,
                'bathrooms' => 1,
                'amenities' => ['WiFi', 'Kitchen', 'Garden', 'BBQ grill', 'Free parking', 'Fireplace', 'Pet-friendly'],
                'booking_type' => 'instant',
                'min_nights' => 2,
                'description' => "A century-old fieldstone cottage wrapped in climbing roses and a rambling cottage garden that feels like stepping into a secret world. Two cosy bedrooms, a wood-burning fireplace, and a screened porch for long summer evenings.\n\nThe wild garden has a sun-dappled lawn, stone-walled raised beds, and a weathered oak bench — perfect for morning coffee or an afternoon with a book.",
                'house_rules' => "Pets welcome.\nNo smoking indoors.\nPlease respect the garden — do not pick the plants.",
                'photos' => [
                    ['url' => 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&auto=format&fit=crop', 'caption' => 'Stone cottage with garden'],
                    ['url' => 'https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=1200&auto=format&fit=crop', 'caption' => 'Cosy living room with fireplace'],
                    ['url' => 'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=1200&auto=format&fit=crop', 'caption' => 'Country kitchen'],
                    ['url' => 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=1200&auto=format&fit=crop', 'caption' => 'Wild garden & bench'],
                ],
            ],
            // Image 7: Soviet-era apartment blocks, open grounds — honest urban apartment
            [
                'host_id' => $martin->id,
                'title' => 'Quiet City Apartment — Great Value, Central Location',
                'destination' => 'Riga',
                'address' => 'Brīvības iela 150, LV-1012 Rīga, Latvia',
                'latitude' => 56.9601,
                'longitude' => 24.1478,
                'price_per_night_cents' => 6_500,
                'max_guests' => 3,
                'status' => 'pending_review',
                'property_type' => 'apartment',
                'bedrooms' => 2,
                'beds' => 2,
                'bathrooms' => 1,
                'amenities' => ['WiFi', 'Kitchen', 'TV', 'Washing machine', 'Free parking', 'Heating'],
                'booking_type' => 'instant',
                'min_nights' => 1,
                'description' => "An honest, clean, well-equipped apartment in a quiet residential neighbourhood with excellent public transport links — tram to the Old Town in 12 minutes. Ideal for travellers who want a comfortable base without the tourist-area premium.\n\nTwo bedrooms, a full kitchen, and a bright living room. Everything you need, nothing you don't.",
                'house_rules' => "No smoking.\nNo parties.\nRegister guests at check-in.",
                'photos' => [
                    ['url' => 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1200&auto=format&fit=crop', 'caption' => 'Living room'],
                    ['url' => 'https://images.unsplash.com/photo-1556020685-ae41abfc9365?w=1200&auto=format&fit=crop', 'caption' => 'Bedroom'],
                    ['url' => 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200&auto=format&fit=crop', 'caption' => 'Kitchen'],
                ],
            ],
        ];

        foreach ($listings as $attrs) {
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
    }
}
