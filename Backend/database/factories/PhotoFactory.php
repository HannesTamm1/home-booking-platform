<?php

namespace Database\Factories;

use App\Models\Photo;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Photo>
 */
class PhotoFactory extends Factory
{
    protected $model = Photo::class;

    public function definition(): array
    {
        $seed = fake()->unique()->word();

        return [
            'listing_id' => ListingFactory::new(),
            'url' => "https://picsum.photos/seed/{$seed}/800/600",
            'caption' => fake()->optional(0.5)->sentence(),
            'sort_order' => 0,
        ];
    }
}
