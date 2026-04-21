<?php

namespace App\Http\Controllers\Api;

use App\Actions\Listings\PaginateListings;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\ListListingsRequest;
use App\Http\Resources\ListingResource;
use Illuminate\Http\JsonResponse;

class ListingIndexController extends Controller
{
    public function __invoke(ListListingsRequest $request, PaginateListings $paginateListings): JsonResponse
    {
        $filters = $request->filters();
        $paginator = $paginateListings->execute($request->perPage(), $filters);
        $listings = ListingResource::collection($paginator->getCollection())->resolve($request);

        return response()->json([
            'data' => $listings,
            'meta' => [
                'totalListings' => $paginator->total(),
                'averagePricePerNight' => $paginateListings->averagePricePerNight($filters),
                'generatedAt' => now()->toISOString(),
                'filters' => [
                    'destination' => $filters['destination'],
                    'guests' => $filters['guests'],
                    'checkIn' => $filters['check_in'],
                    'checkOut' => $filters['check_out'],
                    'availableDestinations' => $paginateListings->destinations(),
                ],
                'pagination' => [
                    'currentPage' => $paginator->currentPage(),
                    'perPage' => $paginator->perPage(),
                    'lastPage' => $paginator->lastPage(),
                    'hasMorePages' => $paginator->hasMorePages(),
                ],
            ],
        ]);
    }
}
