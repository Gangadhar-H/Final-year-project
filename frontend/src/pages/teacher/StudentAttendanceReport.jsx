import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import {
    ArrowLeft,
    Users,
    TrendingUp,
    TrendingDown,
    Calendar,
    BookOpen,
    Search,
    Filter,
    Download,
    AlertCircle,
    CheckCircle,
    Clock,
    User
} from 'lucide-react';
import { getStudentAttendanceReport } from '../../services/teacherService';

const StudentAttendanceReport = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const subjectId = searchParams.get('subject');
    const division = searchParams.get('division');

    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('name');
    const [sortOrder, setSortOrder] = useState('asc');
    const [filterBy, setFilterBy] = useState('all');

    useEffect(() => {
        if (subjectId && division) {
            loadAttendanceReport();
        } else {
            setError('Subject and division parameters are required');
            setLoading(false);
        }
    }, [subjectId, division]);

    const loadAttendanceReport = async () => {
        try {
            setLoading(true);
            const response = await getStudentAttendanceReport(subjectId, division);
            setReportData(response);
            setError('');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load attendance report');
            console.error('Error loading attendance report:', err);
        } finally {
            setLoading(false);
        }
    };

    // Filter and sort students
    const getFilteredAndSortedStudents = () => {
        if (!reportData?.studentStats) return [];

        let filtered = reportData.studentStats.filter(stat => {
            const matchesSearch = stat.student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                stat.student.uucmsNo.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesFilter = filterBy === 'all' ||
                (filterBy === 'good' && stat.attendancePercentage >= 75) ||
                (filterBy === 'average' && stat.attendancePercentage >= 60 && stat.attendancePercentage < 75) ||
                (filterBy === 'poor' && stat.attendancePercentage < 60);

            return matchesSearch && matchesFilter;
        });

        // Sort the filtered results
        filtered.sort((a, b) => {
            let aValue, bValue;

            switch (sortBy) {
                case 'name':
                    aValue = a.student.name.toLowerCase();
                    bValue = b.student.name.toLowerCase();
                    break;
                case 'uucmsNo':
                    aValue = a.student.uucmsNo;
                    bValue = b.student.uucmsNo;
                    break;
                case 'attendance':
                    aValue = a.attendancePercentage;
                    bValue = b.attendancePercentage;
                    break;
                case 'present':
                    aValue = a.classesAttended;
                    bValue = b.classesAttended;
                    break;
                case 'absent':
                    aValue = a.classesAbsent;
                    bValue = b.classesAbsent;
                    break;
                default:
                    aValue = a.student.name.toLowerCase();
                    bValue = b.student.name.toLowerCase();
            }

            if (sortOrder === 'asc') {
                return aValue > bValue ? 1 : -1;
            } else {
                return aValue < bValue ? 1 : -1;
            }
        });

        return filtered;
    };

    const getAttendanceStatusColor = (percentage) => {
        if (percentage >= 75) return 'text-green-600 bg-green-50';
        if (percentage >= 60) return 'text-yellow-600 bg-yellow-50';
        return 'text-red-600 bg-red-50';
    };

    const getAttendanceStatusIcon = (percentage) => {
        if (percentage >= 75) return <CheckCircle className="h-4 w-4" />;
        if (percentage >= 60) return <Clock className="h-4 w-4" />;
        return <AlertCircle className="h-4 w-4" />;
    };

    const exportToCSV = () => {
        if (!reportData) return;

        const headers = ['Name', 'UUCMS No', 'Total Classes', 'Present', 'Absent', 'Attendance %'];
        const csvData = [
            headers.join(','),
            ...reportData.studentStats.map(stat => [
                stat.student.name,
                stat.student.uucmsNo,
                stat.totalClasses,
                stat.classesAttended,
                stat.classesAbsent,
                stat.attendancePercentage
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvData], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `attendance_report_${reportData.subject.code}_${division}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading attendance report...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6">
                <div className="flex items-center gap-2 mb-4">
                    <button
                        onClick={() => navigate('/teacher/attendance')}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Attendance
                    </button>
                </div>

                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
                    <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                    <p className="text-red-700">{error}</p>
                </div>
            </div>
        );
    }

    const filteredStudents = getFilteredAndSortedStudents();

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate('/teacher/attendance')}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                </button>

                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Attendance History</h1>
                    <p className="text-gray-600">
                        {reportData?.subject.name} ({reportData?.subject.code}) - Division {division}
                    </p>
                </div>
            </div>

            {reportData && (
                <>
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="bg-blue-50 rounded-lg p-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <Calendar className="h-6 w-6 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-blue-600 font-medium">Total Classes</p>
                                    <p className="text-2xl font-bold text-blue-900">{reportData.totalClasses}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-green-50 rounded-lg p-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-100 rounded-lg">
                                    <Users className="h-6 w-6 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-green-600 font-medium">Total Students</p>
                                    <p className="text-2xl font-bold text-green-900">{reportData.overallStats.totalStudents}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-purple-50 rounded-lg p-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-purple-100 rounded-lg">
                                    <TrendingUp className="h-6 w-6 text-purple-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-purple-600 font-medium">Avg Attendance</p>
                                    <p className="text-2xl font-bold text-purple-900">{reportData.overallStats.averageAttendance}%</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-orange-50 rounded-lg p-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-orange-100 rounded-lg">
                                    <TrendingDown className="h-6 w-6 text-orange-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-orange-600 font-medium">Below 60%</p>
                                    <p className="text-2xl font-bold text-orange-900">{reportData.overallStats.studentsWithPoorAttendance}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Filters and Search */}
                    <div className="bg-white rounded-lg shadow-sm border p-6">
                        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                            <div className="flex flex-col sm:flex-row gap-4 flex-1">
                                {/* Search */}
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search students..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full sm:w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>

                                {/* Filter */}
                                <select
                                    value={filterBy}
                                    onChange={(e) => setFilterBy(e.target.value)}
                                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="all">All Students</option>
                                    <option value="good">Good (≥75%)</option>
                                    <option value="average">Average (60-74%)</option>
                                    <option value="poor">Poor (&lt;60%)</option>
                                </select>

                                {/* Sort */}
                                <select
                                    value={`${sortBy}-${sortOrder}`}
                                    onChange={(e) => {
                                        const [field, order] = e.target.value.split('-');
                                        setSortBy(field);
                                        setSortOrder(order);
                                    }}
                                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="name-asc">Name (A-Z)</option>
                                    <option value="name-desc">Name (Z-A)</option>
                                    <option value="uucmsNo-asc">UUCMS No (Low-High)</option>
                                    <option value="uucmsNo-desc">UUCMS No (High-Low)</option>
                                    <option value="attendance-desc">Attendance (High-Low)</option>
                                    <option value="attendance-asc">Attendance (Low-High)</option>
                                    <option value="present-desc">Present (High-Low)</option>
                                    <option value="absent-desc">Absent (High-Low)</option>
                                </select>
                            </div>

                            {/* Export Button */}
                            <button
                                onClick={exportToCSV}
                                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                            >
                                <Download className="h-4 w-4" />
                                Export CSV
                            </button>
                        </div>
                    </div>

                    {/* Students Table */}
                    <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Student
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            UUCMS No
                                        </th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Total Classes
                                        </th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Present
                                        </th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Absent
                                        </th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Attendance %
                                        </th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredStudents.length === 0 ? (
                                        <tr>
                                            <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                                                <User className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                                                <p className="text-lg font-medium text-gray-900 mb-2">No students found</p>
                                                <p>Try adjusting your search or filter criteria.</p>
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredStudents.map((stat, index) => (
                                            <tr key={stat.student._id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                                                            <span className="text-blue-600 font-medium text-sm">
                                                                {stat.student.name.charAt(0).toUpperCase()}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-medium text-gray-900">
                                                                {stat.student.name}
                                                            </p>
                                                            <p className="text-sm text-gray-500">
                                                                Semester {reportData.subject.semester}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {stat.student.uucmsNo}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                                                    {stat.totalClasses}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                                    <span className="text-sm font-medium text-green-600">
                                                        {stat.classesAttended}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                                    <span className="text-sm font-medium text-red-600">
                                                        {stat.classesAbsent}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                                    <span className={`text-sm font-bold ${getAttendanceStatusColor(stat.attendancePercentage).split(' ')[0]}`}>
                                                        {stat.attendancePercentage}%
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getAttendanceStatusColor(stat.attendancePercentage)}`}>
                                                        {getAttendanceStatusIcon(stat.attendancePercentage)}
                                                        {stat.status.charAt(0).toUpperCase() + stat.status.slice(1)}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Summary */}
                    <div className="bg-white rounded-lg shadow-sm border p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Summary</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Students with Good Attendance (≥75%):</span>
                                <span className="font-medium text-green-600">
                                    {reportData.overallStats.studentsWithGoodAttendance}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Students with Poor Attendance (&lt;60%):</span>
                                <span className="font-medium text-red-600">
                                    {reportData.overallStats.studentsWithPoorAttendance}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Overall Average:</span>
                                <span className="font-medium text-blue-600">
                                    {reportData.overallStats.averageAttendance}%
                                </span>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default StudentAttendanceReport;