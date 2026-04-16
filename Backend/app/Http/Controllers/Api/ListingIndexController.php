<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Listing;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;

class ListingIndexController extends Controller
{
    public function __invoke(): JsonResponse
    {
        $listings = Listing::query()
            ->with(['host:id'])
            ->withCount([
                'bookings as confirmed_bookings_count' => fn (Builder $query) => $query->where('status', 'confirmed'),
            ])
            ->withSum([
                'bookings as confirmed_revenue' => fn (Builder $query) => $query->where('status', 'confirmed'),
            ], 'total_price')
            ->latest()
            ->get()
            ->map(fn (Listing $listing) => [
                'id' => $listing->id,
                'title' => $listing->title,
                'pricePerNight' => (float) $listing->price_per_night,
                'maxGuests' => $listing->max_guests,
                'host' => [
                    'publicLabel' => $listing->host ? 'Managed by host' : 'Host unavailable',
                ],
                'metrics' => [
                    'confirmedBookings' => (int) ($listing->confirmed_bookings_count ?? 0),
                    'confirmedRevenue' => (float) ($listing->confirmed_revenue ?? 0),
                ],
                'createdAt' => $listing->created_at?->toISOString(),
            ])
            ->values();

        return response()->json([
            'data' => $listings,
            'meta' => [
                'totalListings' => $listings->count(),
                'averagePricePerNight' => $listings->count() > 0 ? round((float) $listings->avg('pricePerNight'), 2) : 0,
                'generatedAt' => now()->toISOString(),
            ],
        ]);
    }
}
