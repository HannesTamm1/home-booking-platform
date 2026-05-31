<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\HostApplication;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class AdminHostApplicationController extends Controller
{
    public function index(): JsonResponse
    {
        $applications = HostApplication::query()
            ->with(['user:id,name,email', 'reviewer:id,name,email'])
            ->orderByRaw("CASE status WHEN 'pending' THEN 0 ELSE 1 END")
            ->orderByDesc('created_at')
            ->get()
            ->map(fn ($a) => [
                'id' => $a->id,
                'status' => $a->status,
                'note' => $a->note,
                'admin_note' => $a->admin_note,
                'created_at' => $a->created_at,
                'user' => ['id' => $a->user->id, 'name' => $a->user->name, 'email' => $a->user->email],
                'reviewed_by' => $a->reviewer ? ['id' => $a->reviewer->id, 'name' => $a->reviewer->name] : null,
            ]);

        return response()->json(['data' => $applications]);
    }

    public function approve(Request $request, HostApplication $hostApplication): JsonResponse
    {
        $request->validate([
            'admin_note' => ['nullable', 'string', 'max:1000'],
        ]);

        $hostApplication->update([
            'status' => 'approved',
            'admin_note' => $request->string('admin_note')->trim()->value() ?: null,
            'reviewed_by' => $request->user()->id,
        ]);

        $hostApplication->user->update(['role' => 'host']);

        return response()->json(['message' => 'Application approved. User is now a host.']);
    }

    public function reject(Request $request, HostApplication $hostApplication): JsonResponse
    {
        $request->validate([
            'admin_note' => ['nullable', 'string', 'max:1000'],
        ]);

        $hostApplication->update([
            'status' => 'rejected',
            'admin_note' => $request->string('admin_note')->trim()->value() ?: null,
            'reviewed_by' => $request->user()->id,
        ]);

        return response()->json(['message' => 'Application rejected.']);
    }
}
