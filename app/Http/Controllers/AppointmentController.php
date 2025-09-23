<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AppointmentController extends Controller
{
    public function index()
    {
        abort_if(!in_array(auth()->user()->role, ['doctor', 'nurse']), 403);
        
        $user = auth()->user();
        $appointments = null;

        if ($user->role === 'doctor') {
            $appointments = $user->doctor->appointments()
                ->with('patient')
                ->orderBy('appointment_date')
                ->get();
        } else {
            $appointments = Appointment::with(['patient', 'doctor'])
                ->orderBy('appointment_date')
                ->get();
        }

        return response()->json($appointments);
    }

    public function store(Request $request)
    {
        abort_if(!in_array(auth()->user()->role, ['doctor', 'nurse']), 403);
        
        $appointment = Appointment::create([
            'patient_id' => $request->patient_id,
            'doctor_id' => $request->doctor_id,
            'appointment_date' => $request->appointment_date,
            'reason' => $request->reason,
            'status' => 'scheduled'
        ]);

        return response()->json($appointment->load(['patient', 'doctor']));
    }

    public function update(Request $request, Appointment $appointment)
    {
        abort_if(!in_array(auth()->user()->role, ['doctor', 'nurse']), 403);
        
        $appointment->update([
            'appointment_date' => $request->appointment_date,
            'reason' => $request->reason,
            'status' => $request->status
        ]);

        return response()->json($appointment->load(['patient', 'doctor']));
    }

    public function cancel(Appointment $appointment)
    {
        abort_if(!in_array(auth()->user()->role, ['doctor', 'nurse']), 403);
        
        $appointment->update(['status' => 'cancelled']);
        return response()->json($appointment);
    }

    public function upcoming()
    {
        abort_if(!in_array(auth()->user()->role, ['doctor', 'nurse']), 403);
        
        $appointments = Appointment::with(['patient', 'doctor'])
            ->where('appointment_date', '>=', now())
            ->where('status', 'scheduled')
            ->orderBy('appointment_date')
            ->take(10)
            ->get();

        return response()->json($appointments);
    }

    public function statistics()
    {
        abort_if(!in_array(auth()->user()->role, ['doctor', 'nurse']), 403);
        
        $startOfWeek = now()->startOfWeek();
        $startOfMonth = now()->startOfMonth();

        return response()->json([
            'total' => Appointment::count(),
            'upcoming' => Appointment::where('appointment_date', '>=', now())
                ->where('status', 'scheduled')
                ->count(),
            'this_week' => [
                'total' => Appointment::whereBetween('appointment_date', [
                    $startOfWeek, 
                    $startOfWeek->copy()->endOfWeek()
                ])->count(),
                'by_status' => Appointment::whereBetween('appointment_date', [
                    $startOfWeek, 
                    $startOfWeek->copy()->endOfWeek()
                ])
                ->select('status', DB::raw('count(*) as count'))
                ->groupBy('status')
                ->get()
            ],
            'this_month' => [
                'total' => Appointment::whereBetween('appointment_date', [
                    $startOfMonth, 
                    $startOfMonth->copy()->endOfMonth()
                ])->count(),
                'by_status' => Appointment::whereBetween('appointment_date', [
                    $startOfMonth, 
                    $startOfMonth->copy()->endOfMonth()
                ])
                ->select('status', DB::raw('count(*) as count'))
                ->groupBy('status')
                ->get()
            ]
        ]);
    }

}
