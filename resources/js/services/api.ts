import axios from 'axios';

export interface Student {
    id: number;
    student_number: string;
    first_name: string;
    last_name: string;
    program: string;
    year_level: string;
    section: string;
    patient?: any;
}

export interface Employee {
    id: number;
    employee_id: string;
    first_name: string;
    last_name: string;
    department: string;
    position: string;
    patient?: any;
}

const api = {
    students: {
        search: async (query: string) => {
            const response = await axios.get('/api/students/search', { params: { query } });
            return response.data;
        },
        getAll: async () => {
            const response = await axios.get('/api/students');
            return response.data;
        },
        getById: async (id: number) => {
            const response = await axios.get(`/api/students/${id}`);
            return response.data;
        }
    },
    employees: {
        search: async (query: string) => {
            const response = await axios.get('/api/employees/search', { params: { query } });
            return response.data;
        },
        getAll: async () => {
            const response = await axios.get('/api/employees');
            return response.data;
        },
        getById: async (id: number) => {
            const response = await axios.get(`/api/employees/${id}`);
            return response.data;
        }
    },
    consultations: {
        create: async (data: any) => {
            const response = await axios.post('/api/consultations', data);
            return response.data;
        },
        getById: async (id: number) => {
            const response = await axios.get(`/api/consultations/${id}`);
            return response.data;
        },
        addRemark: async (consultationId: number, data: any) => {
            const response = await axios.post(`/api/consultations/${consultationId}/remarks`, data);
            return response.data;
        }
    }
};

export default api;
