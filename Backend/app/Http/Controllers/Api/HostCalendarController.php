<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\CalendarDay;
use App\Models\Listing;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Gate;

class HostCalendarController extends Controller
{
    public function show(Request $request, Listing $listing): JsonResponse
    {
        Gate::authorize('update', $listing);

        $request->validate([
            'year' => ['required', 'integer', 'min:2020', 'max:2030'],
            'month' => ['required', 'integer', 'min:1', 'max:12'],
        ]);

        $year = $request->integer('year');
        $month = $request->integer('month');

        $start = Carbon::create($year, $month, 1)->startOfMonth();
        $end = $start->copy()->endOfMonth();

        // Blocked days set by host
        $blockedDays = CalendarDay::query()
            ->where('listing_id', $listing->id)
            ->where('is_blocked', true)
            ->whereBetween('date', [$start, $end])
            ->pluck('date')
            ->map(fn ($d) => Carbon::parse($d)->format('Y-m-d'))
            ->all();

        // Custom pricing
        $customPrices = CalendarDay::query()
            ->where('listing_id', $listing->id)
            ->whereNotNull('custom_price_cents')
            ->whereBetween('date', [$start, $end])
            ->pluck('custom_price_cents', 'date')
            ->mapWithKeys(fn ($cents, $date) => [
                Carbon::parse($date)->format('Y-m-d') => round($cents / 100, 2),
            ])
            ->all();

        // Booked ranges (confirmed bookings)
        $bookedRanges = Booking::query()
            ->where('listing_id', $listing->id)
            ->whereIn('status', ['confirmed'])
            ->where('end_date', '>=', $start)
            ->where('start_date', '<=', $end)
            ->get(['id', 'start_date', 'end_date'])
            ->map(fn ($b) => [
                'bookingId' => $b->id,
                'startDate' => $b->start_date,
                'endDate' => $b->end_date,
            ])
            ->all();

        return response()->json([
            'data' => [
                'listingId' => $listing->id,
                'basePrice' => round($listing->price_per_night_cents / 100, 2),
                'weekendPrice' => $listing->weekend_price_per_night_cents
                    ? round($listing->weekend_price_per_night_cents / 100, 2)
                    : null,
                'minNights' => $listing->min_nights,
                'blockedDates' => $blockedDays,
                'customPrices' => $customPrices,
                'bookedRanges' => $bookedRanges,
            ],
        ]);
    }

    public function toggleBlock(Request $request, Listing $listing): JsonResponse
    {
        Gate::authorize('update', $listing);

        $request->validate([
            'date' => ['required', 'date', 'after_or_equal:today'],
        ]);

        $date = Carbon::parse($request->string('date')->value());

        // Can't block a date that's part of a confirmed booking
        $hasBooking = Booking::query()
            ->where('listing_id', $listing->id)
            ->where('status', 'confirmed')
            ->where('start_date', '<=', $date)
            ->where('end_date', '>', $date)
            ->exists();

        if ($hasBooking) {
            return response()->json(['message' => 'Cannot block a date with a confirmed booking.'], 422);
        }

        $calDay = CalendarDay::query()->firstOrCreate(
            ['listing_id' => $listing->id, 'date' => $date->format('Y-m-d')],
            ['is_blocked' => false],
        );

        $calDay->update(['is_blocked' => ! $calDay->is_blocked]);

        return response()->json([
            'data' => [
                'date' => $date->format('Y-m-d'),
                'isBlocked' => $calDay->is_blocked,
            ],
        ]);
    }

    public function setPrice(Request $request, Listing $listing): JsonResponse
    {
        Gate::authorize('update', $listing);

        $request->validate([
            'date' => ['required', 'date', 'after_or_equal:today'],
            'price' => ['nullable', 'numeric', 'min:0'],
        ]);

        $date = Carbon::parse($request->string('date')->value());
        $priceCents = $request->filled('price')
            ? (int) round($request->float('price') * 100)
            : null;

        CalendarDay::query()->updateOrCreate(
            ['listing_id' => $listing->id, 'date' => $date->format('Y-m-d')],
            ['custom_price_cents' => $priceCents],
        );

        return response()->json([
            'data' => [
                'date' => $date->format('Y-m-d'),
                'customPrice' => $priceCents ? round($priceCents / 100, 2) : null,
            ],
        ]);
    }
}
