<?php

namespace Tests\Feature;

use App\Models\Booking;
use App\Models\Listing;
use App\Models\Photo;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ModelRelationshipsTest extends TestCase
{
    use RefreshDatabase;

    public function test_host_has_many_listings(): void
    {
        $host = User::factory()->host()->create();
        Listing::factory(3)->create(['host_id' => $host->id]);

        $this->assertCount(3, $host->listings);
        $this->assertInstanceOf(Listing::class, $host->listings->first());
    }

    public function test_guest_has_many_bookings(): void
    {
        $guest = User::factory()->guest()->create();
        Booking::factory(2)->create(['user_id' => $guest->id]);

        $this->assertCount(2, $guest->bookings);
        $this->assertInstanceOf(Booking::class, $guest->bookings->first());
    }

    public function test_listing_belongs_to_host(): void
    {
        $host = User::factory()->host()->create();
        $listing = Listing::factory()->create(['host_id' => $host->id]);

        $this->assertTrue($listing->host->is($host));
        $this->assertEquals('host', $listing->host->role);
    }

    public function test_listing_has_many_bookings(): void
    {
        $listing = Listing::factory()->create();
        Booking::factory(4)->create(['listing_id' => $listing->id]);

        $this->assertCount(4, $listing->bookings);
    }

    public function test_listing_has_many_photos_ordered_by_sort_order(): void
    {
        $listing = Listing::factory()->create();
        Photo::factory()->create(['listing_id' => $listing->id, 'sort_order' => 2]);
        Photo::factory()->create(['listing_id' => $listing->id, 'sort_order' => 0]);
        Photo::factory()->create(['listing_id' => $listing->id, 'sort_order' => 1]);

        $photos = $listing->photos;

        $this->assertCount(3, $photos);
        $this->assertEquals([0, 1, 2], $photos->pluck('sort_order')->all());
    }

    public function test_booking_belongs_to_listing_and_user(): void
    {
        $host = User::factory()->host()->create();
        $guest = User::factory()->guest()->create();
        $listing = Listing::factory()->create(['host_id' => $host->id]);
        $booking = Booking::factory()->create(['listing_id' => $listing->id, 'user_id' => $guest->id]);

        $this->assertTrue($booking->listing->is($listing));
        $this->assertTrue($booking->user->is($guest));
    }

    public function test_photo_belongs_to_listing(): void
    {
        $listing = Listing::factory()->create();
        $photo = Photo::factory()->create(['listing_id' => $listing->id]);

        $this->assertTrue($photo->listing->is($listing));
    }

    public function test_listing_money_is_stored_in_cents(): void
    {
        $listing = Listing::factory()->create(['price_per_night_cents' => 22_500]);

        $fresh = $listing->fresh();
        $this->assertIsInt($fresh->price_per_night_cents);
        $this->assertSame(22_500, $fresh->price_per_night_cents);
    }

    public function test_booking_money_is_stored_in_cents(): void
    {
        $booking = Booking::factory()->create(['total_price_cents' => 135_000]);

        $fresh = $booking->fresh();
        $this->assertIsInt($fresh->total_price_cents);
        $this->assertSame(135_000, $fresh->total_price_cents);
    }

    public function test_currency_defaults_to_eur(): void
    {
        $listing = Listing::factory()->create();
        $booking = Booking::factory()->create();

        $this->assertSame('EUR', $listing->fresh()->currency);
        $this->assertSame('EUR', $booking->fresh()->currency);
    }

    public function test_deleting_listing_cascades_to_bookings_and_photos(): void
    {
        $listing = Listing::factory()->create();
        Booking::factory(2)->create(['listing_id' => $listing->id]);
        Photo::factory(3)->create(['listing_id' => $listing->id]);

        $listing->delete();

        $this->assertDatabaseCount('bookings', 0);
        $this->assertDatabaseCount('listing_photos', 0);
    }

    public function test_deleting_user_cascades_to_listings_and_bookings(): void
    {
        $host = User::factory()->host()->create();
        $listings = Listing::factory(2)->create(['host_id' => $host->id]);

        $host->delete();

        foreach ($listings as $listing) {
            $this->assertDatabaseMissing('listings', ['id' => $listing->id]);
        }

        $guest = User::factory()->guest()->create();
        $listing = Listing::factory()->create();
        $bookings = Booking::factory(2)->create(['user_id' => $guest->id, 'listing_id' => $listing->id]);

        $guest->delete();

        foreach ($bookings as $booking) {
            $this->assertDatabaseMissing('bookings', ['id' => $booking->id]);
        }
    }
}
