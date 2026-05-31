<?php

namespace App\Policies;

use App\Models\Booking;
use App\Models\User;

class BookingPolicy
{
    public function create(User $user): bool
    {
        return true;
    }

    public function view(User $user, Booking $booking): bool
    {
        return $user->id === $booking->user_id;
    }

    public function delete(User $user, Booking $booking): bool
    {
        return $user->id === $booking->user_id;
    }
}
