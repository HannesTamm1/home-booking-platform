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
        'title',
        'destination',
        'description',
        'price_per_night_cents',
        'currency',
        'max_guests',
        'latitude',
        'longitude',
    ];

    protected function casts(): array
    {
        return [
            'price_per_night_cents' => 'integer',
            'max_guests' => 'integer',
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
}
