<?php

namespace App\Policies;

use App\Models\Listing;
use App\Models\User;

class ListingPolicy
{
    public function create(User $user): bool
    {
        return in_array($user->role, ['host', 'admin'], true);
    }

    public function update(User $user, Listing $listing): bool
    {
        return $user->id === $listing->host_id || $user->role === 'admin';
    }

    public function delete(User $user, Listing $listing): bool
    {
        return $user->id === $listing->host_id || $user->role === 'admin';
    }

    public function submit(User $user, Listing $listing): bool
    {
        return $user->id === $listing->host_id && in_array($listing->status, ['draft', 'rejected'], true);
    }
}
