<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController; // We only need this controller for this task

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// This is the ONLY route you need for the Google login button in your React app.
Route::post('/auth/google', [AuthController::class, 'handleGoogleLogin']);

// The default user route can stay if you need it
Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});