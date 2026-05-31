<?php

use App\Http\Controllers\Api\AdminBookingController;
use App\Http\Controllers\Api\ConversationController;
use App\Http\Controllers\Api\AdminDisputeController;
use App\Http\Controllers\Api\AdminHostApplicationController;
use App\Http\Controllers\Api\AdminListingController;
use App\Http\Controllers\Api\AdminOverviewController;
use App\Http\Controllers\Api\AdminUserController;
use App\Http\Controllers\Api\Auth\LoginController;
use App\Http\Controllers\Api\Auth\RegisterController;
use App\Http\Controllers\Api\BecomeHostController;
use App\Http\Controllers\Api\BookingController;
use App\Http\Controllers\Api\HostApplicationController;
use App\Http\Controllers\Api\HostBookingController;
use App\Http\Controllers\Api\HostCalendarController;
use App\Http\Controllers\Api\HostConnectController;
use App\Http\Controllers\Api\HostDashboardController;
use App\Http\Controllers\Api\HostEarningsController;
use App\Http\Controllers\Api\HostListingController;
use App\Http\Controllers\Api\PhotoUploadController;
use App\Http\Controllers\Api\ListingAvailabilityController;
use App\Http\Controllers\Api\ListingController;
use App\Http\Controllers\Api\ListingIndexController;
use App\Http\Controllers\Api\UserBookingController;
use App\Http\Controllers\Api\UserPasswordController;
use App\Http\Middleware\EnsureAdmin;
use Illuminate\Support\Facades\Route;

Route::middleware('throttle:10,1')->group(function () {
    Route::post('/auth/register', RegisterController::class);
    Route::post('/auth/login', LoginController::class);
});

Route::get('/listings', ListingIndexController::class);
Route::get('/listings/{listing}', [ListingController::class, 'show']);
Route::get('/listings/{listing}/availability', ListingAvailabilityController::class);

Route::middleware('auth:sanctum')->group(function () {
    Route::put('/user/password', [UserPasswordController::class, 'update']);

    Route::get('/conversations', [ConversationController::class, 'index']);
    Route::post('/conversations', [ConversationController::class, 'store']);
    Route::get('/conversations/{conversation}', [ConversationController::class, 'show']);
    Route::post('/conversations/{conversation}/reply', [ConversationController::class, 'reply']);
    Route::get('/user/host-application', [HostApplicationController::class, 'show']);
    Route::post('/user/host-application', [HostApplicationController::class, 'store']);

    Route::get('/user/bookings', [UserBookingController::class, 'index']);
    Route::get('/user/bookings/{booking}', [UserBookingController::class, 'show']);
    Route::delete('/user/bookings/{booking}', [UserBookingController::class, 'destroy']);

    // Host
    Route::post('/host/photos', PhotoUploadController::class);
    Route::get('/host/dashboard', HostDashboardController::class);
    Route::get('/host/earnings', HostEarningsController::class);
    Route::get('/host/connect/status', [HostConnectController::class, 'status']);
    Route::post('/host/connect/onboard', [HostConnectController::class, 'startOnboarding']);
    Route::get('/host/listings', [HostListingController::class, 'index']);
    Route::get('/host/bookings', [HostBookingController::class, 'index']);

    Route::get('/host/listings/{listing}/calendar', [HostCalendarController::class, 'show']);
    Route::post('/host/listings/{listing}/calendar/toggle-block', [HostCalendarController::class, 'toggleBlock']);
    Route::post('/host/listings/{listing}/calendar/set-price', [HostCalendarController::class, 'setPrice']);

    Route::post('/listings', [ListingController::class, 'store']);
    Route::put('/listings/{listing}', [ListingController::class, 'update']);
    Route::patch('/listings/{listing}', [ListingController::class, 'update']);
    Route::delete('/listings/{listing}', [ListingController::class, 'destroy']);
    Route::post('/listings/{listing}/submit', [HostListingController::class, 'submit']);
    Route::middleware('throttle:20,1')->group(function () {
        Route::post('/listings/{listing}/bookings', [BookingController::class, 'store']);
    });

    Route::middleware(EnsureAdmin::class)->prefix('admin')->group(function () {
        Route::get('/overview', AdminOverviewController::class);

        Route::get('/host-applications', [AdminHostApplicationController::class, 'index']);
        Route::patch('/host-applications/{hostApplication}/approve', [AdminHostApplicationController::class, 'approve']);
        Route::patch('/host-applications/{hostApplication}/reject', [AdminHostApplicationController::class, 'reject']);

        Route::get('/listings', [AdminListingController::class, 'index']);
        Route::get('/listings/all', [AdminListingController::class, 'all']);
        Route::patch('/listings/{listing}/approve', [AdminListingController::class, 'approve']);
        Route::patch('/listings/{listing}/reject', [AdminListingController::class, 'reject']);
        Route::patch('/listings/{listing}/unpublish', [AdminListingController::class, 'unpublish']);

        Route::get('/bookings', [AdminBookingController::class, 'index']);

        Route::get('/disputes', [AdminDisputeController::class, 'index']);
        Route::get('/disputes/{dispute}', [AdminDisputeController::class, 'show']);
        Route::post('/disputes', [AdminDisputeController::class, 'store']);
        Route::post('/disputes/{dispute}/resolve', [AdminDisputeController::class, 'resolve']);

        Route::get('/users', [AdminUserController::class, 'index']);
        Route::patch('/users/{user}/suspend', [AdminUserController::class, 'suspend']);
        Route::patch('/users/{user}/reinstate', [AdminUserController::class, 'reinstate']);
    });
});
