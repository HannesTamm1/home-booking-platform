<?php

namespace App\Policies;

use App\Models\User;

class BookingPolicy
{
    public function create(User $user): bool
    {
        return true;
    }
}
