<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Patient;
use App\Models\Consultation;
use App\Models\Appointment;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        abort_if(!in_array(auth()->user()->role, ['doctor', 'nurse']), 403);

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

    public function summary()
    {
        abort_if(!in_array(auth()->user()->role, ['doctor', 'nurse']), 403);

        $today = now()->startOfDay();
        $thisWeek = now()->startOfWeek();
        $thisMonth = now()->startOfMonth();

        return response()->json([
            'today' => [
                'consultations' => Consultation::whereDate('created_at', $today)->count(),
                'appointments' => Appointment::whereDate('appointment_date', $today)->count(),
                'new_patients' => Patient::whereDate('created_at', $today)->count(),
            ],
            'this_week' => [
                'consultations' => Consultation::where('created_at', '>=', $thisWeek)->count(),
                'appointments' => Appointment::where('appointment_date', '>=', $thisWeek)->count(),
                'new_patients' => Patient::where('created_at', '>=', $thisWeek)->count(),
            ],
            'this_month' => [
                'consultations' => Consultation::where('created_at', '>=', $thisMonth)->count(),
                'appointments' => Appointment::where('appointment_date', '>=', $thisMonth)->count(),
                'new_patients' => Patient::where('created_at', '>=', $thisMonth)->count(),
            ],
            'totals' => [
                'patients' => Patient::count(),
                'consultations' => Consultation::count(),
                'appointments' => Appointment::count(),
            ]
        ]);
    }

    public function recentActivity()
    {
        abort_if(!in_array(auth()->user()->role, ['doctor', 'nurse']), 403);

        $recentConsultations = Consultation::with(['patient', 'nurse', 'doctor'])
            ->latest()
            ->take(5)
            ->get();

        $upcomingAppointments = Appointment::with(['patient', 'doctor'])
            ->where('appointment_date', '>=', now())
            ->where('status', 'scheduled')
            ->orderBy('appointment_date')
            ->take(5)
            ->get();

        $recentPatients = Patient::latest()
            ->take(5)
            ->get();

        return response()->json([
            'consultations' => $recentConsultations,
            'appointments' => $upcomingAppointments,
            'patients' => $recentPatients
        ]);
    }

    public function weeklyStats()
    {
        abort_if(!in_array(auth()->user()->role, ['doctor', 'nurse']), 403);

        $startOfWeek = now()->startOfWeek();
        $dates = [];
        
        for ($i = 0; $i < 7; $i++) {
            $date = $startOfWeek->copy()->addDays($i);
            $dates[] = [
                'date' => $date->toDateString(),
                'consultations' => Consultation::whereDate('created_at', $date)->count(),
                'appointments' => Appointment::whereDate('appointment_date', $date)->count()
            ];
        }

        return response()->json([
            'weekly_trend' => $dates,
            'status_distribution' => [
                'consultations' => Consultation::select('status', DB::raw('count(*) as count'))
                    ->where('created_at', '>=', $startOfWeek)
                    ->groupBy('status')
                    ->get(),
                'appointments' => Appointment::select('status', DB::raw('count(*) as count'))
                    ->where('appointment_date', '>=', $startOfWeek)
                    ->groupBy('status')
                    ->get()
            ]
        ]);
    }
}
