<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class ConsultationController extends Controller
{
    public function index()
    {
        abort_if(!in_array(auth()->user()->role, ['doctor', 'nurse']), 403);
        
        $user = auth()->user();
        $consultations = null;

        if ($user->role === 'nurse') {
            $consultations = $user->nurse->consultations()
                ->with(['patient', 'doctor'])
                ->latest()
                ->paginate(10);
        } elseif ($user->role === 'doctor') {
            $consultations = $user->doctor->consultations()
                ->with(['patient', 'nurse'])
                ->latest()
                ->paginate(10);
        }

        return inertia('Consultations/Index', [
            'consultations' => $consultations
        ]);
    }

    public function create()
    {
        // Only nurses can create new consultations
        abort_if(auth()->user()->role !== 'nurse', 403);

        return inertia('Consultations/Create');
    }

    public function store(Request $request)
    {
        // Validate nurse role
        abort_if(auth()->user()->role !== 'nurse', 403);

        $validated = $request->validate([
            'patient_id' => 'required|exists:patients,id',
            'vital_signs' => 'required|array',
            'patient_concerns' => 'required|string',
            'nurse_remarks' => 'required|string',
            'consultation_type' => 'required|in:regular,referred'
        ]);

        $consultation = auth()->user()->nurse->consultations()->create([
            'patient_id' => $validated['patient_id'],
            'consultation_type' => $validated['consultation_type'],
            'vital_signs' => $validated['vital_signs'],
            'patient_concerns' => $validated['patient_concerns'],
            'nurse_remarks' => $validated['nurse_remarks'],
            'status' => 'pending'
        ]);

        // Create medical history record
        $consultation->medicalHistory()->create([
            'patient_id' => $validated['patient_id'],
            'notes' => $validated['nurse_remarks']
        ]);

        return redirect()->route('consultations.show', $consultation)
            ->with('success', 'Consultation created successfully');
    }

    public function show(Consultation $consultation)
    {
        // Load relationships
        $consultation->load(['patient', 'nurse', 'doctor', 'medicalHistory']);

        return inertia('Consultations/Show', [
            'consultation' => $consultation
        ]);
    }

    public function refer(Consultation $consultation, Request $request)
    {
        // Only nurses can refer consultations
        abort_if(auth()->user()->role !== 'nurse', 403);
        
        $validated = $request->validate([
            'doctor_id' => 'required|exists:doctors,id',
            'nurse_remarks' => 'required|string'
        ]);

        $consultation->update([
            'doctor_id' => $validated['doctor_id'],
            'consultation_type' => 'referred',
            'nurse_remarks' => $validated['nurse_remarks']
        ]);

        return back()->with('success', 'Consultation referred to doctor successfully');
    }

    public function addDoctorRemarks(Consultation $consultation, Request $request)
    {
        // Only doctors can add remarks
        abort_if(auth()->user()->role !== 'doctor', 403);
        
        $validated = $request->validate([
            'doctor_remarks' => 'required|string'
        ]);

        $consultation->update([
            'doctor_remarks' => $validated['doctor_remarks'],
            'status' => 'completed'
        ]);

        return back()->with('success', 'Doctor remarks added successfully');
    }
}
