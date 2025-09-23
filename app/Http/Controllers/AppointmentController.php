<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

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
    {
        // Only nurses can view appointments
        abort_if(auth()->user()->role !== 'nurse', 403);

        $appointments = auth()->user()->nurse->appointments()
            ->with('patient')
            ->latest()
            ->paginate(10);

        return inertia('Appointments/Index', [
            'appointments' => $appointments
        ]);
    }

    public function create()
    {
        // Only nurses can create appointments
        abort_if(auth()->user()->role !== 'nurse', 403);

        return inertia('Appointments/Create');
    }

    public function store(Request $request)
    {
        // Only nurses can create appointments
        abort_if(auth()->user()->role !== 'nurse', 403);

        $validated = $request->validate([
            'patient_id' => 'required|exists:patients,id',
            'schedule_date' => 'required|date|after:now',
            'reason' => 'required|string'
        ]);

        $appointment = auth()->user()->nurse->appointments()->create([
            'patient_id' => $validated['patient_id'],
            'schedule_date' => $validated['schedule_date'],
            'reason' => $validated['reason'],
            'status' => 'pending'
        ]);

        return redirect()->route('appointments.index')
            ->with('success', 'Appointment scheduled successfully');
    }

    public function update(Appointment $appointment, Request $request)
    {
        // Only nurses can update appointments
        abort_if(auth()->user()->role !== 'nurse', 403);

        $validated = $request->validate([
            'status' => 'required|in:completed,cancelled'
        ]);

        $appointment->update($validated);

        return back()->with('success', 'Appointment updated successfully');
    }

    public function destroy(Appointment $appointment)
    {
        // Only nurses can cancel appointments
        abort_if(auth()->user()->role !== 'nurse', 403);

        $appointment->update(['status' => 'cancelled']);

        return back()->with('success', 'Appointment cancelled successfully');
    }
}
