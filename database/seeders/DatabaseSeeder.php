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

        // Create test students with patients
        $student1 = \App\Models\Student::create([
            'student_number' => '2020-00001',
            'first_name' => 'John',
            'last_name' => 'Doe',
            'program' => 'BS Computer Science',
            'year_level' => '3rd Year',
            'section' => 'A',
            'contact_number' => '09123456789',
            'address' => 'Sample Address 1'
        ]);

        \App\Models\Patient::create([
            'first_name' => $student1->first_name,
            'last_name' => $student1->last_name,
            'date_of_birth' => '2000-01-01',
            'age' => 23,
            'gender' => 'Male',
            'nationality' => 'Filipino',
            'civil_status' => 'Single',
            'contact_number' => $student1->contact_number,
            'address' => $student1->address,
            'guardian_name' => 'Juan Doe',
            'guardian_contact' => '09123456788',
            'blood_type' => 'O+',
            'height' => '170 cm',
            'religion' => 'Catholic',
            'eye_color' => 'Brown',
            'type' => 'student',
            'student_id' => $student1->id
        ]);

        $student2 = \App\Models\Student::create([
            'student_number' => '2020-00002',
            'first_name' => 'Jane',
            'last_name' => 'Smith',
            'program' => 'BS Information Technology',
            'year_level' => '2nd Year',
            'section' => 'B',
            'contact_number' => '09987654321',
            'address' => 'Sample Address 2'
        ]);

        \App\Models\Patient::create([
            'first_name' => $student2->first_name,
            'last_name' => $student2->last_name,
            'date_of_birth' => '2001-01-01',
            'age' => 22,
            'gender' => 'Female',
            'nationality' => 'Filipino',
            'civil_status' => 'Single',
            'contact_number' => $student2->contact_number,
            'address' => $student2->address,
            'guardian_name' => 'Maria Smith',
            'guardian_contact' => '09987654320',
            'blood_type' => 'A+',
            'height' => '165 cm',
            'religion' => 'Catholic',
            'eye_color' => 'Brown',
            'type' => 'student',
            'student_id' => $student2->id
        ]);

        // Add 5 more students with patients
        $student3 = \App\Models\Student::create([
            'student_number' => '2021-00003',
            'first_name' => 'Michael',
            'last_name' => 'Brown',
            'program' => 'BS Engineering',
            'year_level' => '1st Year',
            'section' => 'A',
            'contact_number' => '09555666777',
            'address' => 'Davao City Address 3'
        ]);

        \App\Models\Patient::create([
            'first_name' => $student3->first_name,
            'last_name' => $student3->last_name,
            'date_of_birth' => '2002-03-15',
            'age' => 21,
            'gender' => 'Male',
            'nationality' => 'Filipino',
            'civil_status' => 'Single',
            'contact_number' => $student3->contact_number,
            'address' => $student3->address,
            'guardian_name' => 'Peter Brown',
            'guardian_contact' => '09555666776',
            'blood_type' => 'B+',
            'height' => '175 cm',
            'religion' => 'Christian',
            'eye_color' => 'Black',
            'type' => 'student',
            'student_id' => $student3->id
        ]);

        $student4 = \App\Models\Student::create([
            'student_number' => '2021-00004',
            'first_name' => 'Lisa',
            'last_name' => 'Garcia',
            'program' => 'BS Psychology',
            'year_level' => '3rd Year',
            'section' => 'C',
            'contact_number' => '09888999000',
            'address' => 'Tagum City Address 4'
        ]);

        \App\Models\Patient::create([
            'first_name' => $student4->first_name,
            'last_name' => $student4->last_name,
            'date_of_birth' => '2000-07-22',
            'age' => 23,
            'gender' => 'Female',
            'nationality' => 'Filipino',
            'civil_status' => 'Single',
            'contact_number' => $student4->contact_number,
            'address' => $student4->address,
            'guardian_name' => 'Carlos Garcia',
            'guardian_contact' => '09888999001',
            'blood_type' => 'AB+',
            'height' => '160 cm',
            'religion' => 'Catholic',
            'eye_color' => 'Brown',
            'type' => 'student',
            'student_id' => $student4->id
        ]);

        $student5 = \App\Models\Student::create([
            'student_number' => '2022-00005',
            'first_name' => 'David',
            'last_name' => 'Wilson',
            'program' => 'BS Business Administration',
            'year_level' => '2nd Year',
            'section' => 'B',
            'contact_number' => '09777888999',
            'address' => 'Mati City Address 5'
        ]);

        \App\Models\Patient::create([
            'first_name' => $student5->first_name,
            'last_name' => $student5->last_name,
            'date_of_birth' => '2001-11-10',
            'age' => 22,
            'gender' => 'Male',
            'nationality' => 'Filipino',
            'civil_status' => 'Single',
            'contact_number' => $student5->contact_number,
            'address' => $student5->address,
            'guardian_name' => 'Mark Wilson',
            'guardian_contact' => '09777888998',
            'blood_type' => 'O-',
            'height' => '168 cm',
            'religion' => 'Protestant',
            'eye_color' => 'Blue',
            'type' => 'student',
            'student_id' => $student5->id
        ]);

        $student6 = \App\Models\Student::create([
            'student_number' => '2022-00006',
            'first_name' => 'Emma',
            'last_name' => 'Martinez',
            'program' => 'BS Nursing',
            'year_level' => '4th Year',
            'section' => 'A',
            'contact_number' => '09666777888',
            'address' => 'Panabo City Address 6'
        ]);

        \App\Models\Patient::create([
            'first_name' => $student6->first_name,
            'last_name' => $student6->last_name,
            'date_of_birth' => '1999-12-05',
            'age' => 24,
            'gender' => 'Female',
            'nationality' => 'Filipino',
            'civil_status' => 'Single',
            'contact_number' => $student6->contact_number,
            'address' => $student6->address,
            'guardian_name' => 'Jose Martinez',
            'guardian_contact' => '09666777889',
            'blood_type' => 'A-',
            'height' => '162 cm',
            'religion' => 'Catholic',
            'eye_color' => 'Brown',
            'type' => 'student',
            'student_id' => $student6->id
        ]);

        $student7 = \App\Models\Student::create([
            'student_number' => '2023-00007',
            'first_name' => 'Alex',
            'last_name' => 'Thompson',
            'program' => 'BS Architecture',
            'year_level' => '1st Year',
            'section' => 'A',
            'contact_number' => '09555444333',
            'address' => 'Digos City Address 7'
        ]);

        \App\Models\Patient::create([
            'first_name' => $student7->first_name,
            'last_name' => $student7->last_name,
            'date_of_birth' => '2003-02-18',
            'age' => 20,
            'gender' => 'Male',
            'nationality' => 'Filipino',
            'civil_status' => 'Single',
            'contact_number' => $student7->contact_number,
            'address' => $student7->address,
            'guardian_name' => 'James Thompson',
            'guardian_contact' => '09555444334',
            'blood_type' => 'B-',
            'height' => '172 cm',
            'religion' => 'Catholic',
            'eye_color' => 'Green',
            'type' => 'student',
            'student_id' => $student7->id
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

        // Add 5 more employees
        \App\Models\Employee::create([
            'employee_id' => 'EMP003',
            'first_name' => 'Maria',
            'last_name' => 'Santos',
            'department' => 'Finance Department',
            'position' => 'Accountant',
            'contact_number' => '09333444555',
            'address' => 'Finance Office Address 3'
        ]);

        \App\Models\Employee::create([
            'employee_id' => 'EMP004',
            'first_name' => 'John',
            'last_name' => 'Cruz',
            'department' => 'Maintenance Department',
            'position' => 'Maintenance Supervisor',
            'contact_number' => '09222333444',
            'address' => 'Maintenance Building Address 4'
        ]);

        \App\Models\Employee::create([
            'employee_id' => 'EMP005',
            'first_name' => 'Ana',
            'last_name' => 'Reyes',
            'department' => 'Library Department',
            'position' => 'Librarian',
            'contact_number' => '09111000999',
            'address' => 'Library Building Address 5'
        ]);

        \App\Models\Employee::create([
            'employee_id' => 'EMP006',
            'first_name' => 'Carlos',
            'last_name' => 'Dela Cruz',
            'department' => 'Security Department',
            'position' => 'Security Guard',
            'contact_number' => '09000999888',
            'address' => 'Security Office Address 6'
        ]);

        \App\Models\Employee::create([
            'employee_id' => 'EMP007',
            'first_name' => 'Jennifer',
            'last_name' => 'Lopez',
            'department' => 'Registrar Office',
            'position' => 'Records Officer',
            'contact_number' => '09999888777',
            'address' => 'Registrar Building Address 7'
        ]);
    }
}
