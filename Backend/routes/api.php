<?php

use App\Http\Controllers\Api\Auth\LoginController;
use App\Http\Controllers\Api\Auth\RegisterController;
use App\Http\Controllers\Api\BookingController;
use App\Http\Controllers\Api\ListingController;
use App\Http\Controllers\Api\ListingIndexController;
use Illuminate\Support\Facades\Route;

Route::post('/auth/register', RegisterController::class);
Route::post('/auth/login', LoginController::class);

Route::get('/listings', ListingIndexController::class);
Route::get('/listings/{listing}', [ListingController::class, 'show']);

Route::middleware('auth')->group(function () {
    Route::post('/listings', [ListingController::class, 'store']);
    Route::put('/listings/{listing}', [ListingController::class, 'update']);
    Route::patch('/listings/{listing}', [ListingController::class, 'update']);
    Route::delete('/listings/{listing}', [ListingController::class, 'destroy']);

    Route::post('/listings/{listing}/bookings', [BookingController::class, 'store']);
});
