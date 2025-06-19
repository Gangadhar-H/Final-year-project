import React, { useState, useEffect } from 'react';
import { Calendar, Clock, BookOpen, Filter, Download, AlertCircle } from 'lucide-react';
import studentService from '../../services/studentService';
import AttendanceChart from '../../components/student/AttendanceChart';
import StatCard from '../../components/student/StatCard';

const Attendance = () => {
    const [attendanceData, setAttendanceData] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [statistics, setStatistics] = useState({});
    const [subjectWiseStats, setSubjectWiseStats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Filter states
    const [filters, setFilters] = useState({
        subjectId: '',
        startDate: '',
        endDate: ''
    });

    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        fetchAttendanceData();
        fetchSubjects();
    }, []);

    useEffect(() => {
        if (filters.subjectId || filters.startDate || filters.endDate) {
            fetchAttendanceData();
        }
    }, [filters]);

    const fetchAttendanceData = async () => {
        try {
            setLoading(true);
            const response = await studentService.getAttendance(filters);
            setAttendanceData(response.attendance);
            setStatistics(response.statistics);
            setSubjectWiseStats(response.subjectWiseStats || []);
            setError('');
        } catch (err) {
            setError(err.message || 'Failed to fetch attendance data');
            console.error('Error fetching attendance:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchSubjects = async () => {
        try {
            const response = await studentService.getSubjects();
            setSubjects(response.subjects);
        } catch (err) {
            console.error('Error fetching subjects:', err);
        }
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const clearFilters = () => {
        setFilters({
            subjectId: '',
            startDate: '',
            endDate: ''
        });
    };

    const formatDate = (dateString) => {
        const options = {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            weekday: 'short'
        };
        return new Date(dateString).toLocaleDateString('en-IN', options);
    };

    const getStatusColor = (status) => {
        return status === 'present' ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50';
    };

    const getAttendanceColor = (percentage) => {
        if (percentage >= 75) return 'green';
        if (percentage >= 65) return 'yellow';
        return 'red';
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading attendance data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Attendance</h1>
                            <p className="text-gray-600 mt-1">Track your class attendance and statistics</p>
                        </div>
                        <div className="flex space-x-3">
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                <Filter className="w-4 h-4 mr-2" />
                                Filters
                            </button>
                        </div>
                    </div>

                    {/* Error Alert */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                            <div className="flex items-center">
                                <AlertCircle className="w-5 h-5 mr-2" />
                                {error}
                            </div>
                        </div>
                    )}

                    {/* Filters */}
                    {showFilters && (
                        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Filter Attendance</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Subject
                                    </label>
                                    <select
                                        value={filters.subjectId}
                                        onChange={(e) => handleFilterChange('subjectId', e.target.value)}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">All Subjects</option>
                                        {subjects.map(subject => (
                                            <option key={subject._id} value={subject._id}>
                                                {subject.subjectName} ({subject.subjectCode})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Start Date
                                    </label>
                                    <input
                                        type="date"
                                        value={filters.startDate}
                                        onChange={(e) => handleFilterChange('startDate', e.target.value)}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        End Date
                                    </label>
                                    <input
                                        type="date"
                                        value={filters.endDate}
                                        onChange={(e) => handleFilterChange('endDate', e.target.value)}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end mt-4">
                                <button
                                    onClick={clearFilters}
                                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                                >
                                    Clear Filters
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <StatCard
                        title="Total Classes"
                        value={statistics.totalClasses || 0}
                        icon={BookOpen}
                        color="blue"
                    />
                    <StatCard
                        title="Present"
                        value={statistics.presentClasses || 0}
                        subtitle="Classes attended"
                        icon={Clock}
                        color="green"
                    />
                    <StatCard
                        title="Absent"
                        value={statistics.absentClasses || 0}
                        subtitle="Classes missed"
                        icon={AlertCircle}
                        color="red"
                    />
                    <StatCard
                        title="Attendance"
                        value={`${statistics.attendancePercentage || 0}%`}
                        subtitle="Overall percentage"
                        icon={Calendar}
                        color={getAttendanceColor(statistics.attendancePercentage || 0)}
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                    {/* Attendance Chart */}
                    <div className="lg:col-span-1">
                        <AttendanceChart attendanceData={statistics} />
                    </div>

                    {/* Subject-wise Statistics */}
                    <div className="lg:col-span-2">
                        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                Subject-wise Attendance
                            </h3>
                            {subjectWiseStats.length > 0 ? (
                                <div className="space-y-4">
                                    {subjectWiseStats.map((stat, index) => (
                                        <div key={index} className="border border-gray-200 rounded-lg p-4">
                                            <div className="flex justify-between items-center mb-2">
                                                <div>
                                                    <h4 className="font-medium text-gray-900">
                                                        {stat.subject.subjectName}
                                                    </h4>
                                                    <p className="text-sm text-gray-600">
                                                        {stat.subject.subjectCode}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className={`text-lg font-bold ${parseFloat(stat.attendancePercentage) >= 75 ? 'text-green-600' :
                                                        parseFloat(stat.attendancePercentage) >= 65 ? 'text-yellow-600' :
                                                            'text-red-600'
                                                        }`}>
                                                        {stat.attendancePercentage}%
                                                    </p>
                                                    <p className="text-sm text-gray-600">
                                                        {stat.presentClasses}/{stat.totalClasses}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div
                                                    className={`h-2 rounded-full ${parseFloat(stat.attendancePercentage) >= 75 ? 'bg-green-500' :
                                                        parseFloat(stat.attendancePercentage) >= 65 ? 'bg-yellow-500' :
                                                            'bg-red-500'
                                                        }`}
                                                    style={{ width: `${stat.attendancePercentage}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <div className="text-gray-400 text-6xl mb-4">📊</div>
                                    <p className="text-gray-500">No subject-wise data available</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Attendance Records Table */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900">Attendance Records</h3>
                        <p className="text-sm text-gray-600 mt-1">
                            Showing {attendanceData.length} records
                        </p>
                    </div>

                    {attendanceData.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Date
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Subject
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Teacher
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Division
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {attendanceData.map((record, index) => (
                                        <tr key={record._id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {formatDate(record.date)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {record.subject.subjectName}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {record.subject.subjectCode}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">
                                                    {record.teacher.name}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    ID: {record.teacher.teacherId}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {record.division}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusColor(record.status)}`}>
                                                    {record.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <div className="text-gray-400 text-6xl mb-4">📅</div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No attendance records found</h3>
                            <p className="text-gray-500 mb-4">
                                {filters.subjectId || filters.startDate || filters.endDate
                                    ? "Try adjusting your filters to see more results."
                                    : "Attendance records will appear here once classes begin."}
                            </p>
                            {(filters.subjectId || filters.startDate || filters.endDate) && (
                                <button
                                    onClick={clearFilters}
                                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Clear Filters
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Attendance Guidelines */}
                <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <h4 className="text-lg font-semibold text-blue-900 mb-3">Attendance Guidelines</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center text-green-700">
                            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                            <span><strong>75% and above:</strong> Excellent attendance</span>
                        </div>
                        <div className="flex items-center text-yellow-700">
                            <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                            <span><strong>65-74%:</strong> Satisfactory attendance</span>
                        </div>
                        <div className="flex items-center text-red-700">
                            <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                            <span><strong>Below 65%:</strong> Attendance shortage</span>
                        </div>
                    </div>
                    <p className="text-blue-800 mt-3 text-sm">
                        <strong>Note:</strong> Minimum 75% attendance is required to be eligible for examinations.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Attendance;