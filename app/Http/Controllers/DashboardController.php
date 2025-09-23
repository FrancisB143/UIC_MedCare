<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        $stats = [];

        if ($user->role === 'nurse') {
            $stats = [
                'total_patients' => Patient::count(),
                'pending_appointments' => $user->nurse->appointments()
                    ->where('status', 'pending')
                    ->count(),
                'today_consultations' => $user->nurse->consultations()
                    ->whereDate('created_at', today())
                    ->count(),
                'recent_consultations' => $user->nurse->consultations()
                    ->with(['patient'])
                    ->latest()
                    ->take(5)
                    ->get()
            ];
        } elseif ($user->role === 'doctor') {
            $stats = [
                'referred_consultations' => $user->doctor->consultations()
                    ->where('status', 'pending')
                    ->count(),
                'today_consultations' => $user->doctor->consultations()
                    ->whereDate('created_at', today())
                    ->count(),
                'recent_consultations' => $user->doctor->consultations()
                    ->with(['patient', 'nurse'])
                    ->latest()
                    ->take(5)
                    ->get()
            ];
        }

        return inertia('Dashboard/Index', [
            'stats' => $stats
        ]);
    }
}
