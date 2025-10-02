<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Patient extends Model
{
    protected $fillable = [
        'first_name',
        'last_name',
        'middle_initial',
        'suffix',
        'date_of_birth',
        'age',
        'gender',
        'nationality',
        'civil_status',
        'address',
        'contact_number',
        'guardian_name',
        'guardian_contact',
        'blood_type',
        'height',
        'religion',
        'eye_color',
        'disabilities',
        'genetic_conditions',
        'type',
        'user_id',
        'student_id',
        'employee_id'
    ];

    // Relationships
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function medicalHistories()
    {
        return $this->hasMany(MedicalHistory::class);
    }

    public function consultations()
    {
        return $this->hasMany(Consultation::class);
    }

    public function remarks()
    {
        return $this->hasMany(Remark::class);
    }

    public function appointments()
    {
        return $this->hasMany(Appointment::class);
    }

    public function chronicConditions()
    {
        return $this->hasMany(ChronicCondition::class);
    }

    public function allergies()
    {
        return $this->hasMany(Allergy::class);
    }

    public function immunizations()
    {
        return $this->hasMany(Immunization::class);
    }

    public function student()
    {
        return $this->belongsTo(Student::class);
    }

    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }
}
