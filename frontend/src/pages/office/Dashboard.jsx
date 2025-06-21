import { useState, useEffect } from 'react';
import {
    Users,
    BookOpen,
    UserPlus,
    TrendingUp,
    Calendar,
    GraduationCap,
    FileText,
    Activity,
    User
} from 'lucide-react';
import officeService from '../../services/officeService';
import { Link } from 'react-router-dom';

const Dashboard = () => {
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const response = await officeService.getDashboard();
            setDashboardData(response.dashboard);
        } catch (err) {
            setError(err.message || 'Failed to fetch dashboard data');
            console.error('Dashboard fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto mt-8">
                <div className="flex items-center">
                    <div className="flex-shrink-0">
                        <Activity className="h-5 w-5 text-red-400" />
                    </div>
                    <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-800">
                            Error Loading Dashboard
                        </h3>
                        <div className="mt-2 text-sm text-red-700">
                            <p>{error}</p>
                        </div>
                        <div className="mt-4">
                            <button
                                onClick={fetchDashboardData}
                                className="bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded text-sm font-medium"
                            >
                                Try Again
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const {
        totalStudents = 0,
        totalSemesters = 0,
        recentStudents = 0,
        studentsBySemester = [],
        permissions = {}
    } = dashboardData || {};

    // Stats cards data
    const statsCards = [
        {
            title: 'Total Students',
            value: totalStudents,
            icon: Users,
            color: 'bg-blue-500',
            bgColor: 'bg-blue-50',
            textColor: 'text-blue-700'
        },
        {
            title: 'Total Semesters',
            value: totalSemesters,
            icon: BookOpen,
            color: 'bg-green-500',
            bgColor: 'bg-green-50',
            textColor: 'text-green-700'
        },
        {
            title: 'Recent Additions',
            value: recentStudents,
            icon: UserPlus,
            color: 'bg-purple-500',
            bgColor: 'bg-purple-50',
            textColor: 'text-purple-700',
            subtitle: 'Last 7 days'
        },
        {
            title: 'Active Semesters',
            value: studentsBySemester.length,
            icon: GraduationCap,
            color: 'bg-orange-500',
            bgColor: 'bg-orange-50',
            textColor: 'text-orange-700'
        }
    ];

    // Permission cards
    const permissionCards = [
        {
            name: 'Student Management',
            key: 'studentManagement',
            icon: Users,
            description: 'Add, edit, and manage student records'
        },
        {
            name: 'Fee Management',
            key: 'feeManagement',
            icon: FileText,
            description: 'Handle student fee collections and records'
        },
        {
            name: 'Certificate Issue',
            key: 'certificateIssue',
            icon: GraduationCap,
            description: 'Issue certificates and academic documents'
        },
        {
            name: 'Notice Management',
            key: 'noticeManagement',
            icon: Activity,
            description: 'Create and manage official notices'
        },
        {
            name: 'Report Generation',
            key: 'reportGeneration',
            icon: TrendingUp,
            description: 'Generate various administrative reports'
        }
    ];

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Office Dashboard</h1>
                        <p className="text-gray-600 mt-1">Overview of student management and system statistics</p>
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="h-4 w-4 mr-2" />
                        Last updated: {new Date().toLocaleDateString()}
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statsCards.map((card, index) => {
                    const IconComponent = card.icon;
                    return (
                        <div key={index} className={`${card.bgColor} rounded-lg p-6 border`}>
                            <div className="flex items-center">
                                <div className={`${card.color} p-3 rounded-lg`}>
                                    <IconComponent className="h-6 w-6 text-white" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">{card.title}</p>
                                    <p className={`text-2xl font-bold ${card.textColor}`}>
                                        {card.value.toLocaleString()}
                                    </p>
                                    {card.subtitle && (
                                        <p className="text-xs text-gray-500 mt-1">{card.subtitle}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Students by Semester */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-gray-900">Students by Semester</h2>
                        <TrendingUp className="h-5 w-5 text-gray-400" />
                    </div>

                    {studentsBySemester.length > 0 ? (
                        <div className="space-y-4">

                            {studentsBySemester.map((semester, index) => {
                                const percentage = totalStudents > 0 ? (semester.count / totalStudents) * 100 : 0;
                                return (
                                    <div key={index} className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                                                <span className="text-blue-600 font-semibold">
                                                    {semester._id}
                                                </span>
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">
                                                    Semester {semester._id}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-lg font-semibold text-gray-900">
                                                {semester.count}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-500">
                            <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                            <p>No student data available</p>
                        </div>
                    )}
                </div>

                {/* Permissions Overview */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-gray-900">Your Permissions</h2>
                        <Activity className="h-5 w-5 text-gray-400" />
                    </div>

                    <div className="space-y-3">
                        {permissionCards.map((permission, index) => {
                            const IconComponent = permission.icon;
                            const hasPermission = permissions[permission.key];

                            return (
                                <div
                                    key={index}
                                    className={`p-3 rounded-lg border-2 ${hasPermission
                                        ? 'border-green-200 bg-green-50'
                                        : 'border-gray-200 bg-gray-50'
                                        }`}
                                >
                                    <div className="flex items-center">
                                        <div className={`p-2 rounded ${hasPermission ? 'bg-green-100' : 'bg-gray-100'
                                            } mr-3`}>
                                            <IconComponent className={`h-4 w-4 ${hasPermission ? 'text-green-600' : 'text-gray-400'
                                                }`} />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between">
                                                <h3 className={`font-medium ${hasPermission ? 'text-green-900' : 'text-gray-600'
                                                    }`}>
                                                    {permission.name}
                                                </h3>
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${hasPermission
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-gray-100 text-gray-600'
                                                    }`}>
                                                    {hasPermission ? 'Enabled' : 'Disabled'}
                                                </span>
                                            </div>
                                            <p className={`text-sm ${hasPermission ? 'text-green-700' : 'text-gray-500'
                                                } mt-1`}>
                                                {permission.description}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            {permissions.studentManagement && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Link
                            to='/office/students'
                            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors group">
                            <User className="h-8 w-8 text-gray-400 group-hover:text-blue-500 mx-auto mb-2" />
                            <p className="text-sm font-medium text-gray-600 group-hover:text-blue-600 text-center">
                                Students
                            </p>
                        </Link>
                        <Link
                            to='/office/students/bulk-upload'
                            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors group">
                            <FileText className="h-8 w-8 text-gray-400 group-hover:text-green-500 mx-auto mb-2" />
                            <p className="text-sm font-medium text-gray-600 group-hover:text-green-600 text-center">
                                Bulk Upload
                            </p>
                        </Link>

                        <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors group">
                            <TrendingUp className="h-8 w-8 text-gray-400 group-hover:text-purple-500 mx-auto mb-2" />
                            <p className="text-sm font-medium text-gray-600 group-hover:text-purple-600">
                                View Reports
                            </p>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;