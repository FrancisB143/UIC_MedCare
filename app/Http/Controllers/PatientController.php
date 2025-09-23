<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class PatientController extends Controller
{
    public function index()
    {
        // Medical staff can view patient list
        abort_if(!in_array(auth()->user()->role, ['doctor', 'nurse']), 403);

        $patients = Patient::with(['student', 'employee'])
            ->latest()
            ->paginate(10);

        return inertia('Patients/Index', [
            'patients' => $patients
        ]);
    }

    public function show(Patient $patient)
    {
        // Medical staff can view patient details
        abort_if(!in_array(auth()->user()->role, ['doctor', 'nurse']), 403);

        $patient->load([
            'medicalHistories',
            'consultations.nurse',
            'consultations.doctor',
            'remarks',
            'appointments',
            'chronicConditions',
            'allergies',
            'immunizations',
            'student',
            'employee'
        ]);

        return inertia('Patients/Show', [
            'patient' => $patient
        ]);
    }

    public function store(Request $request)
    {
        // Only nurses can create patient records
        abort_if(auth()->user()->role !== 'nurse', 403);

        $validated = $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'middle_initial' => 'nullable|string|max:1',
            'suffix' => 'nullable|string|max:10',
            'date_of_birth' => 'required|date',
            'age' => 'required|integer',
            'gender' => 'required|in:Male,Female,Other',
            'nationality' => 'required|string',
            'civil_status' => 'required|in:Single,Married,Divorced,Widowed',
            'address' => 'required|string',
            'contact_number' => 'required|string',
            'guardian_name' => 'required|string',
            'guardian_contact' => 'required|string',
            'blood_type' => 'required|string',
            'height' => 'required|string',
            'religion' => 'required|string',
            'eye_color' => 'required|string',
            'disabilities' => 'nullable|string',
            'genetic_conditions' => 'nullable|string',
            'type' => 'required|in:student,employee'
        ]);

        $patient = Patient::create($validated);

        // Create student or employee record
        if ($validated['type'] === 'student') {
            $patient->student()->create($request->validate([
                'course' => 'required|string'
            ]));
        } else {
            $patient->employee()->create($request->validate([
                'department' => 'required|string',
                'position' => 'required|string'
            ]));
        }

        return redirect()->route('patients.show', $patient)
            ->with('success', 'Patient record created successfully');
    }

    public function search(Request $request)
    {
        abort_if(!in_array(auth()->user()->role, ['doctor', 'nurse']), 403);

        $query = $request->input('query');
        
        $patients = Patient::where('first_name', 'like', "%{$query}%")
            ->orWhere('last_name', 'like', "%{$query}%")
            ->orWhere('contact_number', 'like', "%{$query}%")
            ->with(['student', 'employee'])
            ->take(10)
            ->get();

        return response()->json($patients);
    }

    public function quickInfo(Patient $patient)
    {
        abort_if(!in_array(auth()->user()->role, ['doctor', 'nurse']), 403);

        return response()->json([
            'basic_info' => $patient->only([
                'first_name', 'last_name', 'age', 'gender', 
                'blood_type', 'contact_number'
            ]),
            'latest_consultation' => $patient->consultations()
                ->latest()
                ->first(),
            'allergies' => $patient->allergies()->pluck('allergy'),
            'chronic_conditions' => $patient->chronicConditions()->pluck('condition')
        ]);
    }

    public function medicalSummary(Patient $patient)
    {
        abort_if(!in_array(auth()->user()->role, ['doctor', 'nurse']), 403);

        return response()->json([
            'consultations_count' => $patient->consultations()->count(),
            'latest_consultations' => $patient->consultations()
                ->with(['nurse', 'doctor'])
                ->latest()
                ->take(5)
                ->get(),
            'medical_histories' => $patient->medicalHistories()
                ->latest()
                ->get(),
            'immunizations' => $patient->immunizations()->get()
        ]);
    }

    public function statistics()
    {
        abort_if(!in_array(auth()->user()->role, ['doctor', 'nurse']), 403);

        $startOfWeek = now()->startOfWeek();
        
        return response()->json([
            'total_patients' => Patient::count(),
            'new_this_week' => Patient::where('created_at', '>=', $startOfWeek)->count(),
            'by_type' => [
                'students' => Patient::whereHas('student')->count(),
                'employees' => Patient::whereHas('employee')->count()
            ],
            'by_gender' => Patient::select('gender', DB::raw('count(*) as count'))
                ->groupBy('gender')
                ->get()
        ]);
    }
}
