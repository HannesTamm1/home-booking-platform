<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_registers_a_user(): void
    {
        $response = $this->postJson('/api/auth/register', [
            'name' => 'Guest User',
            'email' => 'guest@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response
            ->assertCreated()
            ->assertJsonPath('message', 'Account created successfully.')
            ->assertJsonPath('user.name', 'Guest User')
            ->assertJsonPath('user.email', 'guest@example.com')
            ->assertJsonPath('user.role', 'guest');

        $this->assertDatabaseHas('users', [
            'email' => 'guest@example.com',
            'role' => 'guest',
        ]);
    }

    public function test_it_validates_registration_payload(): void
    {
        $response = $this->postJson('/api/auth/register', [
            'name' => '',
            'email' => 'not-an-email',
            'password' => 'short',
            'password_confirmation' => 'mismatch',
        ]);

        $response
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['name', 'email', 'password']);
    }

    public function test_it_logs_in_with_valid_credentials(): void
    {
        $user = User::query()->create([
            'name' => 'Existing User',
            'email' => 'existing@example.com',
            'password' => 'password123',
            'role' => 'guest',
        ]);

        $response = $this->postJson('/api/auth/login', [
            'email' => 'existing@example.com',
            'password' => 'password123',
        ]);

        $response
            ->assertOk()
            ->assertJsonPath('message', 'Logged in successfully.')
            ->assertJsonPath('user.id', $user->id)
            ->assertJsonPath('user.email', 'existing@example.com');
    }

    public function test_it_rejects_invalid_credentials(): void
    {
        User::query()->create([
            'name' => 'Existing User',
            'email' => 'existing@example.com',
            'password' => 'password123',
            'role' => 'guest',
        ]);

        $response = $this->postJson('/api/auth/login', [
            'email' => 'existing@example.com',
            'password' => 'wrong-password',
        ]);

        $response
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['email']);
    }
}
