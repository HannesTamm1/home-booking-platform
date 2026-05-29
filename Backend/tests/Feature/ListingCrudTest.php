<?php

namespace Tests\Feature;

use App\Models\Listing;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ListingCrudTest extends TestCase
{
    use RefreshDatabase;

    // ── Store ─────────────────────────────────────────────────────────────────

    public function test_authenticated_user_can_create_listing(): void
    {
        $host = $this->makeUser('host@example.com');

        $response = $this->actingAs($host)->postJson('/api/listings', [
            'title' => 'Seaside Loft',
            'destination' => 'Tallinn',
            'price_per_night_cents' => 15000,
            'max_guests' => 4,
        ]);

        $response
            ->assertCreated()
            ->assertJsonPath('data.title', 'Seaside Loft')
            ->assertJsonPath('data.destination', 'Tallinn')
            ->assertJsonPath('data.pricePerNight', 150)
            ->assertJsonPath('data.maxGuests', 4)
            ->assertJsonPath('data.currency', 'EUR');

        $this->assertDatabaseHas('listings', [
            'host_id' => $host->id,
            'title' => 'Seaside Loft',
            'price_per_night_cents' => 15000,
        ]);
    }

    public function test_unauthenticated_cannot_create_listing(): void
    {
        $this->postJson('/api/listings', [
            'title' => 'Test',
            'price_per_night_cents' => 5000,
            'max_guests' => 2,
        ])->assertUnauthorized();
    }

    public function test_store_validates_required_fields(): void
    {
        $host = $this->makeUser('host@example.com');

        $this->actingAs($host)->postJson('/api/listings', [])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['title', 'price_per_night_cents', 'max_guests']);
    }

    public function test_store_validates_field_constraints(): void
    {
        $host = $this->makeUser('host@example.com');

        $this->actingAs($host)->postJson('/api/listings', [
            'title' => str_repeat('a', 256),
            'price_per_night_cents' => -1,
            'max_guests' => 0,
            'latitude' => 200,
        ])->assertUnprocessable()
            ->assertJsonValidationErrors(['title', 'price_per_night_cents', 'max_guests', 'latitude']);
    }

    // ── Show ──────────────────────────────────────────────────────────────────

    public function test_anyone_can_read_a_listing(): void
    {
        $listing = $this->makeListing($this->makeUser('host@example.com'));

        $this->getJson('/api/listings/'.$listing->id)
            ->assertOk()
            ->assertJsonPath('data.id', $listing->id)
            ->assertJsonPath('data.title', $listing->title);
    }

    public function test_show_returns_404_for_missing_listing(): void
    {
        $this->getJson('/api/listings/9999')->assertNotFound();
    }

    // ── Update ────────────────────────────────────────────────────────────────

    public function test_owner_can_update_listing(): void
    {
        $host = $this->makeUser('host@example.com');
        $listing = $this->makeListing($host);

        $this->actingAs($host)->putJson('/api/listings/'.$listing->id, [
            'title' => 'Updated Title',
            'price_per_night_cents' => 20000,
            'max_guests' => 6,
        ])->assertOk()
            ->assertJsonPath('data.title', 'Updated Title')
            ->assertJsonPath('data.pricePerNight', 200)
            ->assertJsonPath('data.maxGuests', 6);

        $this->assertDatabaseHas('listings', [
            'id' => $listing->id,
            'title' => 'Updated Title',
        ]);
    }

    public function test_owner_can_patch_single_field(): void
    {
        $host = $this->makeUser('host@example.com');
        $listing = $this->makeListing($host, title: 'Original');

        $this->actingAs($host)->patchJson('/api/listings/'.$listing->id, [
            'title' => 'Patched',
        ])->assertOk()
            ->assertJsonPath('data.title', 'Patched');
    }

    public function test_non_owner_cannot_update_listing(): void
    {
        $owner = $this->makeUser('owner@example.com');
        $other = $this->makeUser('other@example.com');
        $listing = $this->makeListing($owner);

        $this->actingAs($other)->putJson('/api/listings/'.$listing->id, [
            'title' => 'Hijacked',
            'price_per_night_cents' => 100,
            'max_guests' => 1,
        ])->assertForbidden();
    }

    public function test_unauthenticated_cannot_update_listing(): void
    {
        $listing = $this->makeListing($this->makeUser('host@example.com'));

        $this->putJson('/api/listings/'.$listing->id, ['title' => 'Hijacked'])
            ->assertUnauthorized();
    }

    // ── Destroy ───────────────────────────────────────────────────────────────

    public function test_owner_can_delete_listing(): void
    {
        $host = $this->makeUser('host@example.com');
        $listing = $this->makeListing($host);

        $this->actingAs($host)->deleteJson('/api/listings/'.$listing->id)
            ->assertNoContent();

        $this->assertDatabaseMissing('listings', ['id' => $listing->id]);
    }

    public function test_non_owner_cannot_delete_listing(): void
    {
        $owner = $this->makeUser('owner@example.com');
        $other = $this->makeUser('other@example.com');
        $listing = $this->makeListing($owner);

        $this->actingAs($other)->deleteJson('/api/listings/'.$listing->id)
            ->assertForbidden();

        $this->assertDatabaseHas('listings', ['id' => $listing->id]);
    }

    public function test_unauthenticated_cannot_delete_listing(): void
    {
        $listing = $this->makeListing($this->makeUser('host@example.com'));

        $this->deleteJson('/api/listings/'.$listing->id)->assertUnauthorized();
    }

    // ── Index pagination ──────────────────────────────────────────────────────

    public function test_index_paginates_listings(): void
    {
        $host = $this->makeUser('host@example.com');

        for ($i = 1; $i <= 5; $i++) {
            $this->makeListing($host, title: "Listing {$i}");
        }

        $this->getJson('/api/listings?per_page=3')
            ->assertOk()
            ->assertJsonCount(3, 'data')
            ->assertJsonPath('meta.totalListings', 5)
            ->assertJsonPath('meta.pagination.perPage', 3)
            ->assertJsonPath('meta.pagination.lastPage', 2)
            ->assertJsonPath('meta.pagination.hasMorePages', true);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private function makeUser(string $email): User
    {
        return User::query()->create([
            'name' => 'Test User',
            'email' => $email,
            'password' => 'password123',
            'role' => 'host',
        ]);
    }

    private function makeListing(User $host, string $title = 'Test Listing'): Listing
    {
        return Listing::query()->create([
            'host_id' => $host->id,
            'title' => $title,
            'destination' => 'Tallinn',
            'price_per_night_cents' => 15000,
            'max_guests' => 4,
        ]);
    }
}
