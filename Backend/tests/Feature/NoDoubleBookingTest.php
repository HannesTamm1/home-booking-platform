<?php

namespace Tests\Feature;

use App\Models\Booking;
use App\Models\Listing;
use App\Models\User;
use Illuminate\Database\QueryException;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;

class NoDoubleBookingTest extends TestCase
{
    use DatabaseTransactions;

    // Override BEFORE setUpTraits() fires so DatabaseTransactions opens
    // a pgsql connection instead of the sqlite one forced by phpunit.xml.
    protected function refreshApplication(): void
    {
        parent::refreshApplication();

        // Switch the default DB from sqlite (phpunit.xml override) to pgsql
        // BEFORE setUpTraits() runs — DatabaseTransactions uses config('database.default')
        // to choose which connection to wrap in a transaction.
        $this->app['config']->set('database.default', 'pgsql');

        // phpunit.xml injects DB_URL="" which would corrupt the pgsql DSN.
        $this->app['config']->set('database.connections.pgsql.url', null);

        // PGSQL_DATABASE in .env gives the real database name; phpunit.xml
        // overrides DB_DATABASE=:memory: which would otherwise poison the pgsql config.
        // The config/database.php pgsql block already reads PGSQL_DATABASE first,
        // so no further override is needed here.
    }

    protected function setUp(): void
    {
        try {
            parent::setUp();
        } catch (\Exception $e) {
            // Re-throw PHPUnit control-flow exceptions (skip, incomplete…).
            if ($e instanceof \PHPUnit\Framework\Exception) {
                throw $e;
            }

            $this->markTestSkipped('PostgreSQL not available: '.$e->getMessage());

            return;
        }
    }

    // -------------------------------------------------------------------------
    // Reject: overlapping confirmed bookings on the same listing
    // -------------------------------------------------------------------------

    public function test_overlapping_confirmed_booking_on_same_listing_is_rejected(): void
    {
        ['listing' => $listing, 'user' => $user] = $this->scaffold();

        Booking::factory()->confirmed()->create([
            'listing_id' => $listing->id,
            'user_id' => $user->id,
            'start_date' => '2026-07-01',
            'end_date' => '2026-07-07',
        ]);

        $this->expectException(QueryException::class);

        // July 4–10 overlaps July 1–7 → constraint fires
        Booking::factory()->confirmed()->create([
            'listing_id' => $listing->id,
            'user_id' => $user->id,
            'start_date' => '2026-07-04',
            'end_date' => '2026-07-10',
        ]);
    }

    public function test_fully_contained_confirmed_booking_is_rejected(): void
    {
        ['listing' => $listing, 'user' => $user] = $this->scaffold();

        Booking::factory()->confirmed()->create([
            'listing_id' => $listing->id,
            'user_id' => $user->id,
            'start_date' => '2026-08-01',
            'end_date' => '2026-08-14',
        ]);

        $this->expectException(QueryException::class);

        // Aug 5–10 is entirely inside Aug 1–14
        Booking::factory()->confirmed()->create([
            'listing_id' => $listing->id,
            'user_id' => $user->id,
            'start_date' => '2026-08-05',
            'end_date' => '2026-08-10',
        ]);
    }

    // -------------------------------------------------------------------------
    // Allow: non-overlapping confirmed bookings on the same listing
    // -------------------------------------------------------------------------

    public function test_non_overlapping_confirmed_bookings_are_allowed(): void
    {
        ['listing' => $listing, 'user' => $user] = $this->scaffold();

        Booking::factory()->confirmed()->create([
            'listing_id' => $listing->id,
            'user_id' => $user->id,
            'start_date' => '2026-07-01',
            'end_date' => '2026-07-07',
        ]);

        $second = Booking::factory()->confirmed()->create([
            'listing_id' => $listing->id,
            'user_id' => $user->id,
            'start_date' => '2026-07-20',
            'end_date' => '2026-07-25',
        ]);

        $this->assertTrue($second->exists);
    }

