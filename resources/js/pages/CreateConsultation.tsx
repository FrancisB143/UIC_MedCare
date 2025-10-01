import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import SearchBox from '../components/search/SearchBox';

interface Patient {
  id: number;
  first_name: string;
  last_name: string;
  type: 'student' | 'employee';
  student?: {
    student_number: string;
    program: string;
    year_level: string;
  };
  employee?: {
    employee_id: string;
    department: string;
    position: string;
  };
}

export default function CreateConsultation() {
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [searchType, setSearchType] = useState<'student' | 'employee'>('student');

  const handlePatientSelect = (result: any) => {
    setSelectedPatient({
      ...result,
      type: searchType
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) return;

    router.post('/consultations', {
      patient_id: selectedPatient.id,
      // Add other consultation data here
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Create New Consultation</h1>

      <div className="mb-6">
        <div className="flex space-x-4 mb-4">
          <button
            className={`px-4 py-2 rounded ${
              searchType === 'student'
                ? 'bg-[#A3386C] text-white'
                : 'bg-gray-200'
            }`}
            onClick={() => setSearchType('student')}
          >
            Student
          </button>
          <button
            className={`px-4 py-2 rounded ${
              searchType === 'employee'
                ? 'bg-[#A3386C] text-white'
                : 'bg-gray-200'
            }`}
            onClick={() => setSearchType('employee')}
          >
            Employee
          </button>
        </div>

        <SearchBox
          type={searchType}
          onSelect={handlePatientSelect}
          placeholder={`Search ${searchType}...`}
        />
      </div>

      {selectedPatient && (
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">Selected Patient</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600">Name</p>
              <p className="font-medium">{`${selectedPatient.first_name} ${selectedPatient.last_name}`}</p>
            </div>
            <div>
              <p className="text-gray-600">Type</p>
              <p className="font-medium capitalize">{selectedPatient.type}</p>
            </div>
            {selectedPatient.type === 'student' && selectedPatient.student && (
              <>
                <div>
                  <p className="text-gray-600">Student Number</p>
                  <p className="font-medium">{selectedPatient.student.student_number}</p>
                </div>
                <div>
                  <p className="text-gray-600">Program</p>
                  <p className="font-medium">{selectedPatient.student.program}</p>
                </div>
                <div>
                  <p className="text-gray-600">Year Level</p>
                  <p className="font-medium">{selectedPatient.student.year_level}</p>
                </div>
              </>
            )}
            {selectedPatient.type === 'employee' && selectedPatient.employee && (
              <>
                <div>
                  <p className="text-gray-600">Employee ID</p>
                  <p className="font-medium">{selectedPatient.employee.employee_id}</p>
                </div>
                <div>
                  <p className="text-gray-600">Department</p>
                  <p className="font-medium">{selectedPatient.employee.department}</p>
                </div>
                <div>
                  <p className="text-gray-600">Position</p>
                  <p className="font-medium">{selectedPatient.employee.position}</p>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Add consultation form here */}
      <form onSubmit={handleSubmit}>
        {/* Add consultation fields here */}
        <button
          type="submit"
          className="bg-[#A3386C] text-white px-6 py-2 rounded hover:bg-[#8E2D5C] disabled:bg-gray-400"
          disabled={!selectedPatient}
        >
          Create Consultation
        </button>
      </form>
    </div>
  );
}
