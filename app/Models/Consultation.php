<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Consultation extends Model
{
    protected $fillable = [
        'patient_id',
        'nurse_id',
        'doctor_id',      // nullable, only if referred to doctor
        'consultation_type',  // 'regular', 'referred'
        'vital_signs',
        'patient_concerns',
        'nurse_remarks',
        'doctor_remarks',  // nullable
        'status',         // 'pending', 'completed'
        'created_at'
    ];

    // Relationships
    public function patient()
    {
        return $this->belongsTo(Patient::class);
    }

    public function nurse()
    {
        return $this->belongsTo(Nurse::class);
    }

    public function doctor()
    {
        return $this->belongsTo(Doctor::class);
    }

    public function medicalHistory()
    {
        return $this->hasOne(MedicalHistory::class);
    }
}
