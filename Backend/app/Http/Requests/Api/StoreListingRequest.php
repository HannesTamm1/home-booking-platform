<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;

class StoreListingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /**
     * @return array<string, array<int, string>>
     */
    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'destination' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'house_rules' => ['nullable', 'string'],
            'property_type' => ['nullable', 'string', 'max:64'],
            'price_per_night_cents' => ['required', 'integer', 'min:0'],
            'weekend_price_per_night_cents' => ['nullable', 'integer', 'min:0'],
            'currency' => ['nullable', 'string', 'size:3'],
            'max_guests' => ['required', 'integer', 'min:1'],
            'bedrooms' => ['nullable', 'integer', 'min:0'],
            'beds' => ['nullable', 'integer', 'min:1'],
            'bathrooms' => ['nullable', 'numeric', 'min:0'],
            'amenities' => ['nullable', 'array'],
            'amenities.*' => ['string', 'max:64'],
            'booking_type' => ['nullable', 'in:instant,request'],
            'min_nights' => ['nullable', 'integer', 'min:1'],
            'latitude' => ['nullable', 'numeric', 'between:-90,90'],
            'longitude' => ['nullable', 'numeric', 'between:-180,180'],
            'photos' => ['nullable', 'array', 'max:20'],
            'photos.*.url' => ['required', 'string', 'max:2048'],
            'photos.*.caption' => ['nullable', 'string', 'max:255'],
        ];
    }
}
