<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Dispute;
use App\Models\Listing;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Carbon;

class AdminOverviewController extends Controller
{
    public function __invoke(): JsonResponse
    {
        $now = Carbon::now();
        $monthStart = $now->copy()->startOfMonth();

        $activeUsers = User::query()->where('is_suspended', false)->count();
        $liveListings = Listing::query()->where('status', 'published')->count();
        $pendingListings = Listing::query()->where('status', 'pending_review')->count();
        $openDisputes = Dispute::query()->where('status', 'open')->count();

        $monthBookings = Booking::query()
            ->whereIn('status', ['confirmed'])
            ->where('created_at', '>=', $monthStart)
            ->get();

        $gmvCents = $monthBookings->sum('total_price_cents');
        $bookingCount = $monthBookings->count();

        $weeklyBookings = [];
        for ($i = 6; $i >= 0; $i--) {
            $day = $now->copy()->subDays($i);
            $weeklyBookings[] = [
                'date' => $day->format('D'),
                'count' => Booking::query()
                    ->where('status', 'confirmed')
                    ->whereDate('created_at', $day)
                    ->count(),
            ];
        }

        return response()->json([
            'data' => [
                'activeUsers' => $activeUsers,
                'liveListings' => $liveListings,
                'pendingListings' => $pendingListings,
                'openDisputes' => $openDisputes,
                'gmv' => round($gmvCents / 100, 2),
                'bookingCount' => $bookingCount,
                'weeklyBookings' => $weeklyBookings,
            ],
        ]);
    }
}
