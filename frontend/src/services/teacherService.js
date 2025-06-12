// src/services/teacherService.js
import API from '../api/axios.js';

// Authentication Services
export const loginTeacher = (credentials) =>
    API.post('/teacher/login', credentials)
        .then(res => res.data);

export const logoutTeacher = () =>
    API.post('/teacher/logout')
        .then(res => res.data);

// Profile Services
export const getTeacherProfile = () =>
    API.get('/teacher/profile')
        .then(res => res.data);

export const updateTeacherProfile = (profileData) =>
    API.put('/teacher/profile', profileData)
        .then(res => res.data);

export const changeTeacherPassword = (passwordData) =>
    API.post('/teacher/change-password', passwordData)
        .then(res => res.data);

// Subject Services
export const getAssignedSubjects = () =>
    API.get('/teacher/assigned-subjects')
        .then(res => res.data);

// Attendance Services
export const getStudentsForAttendance = (subjectId, division) =>
    API.get(`/teacher/subjects/${subjectId}/students`, {
        params: { division }
    }).then(res => res.data);

export const markAttendance = (subjectId, attendanceData) =>
    API.post(`/teacher/subjects/${subjectId}/attendance`, attendanceData)
        .then(res => res.data);

export const getAttendance = (subjectId, params = {}) =>
    API.get(`/teacher/subjects/${subjectId}/attendance`, { params })
        .then(res => res.data);

// Attendance Helper Functions
export const getAttendanceByDate = (subjectId, date, division = null) => {
    const params = { date };
    if (division) params.division = division;

    return getAttendance(subjectId, params);
};

export const getAttendanceByDateRange = (subjectId, startDate, endDate, division = null) => {
    const params = { startDate, endDate };
    if (division) params.division = division;

    return getAttendance(subjectId, params);
};

export const getAttendanceByDivision = (subjectId, division) => {
    return getAttendance(subjectId, { division });
};

// Utility Functions for Attendance Data Processing
export const calculateAttendanceStats = (attendanceRecords) => {
    if (!attendanceRecords || attendanceRecords.length === 0) {
        return {
            totalClasses: 0,
            totalStudents: 0,
            overallAttendanceRate: 0,
            averageAttendance: 0
        };
    }

    let totalClasses = attendanceRecords.length;
    let totalStudentRecords = 0;
    let totalPresentRecords = 0;

    attendanceRecords.forEach(record => {
        totalStudentRecords += record.attendanceRecords.length;
        totalPresentRecords += record.attendanceRecords.filter(
            student => student.status === 'present'
        ).length;
    });

    const overallAttendanceRate = totalStudentRecords > 0
        ? (totalPresentRecords / totalStudentRecords) * 100
        : 0;

    const averageStudentsPerClass = totalStudentRecords / totalClasses;

    return {
        totalClasses,
        totalStudents: Math.round(averageStudentsPerClass),
        overallAttendanceRate: Math.round(overallAttendanceRate * 100) / 100,
        averageAttendance: Math.round(overallAttendanceRate * 100) / 100,
        totalPresentRecords,
        totalStudentRecords
    };
};

export const getStudentAttendanceStats = (attendanceRecords, studentId) => {
    if (!attendanceRecords || attendanceRecords.length === 0) {
        return {
            totalClasses: 0,
            classesAttended: 0,
            attendancePercentage: 0
        };
    }

    let totalClasses = 0;
    let classesAttended = 0;

    attendanceRecords.forEach(record => {
        const studentRecord = record.attendanceRecords.find(
            student => student.student._id === studentId || student.student === studentId
        );

        if (studentRecord) {
            totalClasses++;
            if (studentRecord.status === 'present') {
                classesAttended++;
            }
        }
    });

    const attendancePercentage = totalClasses > 0
        ? (classesAttended / totalClasses) * 100
        : 0;

    return {
        totalClasses,
        classesAttended,
        attendancePercentage: Math.round(attendancePercentage * 100) / 100
    };
};

export const formatAttendanceForDisplay = (attendanceRecords) => {
    return attendanceRecords.map(record => ({
        ...record,
        formattedDate: new Date(record.date).toLocaleDateString('en-IN'),
        presentCount: record.attendanceRecords.filter(student => student.status === 'present').length,
        absentCount: record.attendanceRecords.filter(student => student.status === 'absent').length,
        totalStudents: record.attendanceRecords.length,
        attendancePercentage: record.attendanceRecords.length > 0
            ? Math.round((record.attendanceRecords.filter(student => student.status === 'present').length / record.attendanceRecords.length) * 100)
            : 0
    }));
};

// Marks Services
export const getStudentsForMarks = (subjectId, division) =>
    API.get(`/teacher/subjects/${subjectId}/students`, {
        params: { division }
    }).then(res => res.data);

// Error Handling Wrapper
export const handleApiError = (error) => {
    if (error.response) {
        // Server responded with error status
        return {
            message: error.response.data?.message || 'An error occurred',
            status: error.response.status,
            data: error.response.data
        };
    } else if (error.request) {
        // Request was made but no response received
        return {
            message: 'Network error. Please check your connection.',
            status: 0,
            data: null
        };
    } else {
        // Something else happened
        return {
            message: error.message || 'An unexpected error occurred',
            status: 0,
            data: null
        };
    }
};

// Batch Operations
export const markMultipleAttendance = async (attendanceDataArray) => {
    try {
        const promises = attendanceDataArray.map(({ subjectId, attendanceData }) =>
            markAttendance(subjectId, attendanceData)
        );

        const results = await Promise.all(promises);
        return {
            success: true,
            results,
            message: 'All attendance records marked successfully'
        };
    } catch (error) {
        throw handleApiError(error);
    }
};

// Data Validation Functions
export const validateAttendanceData = (attendanceData) => {
    const errors = [];

    if (!attendanceData.division) {
        errors.push('Division is required');
    }

    if (!attendanceData.attendanceData || !Array.isArray(attendanceData.attendanceData)) {
        errors.push('Attendance data must be an array');
    } else if (attendanceData.attendanceData.length === 0) {
        errors.push('At least one student attendance record is required');
    } else {
        attendanceData.attendanceData.forEach((record, index) => {
            if (!record.studentId) {
                errors.push(`Student ID is required for record ${index + 1}`);
            }
            if (!['present', 'absent'].includes(record.status)) {
                errors.push(`Invalid status for record ${index + 1}. Must be 'present' or 'absent'`);
            }
        });
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};

export const validateProfileData = (profileData) => {
    const errors = [];

    if (!profileData.name || profileData.name.trim().length === 0) {
        errors.push('Name is required');
    }

    if (!profileData.email || profileData.email.trim().length === 0) {
        errors.push('Email is required');
    } else if (!/\S+@\S+\.\S+/.test(profileData.email)) {
        errors.push('Invalid email format');
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};

export const validatePasswordData = (passwordData) => {
    const errors = [];

    if (!passwordData.currentPassword) {
        errors.push('Current password is required');
    }

    if (!passwordData.newPassword) {
        errors.push('New password is required');
    } else if (passwordData.newPassword.length < 6) {
        errors.push('New password must be at least 6 characters long');
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
        errors.push('New password and confirm password do not match');
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};