<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Listing extends Model
{
    use HasFactory;

    protected $fillable = [
        'host_id',
        'status',
        'title',
        'destination',
        'description',
        'house_rules',
        'property_type',
        'price_per_night_cents',
        'weekend_price_per_night_cents',
        'currency',
        'max_guests',
        'bedrooms',
        'beds',
        'bathrooms',
        'amenities',
        'booking_type',
        'min_nights',
        'latitude',
        'longitude',
        'rating_average',
        'rating_count',
        'admin_note',
    ];

    protected function casts(): array
    {
        return [
            'price_per_night_cents' => 'integer',
            'weekend_price_per_night_cents' => 'integer',
            'max_guests' => 'integer',
            'bedrooms' => 'integer',
            'beds' => 'integer',
            'bathrooms' => 'float',
            'amenities' => 'array',
            'min_nights' => 'integer',
            'rating_average' => 'float',
            'rating_count' => 'integer',
            'latitude' => 'float',
            'longitude' => 'float',
        ];
    }

    public function host(): BelongsTo
    {
        return $this->belongsTo(User::class, 'host_id');
    }

    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class);
    }

    public function photos(): HasMany
    {
        return $this->hasMany(Photo::class)->orderBy('sort_order');
    }

    public function calendarDays(): HasMany
    {
        return $this->hasMany(CalendarDay::class);
    }
}
