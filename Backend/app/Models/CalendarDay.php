<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CalendarDay extends Model
{
    protected $fillable = [
        'listing_id',
        'date',
        'is_blocked',
        'custom_price_cents',
    ];

    protected function casts(): array
    {
        return [
            'date' => 'date',
            'is_blocked' => 'boolean',
            'custom_price_cents' => 'integer',
        ];
    }

    public function listing(): BelongsTo
    {
        return $this->belongsTo(Listing::class);
    }
}