    public function test_adjacent_confirmed_bookings_are_allowed(): void
    {
        ['listing' => $listing, 'user' => $user] = $this->scaffold();

        // Half-open interval [start, end): July 7 is NOT inside July 1–7
        Booking::factory()->confirmed()->create([
            'listing_id' => $listing->id,
            'user_id' => $user->id,
            'start_date' => '2026-07-01',
            'end_date' => '2026-07-07',
        ]);

        $checkin = Booking::factory()->confirmed()->create([
            'listing_id' => $listing->id,
            'user_id' => $user->id,
            'start_date' => '2026-07-07',   // same-day check-in is valid
            'end_date' => '2026-07-10',
        ]);

        $this->assertTrue($checkin->exists);
    }

    // -------------------------------------------------------------------------
    // Allow: overlapping dates on different listings
    // -------------------------------------------------------------------------

    public function test_overlapping_confirmed_bookings_on_different_listings_are_allowed(): void
    {
        $user = User::factory()->guest()->create();
        $host = User::factory()->host()->create();

        $a = Listing::factory()->create(['host_id' => $host->id]);
        $b = Listing::factory()->create(['host_id' => $host->id]);

        Booking::factory()->confirmed()->create([
            'listing_id' => $a->id,
            'user_id' => $user->id,
            'start_date' => '2026-09-01',
            'end_date' => '2026-09-07',
        ]);

        $second = Booking::factory()->confirmed()->create([
            'listing_id' => $b->id,   // different listing
            'user_id' => $user->id,
            'start_date' => '2026-09-01',
            'end_date' => '2026-09-07',
        ]);

        $this->assertTrue($second->exists);
    }

    // -------------------------------------------------------------------------
    // Allow: non-confirmed statuses bypass the constraint entirely
    // -------------------------------------------------------------------------

    public function test_overlapping_pending_bookings_are_allowed(): void
    {
        ['listing' => $listing, 'user' => $user] = $this->scaffold();

        Booking::factory()->pending()->create([
            'listing_id' => $listing->id,
            'user_id' => $user->id,
            'start_date' => '2026-10-01',
            'end_date' => '2026-10-07',
        ]);

        $second = Booking::factory()->pending()->create([
            'listing_id' => $listing->id,
            'user_id' => $user->id,
            'start_date' => '2026-10-03',
            'end_date' => '2026-10-09',
        ]);

        $this->assertTrue($second->exists);
    }

    public function test_overlapping_cancelled_bookings_are_allowed(): void
    {
        ['listing' => $listing, 'user' => $user] = $this->scaffold();

        Booking::factory()->cancelled()->create([
            'listing_id' => $listing->id,
            'user_id' => $user->id,
            'start_date' => '2026-11-01',
            'end_date' => '2026-11-07',
        ]);

        $second = Booking::factory()->cancelled()->create([
            'listing_id' => $listing->id,
            'user_id' => $user->id,
            'start_date' => '2026-11-03',
            'end_date' => '2026-11-09',
        ]);

        $this->assertTrue($second->exists);
    }

    public function test_confirmed_booking_does_not_conflict_with_overlapping_pending(): void
    {
        ['listing' => $listing, 'user' => $user] = $this->scaffold();

        Booking::factory()->pending()->create([
            'listing_id' => $listing->id,
            'user_id' => $user->id,
            'start_date' => '2026-12-01',
            'end_date' => '2026-12-07',
        ]);

        // Only confirmed vs confirmed triggers the constraint
        $confirmed = Booking::factory()->confirmed()->create([
            'listing_id' => $listing->id,
            'user_id' => $user->id,
            'start_date' => '2026-12-03',
            'end_date' => '2026-12-09',
        ]);

        $this->assertTrue($confirmed->exists);
    }

    // -------------------------------------------------------------------------

    /** @return array{listing: Listing, user: User} */
    private function scaffold(): array
    {
        return [
            'listing' => Listing::factory()->create(),
            'user' => User::factory()->guest()->create(),
        ];
    }
}
