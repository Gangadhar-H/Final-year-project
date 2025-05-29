import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    getAssignedSubjects,
    getAttendance,
    formatAttendanceForDisplay,
    calculateAttendanceStats
} from '../../services/teacherService';

const AttendanceHistory = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [subjects, setSubjects] = useState([]);
    const [selectedSubject, setSelectedSubject] = useState('');
    const [selectedDivision, setSelectedDivision] = useState('');
    const [dateRange, setDateRange] = useState({
        startDate: '',
        endDate: ''
    });
    const [attendanceRecords, setAttendanceRecords] = useState([]);
    const [filteredRecords, setFilteredRecords] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [stats, setStats] = useState(null);
    const [error, setError] = useState('');
    const [fetchingAttendance, setFetchingAttendance] = useState(false);

    // Get unique divisions for selected subject
    const getAvailableDivisions = () => {
        if (!selectedSubject) return [];
        const subject = subjects.find(s => s.subjectId._id === selectedSubject);
        return subject ? [...new Set(subjects
            .filter(s => s.subjectId._id === selectedSubject)
            .map(s => s.division))] : [];
    };

    // Load assigned subjects on component mount
    useEffect(() => {
        const loadSubjects = async () => {
            try {
                const response = await getAssignedSubjects();
                setSubjects(response.assignedSubjects || []);

                // Auto-select first subject if available
                if (response.assignedSubjects?.length > 0) {
                    const firstSubject = response.assignedSubjects[0];
                    setSelectedSubject(firstSubject.subjectId._id);
                    setSelectedDivision(firstSubject.division);
                }
            } catch (error) {
                console.error('Error loading subjects:', error);
                setError('Failed to load assigned subjects');
            } finally {
                setLoading(false);
            }
        };

        loadSubjects();
    }, []);

    // Fetch attendance records when filters change
    useEffect(() => {
        if (selectedSubject) {
            fetchAttendanceRecords();
        }
    }, [selectedSubject, selectedDivision, dateRange]);

    // Filter records based on search query
    useEffect(() => {
        if (!searchQuery.trim()) {
            setFilteredRecords(attendanceRecords);
        } else {
            const filtered = attendanceRecords.filter(record => {
                const searchLower = searchQuery.toLowerCase();
                const dateStr = new Date(record.date).toLocaleDateString('en-IN');
                const subjectName = record.subject?.subjectName?.toLowerCase() || '';
                const division = record.division?.toLowerCase() || '';

                return dateStr.includes(searchLower) ||
                    subjectName.includes(searchLower) ||
                    division.includes(searchLower);
            });
            setFilteredRecords(filtered);
        }
    }, [searchQuery, attendanceRecords]);

    const fetchAttendanceRecords = async () => {
        if (!selectedSubject) return;

        setFetchingAttendance(true);
        setError('');

        try {
            const params = {};
            if (selectedDivision) params.division = selectedDivision;
            if (dateRange.startDate) params.startDate = dateRange.startDate;
            if (dateRange.endDate) params.endDate = dateRange.endDate;

            const response = await getAttendance(selectedSubject, params);
            const formattedRecords = formatAttendanceForDisplay(response.attendance || []);
            setAttendanceRecords(formattedRecords);

            // Calculate statistics
            const statistics = calculateAttendanceStats(response.attendance || []);
            setStats(statistics);
        } catch (error) {
            console.error('Error fetching attendance:', error);
            setError('Failed to fetch attendance records');
            setAttendanceRecords([]);
            setStats(null);
        } finally {
            setFetchingAttendance(false);
        }
    };

    const handleDateRangeChange = (field, value) => {
        setDateRange(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const clearFilters = () => {
        setDateRange({ startDate: '', endDate: '' });
        setSearchQuery('');
        setSelectedDivision('');
    };

    const getSelectedSubjectName = () => {
        if (!selectedSubject) return '';
        const subject = subjects.find(s => s.subjectId._id === selectedSubject);
        return subject ? `${subject.subjectId.subjectName} (${subject.subjectId.subjectCode})` : '';
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading attendance history...</p>
                </div>
            </div>
        );
    }

    if (subjects.length === 0) {
        return (
            <div className="p-6">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
                    <div className="text-yellow-600 mb-4">
                        <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.314 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium text-yellow-800 mb-2">No Subjects Assigned</h3>
                    <p className="text-yellow-600">You don't have any subjects assigned to view attendance history.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Attendance History</h1>
                    <p className="text-gray-600 mt-1">View and analyze past attendance records</p>
                </div>
                <button
                    onClick={() => navigate('/teacher/attendance')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    Mark Attendance
                </button>
            </div>

            {/* Filters Section */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Filters</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Subject Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Subject
                        </label>
                        <select
                            value={selectedSubject}
                            onChange={(e) => {
                                setSelectedSubject(e.target.value);
                                setSelectedDivision(''); // Reset division when subject changes
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="">Select a subject</option>
                            {[...new Map(subjects.map(s => [s.subjectId._id, s])).values()].map(subject => (
                                <option key={subject.subjectId._id} value={subject.subjectId._id}>
                                    {subject.subjectId.subjectName} ({subject.subjectId.subjectCode})
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Division Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Division
                        </label>
                        <select
                            value={selectedDivision}
                            onChange={(e) => setSelectedDivision(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            disabled={!selectedSubject}
                        >
                            <option value="">All Divisions</option>
                            {getAvailableDivisions().map(division => (
                                <option key={division} value={division}>
                                    Division {division}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Start Date */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            From Date
                        </label>
                        <input
                            type="date"
                            value={dateRange.startDate}
                            onChange={(e) => handleDateRangeChange('startDate', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    {/* End Date */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            To Date
                        </label>
                        <input
                            type="date"
                            value={dateRange.endDate}
                            onChange={(e) => handleDateRangeChange('endDate', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                </div>

                {/* Search and Clear Filters */}
                <div className="flex flex-col sm:flex-row gap-4 mt-4">
                    <div className="flex-1">
                        <input
                            type="text"
                            placeholder="Search by date, subject, or division..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <button
                        onClick={clearFilters}
                        className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg border border-gray-300 transition-colors"
                    >
                        Clear Filters
                    </button>
                </div>
            </div>

            {/* Statistics */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white rounded-lg shadow-sm border p-6">
                        <div className="flex items-center">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-2xl font-bold text-gray-900">{stats.totalClasses}</p>
                                <p className="text-gray-600">Total Classes</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border p-6">
                        <div className="flex items-center">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857M5 10V8a3 3 0 116 0v2M5 10h10M5 10a3 3 0 00-3 3v2" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-2xl font-bold text-gray-900">{stats.totalStudents}</p>
                                <p className="text-gray-600">Avg Students</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border p-6">
                        <div className="flex items-center">
                            <div className="p-2 bg-yellow-100 rounded-lg">
                                <svg className="h-6 w-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-2xl font-bold text-gray-900">{stats.overallAttendanceRate}%</p>
                                <p className="text-gray-600">Attendance Rate</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border p-6">
                        <div className="flex items-center">
                            <div className="p-2 bg-purple-100 rounded-lg">
                                <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-2xl font-bold text-gray-900">{stats.totalPresentRecords}</p>
                                <p className="text-gray-600">Total Present</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex">
                        <svg className="h-5 w-5 text-red-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.314 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                        <p className="ml-3 text-red-800">{error}</p>
                    </div>
                </div>
            )}

            {/* Attendance Records Table */}
            <div className="bg-white rounded-lg shadow-sm border">
                <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex justify-between items-center">
                        <h2 className="text-lg font-semibold text-gray-900">
                            Attendance Records
                            {selectedSubject && (
                                <span className="text-sm font-normal text-gray-600 ml-2">
                                    for {getSelectedSubjectName()}
                                </span>
                            )}
                        </h2>
                        {filteredRecords.length > 0 && (
                            <span className="text-sm text-gray-600">
                                {filteredRecords.length} record{filteredRecords.length !== 1 ? 's' : ''} found
                            </span>
                        )}
                    </div>
                </div>

                <div className="overflow-x-auto">
                    {fetchingAttendance ? (
                        <div className="p-8 text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                            <p className="text-gray-600">Loading attendance records...</p>
                        </div>
                    ) : filteredRecords.length === 0 ? (
                        <div className="p-8 text-center">
                            <div className="text-gray-400 mb-4">
                                <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No Records Found</h3>
                            <p className="text-gray-600">
                                {selectedSubject
                                    ? "No attendance records found for the selected criteria."
                                    : "Please select a subject to view attendance records."
                                }
                            </p>
                        </div>
                    ) : (
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Date
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Subject
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Division
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Total Students
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Present
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Absent
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Attendance %
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredRecords.map((record) => (
                                    <tr key={record._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {record.formattedDate}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">
                                                {record.subject?.subjectName}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {record.subject?.subjectCode}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            Division {record.division}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {record.totalStudents}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                {record.presentCount}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                {record.absentCount}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="w-full bg-gray-200 rounded-full h-2 mr-2">
                                                    <div
                                                        className="bg-blue-600 h-2 rounded-full"
                                                        style={{ width: `${record.attendancePercentage}%` }}
                                                    ></div>
                                                </div>
                                                <span className="text-sm text-gray-900 min-w-0">
                                                    {record.attendancePercentage}%
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <button
                                                onClick={() => navigate(`/teacher/mark-attendance/${record.subject._id}`, {
                                                    state: {
                                                        division: record.division,
                                                        date: record.date,
                                                        mode: 'edit'
                                                    }
                                                })}
                                                className="text-blue-600 hover:text-blue-900 mr-3"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => {
                                                    // You can implement a detailed view modal here
                                                    console.log('View details for:', record);
                                                }}
                                                className="text-gray-600 hover:text-gray-900"
                                            >
                                                View
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AttendanceHistory;