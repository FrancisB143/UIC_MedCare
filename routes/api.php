<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\StudentController;
use App\Http\Controllers\EmployeeController;

// Student endpoints
Route::prefix('students')->group(function () {
    Route::get('/search', [StudentController::class, 'search']);
    Route::get('/', [StudentController::class, 'getAll']);
    Route::get('/{id}', [StudentController::class, 'getById']);
});

// Employee endpoints
Route::prefix('employees')->group(function () {
    Route::get('/search', [EmployeeController::class, 'search']);
    Route::get('/', [EmployeeController::class, 'getAll']);
    Route::get('/{id}', [EmployeeController::class, 'getById']);
});

// Consultation endpoints
Route::prefix('consultations')->group(function () {
    Route::post('/', [ConsultationController::class, 'store']);
    Route::get('/{consultation}', [ConsultationController::class, 'show']);
    Route::post('/{consultation}/remarks', [ConsultationController::class, 'addRemark']);
});