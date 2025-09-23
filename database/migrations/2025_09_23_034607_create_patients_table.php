<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('patients', function (Blueprint $table) {
            $table->id();
            $table->string('first_name');
            $table->string('last_name');
            $table->string('middle_initial')->nullable();
            $table->string('suffix')->nullable();
            $table->date('date_of_birth');
            $table->integer('age');
            $table->enum('gender', ['Male', 'Female', 'Other']);
            $table->string('nationality');
            $table->enum('civil_status', ['Single', 'Married', 'Divorced', 'Widowed']);
            $table->string('address');
            $table->string('contact_number');
            $table->string('guardian_name');
            $table->string('guardian_contact');
            $table->string('blood_type');
            $table->string('height');
            $table->string('religion');
            $table->string('eye_color');
            $table->string('disabilities')->nullable();
            $table->string('genetic_conditions')->nullable();
            $table->string('type'); // 'student' or 'employee'
            $table->timestamps();
            $table->timestamp('last_visit')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('patients');
    }
};
