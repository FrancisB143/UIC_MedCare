<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create a test doctor user
        User::factory()->create([
            'name' => 'Dr. Test User',
            'email' => 'doctor@example.com',
            'password' => bcrypt('password'),
            'role' => 'doctor'
        ]);

        // Create test students
        \App\Models\Student::create([
            'student_number' => '2020-00001',
            'first_name' => 'John',
            'last_name' => 'Doe',
            'program' => 'BS Computer Science',
            'year_level' => '3rd Year',
            'section' => 'A',
            'contact_number' => '09123456789',
            'address' => 'Sample Address 1'
        ]);

        \App\Models\Student::create([
            'student_number' => '2020-00002',
            'first_name' => 'Jane',
            'last_name' => 'Smith',
            'program' => 'BS Information Technology',
            'year_level' => '2nd Year',
            'section' => 'B',
            'contact_number' => '09987654321',
            'address' => 'Sample Address 2'
        ]);

        // Create test employees
        \App\Models\Employee::create([
            'employee_id' => 'EMP001',
            'first_name' => 'Robert',
            'last_name' => 'Johnson',
            'department' => 'IT Department',
            'position' => 'System Administrator',
            'contact_number' => '09111222333',
            'address' => 'Employee Address 1'
        ]);

        \App\Models\Employee::create([
            'employee_id' => 'EMP002',
            'first_name' => 'Sarah',
            'last_name' => 'Williams',
            'department' => 'HR Department',
            'position' => 'HR Manager',
            'contact_number' => '09444555666',
            'address' => 'Employee Address 2'
        ]);
    }
}
