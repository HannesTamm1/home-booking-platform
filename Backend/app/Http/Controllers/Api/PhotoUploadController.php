<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class PhotoUploadController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        $request->validate([
            'photo' => ['required', 'image', 'mimes:jpeg,jpg,png,webp,gif', 'max:5120'],
        ]);

        $path = $request->file('photo')->store('photos', 'public');
        $url = Storage::disk('public')->url($path);

        return response()->json(['url' => $url], 201);
    }
}
