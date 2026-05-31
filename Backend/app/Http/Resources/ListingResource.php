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
            'description' => $this->description,
            'pricePerNight' => round($this->price_per_night_cents / 100, 2),
            'currency' => $this->currency,
            'maxGuests' => $this->max_guests,
            'latitude' => $this->latitude,
            'longitude' => $this->longitude,
            'photos' => $this->whenLoaded('photos', fn () => $this->photos->map(fn ($p) => [
                'url' => $p->url,
                'caption' => $p->caption,
            ])->all()),
            'host' => [
                'publicLabel' => $this->host ? 'Managed by host' : 'Host unavailable',
            ],
            'metrics' => [
                'confirmedBookings' => (int) ($this->confirmed_bookings_count ?? 0),
                'confirmedRevenue' => round(($this->confirmed_revenue ?? 0) / 100, 2),
            ],
            'createdAt' => $this->created_at?->toISOString(),
            'updatedAt' => $this->updated_at?->toISOString(),
        ];
    }
}
