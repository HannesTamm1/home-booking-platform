<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Listing;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class HostDashboardController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        $hostId = $request->user()->id;
        $now = Carbon::today();
        $monthStart = Carbon::now()->startOfMonth();

        $listingIds = Listing::query()
            ->where('host_id', $hostId)
            ->pluck('id');

        $monthConfirmed = Booking::query()
            ->whereIn('listing_id', $listingIds)
            ->where('status', 'confirmed')
            ->where('created_at', '>=', $monthStart)
            ->get();

        $monthRevenueCents = $monthConfirmed->sum('total_price_cents');

        // Occupancy: confirmed booked nights / (published listing count × days in month)
        $publishedCount = Listing::query()
            ->where('host_id', $hostId)
            ->where('status', 'published')
            ->count();

        $daysInMonth = Carbon::now()->daysInMonth;
        $bookedNights = $monthConfirmed->sum(fn ($b) => Carbon::parse($b->start_date)
            ->diffInDays(Carbon::parse($b->end_date)));
        $totalPossibleNights = max(1, $publishedCount * $daysInMonth);
        $occupancy = round(($bookedNights / $totalPossibleNights) * 100, 1);

        // Upcoming stays (confirmed, start date >= today)
        $upcomingBookings = Booking::query()
            ->whereIn('listing_id', $listingIds)
            ->where('status', 'confirmed')
            ->where('start_date', '>=', $now)
            ->orderBy('start_date')
            ->with('listing:id,title')
            ->limit(5)
            ->get()
            ->map(fn ($b) => [
                'id' => $b->id,
                'listingTitle' => $b->listing?->title,
                'startDate' => $b->start_date->toDateString(),
                'endDate' => $b->end_date->toDateString(),
                'nights' => Carbon::parse($b->start_date)->diffInDays(Carbon::parse($b->end_date)),
                'totalPrice' => round($b->total_price_cents / 100, 2),
                'currency' => $b->currency,
                'status' => $b->status,
            ]);

        // Average rating across published listings
        $avgRating = Listing::query()
            ->where('host_id', $hostId)
            ->whereNotNull('rating_average')
            ->avg('rating_average');

        return response()->json([
            'data' => [
                'monthRevenue' => round($monthRevenueCents / 100, 2),
                'occupancyPercent' => $occupancy,
                'upcomingBookingsCount' => $upcomingBookings->count(),
                'averageRating' => $avgRating ? round((float) $avgRating, 2) : null,
                'upcomingBookings' => $upcomingBookings,
                'publishedListings' => $publishedCount,
                'totalListings' => $listingIds->count(),
            ],
        ]);
    }
}
