<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminUserController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = User::query()
            ->withCount([
                'bookings as booking_count',
                'listings as listing_count',
            ])
            ->orderByDesc('created_at');

        if ($search = $request->string('search')->trim()->value()) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'ilike', "%{$search}%")
                    ->orWhere('email', 'ilike', "%{$search}%");
            });
        }

        $users = $query->paginate(25)->withQueryString();

        return response()->json([
            'data' => $users->map(fn ($u) => [
                'id' => $u->id,
                'name' => $u->name,
                'email' => $u->email,
                'role' => $u->role,
                'isSuspended' => $u->is_suspended,
                'suspensionReason' => $u->suspension_reason,
                'bookingCount' => $u->booking_count,
                'listingCount' => $u->listing_count,
                'createdAt' => $u->created_at?->toISOString(),
            ]),
            'meta' => [
                'currentPage' => $users->currentPage(),
                'lastPage' => $users->lastPage(),
                'total' => $users->total(),
            ],
        ]);
    }

    public function suspend(Request $request, User $user): JsonResponse
    {
        $request->validate([
            'reason' => ['nullable', 'string', 'max:500'],
        ]);

        if ($user->role === 'admin') {
            return response()->json(['message' => 'Admin accounts cannot be suspended.'], 422);
        }

        $user->update([
            'is_suspended' => true,
            'suspension_reason' => $request->string('reason')->trim()->value() ?: null,
        ]);

        return response()->json(['message' => 'User suspended.']);
    }

    public function reinstate(User $user): JsonResponse
    {
        $user->update([
            'is_suspended' => false,
            'suspension_reason' => null,
        ]);

        return response()->json(['message' => 'User reinstated.']);
    }
}
