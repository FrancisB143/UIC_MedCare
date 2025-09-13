<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Authentication routes
Route::post('/auth/google', [AuthController::class, 'handleGoogleLogin']);

// User management routes for MSSQL integration
Route::post('/users/by-email', [UserController::class, 'getUserByEmail']);
Route::get('/users/{id}/branch', [UserController::class, 'getUserBranch']);
Route::get('/users', [UserController::class, 'getAllUsers']);
Route::post('/users', [UserController::class, 'createUser']);
Route::put('/users/{id}', [UserController::class, 'updateUser']);
Route::delete('/users/{id}', [UserController::class, 'deleteUser']);

// The default user route can stay if you need it
Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});