import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import studentService from '../../services/studentService';
import StatCard from '../../components/student/StatCard';
import MarksChart from '../../components/student/MarksChart';
import {
    BookOpenIcon,
    AcademicCapIcon,
    CalendarIcon,
    ChartBarIcon,
    UserIcon,
    ClockIcon
} from '@heroicons/react/24/outline';

function Dashboard() {
    const { user } = useAuth();
    const [dashboardData, setDashboardData] = useState(null);
    const [marksData, setMarksData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                setError(null);

                // Fetch dashboard data and marks data in parallel
                const [dashboardResponse, marksResponse] = await Promise.all([
                    studentService.getDashboard(),
                    studentService.getInternalMarks()
                ]);

                setDashboardData(dashboardResponse.data);
                setMarksData(marksResponse);
            } catch (err) {
                console.error('Error fetching dashboard data:', err);
                setError(err.message || 'Failed to load dashboard data');
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchDashboardData();
        }
    }, [user]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="text-red-500 text-6xl mb-4">⚠️</div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Dashboard</h2>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    if (!dashboardData) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <p className="text-gray-600">No dashboard data available</p>
                </div>
            </div>
        );
    }

    const { student, stats, recentMarks, recentMaterials } = dashboardData;

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            {/* Welcome Section */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Welcome back, {student.name}!
                </h1>
                <p className="text-gray-600">
                    {student.uucmsNo} • Semester {student.semester} • Division {student.division}
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                    title="Total Subjects"
                    value={stats.totalSubjects}
                    subtitle="This semester"
                    icon={BookOpenIcon}
                    color="blue"
                />
                <StatCard
                    title="Attendance"
                    value={`${stats.attendancePercentage}%`}
                    subtitle={`${stats.presentClasses}/${stats.totalClasses} classes`}
                    icon={CalendarIcon}
                    color={stats.attendancePercentage >= 75 ? 'green' : stats.attendancePercentage >= 65 ? 'yellow' : 'red'}
                />
                <StatCard
                    title="Average Marks"
                    value={`${stats.averageMarks}%`}
                    subtitle={`${stats.totalAssignments} assignments`}
                    icon={AcademicCapIcon}
                    color={stats.averageMarks >= 80 ? 'green' : stats.averageMarks >= 60 ? 'yellow' : 'red'}
                />
                <StatCard
                    title="Total Assignments"
                    value={stats.totalAssignments}
                    subtitle="Completed"
                    icon={ChartBarIcon}
                    color="purple"
                />
            </div>

            {/* Charts and Recent Data */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Marks Chart - Takes up 2 columns */}
                <div className="lg:col-span-2">
                    <MarksChart marksData={marksData} chartType="bar" />
                </div>

                {/* Recent Marks */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Recent Marks
                    </h3>
                    {recentMarks && recentMarks.length > 0 ? (
                        <div className="space-y-4">
                            {recentMarks.map((mark, index) => (
                                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div className="flex-1">
                                        <p className="font-medium text-gray-900 text-sm">
                                            {mark.subject.subjectName}
                                        </p>
                                        <p className="text-xs text-gray-600">
                                            {mark.examType} • {new Date(mark.examDate).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className={`font-semibold text-sm ${(mark.obtainedMarks / mark.maxMarks * 100) >= 80 ? 'text-green-600' :
                                                (mark.obtainedMarks / mark.maxMarks * 100) >= 60 ? 'text-yellow-600' :
                                                    'text-red-600'
                                            }`}>
                                            {mark.obtainedMarks}/{mark.maxMarks}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {((mark.obtainedMarks / mark.maxMarks) * 100).toFixed(1)}%
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <AcademicCapIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                            <p className="text-gray-500 text-sm">No recent marks available</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Study Materials Section */}
            {recentMaterials && recentMaterials.length > 0 && (
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Recent Study Materials
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {recentMaterials.map((material, index) => (
                            <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                <div className="flex items-start justify-between mb-2">
                                    <h4 className="font-medium text-gray-900 text-sm truncate flex-1">
                                        {material.title}
                                    </h4>
                                    <span className="text-xs text-gray-500 ml-2">
                                        {new Date(material.uploadDate).toLocaleDateString()}
                                    </span>
                                </div>
                                <p className="text-xs text-gray-600 mb-2">
                                    {material.subject.subjectName}
                                </p>
                                <p className="text-xs text-gray-500">
                                    By {material.uploadedBy.name}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Quick Actions */}
            <div className="mt-8 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Quick Actions
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <button className="flex flex-col items-center p-4 bg-blue-50 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors">
                        <CalendarIcon className="w-8 h-8 text-blue-600 mb-2" />
                        <span className="text-sm font-medium text-blue-900">View Attendance</span>
                    </button>
                    <button className="flex flex-col items-center p-4 bg-green-50 rounded-lg border border-green-200 hover:bg-green-100 transition-colors">
                        <ChartBarIcon className="w-8 h-8 text-green-600 mb-2" />
                        <span className="text-sm font-medium text-green-900">View Marks</span>
                    </button>
                    <button className="flex flex-col items-center p-4 bg-purple-50 rounded-lg border border-purple-200 hover:bg-purple-100 transition-colors">
                        <BookOpenIcon className="w-8 h-8 text-purple-600 mb-2" />
                        <span className="text-sm font-medium text-purple-900">Study Materials</span>
                    </button>
                    <button className="flex flex-col items-center p-4 bg-yellow-50 rounded-lg border border-yellow-200 hover:bg-yellow-100 transition-colors">
                        <UserIcon className="w-8 h-8 text-yellow-600 mb-2" />
                        <span className="text-sm font-medium text-yellow-900">Profile</span>
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;