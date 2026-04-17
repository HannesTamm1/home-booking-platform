<?php

namespace App\Actions\Listings;

use App\Models\Listing;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;

class PaginateListings
{
    public function execute(int $perPage): LengthAwarePaginator
    {
        return $this->baseQuery()
            ->paginate($perPage)
            ->withQueryString();
    }

    public function averagePricePerNight(): float
    {
        return round((float) Listing::query()->avg('price_per_night'), 2);
    }

    private function baseQuery(): Builder
    {
        return Listing::query()
            ->with(['host:id'])
            ->withCount([
                'bookings as confirmed_bookings_count' => fn (Builder $query) => $query->where('status', 'confirmed'),
            ])
            ->withSum([
                'bookings as confirmed_revenue' => fn (Builder $query) => $query->where('status', 'confirmed'),
            ], 'total_price')
            ->latest();
    }
}
