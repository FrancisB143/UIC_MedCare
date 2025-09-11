// resources/js/data/mockData.ts
export interface Patient {
    id: string;
    name: string;
    age: number;
    gender: string;
    address: string;
    contact: string;
    lastVisit: string;
    medicalHistory: Array<{
        condition: string;
        diagnosed: string;
    }>;
    consultations: Array<{
        date: string;
        notes: string;
    }>;
    remarks: Array<{
        date: string;
        note: string;
    }>;
    additionalProfile: {
        lastName: string;
        firstName: string;
        middleInitial: string;
        suffix: string;
        dateOfBirth: string;
        nationality: string;
        civilStatus: string;
        address: string;
        guardianName: string;
        guardianContact: string;
        bloodType: string;
        height: string;
        religion: string;
        eyeColor: string;
        chronicConditions: string[];
        knownAllergies: string[];
        disabilities: string;
        immunizationHistory: string[];
        geneticConditions: string;
    };
}

export interface Student extends Patient {
    course: string;
    type: 'student';
}

export interface Employee extends Patient {
    department: string;
    position: string;
    type: 'employee';
}

// Combined mock data for both students and employees
export const mockPatients: Record<string, Student | Employee> = {
    // Students
    "1": {
        id: "1",
        name: "Juan Dela Cruz",
        age: 20,
        gender: "Male",
        course: "BSIT",
        address: "Fr Selga, Davao City",
        contact: "09123456789",
        lastVisit: "2025-08-01",
        medicalHistory: [
            { condition: "Asthma", diagnosed: "2023-01-15" },
            { condition: "Allergy to Penicillin", diagnosed: "2022-05-10" }
        ],
        consultations: [
            { date: "2025-08-01", notes: "Complained of headache and fatigue." },
            { date: "2025-07-15", notes: "Routine checkup, no issues found." }
        ],
        remarks: [
            { date: "2025-08-01", note: "Prescribed pain reliever." },
            { date: "2025-07-15", note: "Advised to drink more water." }
        ],
        additionalProfile: {
            lastName: "Dela Cruz",
            firstName: "Juan",
            middleInitial: "A",
            suffix: "Jr.",
            dateOfBirth: "2005-03-15",
            nationality: "Filipino",
            civilStatus: "Single",
            address: "Fr Selga, Davao City",
            guardianName: "Maria Dela Cruz",
            guardianContact: "09123456780",
            bloodType: "O+",
            height: "170 cm",
            religion: "Catholic",
            eyeColor: "Brown",
            chronicConditions: ["Asthma"],
            knownAllergies: ["Penicillin"],
            disabilities: "None",
            immunizationHistory: ["Hepatitis B", "MMR"],
            geneticConditions: "None"
        },
        type: "student"
    },
    "2": {
        id: "2",
        name: "Maria Santos",
        age: 19,
        gender: "Female",
        course: "BSN",
        address: "Toril, Davao City",
        contact: "09123456788",
        lastVisit: "2025-07-28",
        medicalHistory: [
            { condition: "Migraine", diagnosed: "2023-03-20" }
        ],
        consultations: [
            { date: "2025-07-28", notes: "Complained of severe headache." }
        ],
        remarks: [
            { date: "2025-07-28", note: "Prescribed migraine medication." }
        ],
        additionalProfile: {
            lastName: "Santos",
            firstName: "Maria",
            middleInitial: "B",
            suffix: "",
            dateOfBirth: "2006-07-20",
            nationality: "Filipino",
            civilStatus: "Single",
            address: "Toril, Davao City",
            guardianName: "Roberto Santos",
            guardianContact: "09123456781",
            bloodType: "A+",
            height: "160 cm",
            religion: "Born Again Christian",
            eyeColor: "Black",
            chronicConditions: ["Migraine"],
            knownAllergies: [],
            disabilities: "None",
            immunizationHistory: ["Hepatitis B", "Varicella"],
            geneticConditions: "None"
        },
        type: "student"
    },
    // Employees
    "3": {
        id: "3",
        name: "Dr. Roberto Garcia",
        age: 45,
        gender: "Male",
        department: "Medical Department",
        position: "Chief Medical Officer",
        address: "Bajada, Davao City",
        contact: "09123456787",
        lastVisit: "2025-06-15",
        medicalHistory: [
            { condition: "Hypertension", diagnosed: "2020-01-10" }
        ],
        consultations: [
            { date: "2025-06-15", notes: "Annual checkup, blood pressure slightly elevated." }
        ],
        remarks: [
            { date: "2025-06-15", note: "Advised to reduce salt intake and exercise regularly." }
        ],
        additionalProfile: {
            lastName: "Garcia",
            firstName: "Roberto",
            middleInitial: "M",
            suffix: "",
            dateOfBirth: "1978-12-05",
            nationality: "Filipino",
            civilStatus: "Married",
            address: "Bajada, Davao City",
            guardianName: "Elena Garcia",
            guardianContact: "09123456782",
            bloodType: "B+",
            height: "175 cm",
            religion: "Catholic",
            eyeColor: "Brown",
            chronicConditions: ["Hypertension"],
            knownAllergies: [],
            disabilities: "None",
            immunizationHistory: ["Hepatitis B", "Influenza"],
            geneticConditions: "None"
        },
        type: "employee"
    },
    "4": {
        id: "4",
        name: "Ana Reyes",
        age: 38,
        gender: "Female",
        department: "Administration",
        position: "HR Manager",
        address: "Matina, Davao City",
        contact: "09123456786",
        lastVisit: "2025-07-10",
        medicalHistory: [],
        consultations: [
            { date: "2025-07-10", notes: "Routine checkup for work clearance." }
        ],
        remarks: [
            { date: "2025-07-10", note: "All vitals normal, fit for work." }
        ],
        additionalProfile: {
            lastName: "Reyes",
            firstName: "Ana",
            middleInitial: "C",
            suffix: "",
            dateOfBirth: "1985-03-12",
            nationality: "Filipino",
            civilStatus: "Married",
            address: "Matina, Davao City",
            guardianName: "Carlos Reyes",
            guardianContact: "09123456783",
            bloodType: "AB+",
            height: "165 cm",
            religion: "Catholic",
            eyeColor: "Black",
            chronicConditions: [],
            knownAllergies: ["Shellfish"],
            disabilities: "None",
            immunizationHistory: ["Hepatitis B", "MMR", "Varicella"],
            geneticConditions: "None"
        },
        type: "employee"
    }
};

// Helper functions
export const getPatientById = (id: string): Student | Employee | undefined => {
    return mockPatients[id];
};

export const getStudents = (): Student[] => {
    return Object.values(mockPatients).filter(patient => patient.type === 'student') as Student[];
};

export const getEmployees = (): Employee[] => {
    return Object.values(mockPatients).filter(patient => patient.type === 'employee') as Employee[];
};

// Function to add consultation to a patient
export const addConsultation = (patientId: string, consultation: { date: string; notes: string }) => {
    if (mockPatients[patientId]) {
        mockPatients[patientId].consultations.push(consultation);
    }
};

// Function to add remark to a patient
export const addRemark = (patientId: string, remark: { date: string; note: string }) => {
    if (mockPatients[patientId]) {
        mockPatients[patientId].remarks.push(remark);
    }
};