<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class AdminBookingController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Booking::query()
            ->with([
                'listing:id,title,destination',
                'user:id,name,email',
            ])
            ->orderByDesc('created_at');

        if ($status = $request->string('status')->trim()->value()) {
            $query->where('status', $status);
        }

        if ($listingId = $request->integer('listing_id')) {
            $query->where('listing_id', $listingId);
        }

        if ($from = $request->string('from')->trim()->value()) {
            $query->where('start_date', '>=', $from);
        }

        if ($to = $request->string('to')->trim()->value()) {
            $query->where('end_date', '<=', $to);
        }

        if ($search = $request->string('search')->trim()->value()) {
            $query->whereHas('user', fn ($q) => $q->where('email', 'ilike', "%{$search}%")
                ->orWhere('name', 'ilike', "%{$search}%"));
        }

        $bookings = $query->paginate(30)->withQueryString();

        return response()->json([
            'data' => $bookings->map(fn ($b) => [
                'id' => $b->id,
                'listingId' => $b->listing_id,
                'listingTitle' => $b->listing?->title,
                'listingDestination' => $b->listing?->destination,
                'guestName' => $b->user?->name,
                'guestEmail' => $b->user?->email,
                'startDate' => $b->start_date->toDateString(),
                'endDate' => $b->end_date->toDateString(),
                'nights' => Carbon::parse($b->start_date)->diffInDays(Carbon::parse($b->end_date)),
                'totalPrice' => round($b->total_price_cents / 100, 2),
                'hostPayout' => $b->host_payout_cents ? round($b->host_payout_cents / 100, 2) : null,
                'currency' => $b->currency,
                'status' => $b->status,
                'createdAt' => $b->created_at?->toISOString(),
                'hasDispute' => $b->disputes()->exists(),
            ]),
            'meta' => [
                'currentPage' => $bookings->currentPage(),
                'lastPage' => $bookings->lastPage(),
                'total' => $bookings->total(),
            ],
        ]);
    }
}
