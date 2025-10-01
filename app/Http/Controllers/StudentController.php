<?php

namespace App\Http\Controllers;

use App\Models\Student;
use Illuminate\Http\Request;

class StudentController extends Controller
{
    public function index()
    {
        $students = Student::with(['patient'])
            ->latest()
            ->paginate(10);

        return inertia('Students/Index', [
            'students' => $students
        ]);
    }

    public function show(Student $student)
    {
        $student->load(['patient.medicalHistories', 'patient.consultations']);
        return inertia('Students/Show', [
            'student' => $student
        ]);
    }

    public function search(Request $request)
    {
        \Log::info('Student search called with query: ' . $request->input('query'));

        $query = $request->input('query');
        
        $query_builder = Student::where('student_number', 'like', "%{$query}%")
            ->orWhere('first_name', 'like', "%{$query}%")
            ->orWhere('last_name', 'like', "%{$query}%")
            ->orWhere('program', 'like', "%{$query}%")
            ->orWhere('year_level', 'like', "%{$query}%")
            ->with(['patient']);
            
        \Log::info('SQL Query: ' . $query_builder->toSql());
        
        $students = $query_builder->take(10)->get();
            
        \Log::info('Student search results: ' . count($students));

        return response()->json($students);
    }

    public function getAll()
    {
        abort_if(!in_array(auth()->user()->role, ['doctor', 'nurse']), 403);
        
        $students = Student::with(['patient'])->get();
        return response()->json($students);
    }

    public function getById($id)
    {
        abort_if(!in_array(auth()->user()->role, ['doctor', 'nurse']), 403);
        
        $student = Student::with([
            'patient.medicalHistories',
            'patient.consultations.nurse',
            'patient.consultations.doctor',
            'patient.remarks',
            'patient.appointments',
            'patient.chronicConditions',
            'patient.allergies',
            'patient.immunizations'
        ])->findOrFail($id);

        return response()->json($student);
    }
}
