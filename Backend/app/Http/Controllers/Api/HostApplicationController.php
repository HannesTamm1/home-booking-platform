<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\HostApplication;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class HostApplicationController extends Controller
{
    public function show(Request $request): JsonResponse
    {
        $application = HostApplication::query()
            ->where('user_id', $request->user()->id)
            ->latest()
            ->first();

        return response()->json([
            'application' => $application ? [
                'id' => $application->id,
                'status' => $application->status,
                'note' => $application->note,
                'admin_note' => $application->admin_note,
                'created_at' => $application->created_at,
            ] : null,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user->role === 'host' || $user->role === 'admin') {
            throw ValidationException::withMessages([
                'role' => ['You are already a host or admin.'],
            ]);
        }

        $pending = HostApplication::query()
            ->where('user_id', $user->id)
            ->where('status', 'pending')
            ->exists();

        if ($pending) {
            throw ValidationException::withMessages([
                'application' => ['You already have a pending application.'],
            ]);
        }

        $request->validate([
            'note' => ['nullable', 'string', 'max:1000'],
        ]);

        $application = HostApplication::query()->create([
            'user_id' => $user->id,
            'status' => 'pending',
            'note' => $request->string('note')->trim()->value() ?: null,
        ]);

        return response()->json([
            'message' => 'Application submitted successfully.',
            'application' => [
                'id' => $application->id,
                'status' => $application->status,
                'note' => $application->note,
                'created_at' => $application->created_at,
            ],
        ], 201);
    }
}
