<?php

use Inertia\Inertia;
use Illuminate\Support\Facades\Route;

// Default route shows Login page
Route::get('/', function () {
    return Inertia::render('Login');
})->name('login');

// Dashboard route (protected by auth middleware)
Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->name('dashboard');

Route::get('/search/student', fn() => Inertia::render('Search/Student'));
Route::get('/search/employee', fn() => Inertia::render('Search/Employee'));
Route::get('/search/community', fn() => Inertia::render('Search/Community'));
Route::get('/inventory/dashboard', fn() => Inertia::render('Inventory/InventDashboard'));

// Updated stocks route - this renders your refactored StocksPage
Route::get('/inventory/stocks', function() {
    return Inertia::render('Inventory/Stocks');
})->name('inventory.stocks');

// NEW: Branch inventory route - IMPORTANT: This must come BEFORE the stocks route or it won't work
Route::get('/inventory/stocks/branch/{id}', function ($id) {
    // Add debug logging
    \Log::info('Branch route hit with ID: ' . $id);
    
    $branchId = (int) $id;
    
    // Validate that branch exists
    if ($branchId < 1 || $branchId > 5) {
        \Log::warning('Invalid branch ID: ' . $branchId);
        return redirect()->route('inventory.stocks')->with('error', 'Branch not found');
    }
    
    \Log::info('Rendering BranchInventory with branchId: ' . $branchId);
    
    return Inertia::render('Inventory/BranchInventory', [
        'branchId' => $branchId
    ]);
})->name('inventory.stocks.branch');

Route::get('/inventory/history', fn() => Inertia::render('Inventory/History'));
Route::get('/Reports', fn() => Inertia::render('Reports'));
Route::get('/Print', fn() => Inertia::render('Print'));
Route::get('/About', fn() => Inertia::render('About'));
Route::get('/Notification', fn() => Inertia::render('Notification'));