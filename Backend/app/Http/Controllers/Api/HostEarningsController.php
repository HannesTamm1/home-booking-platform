<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Listing;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class HostEarningsController extends Controller
{
    private const PLATFORM_FEE_PERCENT = 15;

    public function __invoke(Request $request): JsonResponse
    {
        $hostId = $request->user()->id;
        $user = $request->user();

        $listingIds = Listing::query()
            ->where('host_id', $hostId)
            ->pluck('id', 'id');

        // All-time totals
        $allConfirmed = Booking::query()
            ->whereIn('listing_id', $listingIds)
            ->where('status', 'confirmed')
            ->get(['listing_id', 'total_price_cents', 'host_payout_cents', 'start_date', 'end_date', 'created_at']);

        $totalRevenue = $allConfirmed->sum('total_price_cents');
        $totalPayout = $allConfirmed->sum('host_payout_cents');
        $platformFees = $totalRevenue - $totalPayout;

        // Released (check-in has passed) vs pending
        $today = Carbon::today();
        $released = $allConfirmed->filter(fn ($b) => Carbon::parse($b->start_date)->lte($today));
        $pending = $allConfirmed->filter(fn ($b) => Carbon::parse($b->start_date)->gt($today));

        // Monthly breakdown — last 12 months
        $monthly = [];
        for ($i = 11; $i >= 0; $i--) {
            $month = Carbon::now()->subMonths($i);
            $label = $month->format('M Y');
            $start = $month->copy()->startOfMonth();
            $end = $month->copy()->endOfMonth();

            $monthBookings = $allConfirmed->filter(
                fn ($b) => Carbon::parse($b->created_at)->between($start, $end),
            );

            $monthly[] = [
                'label' => $label,
                'grossRevenue' => round($monthBookings->sum('total_price_cents') / 100, 2),
                'hostPayout' => round($monthBookings->sum('host_payout_cents') / 100, 2),
                'bookings' => $monthBookings->count(),
            ];
        }

        // Per-listing breakdown
        $perListing = Listing::query()
            ->where('host_id', $hostId)
            ->with(['photos' => fn ($q) => $q->orderBy('sort_order')->limit(1)])
            ->get()
            ->map(function (Listing $listing) use ($allConfirmed) {
                $lb = $allConfirmed->where('listing_id', $listing->id);
                return [
                    'id' => $listing->id,
                    'title' => $listing->title,
                    'destination' => $listing->destination,
                    'status' => $listing->status,
                    'coverPhotoUrl' => $listing->photos->first()?->url,
                    'totalBookings' => $lb->count(),
                    'grossRevenue' => round($lb->sum('total_price_cents') / 100, 2),
                    'hostPayout' => round($lb->sum('host_payout_cents') / 100, 2),
                ];
            });

        return response()->json([
            'data' => [
                'connectComplete' => $user->connect_onboarding_complete,
                'connectId' => $user->stripe_connect_id,
                'platformFeePercent' => self::PLATFORM_FEE_PERCENT,
                'allTime' => [
                    'grossRevenue' => round($totalRevenue / 100, 2),
                    'hostPayout' => round($totalPayout / 100, 2),
                    'platformFees' => round($platformFees / 100, 2),
                    'bookings' => $allConfirmed->count(),
                ],
                'released' => [
                    'amount' => round($released->sum('host_payout_cents') / 100, 2),
                    'bookings' => $released->count(),
                ],
                'pending' => [
                    'amount' => round($pending->sum('host_payout_cents') / 100, 2),
                    'bookings' => $pending->count(),
                ],
                'monthly' => $monthly,
                'perListing' => $perListing->values(),
            ],
        ]);
    }
}
