<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class IdempotencyKey extends Model
{
    public $timestamps = false;

    protected $fillable = ['key', 'user_id', 'booking_id'];

    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }
}
