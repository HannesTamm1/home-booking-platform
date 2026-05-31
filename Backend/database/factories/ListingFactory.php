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

    private static array $propertyTypes = [
        'apartment', 'house', 'villa', 'cabin', 'cottage', 'studio', 'loft',
    ];

    private static array $allAmenities = [
        'WiFi', 'Kitchen', 'Air conditioning', 'Washing machine',
        'Free parking', 'Pool', 'Hot tub', 'Gym', 'Workspace',
        'TV', 'Dishwasher', 'Balcony', 'Garden', 'BBQ grill',
    ];

    public function definition(): array
    {
        $destination = fake()->randomElement(self::$destinations);
        $prefix = fake()->randomElement(self::$titlePrefixes);
        $suffix = fake()->randomElement(self::$titleSuffixes);
        $bedrooms = fake()->numberBetween(1, 4);
        $amenities = fake()->randomElements(self::$allAmenities, fake()->numberBetween(3, 8));

        return [
            'host_id' => UserFactory::new()->host(),
            'status' => 'published',
            'title' => "{$prefix} {$suffix} in {$destination}",
            'destination' => $destination,
            'description' => fake()->paragraph(3),
            'house_rules' => fake()->optional(0.5)->sentence(),
            'property_type' => fake()->randomElement(self::$propertyTypes),
            'price_per_night_cents' => fake()->numberBetween(5_000, 50_000),
            'weekend_price_per_night_cents' => fake()->optional(0.4)->numberBetween(6_000, 60_000),
            'currency' => 'EUR',
            'max_guests' => fake()->numberBetween(1, 10),
            'bedrooms' => $bedrooms,
            'beds' => $bedrooms + fake()->numberBetween(0, 2),
            'bathrooms' => fake()->randomElement([1, 1, 1.5, 2, 2.5, 3]),
            'amenities' => $amenities,
            'booking_type' => fake()->randomElement(['instant', 'instant', 'instant', 'request']),
            'min_nights' => fake()->randomElement([1, 1, 1, 2, 3]),
            'latitude' => fake()->optional(0.6)->latitude(54.0, 70.0),
            'longitude' => fake()->optional(0.6)->longitude(10.0, 32.0),
            'rating_average' => fake()->boolean(70) ? fake()->randomFloat(2, 3.5, 5.0) : null,
            'rating_count' => fake()->boolean(70) ? fake()->numberBetween(1, 120) : 0,
        ];
    }
}
