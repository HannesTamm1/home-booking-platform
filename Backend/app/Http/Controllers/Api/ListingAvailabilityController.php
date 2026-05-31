<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\CalendarDay;
use App\Models\Listing;
use Illuminate\Http\JsonResponse;

class ListingAvailabilityController extends Controller
{
    public function __invoke(Listing $listing): JsonResponse
    {
        $today = now()->toDateString();

        // Confirmed booking ranges
        $booked = Booking::query()
            ->where('listing_id', $listing->id)
            ->where('status', 'confirmed')
            ->where('end_date', '>=', $today)
            ->orderBy('start_date')
            ->get(['start_date', 'end_date'])
            ->map(fn ($b) => [
                'startDate' => $b->start_date->toDateString(),
                'endDate' => $b->end_date->toDateString(),
                'reason' => 'booked',
            ]);

        // Host-blocked individual dates collapsed into ranges
        $blockedDates = CalendarDay::query()
            ->where('listing_id', $listing->id)
            ->where('is_blocked', true)
            ->where('date', '>=', $today)
            ->orderBy('date')
            ->pluck('date')
            ->map(fn ($d) => $d->toDateString())
            ->all();

        // Collapse consecutive blocked dates into ranges
        $blockedRanges = collect();
        foreach ($blockedDates as $date) {
            $last = $blockedRanges->last();
            if ($last && $last['endDate'] === $date) {
                $blockedRanges->pop();
                $blockedRanges->push(['startDate' => $last['startDate'], 'endDate' => date('Y-m-d', strtotime($date . ' +1 day')), 'reason' => 'blocked']);
            } else {
                $blockedRanges->push(['startDate' => $date, 'endDate' => date('Y-m-d', strtotime($date . ' +1 day')), 'reason' => 'blocked']);
            }
        }

        $all = $booked->concat($blockedRanges)->sortBy('startDate')->values();

        return response()->json(['data' => $all]);
    }
}
