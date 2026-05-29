<?php

namespace App\Http\Controllers\Api;

use App\Actions\Bookings\CreateBooking;
use App\Exceptions\BookingConflictException;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\StoreBookingRequest;
use App\Http\Resources\BookingResource;
use App\Models\Booking;
use App\Models\Listing;
use Illuminate\Database\QueryException;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Gate;

class BookingController extends Controller
{
    public function store(
        StoreBookingRequest $request,
        Listing $listing,
        CreateBooking $action,
    ): JsonResponse {
        Gate::authorize('create', Booking::class);

        try {
            [$booking, $isNew] = $action->execute(
                $listing,
                $request->user(),
                $request->input('start_date'),
                $request->input('end_date'),
                $request->header('Idempotency-Key'),
            );
        } catch (BookingConflictException $e) {
            return response()->json(['message' => $e->getMessage()], 409);
        } catch (QueryException $e) {
            // PostgreSQL exclusion constraint violation (final concurrency guard).
            if ($e->getCode() === '23P01') {
                return response()->json(['message' => 'The requested dates are not available.'], 409);
            }
            throw $e;
        }

        return (new BookingResource($booking))
            ->response()
            ->setStatusCode($isNew ? 201 : 200);
    }
}
