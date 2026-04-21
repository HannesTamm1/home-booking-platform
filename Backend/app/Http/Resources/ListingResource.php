<?php

namespace App\Http\Resources;

use App\Models\Listing;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Listing
 */
class ListingResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'destination' => $this->destination,
            'pricePerNight' => (float) $this->price_per_night,
            'maxGuests' => $this->max_guests,
            'host' => [
                'publicLabel' => $this->host ? 'Managed by host' : 'Host unavailable',
            ],
            'metrics' => [
                'confirmedBookings' => (int) ($this->confirmed_bookings_count ?? 0),
                'confirmedRevenue' => (float) ($this->confirmed_revenue ?? 0),
            ],
            'createdAt' => $this->created_at?->toISOString(),
        ];
    }
}
