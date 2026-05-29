<?php

namespace Database\Factories;

use App\Models\Listing;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Listing>
 */
class ListingFactory extends Factory
{
    protected $model = Listing::class;

    private static array $destinations = [
        'Tallinn', 'Riga', 'Vilnius', 'Helsinki',
        'Stockholm', 'Copenhagen', 'Oslo', 'Tartu', 'Parnu',
    ];

    private static array $titlePrefixes = [
        'Cozy', 'Sunny', 'Modern', 'Charming', 'Spacious', 'Bright', 'Quiet', 'Elegant',
    ];

    private static array $titleSuffixes = [
        'Loft', 'Apartment', 'Studio', 'Cabin', 'Cottage', 'Flat', 'Suite', 'Retreat',
    ];

    public function definition(): array
    {
        $destination = fake()->randomElement(self::$destinations);
        $prefix = fake()->randomElement(self::$titlePrefixes);
        $suffix = fake()->randomElement(self::$titleSuffixes);

        return [
            'host_id' => UserFactory::new()->host(),
            'title' => "{$destination} {$prefix} {$suffix}",
            'destination' => $destination,
            'description' => fake()->paragraph(3),
            'price_per_night_cents' => fake()->numberBetween(5_000, 50_000),
            'currency' => 'EUR',
            'max_guests' => fake()->numberBetween(1, 10),
            'latitude' => fake()->optional(0.6)->latitude(54.0, 70.0),
            'longitude' => fake()->optional(0.6)->longitude(10.0, 32.0),
        ];
    }
}
