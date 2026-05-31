<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Dispute;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminDisputeController extends Controller
{
    public function index(): JsonResponse
    {
        $disputes = Dispute::query()
            ->with([
                'booking.listing:id,title,destination',
                'booking.user:id,name,email',
                'openedBy:id,name,email',
                'resolvedBy:id,name',
            ])
            ->orderByRaw("CASE status WHEN 'open' THEN 0 ELSE 1 END")
            ->orderByDesc('created_at')
            ->get();

        return response()->json(['data' => $disputes->map(fn ($d) => $this->format($d))]);
    }

    public function show(Dispute $dispute): JsonResponse
    {
        $dispute->load([
            'booking.listing:id,title,destination,price_per_night_cents',
            'booking.user:id,name,email',
            'openedBy:id,name,email',
            'resolvedBy:id,name',
        ]);

        return response()->json(['data' => $this->format($dispute)]);
    }

    public function resolve(Request $request, Dispute $dispute): JsonResponse
    {
        $request->validate([
            'resolution' => ['required', 'in:refund_guest,side_with_host,partial'],
            'refund_amount_cents' => ['nullable', 'integer', 'min:0'],
            'admin_note' => ['nullable', 'string', 'max:1000'],
        ]);

        if ($dispute->status === 'resolved') {
            return response()->json(['message' => 'Dispute is already resolved.'], 422);
        }

        $resolution = $request->string('resolution')->value();
        $refundCents = null;

        if ($resolution === 'refund_guest') {
            $refundCents = $dispute->booking->total_price_cents;
        } elseif ($resolution === 'partial') {
            $refundCents = $request->integer('refund_amount_cents');
        }

        $dispute->update([
            'status' => 'resolved',
            'resolution' => $resolution,
            'refund_amount_cents' => $refundCents,
            'admin_note' => $request->string('admin_note')->trim()->value() ?: null,
            'resolved_by_id' => $request->user()->id,
            'resolved_at' => now(),
        ]);

        // Update booking status to reflect refund decision
        if ($resolution === 'refund_guest' || $resolution === 'partial') {
            $dispute->booking->update(['status' => 'refunded']);
        }

        return response()->json([
            'message' => 'Dispute resolved.',
            'data' => $this->format($dispute->fresh(['openedBy', 'resolvedBy', 'booking.listing', 'booking.user'])),
        ]);
    }

    /** Open a dispute from the admin panel (e.g. escalation). */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'booking_id' => ['required', 'exists:bookings,id'],
            'description' => ['required', 'string', 'max:2000'],
        ]);

        $dispute = Dispute::create([
            'booking_id' => $request->integer('booking_id'),
            'opened_by_id' => $request->user()->id,
            'description' => $request->string('description')->trim()->value(),
            'status' => 'open',
        ]);

        return response()->json(['data' => $this->format($dispute->load(['openedBy', 'booking.listing', 'booking.user']))], 201);
    }

    private function format(Dispute $d): array
    {
        return [
            'id' => $d->id,
            'status' => $d->status,
            'resolution' => $d->resolution,
            'refundAmount' => $d->refund_amount_cents ? round($d->refund_amount_cents / 100, 2) : null,
            'description' => $d->description,
            'adminNote' => $d->admin_note,
            'resolvedAt' => $d->resolved_at?->toISOString(),
            'createdAt' => $d->created_at?->toISOString(),
            'booking' => $d->booking ? [
                'id' => $d->booking->id,
                'listingTitle' => $d->booking->listing?->title,
                'listingDestination' => $d->booking->listing?->destination,
                'startDate' => $d->booking->start_date->toDateString(),
                'endDate' => $d->booking->end_date->toDateString(),
                'totalPrice' => round($d->booking->total_price_cents / 100, 2),
                'currency' => $d->booking->currency,
                'status' => $d->booking->status,
                'guestName' => $d->booking->user?->name,
                'guestEmail' => $d->booking->user?->email,
            ] : null,
            'openedBy' => $d->openedBy ? ['id' => $d->openedBy->id, 'name' => $d->openedBy->name, 'email' => $d->openedBy->email] : null,
            'resolvedBy' => $d->resolvedBy ? ['id' => $d->resolvedBy->id, 'name' => $d->resolvedBy->name] : null,
        ];
    }
}
