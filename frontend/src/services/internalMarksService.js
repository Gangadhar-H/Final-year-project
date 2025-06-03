// src/services/internalMarksService.js
import API from '../api/axios.js';

// Add Internal Marks
export const addInternalMarks = (subjectId, marksData) =>
    API.post(`/teacher/subjects/${subjectId}/internal-marks`, marksData)
        .then(res => res.data);

// Get Internal Marks
export const getInternalMarks = (subjectId, params = {}) =>
    API.get(`/teacher/subjects/${subjectId}/internal-marks`, { params })
        .then(res => res.data);

// Update Internal Marks
export const updateInternalMarks = (markId, marksData) =>
    API.put(`/teacher/internal-marks/${markId}`, marksData)
        .then(res => res.data);

// Delete Internal Marks
export const deleteInternalMarks = (markId) =>
    API.delete(`/teacher/internal-marks/${markId}`)
        .then(res => res.data);

// Get Student Performance Summary
export const getStudentPerformanceSummary = (subjectId, params) =>
    API.get(`/teacher/subjects/${subjectId}/student-performance`, { params })
        .then(res => res.data);

// Helper Functions
export const validateMarksData = (marksData) => {
    const errors = [];

    if (!marksData.division) {
        errors.push('Division is required');
    }

    if (!marksData.examType) {
        errors.push('Exam type is required');
    }

    if (!marksData.maxMarks || marksData.maxMarks <= 0) {
        errors.push('Valid maximum marks are required');
    }

    if (!marksData.examDate) {
        errors.push('Exam date is required');
    }

    if (!marksData.marksData || !Array.isArray(marksData.marksData)) {
        errors.push('Marks data must be an array');
    } else if (marksData.marksData.length === 0) {
        errors.push('At least one student mark is required');
    } else {
        marksData.marksData.forEach((mark, index) => {
            if (!mark.studentId) {
                errors.push(`Student ID is required for record ${index + 1}`);
            }
            if (mark.obtainedMarks === undefined || mark.obtainedMarks === null) {
                errors.push(`Obtained marks are required for record ${index + 1}`);
            }
            if (mark.obtainedMarks < 0) {
                errors.push(`Obtained marks cannot be negative for record ${index + 1}`);
            }
            if (mark.obtainedMarks > marksData.maxMarks) {
                errors.push(`Obtained marks cannot exceed maximum marks for record ${index + 1}`);
            }
        });
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};

export const calculateGrade = (obtainedMarks, maxMarks) => {
    const percentage = (obtainedMarks / maxMarks) * 100;

    if (percentage >= 90) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B+';
    if (percentage >= 60) return 'B';
    if (percentage >= 50) return 'C';
    if (percentage >= 40) return 'D';
    return 'F';
};

export const calculatePercentage = (obtainedMarks, maxMarks) => {
    return ((obtainedMarks / maxMarks) * 100).toFixed(2);
};

export const formatMarksForDisplay = (marks) => {
    return marks.map(mark => ({
        ...mark,
        percentage: calculatePercentage(mark.obtainedMarks, mark.maxMarks),
        grade: calculateGrade(mark.obtainedMarks, mark.maxMarks),
        formattedDate: new Date(mark.examDate).toLocaleDateString('en-IN')
    }));
};

// Check for duplicate exam types
export const checkDuplicateExamType = async (subjectId, division, examType, excludeMarkId = null) => {
    try {
        const response = await getInternalMarks(subjectId, { division, examType });
        const existingMarks = response.marks || [];

        if (excludeMarkId) {
            return existingMarks.some(mark => mark._id !== excludeMarkId);
        }

        return existingMarks.length > 0;
    } catch (error) {
        console.error('Error checking duplicate exam type:', error);
        return false;
    }
};

export const handleApiError = (error) => {
    if (error.response) {
        return {
            message: error.response.data?.message || 'An error occurred',
            status: error.response.status,
            data: error.response.data
        };
    } else if (error.request) {
        return {
            message: 'Network error. Please check your connection.',
            status: 0,
            data: null
        };
    } else {
        return {
            message: error.message || 'An unexpected error occurred',
            status: 0,
            data: null
        };
    }
};