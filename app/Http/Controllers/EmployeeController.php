<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use Illuminate\Http\Request;

class EmployeeController extends Controller
{
    public function search(Request $request)
    {
        $query = $request->input('query');
        
        $employees = Employee::where('employee_id', 'like', "%{$query}%")
            ->orWhere('first_name', 'like', "%{$query}%")
            ->orWhere('last_name', 'like', "%{$query}%")
            ->orWhere('department', 'like', "%{$query}%")
            ->orWhere('position', 'like', "%{$query}%")
            ->take(10)
            ->get();

        return response()->json($employees);
    }

    public function getAll()
    {
        $employees = Employee::with(['patient'])->get();
        return response()->json($employees);
    }

    public function getById($id)
    {
        
        $employee = Employee::with([
            'patient.medicalHistories',
            'patient.consultations.nurse',
            'patient.consultations.doctor',
            'patient.remarks',
            'patient.appointments',
            'patient.chronicConditions',
            'patient.allergies',
            'patient.immunizations'
        ])->findOrFail($id);

        return response()->json($employee);
    }
}
