<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ListingResource;
use App\Models\Listing;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminListingController extends Controller
{
    public function index(): JsonResponse
    {
        $listings = Listing::query()
            ->whereIn('status', ['pending_review'])
            ->with(['host:id,name,email', 'photos'])
            ->withCount([
                'bookings as confirmed_bookings_count' => fn ($q) => $q->where('status', 'confirmed'),
            ])
            ->withSum([
                'bookings as confirmed_revenue' => fn ($q) => $q->where('status', 'confirmed'),
            ], 'total_price_cents')
            ->orderBy('updated_at')
            ->get();

        // Simple outlier flag: flag if price > 3× average for that destination
        $destAverages = Listing::query()
            ->where('status', 'published')
            ->selectRaw('destination, AVG(price_per_night_cents) as avg_price')
            ->groupBy('destination')
            ->pluck('avg_price', 'destination');

        $mapped = $listings->map(function (Listing $l) use ($destAverages) {
            $resource = (new ListingResource($l))->resolve(request());
            $avg = $destAverages[$l->destination] ?? null;
            $isPriceOutlier = $avg && ($l->price_per_night_cents > $avg * 3);

            return array_merge($resource, [
                'adminNote' => $l->admin_note,
                'flags' => array_filter([
                    $isPriceOutlier ? 'price_outlier' : null,
                ]),
            ]);
        });

        return response()->json(['data' => $mapped]);
    }

    public function approve(Request $request, Listing $listing): JsonResponse
    {
        $request->validate([
            'admin_note' => ['nullable', 'string', 'max:500'],
        ]);

        $listing->update([
            'status' => 'published',
            'admin_note' => $request->string('admin_note')->trim()->value() ?: null,
        ]);

        return response()->json(['message' => 'Listing approved and published.']);
    }

    public function reject(Request $request, Listing $listing): JsonResponse
    {
        $request->validate([
            'admin_note' => ['nullable', 'string', 'max:500'],
        ]);

        $listing->update([
            'status' => 'rejected',
            'admin_note' => $request->string('admin_note')->trim()->value() ?: null,
        ]);

        return response()->json(['message' => 'Listing rejected.']);
    }

    public function unpublish(Request $request, Listing $listing): JsonResponse
    {
        $request->validate([
            'admin_note' => ['nullable', 'string', 'max:500'],
        ]);

        $listing->update([
            'status' => 'suspended',
            'admin_note' => $request->string('admin_note')->trim()->value() ?: null,
        ]);

        return response()->json(['message' => 'Listing suspended.']);
    }

    /** All listings for admin search */
    public function all(Request $request): JsonResponse
    {
        $query = Listing::query()
            ->with(['host:id,name,email', 'photos'])
            ->withCount([
                'bookings as confirmed_bookings_count' => fn ($q) => $q->where('status', 'confirmed'),
            ])
            ->orderByDesc('updated_at');

        if ($status = $request->string('status')->trim()->value()) {
            $query->where('status', $status);
        }

        if ($search = $request->string('search')->trim()->value()) {
            $query->where('title', 'ilike', "%{$search}%");
        }

        $listings = $query->paginate(25)->withQueryString();

        return response()->json([
            'data' => $listings->map(fn ($l) => [
                'id' => $l->id,
                'status' => $l->status,
                'title' => $l->title,
                'destination' => $l->destination,
                'propertyType' => $l->property_type,
                'pricePerNight' => round($l->price_per_night_cents / 100, 2),
                'maxGuests' => $l->max_guests,
                'confirmedBookings' => $l->confirmed_bookings_count,
                'adminNote' => $l->admin_note,
                'hostName' => $l->host?->name,
                'hostEmail' => $l->host?->email,
                'updatedAt' => $l->updated_at?->toISOString(),
            ]),
            'meta' => [
                'currentPage' => $listings->currentPage(),
                'lastPage' => $listings->lastPage(),
                'total' => $listings->total(),
            ],
        ]);
    }
}
