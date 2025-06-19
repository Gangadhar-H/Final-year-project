import axios from '../api/axios';

const officeService = {
    // ================== AUTHENTICATION ==================

    login: async (credentials) => {
        try {
            const response = await axios.post('/office/login', credentials);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Login failed' };
        }
    },

    logout: async () => {
        try {
            const response = await axios.post('/office/logout');
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Logout failed' };
        }
    },

    // ================== PROFILE MANAGEMENT ==================

    getProfile: async () => {
        try {
            const response = await axios.get('/office/profile');
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to fetch profile' };
        }
    },

    updateProfile: async (profileData) => {
        try {
            const response = await axios.put('/office/profile', profileData);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Profile update failed' };
        }
    },

    changePassword: async (passwordData) => {
        try {
            const response = await axios.post('/office/change-password', passwordData);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Password change failed' };
        }
    },

    // ================== DASHBOARD ==================

    getDashboard: async () => {
        try {
            const response = await axios.get('/office/dashboard');
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to fetch dashboard data' };
        }
    },

    // ================== STUDENT MANAGEMENT ==================

    // Get all students with pagination and filters
    getStudents: async (params = {}) => {
        try {
            const queryParams = new URLSearchParams();

            if (params.page) queryParams.append('page', params.page);
            if (params.limit) queryParams.append('limit', params.limit);
            if (params.semester) queryParams.append('semester', params.semester);
            if (params.division) queryParams.append('division', params.division);
            if (params.search) queryParams.append('search', params.search);

            const response = await axios.get(`/office/students?${queryParams.toString()}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to fetch students' };
        }
    },

    // Get single student by ID
    getStudent: async (studentId) => {
        try {
            const response = await axios.get(`/office/students/${studentId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to fetch student details' };
        }
    },

    // Add single student
    addStudent: async (studentData) => {
        try {
            const response = await axios.post('/office/students', studentData);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to add student' };
        }
    },

    // Update student
    updateStudent: async (studentId, studentData) => {
        try {
            const response = await axios.put(`/office/students/${studentId}`, studentData);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to update student' };
        }
    },

    // Delete student
    deleteStudent: async (studentId) => {
        try {
            const response = await axios.delete(`/office/students/${studentId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to delete student' };
        }
    },

    // Bulk upload students
    bulkUploadStudents: async (file, onUploadProgress) => {
        try {
            const formData = new FormData();
            formData.append('excelFile', file);

            const response = await axios.post('/office/students/bulk-upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                onUploadProgress: (progressEvent) => {
                    if (onUploadProgress) {
                        const percentCompleted = Math.round(
                            (progressEvent.loaded * 100) / progressEvent.total
                        );
                        onUploadProgress(percentCompleted);
                    }
                },
            });

            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Bulk upload failed' };
        }
    },

    // Download student template
    downloadStudentTemplate: async () => {
        try {
            const response = await axios.get('/office/students/download-template', {
                responseType: 'blob',
            });

            // Create blob URL and trigger download
            const blob = new Blob([response.data], {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            });

            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'student_upload_template.xlsx';
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            return { message: 'Template downloaded successfully' };
        } catch (error) {
            throw error.response?.data || { message: 'Failed to download template' };
        }
    },

    // ================== UTILITY FUNCTIONS ==================

    // Get all semesters
    getSemesters: async () => {
        try {
            const response = await axios.get('/office/semesters');
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to fetch semesters' };
        }
    },

    // ================== HELPER FUNCTIONS ==================

    // Format student data for display
    formatStudentData: (student) => {
        return {
            ...student,
            semesterText: student.semester?.semesterNumber
                ? `Semester ${student.semester.semesterNumber}`
                : 'N/A',
            displayName: `${student.name} (${student.uucmsNo})`,
            formattedEmail: student.email.toLowerCase(),
            createdDate: student.createdAt
                ? new Date(student.createdAt).toLocaleDateString()
                : 'N/A'
        };
    },

    // Validate student data before submission
    validateStudentData: (studentData) => {
        const errors = {};

        if (!studentData.name?.trim()) {
            errors.name = 'Name is required';
        }

        if (!studentData.uucmsNo?.trim()) {
            errors.uucmsNo = 'UUCMS Number is required';
        } else if (!/^[A-Za-z0-9]+$/.test(studentData.uucmsNo)) {
            errors.uucmsNo = 'UUCMS Number should contain only letters and numbers';
        }

        if (!studentData.email?.trim()) {
            errors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(studentData.email)) {
            errors.email = 'Please enter a valid email address';
        }

        if (!studentData.semesterId) {
            errors.semesterId = 'Semester is required';
        }

        if (!studentData.division?.trim()) {
            errors.division = 'Division is required';
        }

        return {
            isValid: Object.keys(errors).length === 0,
            errors
        };
    },

    // Process bulk upload results
    processBulkUploadResults: (results) => {
        const { summary, results: uploadResults } = results;

        return {
            summary,
            successful: uploadResults.success || [],
            errors: uploadResults.errors || [],
            duplicates: uploadResults.duplicates || [],
            hasErrors: (uploadResults.errors?.length > 0) || (uploadResults.duplicates?.length > 0)
        };
    }
};

export default officeService;