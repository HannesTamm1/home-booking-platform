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
        $paginator = $paginateListings->execute($request->perPage());
        $listings = ListingResource::collection($paginator->getCollection())->resolve($request);

        return response()->json([
            'data' => $listings,
            'meta' => [
                'totalListings' => $paginator->total(),
                'averagePricePerNight' => $paginateListings->averagePricePerNight(),
                'generatedAt' => now()->toISOString(),
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
