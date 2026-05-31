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
            'status' => $this->status,
            'title' => $this->title,
            'destination' => $this->destination,
            'address' => $this->address,
            'description' => $this->description,
            'houseRules' => $this->house_rules,
            'propertyType' => $this->property_type,
            'pricePerNight' => round($this->price_per_night_cents / 100, 2),
            'weekendPricePerNight' => $this->weekend_price_per_night_cents
                ? round($this->weekend_price_per_night_cents / 100, 2)
                : null,
            'currency' => $this->currency,
            'maxGuests' => $this->max_guests,
            'bedrooms' => $this->bedrooms,
            'beds' => $this->beds,
            'bathrooms' => $this->bathrooms,
            'amenities' => $this->amenities ?? [],
            'bookingType' => $this->booking_type,
            'minNights' => $this->min_nights,
            'latitude' => $this->latitude,
            'longitude' => $this->longitude,
            'ratingAverage' => $this->rating_average,
            'ratingCount' => $this->rating_count,
            'photos' => $this->whenLoaded('photos', fn () => $this->photos->map(fn ($p) => [
                'id' => $p->id,
                'url' => $p->url,
                'caption' => $p->caption,
                'sortOrder' => $p->sort_order,
                'isCover' => $p->sort_order === 0,
            ])->all()),
            'host' => $this->whenLoaded('host', fn () => [
                'id' => $this->host->id,
                'name' => $this->host->name,
                'email' => $this->host->email,
                'publicLabel' => $this->host->name ?? 'Your host',
            ], ['publicLabel' => 'Managed by host']),
            'metrics' => [
                'confirmedBookings' => (int) ($this->confirmed_bookings_count ?? 0),
                'confirmedRevenue' => round(($this->confirmed_revenue ?? 0) / 100, 2),
            ],
            'createdAt' => $this->created_at?->toISOString(),
            'updatedAt' => $this->updated_at?->toISOString(),
        ];
    }
}
