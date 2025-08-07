<?php

use Inertia\Inertia;
use Illuminate\Support\Facades\Route;

Route::get('/', fn() => Inertia::render('Dashboard'));
Route::get('/search/student', fn() => Inertia::render('Search/Student'));
Route::get('/search/employee', fn() => Inertia::render('Search/Employee'));
Route::get('/search/community', fn() => Inertia::render('Search/Community'));
Route::get('/inventory/dashboard', fn() => Inertia::render('Inventory/InventDashboard'));
Route::get('/inventory/stocks', fn() => Inertia::render('Inventory/Stocks'));
Route::get('/inventory/history', fn() => Inertia::render('Inventory/History'));
Route::get('/Reports', fn() => Inertia::render('Reports'));
Route::get('/Print', fn() => Inertia::render('Print'));
Route::get('/About', fn() => Inertia::render('About'));
Route::get('/Notification', fn() => Inertia::render('Notification'));

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
