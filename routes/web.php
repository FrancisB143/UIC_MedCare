<?php

use Inertia\Inertia;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ConsultationController;
use App\Http\Controllers\AppointmentController;
use App\Http\Controllers\PatientController;
use App\Http\Controllers\MedicalHistoryController;
use App\Http\Controllers\Auth\GoogleLoginController;

// Authentication Routes
Route::get('/', function () {
    return Inertia::render('Login');
})->name('login');

Route::get('/auth/google', [GoogleLoginController::class, 'redirect'])->name('google.login');
Route::get('/auth/google/callback', [GoogleLoginController::class, 'callback'])->name('google.callback');


// Protected Routes
Route::middleware(['auth'])->group(function () {
    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Patient Routes
    Route::prefix('patients')->group(function () {
        Route::get('/', [PatientController::class, 'index'])->name('patients.index');
        Route::get('/search', [PatientController::class, 'search'])->name('patients.search');
        Route::get('/{patient}', [PatientController::class, 'show'])->name('patients.show');
        Route::post('/', [PatientController::class, 'store'])->name('patients.store');
    });

    // Consultation Routes
    Route::prefix('consultations')->group(function () {
        Route::get('/', [ConsultationController::class, 'index'])->name('consultations.index');
        Route::get('/create', [ConsultationController::class, 'create'])->name('consultations.create');
        Route::post('/', [ConsultationController::class, 'store'])->name('consultations.store');
        Route::get('/{consultation}', [ConsultationController::class, 'show'])->name('consultations.show');
        Route::post('/{consultation}/refer', [ConsultationController::class, 'refer'])->name('consultations.refer');
        Route::post('/{consultation}/doctor-remarks', [ConsultationController::class, 'addDoctorRemarks'])->name('consultations.remarks');
    });

    // Appointment Routes
    Route::prefix('appointments')->group(function () {
        Route::get('/', [AppointmentController::class, 'index'])->name('appointments.index');
        Route::get('/create', [AppointmentController::class, 'create'])->name('appointments.create');
        Route::post('/', [AppointmentController::class, 'store'])->name('appointments.store');
        Route::put('/{appointment}', [AppointmentController::class, 'update'])->name('appointments.update');
        Route::delete('/{appointment}', [AppointmentController::class, 'destroy'])->name('appointments.destroy');
    });

    // Medical History Routes
    Route::get('/medical-history/{patient}', [MedicalHistoryController::class, 'index'])->name('medical-history.index');
});

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
Route::get('/Chat', fn() => Inertia::render('Chat'));

// HSMS Consultation Routes
Route::get('/consultation/student/{id}', fn($id) => Inertia::render('Consultation/StudentProfile', ['id' => $id]));
Route::get('/consultation/employee/{id}', fn($id) => Inertia::render('Consultation/EmployeeProfile', ['id' => $id]));
Route::get('/consultation/student/{id}/create', fn($id) => Inertia::render('Consultation/CreateConsultation', ['id' => $id]));
Route::get('/consultation/employee/{id}/create', fn($id) => Inertia::render('Consultation/CreateConsultation', ['id' => $id]));
Route::get('/consultation/student/{id}/create/walk-in', fn($id) => Inertia::render('Consultation/WalkIn', ['id' => $id]));
Route::get('/consultation/employee/{id}/create/walk-in', fn($id) => Inertia::render('Consultation/WalkIn', ['id' => $id]));
Route::get('/consultation/student/{id}/create/scheduled', fn($id) => Inertia::render('Consultation/Scheduled', ['id' => $id]));
Route::get('/consultation/employee/{id}/create/scheduled', fn($id) => Inertia::render('Consultation/Scheduled', ['id' => $id]));
Route::get('/Chat', fn() => Inertia::render('Chat'));

Route::post('/api/auth/google', [GoogleAuthController::class, 'authenticate']);