<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\BookingResource;
use App\Models\Booking;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Gate;

class UserBookingController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $bookings = Booking::query()
            ->where('user_id', $request->user()->id)
            ->with('listing')
            ->orderByDesc('start_date')
            ->get();

        return BookingResource::collection($bookings)->response();
    }

    public function show(Request $request, Booking $booking): JsonResponse
    {
        Gate::authorize('view', $booking);

        $booking->loadMissing('listing');

        return (new BookingResource($booking))->response();
    }

    public function destroy(Booking $booking): Response
    {
        Gate::authorize('delete', $booking);

        $booking->update(['status' => 'cancelled']);

        return response()->noContent();
    }
}
