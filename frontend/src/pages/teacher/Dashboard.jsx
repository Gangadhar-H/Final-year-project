import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    getAssignedSubjects,
    getAttendance,
    calculateAttendanceStats,
    formatAttendanceForDisplay
} from '../../services/teacherService';

const Dashboard = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [dashboardData, setDashboardData] = useState({
        subjects: [],
        recentAttendance: [],
        stats: {
            totalSubjects: 0,
            totalStudents: 0,
            recentAttendanceRate: 0,
            totalClassesToday: 0
        }
    });
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            setError(null);

            // Fetch assigned subjects
            const subjectsResponse = await getAssignedSubjects();
            const subjects = subjectsResponse.assignedSubjects || [];

            // Fetch recent attendance for each subject (last 7 days)
            const today = new Date();
            const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

            let allRecentAttendance = [];
            let totalStudents = 0;
            let totalClassesToday = 0;

            for (const subject of subjects) {
                try {
                    // Get attendance for the last week
                    const attendanceResponse = await getAttendance(subject.subjectId._id, {
                        startDate: weekAgo.toISOString().split('T')[0],
                        endDate: today.toISOString().split('T')[0]
                    });

                    // Remove attendanceResponse.success check
                    if (attendanceResponse.attendance) {
                        const formattedAttendance = formatAttendanceForDisplay(attendanceResponse.attendance);

                        // Add subject info to each attendance record
                        const attendanceWithSubject = formattedAttendance.map(record => ({
                            ...record,
                            subjectName: subject.subjectId.subjectName,
                            subjectCode: subject.subjectId.subjectCode,
                            division: subject.division
                        }));

                        allRecentAttendance.push(...attendanceWithSubject);

                        // Count today's classes
                        const todayStr = today.toISOString().split('T')[0];
                        const todayClasses = attendanceResponse.attendance.filter(record =>
                            new Date(record.date).toISOString().split('T')[0] === todayStr
                        );
                        totalClassesToday += todayClasses.length;

                        // Estimate total students (use the latest attendance record for this subject)
                        if (formattedAttendance.length > 0) {
                            totalStudents += formattedAttendance[formattedAttendance.length - 1].totalStudents;
                        }
                    }
                } catch (attendanceError) {
                    console.warn(`Failed to fetch attendance for subject ${subject.subjectId.subjectName}:`, attendanceError);
                }
            }

            // Sort recent attendance by date (most recent first)
            allRecentAttendance.sort((a, b) => new Date(b.date) - new Date(a.date));

            // Calculate overall stats
            const attendanceStats = calculateAttendanceStats(allRecentAttendance);

            setDashboardData({
                subjects,
                recentAttendance: allRecentAttendance.slice(0, 5), // Show only last 5 records
                stats: {
                    totalSubjects: subjects.length,
                    totalStudents: Math.round(totalStudents / Math.max(subjects.length, 1)), // Average students per subject
                    recentAttendanceRate: attendanceStats.overallAttendanceRate,
                    totalClassesToday
                }
            });

        } catch (err) {
            console.error('Error fetching dashboard data:', err);
            setError('Failed to load dashboard data. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAttendance = (subjectId) => {
        navigate(`/teacher/mark-attendance/${subjectId}`);
    };

    const quickActions = [
        {
            title: 'Mark Attendance',
            description: 'Record student attendance for today',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
            ),
            color: 'bg-blue-500 hover:bg-blue-600',
            action: () => navigate('/teacher/attendance')
        },
        {
            title: 'View Subjects',
            description: 'Manage your assigned subjects',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
            ),
            color: 'bg-green-500 hover:bg-green-600',
            action: () => navigate('/teacher/subjects')
        },
        {
            title: 'Attendance History',
            description: 'Review past attendance records',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
            ),
            color: 'bg-purple-500 hover:bg-purple-600',
            action: () => navigate('/teacher/attendance-history')
        },
        {
            title: 'Profile Settings',
            description: 'Update your profile information',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
            ),
            color: 'bg-gray-500 hover:bg-gray-600',
            action: () => navigate('/teacher/profile')
        }
    ];

    if (loading) {
        return (
            <div className="p-6">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="bg-white p-6 rounded-lg shadow">
                                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex">
                        <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-red-800">Error Loading Dashboard</h3>
                            <p className="text-sm text-red-700 mt-1">{error}</p>
                            <button
                                onClick={fetchDashboardData}
                                className="mt-2 text-sm bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded"
                            >
                                Try Again
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* Welcome Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg p-6 text-white">
                <h1 className="text-2xl font-bold mb-2">
                    Welcome back, {user?.name}!
                </h1>
                <p className="text-blue-100">
                    {new Date().toLocaleDateString('en-IN', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    })}
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <div className="flex items-center">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Total Subjects</p>
                            <p className="text-2xl font-bold text-gray-900">{dashboardData.stats.totalSubjects}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <div className="flex items-center">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Avg Students</p>
                            <p className="text-2xl font-bold text-gray-900">{dashboardData.stats.totalStudents}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <div className="flex items-center">
                        <div className="p-2 bg-purple-100 rounded-lg">
                            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Attendance Rate</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {dashboardData.stats.recentAttendanceRate.toFixed(1)}%
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <div className="flex items-center">
                        <div className="p-2 bg-orange-100 rounded-lg">
                            <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Classes Today</p>
                            <p className="text-2xl font-bold text-gray-900">{dashboardData.stats.totalClassesToday}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Assigned Subjects */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-lg shadow-sm border">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-semibold text-gray-900">Your Subjects</h2>
                                <button
                                    onClick={() => navigate('/teacher/subjects')}
                                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                >
                                    View All →
                                </button>
                            </div>
                        </div>
                        <div className="p-6 space-y-4">
                            {dashboardData.subjects.length > 0 ? (
                                dashboardData.subjects.map((subject) => (
                                    <div
                                        key={`${subject.subjectId._id}-${subject.division}`}
                                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                    >
                                        <div className="flex items-center space-x-3">
                                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                                <span className="text-blue-600 font-semibold text-sm">
                                                    {subject.subjectId.subjectCode.substring(0, 2).toUpperCase()}
                                                </span>
                                            </div>
                                            <div>
                                                <h3 className="font-medium text-gray-900">
                                                    {subject.subjectId.subjectName}
                                                </h3>
                                                <p className="text-sm text-gray-500">
                                                    {subject.subjectId.subjectCode} - Division {subject.division}
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleMarkAttendance(subject.subjectId._id)}
                                            className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium hover:bg-blue-200 transition-colors"
                                        >
                                            Mark Attendance
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    <svg className="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                    </svg>
                                    <p>No subjects assigned yet</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="space-y-6">
                    {/* Recent Attendance */}
                    <div className="bg-white rounded-lg shadow-sm border">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-semibold text-gray-900">Recent Attendance</h2>
                                <button
                                    onClick={() => navigate('/teacher/attendance-history')}
                                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                >
                                    View All →
                                </button>
                            </div>
                        </div>
                        <div className="p-6">
                            {dashboardData.recentAttendance.length > 0 ? (
                                <div className="space-y-3">
                                    {dashboardData.recentAttendance.map((record, index) => (
                                        <div key={index} className="flex items-center justify-between py-2">
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">
                                                    {record.subjectCode}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {record.formattedDate} - Div {record.division}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-medium text-gray-900">
                                                    {record.attendancePercentage}%
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {record.presentCount}/{record.totalStudents}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-4 text-gray-500">
                                    <p className="text-sm">No recent attendance records</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-white rounded-lg shadow-sm border">
                        <div className="p-6 border-b border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
                        </div>
                        <div className="p-6 space-y-3">
                            {quickActions.map((action, index) => (
                                <button
                                    key={index}
                                    onClick={action.action}
                                    className={`w-full flex items-center p-3 rounded-lg text-white transition-colors ${action.color}`}
                                >
                                    <div className="flex-shrink-0">{action.icon}</div>
                                    <div className="ml-3 text-left">
                                        <p className="font-medium">{action.title}</p>
                                        <p className="text-sm opacity-90">{action.description}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;