<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\StoreListingRequest;
use App\Http\Requests\Api\UpdateListingRequest;
use App\Http\Resources\ListingResource;
use App\Models\Listing;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Gate;

class ListingController extends Controller
{
    public function show(Listing $listing): JsonResponse
    {
        $listing->loadMissing('host', 'photos');

        return (new ListingResource($listing))->response();
    }

    public function store(StoreListingRequest $request): JsonResponse
    {
        Gate::authorize('create', Listing::class);

        $listing = Listing::query()->create([
            'host_id' => $request->user()->id,
            'status' => 'draft',
            'title' => $request->string('title')->trim()->value(),
            'destination' => $request->filled('destination') ? $request->string('destination')->trim()->value() : null,
            'address' => $request->filled('address') ? $request->string('address')->trim()->value() : null,
            'description' => $request->input('description'),
            'house_rules' => $request->input('house_rules'),
            'property_type' => $request->input('property_type'),
            'price_per_night_cents' => $request->integer('price_per_night_cents'),
            'weekend_price_per_night_cents' => $request->filled('weekend_price_per_night_cents')
                ? $request->integer('weekend_price_per_night_cents')
                : null,
            'currency' => $request->input('currency', 'EUR'),
            'max_guests' => $request->integer('max_guests'),
            'bedrooms' => $request->integer('bedrooms', 1),
            'beds' => $request->integer('beds', 1),
            'bathrooms' => $request->input('bathrooms', 1),
            'amenities' => $request->input('amenities', []),
            'booking_type' => $request->input('booking_type', 'instant'),
            'min_nights' => $request->integer('min_nights', 1),
            'latitude' => $request->input('latitude'),
            'longitude' => $request->input('longitude'),
        ]);

        $this->syncPhotos($listing, $request->input('photos', []));

        $listing->load('host', 'photos');

        return (new ListingResource($listing))
            ->response()
            ->setStatusCode(201);
    }

    public function update(UpdateListingRequest $request, Listing $listing): JsonResponse
    {
        Gate::authorize('update', $listing);

        $listing->update(array_filter([
            'title' => $request->filled('title') ? $request->string('title')->trim()->value() : null,
            'destination' => $request->has('destination') ? ($request->filled('destination') ? $request->string('destination')->trim()->value() : null) : $listing->destination,
            'address' => $request->has('address') ? ($request->filled('address') ? $request->string('address')->trim()->value() : null) : $listing->address,
            'description' => $request->has('description') ? $request->input('description') : $listing->description,
            'house_rules' => $request->has('house_rules') ? $request->input('house_rules') : $listing->house_rules,
            'property_type' => $request->has('property_type') ? $request->input('property_type') : $listing->property_type,
            'price_per_night_cents' => $request->has('price_per_night_cents') ? $request->integer('price_per_night_cents') : $listing->price_per_night_cents,
            'weekend_price_per_night_cents' => $request->has('weekend_price_per_night_cents')
                ? ($request->filled('weekend_price_per_night_cents') ? $request->integer('weekend_price_per_night_cents') : null)
                : $listing->weekend_price_per_night_cents,
            'currency' => $request->has('currency') ? $request->input('currency') : $listing->currency,
            'max_guests' => $request->has('max_guests') ? $request->integer('max_guests') : $listing->max_guests,
            'bedrooms' => $request->has('bedrooms') ? $request->integer('bedrooms') : $listing->bedrooms,
            'beds' => $request->has('beds') ? $request->integer('beds') : $listing->beds,
            'bathrooms' => $request->has('bathrooms') ? $request->input('bathrooms') : $listing->bathrooms,
            'amenities' => $request->has('amenities') ? $request->input('amenities', []) : $listing->amenities,
            'booking_type' => $request->has('booking_type') ? $request->input('booking_type') : $listing->booking_type,
            'min_nights' => $request->has('min_nights') ? $request->integer('min_nights') : $listing->min_nights,
            'latitude' => $request->has('latitude') ? $request->input('latitude') : $listing->latitude,
            'longitude' => $request->has('longitude') ? $request->input('longitude') : $listing->longitude,
        ], fn ($v) => $v !== null || true));

        if ($request->has('photos')) {
            $this->syncPhotos($listing, $request->input('photos', []));
        }

        $listing->load('host', 'photos');

        return (new ListingResource($listing))->response();
    }

    public function destroy(Listing $listing): Response
    {
        Gate::authorize('delete', $listing);

        $listing->delete();

        return response()->noContent();
    }

    /**
     * @param  array<int, array{url: string, caption?: string|null}>  $photos
     */
    private function syncPhotos(Listing $listing, array $photos): void
    {
        $listing->photos()->delete();

        foreach ($photos as $index => $photo) {
            $listing->photos()->create([
                'url' => $photo['url'],
                'caption' => $photo['caption'] ?? null,
                'sort_order' => $index,
            ]);
        }
    }
}
