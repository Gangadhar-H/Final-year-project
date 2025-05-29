import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    getStudentsForAttendance,
    markAttendance,
    getAttendanceByDate,
    validateAttendanceData,
    handleApiError
} from '../../services/teacherService';

const MarkAttendance = () => {
    const { subjectId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();

    // Get subject and division from navigation state or URL params
    const searchParams = new URLSearchParams(location.search);
    const initialDivision = location.state?.division || searchParams.get('division') || '';
    const subjectName = location.state?.subjectName || 'Subject';

    // State management
    const [students, setStudents] = useState([]);
    const [attendanceData, setAttendanceData] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [division, setDivision] = useState(initialDivision);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [subjectInfo, setSubjectInfo] = useState(null);
    const [existingAttendance, setExistingAttendance] = useState(null);
    const [bulkAction, setBulkAction] = useState('');

    // Load students when component mounts or division changes
    useEffect(() => {
        if (subjectId && division) {
            loadStudents();
        }
    }, [subjectId, division]);

    // Check for existing attendance when date changes
    useEffect(() => {
        if (subjectId && division && selectedDate) {
            checkExistingAttendance();
        }
    }, [subjectId, division, selectedDate]);

    const loadStudents = async () => {
        try {
            setLoading(true);
            setError('');

            const response = await getStudentsForAttendance(subjectId, division);

            setStudents(response.students || []);
            setSubjectInfo(response.subject);

            // Initialize attendance data with default 'absent' status
            const initialAttendance = response.students.map(student => ({
                studentId: student._id,
                status: 'absent'
            }));
            setAttendanceData(initialAttendance);

        } catch (err) {
            const errorInfo = handleApiError(err);
            setError(errorInfo.message);
            console.error('Error loading students:', err);
        } finally {
            setLoading(false);
        }
    };

    const checkExistingAttendance = async () => {
        try {
            const response = await getAttendanceByDate(subjectId, selectedDate, division);

            if (response.attendance && response.attendance.length > 0) {
                const existingRecord = response.attendance[0];
                setExistingAttendance(existingRecord);

                // Update attendance data with existing records
                const existingData = existingRecord.attendanceRecords.map(record => ({
                    studentId: record.student._id || record.student,
                    status: record.status
                }));
                setAttendanceData(existingData);
            } else {
                setExistingAttendance(null);
                // Reset to default absent status for all students
                const defaultData = students.map(student => ({
                    studentId: student._id,
                    status: 'absent'
                }));
                setAttendanceData(defaultData);
            }
        } catch (err) {
            // If no attendance found, that's normal - don't show error
            setExistingAttendance(null);
        }
    };

    const updateStudentAttendance = (studentId, status) => {
        setAttendanceData(prev =>
            prev.map(record =>
                record.studentId === studentId
                    ? { ...record, status }
                    : record
            )
        );
    };

    const handleBulkAction = (action) => {
        if (action === 'mark-all-present') {
            setAttendanceData(prev =>
                prev.map(record => ({ ...record, status: 'present' }))
            );
        } else if (action === 'mark-all-absent') {
            setAttendanceData(prev =>
                prev.map(record => ({ ...record, status: 'absent' }))
            );
        }
        setBulkAction('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setSubmitting(true);
            setError('');
            setSuccess('');

            const submitData = {
                division,
                attendanceData,
                date: selectedDate
            };

            // Validate data
            const validation = validateAttendanceData(submitData);
            if (!validation.isValid) {
                setError(validation.errors.join(', '));
                return;
            }

            const response = await markAttendance(subjectId, submitData);

            setSuccess(
                existingAttendance
                    ? 'Attendance updated successfully!'
                    : 'Attendance marked successfully!'
            );

            // Refresh existing attendance data
            setTimeout(() => {
                checkExistingAttendance();
            }, 1000);

        } catch (err) {
            const errorInfo = handleApiError(err);
            setError(errorInfo.message);
            console.error('Error marking attendance:', err);
        } finally {
            setSubmitting(false);
        }
    };

    const getAttendanceStats = () => {
        const present = attendanceData.filter(record => record.status === 'present').length;
        const absent = attendanceData.filter(record => record.status === 'absent').length;
        const total = attendanceData.length;
        const percentage = total > 0 ? Math.round((present / total) * 100) : 0;

        return { present, absent, total, percentage };
    };

    const stats = getAttendanceStats();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading students...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center justify-between">
                    <div>
                        <button
                            onClick={() => navigate(-1)}
                            className="flex items-center text-blue-600 hover:text-blue-800 mb-2"
                        >
                            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            Back
                        </button>
                        <h1 className="text-3xl font-bold text-gray-900">Mark Attendance</h1>
                        <p className="text-gray-600 mt-1">
                            {subjectInfo ?
                                `${subjectInfo.name} (${subjectInfo.code}) - Division ${division} - Semester ${subjectInfo.semester}` :
                                `${subjectName} - Division ${division}`
                            }
                        </p>
                    </div>

                    {existingAttendance && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                            <p className="text-yellow-800 text-sm font-medium">
                                ⚠️ Attendance already exists for this date
                            </p>
                            <p className="text-yellow-700 text-xs">
                                You can update the existing records
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Error/Success Messages */}
            {error && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    {error}
                </div>
            )}

            {success && (
                <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                    {success}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Date and Division Selection */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Attendance Details</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Date
                            </label>
                            <input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                max={new Date().toISOString().split('T')[0]}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Division
                            </label>
                            <input
                                type="text"
                                value={division}
                                onChange={(e) => setDivision(e.target.value)}
                                placeholder="Enter division"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                    </div>
                </div>

                {/* Attendance Stats */}
                {students.length > 0 && (
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Attendance Overview</h2>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="text-center p-3 bg-blue-50 rounded-lg">
                                <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
                                <div className="text-sm text-blue-800">Total Students</div>
                            </div>
                            <div className="text-center p-3 bg-green-50 rounded-lg">
                                <div className="text-2xl font-bold text-green-600">{stats.present}</div>
                                <div className="text-sm text-green-800">Present</div>
                            </div>
                            <div className="text-center p-3 bg-red-50 rounded-lg">
                                <div className="text-2xl font-bold text-red-600">{stats.absent}</div>
                                <div className="text-sm text-red-800">Absent</div>
                            </div>
                            <div className="text-center p-3 bg-purple-50 rounded-lg">
                                <div className="text-2xl font-bold text-purple-600">{stats.percentage}%</div>
                                <div className="text-sm text-purple-800">Attendance Rate</div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Bulk Actions */}
                {students.length > 0 && (
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
                            <div className="flex space-x-2">
                                <button
                                    type="button"
                                    onClick={() => handleBulkAction('mark-all-present')}
                                    className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                                >
                                    Mark All Present
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleBulkAction('mark-all-absent')}
                                    className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                                >
                                    Mark All Absent
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Student List */}
                {students.length > 0 ? (
                    <div className="bg-white rounded-lg border border-gray-200">
                        <div className="p-6 border-b border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-900">Student Attendance</h2>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            #
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Student Name
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            UUCMS No
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Attendance Status
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {students.map((student, index) => {
                                        const studentAttendance = attendanceData.find(
                                            record => record.studentId === student._id
                                        );

                                        return (
                                            <tr key={student._id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {index + 1}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {student.name}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {student.email}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {student.uucmsNo}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex space-x-4">
                                                        <label className="flex items-center">
                                                            <input
                                                                type="radio"
                                                                name={`attendance_${student._id}`}
                                                                value="present"
                                                                checked={studentAttendance?.status === 'present'}
                                                                onChange={() => updateStudentAttendance(student._id, 'present')}
                                                                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                                                            />
                                                            <span className="ml-2 text-sm text-green-700 font-medium">
                                                                Present
                                                            </span>
                                                        </label>
                                                        <label className="flex items-center">
                                                            <input
                                                                type="radio"
                                                                name={`attendance_${student._id}`}
                                                                value="absent"
                                                                checked={studentAttendance?.status === 'absent'}
                                                                onChange={() => updateStudentAttendance(student._id, 'absent')}
                                                                className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300"
                                                            />
                                                            <span className="ml-2 text-sm text-red-700 font-medium">
                                                                Absent
                                                            </span>
                                                        </label>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : !loading && (
                    <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                        <div className="text-gray-400 mb-4">
                            <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No Students Found</h3>
                        <p className="text-gray-500 mb-4">
                            No students found for the selected subject and division.
                        </p>
                        {!division && (
                            <p className="text-sm text-yellow-600">
                                Please select a division to load students.
                            </p>
                        )}
                    </div>
                )}

                {/* Submit Button */}
                {students.length > 0 && (
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-600">
                                {existingAttendance ?
                                    'Click "Update Attendance" to save changes to existing attendance record' :
                                    'Click "Mark Attendance" to save attendance for all students'
                                }
                            </div>
                            <button
                                type="submit"
                                disabled={submitting || students.length === 0}
                                className={`px-6 py-3 rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 ${submitting || students.length === 0
                                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                        : existingAttendance
                                            ? 'bg-yellow-600 hover:bg-yellow-700 text-white focus:ring-yellow-500'
                                            : 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500'
                                    }`}
                            >
                                {submitting ? (
                                    <div className="flex items-center">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        {existingAttendance ? 'Updating...' : 'Marking...'}
                                    </div>
                                ) : (
                                    existingAttendance ? 'Update Attendance' : 'Mark Attendance'
                                )}
                            </button>
                        </div>
                    </div>
                )}
            </form>
        </div>
    );
};

export default MarkAttendance;