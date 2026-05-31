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
            'title' => $request->string('title')->trim()->value(),
            'destination' => $request->filled('destination') ? $request->string('destination')->trim()->value() : null,
            'description' => $request->input('description'),
            'price_per_night_cents' => $request->integer('price_per_night_cents'),
            'currency' => $request->input('currency', 'EUR'),
            'max_guests' => $request->integer('max_guests'),
            'latitude' => $request->input('latitude'),
            'longitude' => $request->input('longitude'),
        ]);

        $listing->load('host');

        return (new ListingResource($listing))
            ->response()
            ->setStatusCode(201);
    }

    public function update(UpdateListingRequest $request, Listing $listing): JsonResponse
    {
        Gate::authorize('update', $listing);

        $listing->update($request->only([
            'title', 'destination', 'description',
            'price_per_night_cents', 'currency', 'max_guests',
            'latitude', 'longitude',
        ]));

        $listing->load('host');

        return (new ListingResource($listing))->response();
    }

    public function destroy(Listing $listing): Response
    {
        Gate::authorize('delete', $listing);

        $listing->delete();

        return response()->noContent();
    }
}
