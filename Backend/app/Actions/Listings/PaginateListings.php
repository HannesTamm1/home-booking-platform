<?php

namespace App\Actions\Listings;

use App\Models\Listing;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;

class PaginateListings
{
    /**
     * @param  array{destination: string|null, guests: int|null, check_in: string|null, check_out: string|null}  $filters
     */
    public function execute(int $perPage, array $filters = []): LengthAwarePaginator
    {
        return $this->baseQuery($filters)
            ->paginate($perPage)
            ->withQueryString();
    }

    /**
     * @param  array{destination: string|null, guests: int|null, check_in: string|null, check_out: string|null}  $filters
     */
    public function averagePricePerNight(array $filters = []): float
    {
        return round((float) $this->filterQuery($filters)->avg('price_per_night'), 2);
    }

    /**
     * @return array<int, string>
     */
    public function destinations(): array
    {
        return Listing::query()
            ->whereNotNull('destination')
            ->orderBy('destination')
            ->distinct()
            ->pluck('destination')
            ->filter()
            ->values()
            ->all();
    }

    /**
     * @param  array{destination: string|null, guests: int|null, check_in: string|null, check_out: string|null}  $filters
     */
    private function baseQuery(array $filters = []): Builder
    {
        return $this->filterQuery($filters)
            ->with(['host:id'])
            ->withCount([
                'bookings as confirmed_bookings_count' => fn (Builder $query) => $query->where('status', 'confirmed'),
            ])
            ->withSum([
                'bookings as confirmed_revenue' => fn (Builder $query) => $query->where('status', 'confirmed'),
            ], 'total_price')
            ->latest();
    }

    /**
     * @param  array{destination: string|null, guests: int|null, check_in: string|null, check_out: string|null}  $filters
     */
    private function filterQuery(array $filters = []): Builder
    {
        $query = Listing::query();

        $validDestinations = $this->destinations();

        if (($filters['destination'] ?? null) && in_array($filters['destination'], $validDestinations, true)) {
            $query->where('destination', $filters['destination']);
        }

        if ($filters['guests'] ?? null) {
            $query->where('max_guests', '>=', $filters['guests']);
        }

        if (($filters['check_in'] ?? null) && ($filters['check_out'] ?? null)) {
            $checkIn = $filters['check_in'];
            $checkOut = $filters['check_out'];

            $query->whereDoesntHave('bookings', function (Builder $query) use ($checkIn, $checkOut) {
                $query
                    ->where('status', 'confirmed')
                    ->whereDate('start_date', '<=', $checkOut)
                    ->whereDate('end_date', '>=', $checkIn);
            });
        }

        return $query;
    }
}
