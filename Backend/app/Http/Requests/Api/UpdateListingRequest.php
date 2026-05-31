<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;

class UpdateListingRequest extends FormRequest
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
            'title' => ['sometimes', 'required', 'string', 'max:255'],
            'destination' => ['sometimes', 'nullable', 'string', 'max:255'],
            'description' => ['sometimes', 'nullable', 'string'],
            'house_rules' => ['sometimes', 'nullable', 'string'],
            'property_type' => ['sometimes', 'nullable', 'string', 'max:64'],
            'price_per_night_cents' => ['sometimes', 'required', 'integer', 'min:0'],
            'weekend_price_per_night_cents' => ['sometimes', 'nullable', 'integer', 'min:0'],
            'currency' => ['sometimes', 'nullable', 'string', 'size:3'],
            'max_guests' => ['sometimes', 'required', 'integer', 'min:1'],
            'bedrooms' => ['sometimes', 'nullable', 'integer', 'min:0'],
            'beds' => ['sometimes', 'nullable', 'integer', 'min:1'],
            'bathrooms' => ['sometimes', 'nullable', 'numeric', 'min:0'],
            'amenities' => ['sometimes', 'nullable', 'array'],
            'amenities.*' => ['string', 'max:64'],
            'booking_type' => ['sometimes', 'nullable', 'in:instant,request'],
            'min_nights' => ['sometimes', 'nullable', 'integer', 'min:1'],
            'latitude' => ['sometimes', 'nullable', 'numeric', 'between:-90,90'],
            'longitude' => ['sometimes', 'nullable', 'numeric', 'between:-180,180'],
            'photos' => ['sometimes', 'nullable', 'array', 'max:20'],
            'photos.*.url' => ['required_with:photos', 'string', 'max:2048'],
            'photos.*.caption' => ['nullable', 'string', 'max:255'],
        ];
    }
}
