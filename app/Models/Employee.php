<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Employee extends Model
{
    protected $fillable = [
        'employee_id',
        'first_name',
        'last_name',
        'department',
        'position',
        'contact_number',
        'address'
    ];

    public function patient()
    {
        return $this->hasOne(Patient::class);
    }
}
