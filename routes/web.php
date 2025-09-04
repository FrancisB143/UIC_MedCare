<?php

use Inertia\Inertia;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return Inertia::render('Login');
})->name('login');


Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->name('dashboard');

Route::get('/search/student', fn() => Inertia::render('Search/Student'));
Route::get('/search/employee', fn() => Inertia::render('Search/Employee'));
Route::get('/search/community', fn() => Inertia::render('Search/Community'));
Route::get('/inventory/dashboard', fn() => Inertia::render('Inventory/InventDashboard'));

Route::get('/inventory/stocks', function() {
    return Inertia::render('Inventory/Stocks');
})->name('inventory.stocks');


Route::get('/inventory/branchinventory/{branchId}', function ($branchId) {
    return Inertia::render('Inventory/BranchInventory', [
        'branchId' => (int) $branchId
    ]);
});


Route::get('/inventory/otherinventorystocks/{branchId}', function ($branchId) {
    return Inertia::render('Inventory/OtherInventoryStocks', [
        'branchId' => (int) $branchId
    ]);
});

Route::get('/inventory/history', fn() => Inertia::render('Inventory/History'));
Route::get('/Reports', fn() => Inertia::render('Reports'));
Route::get('/Print', fn() => Inertia::render('Print'));
Route::get('/About', fn() => Inertia::render('About'));
Route::get('/Notification', fn() => Inertia::render('Notification'));


Route::post('/api/auth/google', [GoogleAuthController::class, 'authenticate']);