// src/services/studentService.js
import API from '../api/axios';

class StudentService {
    // Authentication
    async login(credentials) {
        try {
            const response = await API.post('/student/login', credentials);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    }

    async logout() {
        try {
            const response = await API.post('/student/logout');
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    }

    // Dashboard
    async getDashboard() {
        try {
            const response = await API.get('/student/dashboard');
            console.log(response);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    }

    // Profile
    async getProfile() {
        try {
            const response = await API.get('/student/profile');
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    }

    async updateProfile(profileData) {
        try {
            const response = await API.put('/student/profile', profileData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    }

    // Subjects
    async getSubjects() {
        try {
            const response = await API.get('/student/subjects');
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    }

    // Attendance
    async getAttendance(filters = {}) {
        try {
            const params = new URLSearchParams();
            if (filters.subjectId) params.append('subjectId', filters.subjectId);
            if (filters.startDate) params.append('startDate', filters.startDate);
            if (filters.endDate) params.append('endDate', filters.endDate);

            const response = await API.get(`/student/attendance?${params.toString()}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    }

    // Internal Marks
    async getInternalMarks(filters = {}) {
        try {
            const params = new URLSearchParams();
            if (filters.subjectId) params.append('subjectId', filters.subjectId);
            if (filters.examType) params.append('examType', filters.examType);

            const response = await API.get(`/student/internal-marks?${params.toString()}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    }
}

const studentService = new StudentService();
export default studentService;