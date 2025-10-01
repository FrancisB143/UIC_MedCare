<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Student extends Model
{
    protected $fillable = [
        'student_number',
        'first_name',
        'last_name',
        'program',
        'year_level',
        'section',
        'contact_number',
        'address'
    ];

    public function patient()
    {
        return $this->hasOne(Patient::class);
    }
}
