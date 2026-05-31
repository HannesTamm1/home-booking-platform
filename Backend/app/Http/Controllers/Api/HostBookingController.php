<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Listing;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class HostBookingController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $hostId = $request->user()->id;

        $listingIds = Listing::query()
            ->where('host_id', $hostId)
            ->pluck('id');

        $bookings = Booking::query()
            ->whereIn('listing_id', $listingIds)
            ->with('listing:id,title,destination')
            ->orderByDesc('start_date')
            ->get()
            ->map(fn ($b) => [
                'id' => $b->id,
                'listingId' => $b->listing_id,
                'listingTitle' => $b->listing?->title,
                'listingDestination' => $b->listing?->destination,
                'startDate' => $b->start_date->toDateString(),
                'endDate' => $b->end_date->toDateString(),
                'nights' => Carbon::parse($b->start_date)->diffInDays(Carbon::parse($b->end_date)),
                'totalPrice' => round($b->total_price_cents / 100, 2),
                'currency' => $b->currency,
                'status' => $b->status,
                'createdAt' => $b->created_at?->toISOString(),
            ]);

        return response()->json(['data' => $bookings]);
    }
}
