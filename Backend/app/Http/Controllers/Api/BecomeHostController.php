<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BecomeHostController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user->role !== 'guest') {
            return response()->json(['message' => 'Already a host or admin.'], 422);
        }

        $user->update(['role' => 'host']);

        return response()->json([
            'message' => 'You are now a host.',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
            ],
        ]);
    }
}
