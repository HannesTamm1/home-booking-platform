<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ListingResource;
use App\Models\Listing;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class HostListingController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $listings = Listing::query()
            ->where('host_id', $request->user()->id)
            ->with(['photos'])
            ->withCount([
                'bookings as confirmed_bookings_count' => fn ($q) => $q->where('status', 'confirmed'),
            ])
            ->withSum([
                'bookings as confirmed_revenue' => fn ($q) => $q->where('status', 'confirmed'),
            ], 'total_price_cents')
            ->latest()
            ->get();

        return response()->json([
            'data' => ListingResource::collection($listings)->resolve($request),
        ]);
    }

    public function submit(Request $request, Listing $listing): JsonResponse
    {
        Gate::authorize('submit', $listing);

        $listing->update(['status' => 'pending_review']);

        return response()->json([
            'data' => (new ListingResource($listing))->resolve($request),
        ]);
    }
}
