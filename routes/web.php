<?php

use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// --- Public Routes ---
// These routes do NOT require a user to be logged in.

// The public login page
Route::get('/', function () {
    return Inertia::render('Login');
})->name('login');

// The dashboard page
Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->name('dashboard');

// All application pages are now public
Route::get('/search/student', fn() => Inertia::render('Search/Student'));
Route::get('/search/employee', fn() => Inertia::render('Search/Employee'));
Route::get('/search/community', fn() => Inertia::render('Search/Community'));

Route::get('/inventory/dashboard', fn() => Inertia::render('Inventory/InventDashboard'));
Route::get('/inventory/stocks', function() {
    return Inertia::render('Inventory/Stocks');
})->name('inventory.stocks');

// New route for branch inventory without branch ID (gets user's branch automatically)
Route::get('/inventory/branchinventory', function () {
    return Inertia::render('Inventory/BranchInventory');
});

// Keep the old route for backward compatibility
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

// --- Protected Routes ---
// Routes that MUST require a user to be logged in (like logging out).
Route::middleware(['auth'])->group(function () {
    Route::post('/logout', function () {
        Auth::logout();
        request()->session()->invalidate();
        request()->session()->regenerateToken();
        return redirect('/');
    })->name('logout');
});