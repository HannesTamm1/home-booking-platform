<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<User>
 */
class UserFactory extends Factory
{
    protected $model = User::class;

    public function definition(): array
    {
        return [
            'name' => fake()->name(),
            'email' => fake()->unique()->safeEmail(),
            'password' => 'password123',
            'role' => fake()->randomElement(['guest', 'host']),
        ];
    }

    public function host(): static
    {
        return $this->state(['role' => 'host']);
    }

    public function guest(): static
    {
        return $this->state(['role' => 'guest']);
    }
}
