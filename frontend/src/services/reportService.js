// frontend/src/services/reportService.js
import axios from '../api/axios';

const reportService = {
    // ================== REPORT OPTIONS ==================

    getReportOptions: async () => {
        try {
            const response = await axios.get('/office/reports/options');
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to fetch report options' };
        }
    },

    // ================== INTERNAL MARKS REPORTS ==================

    getInternalMarksReport: async (params) => {
        try {
            const queryParams = new URLSearchParams();

            if (params.semesterId) queryParams.append('semesterId', params.semesterId);
            if (params.examType) queryParams.append('examType', params.examType);
            if (params.division) queryParams.append('division', params.division);

            const response = await axios.get(`/office/reports/internal-marks?${queryParams.toString()}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to generate report' };
        }
    },

    downloadInternalMarksReport: async (params) => {
        try {
            const queryParams = new URLSearchParams();

            if (params.semesterId) queryParams.append('semesterId', params.semesterId);
            if (params.examType) queryParams.append('examType', params.examType);
            if (params.division) queryParams.append('division', params.division);

            const response = await axios.get(`/office/reports/internal-marks/download?${queryParams.toString()}`, {
                responseType: 'blob',
            });

            // Create blob URL and trigger download
            const blob = new Blob([response.data], {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            });

            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;

            // Generate filename
            const timestamp = new Date().toISOString().split('T')[0];
            const filename = `Internal_Marks_Report_${timestamp}.xlsx`;
            link.download = filename;

            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            return { message: 'Report downloaded successfully' };
        } catch (error) {
            throw error.response?.data || { message: 'Failed to download report' };
        }
    },

    // ================== HELPER FUNCTIONS ==================

    validateReportParams: (params) => {
        const errors = {};

        if (!params.semesterId) {
            errors.semesterId = 'Semester is required';
        }

        if (!params.examType) {
            errors.examType = 'Exam type is required';
        }

        return {
            isValid: Object.keys(errors).length === 0,
            errors
        };
    },

    formatReportData: (reportData) => {
        if (!reportData || !reportData.students) {
            return { students: [], statistics: {} };
        }

        return {
            ...reportData,
            students: reportData.students.map(student => ({
                ...student,
                percentageDisplay: `${student.percentage}%`,
                totalDisplay: `${student.totalObtained}/${student.totalMax}`
            }))
        };
    },

    getGradeFromPercentage: (percentage) => {
        if (percentage >= 90) return { grade: 'A+', color: 'text-green-600' };
        if (percentage >= 80) return { grade: 'A', color: 'text-green-500' };
        if (percentage >= 70) return { grade: 'B+', color: 'text-blue-600' };
        if (percentage >= 60) return { grade: 'B', color: 'text-blue-500' };
        if (percentage >= 50) return { grade: 'C+', color: 'text-yellow-600' };
        if (percentage >= 40) return { grade: 'C', color: 'text-yellow-500' };
        if (percentage >= 35) return { grade: 'D', color: 'text-orange-500' };
        return { grade: 'F', color: 'text-red-500' };
    }
};

export default reportService;