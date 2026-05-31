<?php

namespace App\Actions\Bookings;

use App\Exceptions\BookingConflictException;
use App\Models\Booking;
use App\Models\IdempotencyKey;
use App\Models\Listing;
use App\Models\User;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class CreateBooking
{
    /**
     * @return array{0: Booking, 1: bool}  [booking, isNew]
     */
    public function execute(
        Listing $listing,
        User $user,
        string $startDate,
        string $endDate,
        ?string $idempotencyKey,
    ): array {
        // Fast-path: avoid a transaction if the key is already resolved.
        if ($idempotencyKey !== null) {
            $hit = IdempotencyKey::query()
                ->with('booking')
                ->where('key', $idempotencyKey)
                ->where('user_id', $user->id)
                ->first();

            if ($hit?->booking !== null) {
                return [$hit->booking, false];
            }
        }

        return DB::transaction(function () use ($listing, $user, $startDate, $endDate, $idempotencyKey) {
            // Re-check inside the transaction with a row lock so a second
            // in-flight request with the same key waits and then finds it.
            if ($idempotencyKey !== null) {
                $hit = IdempotencyKey::query()
                    ->with('booking')
                    ->where('key', $idempotencyKey)
                    ->where('user_id', $user->id)
                    ->lockForUpdate()
                    ->first();

                if ($hit?->booking !== null) {
                    return [$hit->booking, false];
                }
            }

            // Serialise concurrent availability checks on this listing.
            Listing::query()->where('id', $listing->id)->lockForUpdate()->firstOrFail();

            // Application-level overlap guard (half-open interval [start, end)).
            // The PostgreSQL exclusion constraint is the final guard for any gap
            // that lockForUpdate does not cover across separate DB sessions.
            // Use whereDate() so SQLite's string-stored dates compare correctly.
            $conflict = Booking::query()
                ->where('listing_id', $listing->id)
                ->where('status', 'confirmed')
                ->whereDate('start_date', '<', $endDate)
                ->whereDate('end_date', '>', $startDate)
                ->exists();

            if ($conflict) {
                throw new BookingConflictException();
            }

            $nights = Carbon::parse($startDate)->diffInDays(Carbon::parse($endDate));
            $totalPriceCents = $listing->price_per_night_cents * $nights;
            $hostPayoutCents = (int) floor($totalPriceCents * 0.85);

            $booking = Booking::query()->create([
                'listing_id' => $listing->id,
                'user_id' => $user->id,
                'start_date' => $startDate,
                'end_date' => $endDate,
                'total_price_cents' => $totalPriceCents,
                'host_payout_cents' => $hostPayoutCents,
                'currency' => $listing->currency,
                'status' => 'confirmed',
            ]);

            if ($idempotencyKey !== null) {
                IdempotencyKey::query()->create([
                    'key' => $idempotencyKey,
                    'user_id' => $user->id,
                    'booking_id' => $booking->id,
                ]);
            }

            return [$booking, true];
        });
    }
}
