<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Listing;
use Illuminate\Http\JsonResponse;

class ListingAvailabilityController extends Controller
{
    public function __invoke(Listing $listing): JsonResponse
    {
        $blocked = Booking::query()
            ->where('listing_id', $listing->id)
            ->where('status', 'confirmed')
            ->where('end_date', '>=', now()->toDateString())
            ->orderBy('start_date')
            ->get(['start_date', 'end_date'])
            ->map(fn ($b) => [
                'startDate' => $b->start_date->toDateString(),
                'endDate' => $b->end_date->toDateString(),
            ]);

        return response()->json(['data' => $blocked]);
    }
}
