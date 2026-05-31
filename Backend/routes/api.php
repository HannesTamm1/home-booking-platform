<?php

use App\Http\Controllers\Api\AdminHostApplicationController;
use App\Http\Controllers\Api\Auth\LoginController;
use App\Http\Controllers\Api\Auth\RegisterController;
use App\Http\Controllers\Api\BookingController;
use App\Http\Controllers\Api\HostApplicationController;
use App\Http\Controllers\Api\ListingAvailabilityController;
use App\Http\Controllers\Api\ListingController;
use App\Http\Controllers\Api\ListingIndexController;
use App\Http\Controllers\Api\UserBookingController;
use App\Http\Controllers\Api\UserPasswordController;
use App\Http\Middleware\EnsureAdmin;
use Illuminate\Support\Facades\Route;

Route::post('/auth/register', RegisterController::class);
Route::post('/auth/login', LoginController::class);

Route::get('/listings', ListingIndexController::class);
Route::get('/listings/{listing}', [ListingController::class, 'show']);
Route::get('/listings/{listing}/availability', ListingAvailabilityController::class);

Route::middleware('auth')->group(function () {
    Route::post('/listings', [ListingController::class, 'store']);
    Route::put('/listings/{listing}', [ListingController::class, 'update']);
    Route::patch('/listings/{listing}', [ListingController::class, 'update']);
    Route::delete('/listings/{listing}', [ListingController::class, 'destroy']);

    Route::post('/listings/{listing}/bookings', [BookingController::class, 'store']);
});

Route::middleware('auth:sanctum')->group(function () {
    Route::put('/user/password', [UserPasswordController::class, 'update']);

    Route::get('/user/host-application', [HostApplicationController::class, 'show']);
    Route::post('/user/host-application', [HostApplicationController::class, 'store']);

    Route::get('/user/bookings', [UserBookingController::class, 'index']);
    Route::get('/user/bookings/{booking}', [UserBookingController::class, 'show']);
    Route::delete('/user/bookings/{booking}', [UserBookingController::class, 'destroy']);

    Route::middleware(EnsureAdmin::class)->prefix('admin')->group(function () {
        Route::get('/host-applications', [AdminHostApplicationController::class, 'index']);
        Route::patch('/host-applications/{hostApplication}/approve', [AdminHostApplicationController::class, 'approve']);
        Route::patch('/host-applications/{hostApplication}/reject', [AdminHostApplicationController::class, 'reject']);
    });
});
