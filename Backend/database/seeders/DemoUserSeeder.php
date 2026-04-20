<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class DemoUserSeeder extends Seeder
{
    public function run(): void
    {
        $users = [
            [
                'name' => 'Renter Demo',
                'email' => 'renter@example.com',
                'password' => 'password123',
                'role' => 'renter',
            ],
            [
                'name' => 'User Demo',
                'email' => 'user@example.com',
                'password' => 'password123',
                'role' => 'user',
            ],
        ];

        foreach ($users as $attributes) {
            User::query()->updateOrCreate(
                ['email' => $attributes['email']],
                $attributes,
            );
        }
    }
}
