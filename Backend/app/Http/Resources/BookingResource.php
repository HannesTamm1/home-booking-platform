<?php

namespace App\Http\Resources;

use App\Models\Booking;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Booking
 */
class BookingResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'listingId' => $this->listing_id,
            'listing' => $this->whenLoaded('listing', fn () => [
                'id' => $this->listing->id,
                'title' => $this->listing->title,
                'destination' => $this->listing->destination,
                'pricePerNight' => round($this->listing->price_per_night_cents / 100, 2),
                'currency' => $this->listing->currency,
                'maxGuests' => $this->listing->max_guests,
            ]),
            'startDate' => $this->start_date?->toDateString(),
            'endDate' => $this->end_date?->toDateString(),
            'nights' => $this->start_date && $this->end_date
                ? $this->start_date->diffInDays($this->end_date)
                : null,
            'totalPrice' => round($this->total_price_cents / 100, 2),
            'currency' => $this->currency,
            'status' => $this->status,
            'createdAt' => $this->created_at?->toISOString(),
        ];
    }
}
