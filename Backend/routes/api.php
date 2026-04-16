<?php

use App\Http\Controllers\Api\ListingIndexController;
use Illuminate\Support\Facades\Route;

Route::get('/listings', ListingIndexController::class);
