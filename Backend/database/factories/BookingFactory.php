<?php

namespace Database\Factories;

use App\Models\Booking;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Booking>
 */
class BookingFactory extends Factory
{
    protected $model = Booking::class;

    public function definition(): array
    {
        $nights = fake()->numberBetween(1, 14);
        $startDate = fake()->dateTimeBetween('+1 week', '+6 months');
        $endDate = (clone $startDate)->modify("+{$nights} days");
        $pricePerNightCents = fake()->numberBetween(5_000, 50_000);

        return [
            'listing_id' => ListingFactory::new(),
            'user_id' => UserFactory::new()->guest(),
            'start_date' => $startDate->format('Y-m-d'),
            'end_date' => $endDate->format('Y-m-d'),
            'total_price_cents' => $nights * $pricePerNightCents,
            'currency' => 'EUR',
            'status' => fake()->randomElement(['pending', 'confirmed', 'cancelled']),
        ];
    }

    public function confirmed(): static
    {
        return $this->state(['status' => 'confirmed']);
    }

    public function pending(): static
    {
        return $this->state(['status' => 'pending']);
    }

    public function cancelled(): static
    {
        return $this->state(['status' => 'cancelled']);
    }
}
