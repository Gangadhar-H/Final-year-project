import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    Calendar,
    Users,
    Clock,
    Plus,
    Search,
    Filter,
    BookOpen,
    TrendingUp,
    AlertCircle,
    Eye
} from 'lucide-react';
import { getAssignedSubjects, getAttendance, calculateAttendanceStats } from '../../services/teacherService';

const Attendance = () => {
    const navigate = useNavigate();

    // State Management
    const [subjects, setSubjects] = useState([]);
    const [attendanceData, setAttendanceData] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedSubject, setSelectedSubject] = useState('');
    const [selectedDivision, setSelectedDivision] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [dateRange, setDateRange] = useState({
        startDate: '',
        endDate: ''
    });

    // Load initial data
    useEffect(() => {
        loadAssignedSubjects();
    }, []);

    // Load attendance data when subject or division changes
    useEffect(() => {
        if (selectedSubject) {
            loadAttendanceData();
        }
    }, [selectedSubject, selectedDivision, dateRange]);

    const loadAssignedSubjects = async () => {
        try {
            setLoading(true);
            const response = await getAssignedSubjects();
            setSubjects(response.assignedSubjects || []);
            setError('');
        } catch (err) {
            setError('Failed to load assigned subjects');
            console.error('Error loading subjects:', err);
        } finally {
            setLoading(false);
        }
    };

    const loadAttendanceData = async () => {
        if (!selectedSubject) return;

        try {
            const params = {};
            if (selectedDivision) params.division = selectedDivision;
            if (dateRange.startDate) params.startDate = dateRange.startDate;
            if (dateRange.endDate) params.endDate = dateRange.endDate;

            const response = await getAttendance(selectedSubject, params);
            setAttendanceData(prev => ({
                ...prev,
                [selectedSubject]: response.attendance || []
            }));
        } catch (err) {
            console.error('Error loading attendance data:', err);
        }
    };

    // Get unique divisions for selected subject
    const getAvailableDivisions = () => {
        const subject = subjects.find(s => s.subjectId._id === selectedSubject);
        if (!subject) return [];

        return [...new Set(subjects
            .filter(s => s.subjectId._id === selectedSubject)
            .map(s => s.division)
        )];
    };

    // Filter subjects based on search term
    const filteredSubjects = subjects.filter(subject =>
        subject.subjectId.subjectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        subject.subjectId.subjectCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        subject.division.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Calculate stats for dashboard cards
    const getSubjectStats = (subjectId) => {
        const records = attendanceData[subjectId] || [];
        if (records.length === 0) return null;

        return calculateAttendanceStats(records);
    };

    // Get recent attendance activity
    const getRecentActivity = () => {
        const allRecords = [];
        Object.entries(attendanceData).forEach(([subjectId, records]) => {
            const subject = subjects.find(s => s.subjectId._id === subjectId);
            records.forEach(record => {
                allRecords.push({
                    ...record,
                    subjectName: subject?.subjectId.subjectName || 'Unknown Subject',
                    subjectCode: subject?.subjectId.subjectCode || 'N/A'
                });
            });
        });

        return allRecords
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 5);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading attendance data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Attendance Management</h1>
                    <p className="text-gray-600">Manage and track student attendance across your subjects</p>
                </div>

                <div className="flex gap-3">
                    <Link
                        to="/teacher/attendance-history"
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        <Eye className="h-4 w-4" />
                        View History
                    </Link>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
                    <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                    <p className="text-red-700">{error}</p>
                </div>
            )}

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-blue-50 rounded-lg p-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <BookOpen className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm text-blue-600 font-medium">Total Subjects</p>
                            <p className="text-2xl font-bold text-blue-900">
                                {new Set(subjects.map(s => s.subjectId._id)).size}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-green-50 rounded-lg p-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <Users className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                            <p className="text-sm text-green-600 font-medium">Total Divisions</p>
                            <p className="text-2xl font-bold text-green-900">{subjects.length}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-purple-50 rounded-lg p-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 rounded-lg">
                            <Calendar className="h-6 w-6 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-sm text-purple-600 font-medium">Classes Today</p>
                            <p className="text-2xl font-bold text-purple-900">
                                {Object.values(attendanceData).flat().filter(record => {
                                    const today = new Date().toDateString();
                                    return new Date(record.date).toDateString() === today;
                                }).length}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-orange-50 rounded-lg p-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-orange-100 rounded-lg">
                            <TrendingUp className="h-6 w-6 text-orange-600" />
                        </div>
                        <div>
                            <p className="text-sm text-orange-600 font-medium">Avg Attendance</p>
                            <p className="text-2xl font-bold text-orange-900">
                                {(() => {
                                    const allStats = Object.keys(attendanceData).map(subjectId =>
                                        getSubjectStats(subjectId)
                                    ).filter(Boolean);

                                    if (allStats.length === 0) return '0%';

                                    const avgRate = allStats.reduce((sum, stat) =>
                                        sum + stat.overallAttendanceRate, 0
                                    ) / allStats.length;

                                    return `${Math.round(avgRate)}%`;
                                })()}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Filter & Search</h2>

                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search subjects..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    {/* Subject Filter */}
                    <select
                        value={selectedSubject}
                        onChange={(e) => {
                            setSelectedSubject(e.target.value);
                            setSelectedDivision('');
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="">All Subjects</option>
                        {[...new Set(subjects.map(s => s.subjectId._id))].map(subjectId => {
                            const subject = subjects.find(s => s.subjectId._id === subjectId);
                            return (
                                <option key={subjectId} value={subjectId}>
                                    {subject?.subjectId.subjectName} ({subject?.subjectId.subjectCode})
                                </option>
                            );
                        })}
                    </select>

                    {/* Division Filter */}
                    <select
                        value={selectedDivision}
                        onChange={(e) => setSelectedDivision(e.target.value)}
                        disabled={!selectedSubject}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                    >
                        <option value="">All Divisions</option>
                        {getAvailableDivisions().map(division => (
                            <option key={division} value={division}>
                                Division {division}
                            </option>
                        ))}
                    </select>

                    {/* Date Range */}
                    <div className="flex gap-2">
                        <input
                            type="date"
                            value={dateRange.startDate}
                            onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            max={dateRange.endDate || undefined}
                        />
                        <input
                            type="date"
                            value={dateRange.endDate}
                            onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            min={dateRange.startDate || undefined}
                        />
                    </div>
                </div>

                {/* Clear Filters */}
                {(searchTerm || selectedSubject || selectedDivision || dateRange.startDate || dateRange.endDate) && (
                    <div className="mt-4 pt-4 border-t">
                        <button
                            onClick={() => {
                                setSearchTerm('');
                                setSelectedSubject('');
                                setSelectedDivision('');
                                setDateRange({ startDate: '', endDate: '' });
                            }}
                            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                        >
                            Clear all filters
                        </button>
                    </div>
                )}
            </div>

            {/* Subjects Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredSubjects.length === 0 ? (
                    <div className="col-span-full bg-white rounded-lg shadow-sm border p-8 text-center">
                        <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No subjects found</h3>
                        <p className="text-gray-600">
                            {searchTerm ? 'Try adjusting your search terms.' : 'No subjects assigned yet.'}
                        </p>
                    </div>
                ) : (
                    filteredSubjects.map((subject) => {
                        const stats = getSubjectStats(subject.subjectId._id);

                        return (
                            <div key={`${subject.subjectId._id}-${subject.division}`}
                                className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">

                                {/* Subject Header */}
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900">
                                            {subject.subjectId.subjectName}
                                        </h3>
                                        <p className="text-sm text-gray-600">
                                            {subject.subjectId.subjectCode} • Division {subject.division}
                                        </p>
                                    </div>

                                    <Link
                                        to={`/teacher/mark-attendance/${subject.subjectId._id}?division=${subject.division}`}
                                        className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                        <Plus className="h-4 w-4" />
                                        Mark
                                    </Link>
                                </div>

                                {/* Stats */}
                                {stats && (
                                    <div className="grid grid-cols-3 gap-4 mb-4">
                                        <div className="text-center">
                                            <p className="text-xl font-bold text-gray-900">{stats.totalClasses}</p>
                                            <p className="text-xs text-gray-600">Classes</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-xl font-bold text-gray-900">{stats.totalStudents}</p>
                                            <p className="text-xs text-gray-600">Students</p>
                                        </div>
                                        <div className="text-center">
                                            <p className={`text-xl font-bold ${stats.overallAttendanceRate >= 75 ? 'text-green-600' :
                                                stats.overallAttendanceRate >= 60 ? 'text-yellow-600' : 'text-red-600'
                                                }`}>
                                                {Math.round(stats.overallAttendanceRate)}%
                                            </p>
                                            <p className="text-xs text-gray-600">Attendance</p>
                                        </div>
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div className="flex gap-2 pt-4 border-t">
                                    <Link
                                        to={`/teacher/attendance-history?subject=${subject.subjectId._id}&division=${subject.division}`}
                                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                                    >
                                        <Clock className="h-4 w-4" />
                                        History
                                    </Link>

                                    <Link
                                        to={`/teacher/mark-attendance/${subject.subjectId._id}?division=${subject.division}`}
                                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                                    >
                                        <Plus className="h-4 w-4" />
                                        Take Attendance
                                    </Link>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Recent Activity */}
            {getRecentActivity().length > 0 && (
                <div className="bg-white rounded-lg shadow-sm border p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>

                    <div className="space-y-3">
                        {getRecentActivity().map((record, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-100 rounded-lg">
                                        <Calendar className="h-4 w-4 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">
                                            {record.subjectName} - Division {record.division}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            {new Date(record.date).toLocaleDateString('en-IN')} •
                                            {record.presentCount}/{record.totalStudents} present
                                        </p>
                                    </div>
                                </div>

                                <div className="text-right">
                                    <p className={`text-sm font-medium ${(record.presentCount / record.totalStudents) >= 0.75 ? 'text-green-600' :
                                        (record.presentCount / record.totalStudents) >= 0.6 ? 'text-yellow-600' : 'text-red-600'
                                        }`}>
                                        {Math.round((record.presentCount / record.totalStudents) * 100)}%
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Attendance;