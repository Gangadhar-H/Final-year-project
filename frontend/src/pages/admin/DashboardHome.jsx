import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import API from '../../api/axios';
import { Loader2, Users, BookOpen, GraduationCap, UserCog } from 'lucide-react';

// Dashboard Statistics Card Component
const StatCard = ({ title, value, icon, color }) => {
    const Icon = icon;
    return (
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 hover:shadow-lg transition-shadow" style={{ borderLeftColor: color }}>
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-gray-500 text-sm font-medium mb-1">{title}</h3>
                    <p className="text-2xl font-bold text-gray-800">{value}</p>
                </div>
                <div className="p-3 rounded-full" style={{ backgroundColor: `${color}20` }}>
                    <Icon stroke={color} size={24} />
                </div>
            </div>
        </div>
    );
};

// Recent Activity Component
const ActivityItem = ({ title, time, description, type }) => {
    const getBgColor = () => {
        switch (type) {
            case 'student': return 'bg-blue-100 text-blue-600';
            case 'teacher': return 'bg-green-100 text-green-600';
            case 'subject': return 'bg-purple-100 text-purple-600';
            case 'semester': return 'bg-yellow-100 text-yellow-600';
            default: return 'bg-gray-100 text-gray-600';
        }
    };

    return (
        <div className="py-3">
            <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getBgColor()}`}>
                    {type === 'student' && <GraduationCap size={16} />}
                    {type === 'teacher' && <UserCog size={16} />}
                    {type === 'subject' && <BookOpen size={16} />}
                    {type === 'semester' && <Users size={16} />}
                </div>
                <div className="flex-1">
                    <p className="font-medium">{title}</p>
                    <p className="text-sm text-gray-500">{description}</p>
                </div>
                <span className="text-xs text-gray-400">{time}</span>
            </div>
        </div>
    );
};

// Dashboard Component
export default function DashboardHome() {
    const { auth } = useAuth();
    const [stats, setStats] = useState({
        students: 0,
        teachers: 0,
        subjects: 0,
        semesters: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [recentActivities, setRecentActivities] = useState([]);
    const [semesterDistribution, setSemesterDistribution] = useState([]);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);

                // Fetch all required data in parallel
                const [
                    studentsRes,
                    teachersRes,
                    semestersRes
                ] = await Promise.all([
                    API.get('/admin/students'),
                    API.get('/admin/teachers'),
                    API.get('/admin/semesters/getAllSemesters')
                ]);

                // Get subjects count from all semesters
                let allSubjects = [];
                for (const semester of semestersRes.data.semesters) {
                    const subjectsRes = await API.get(`/admin/semesters/${semester.semesterNumber}/subjects`);
                    allSubjects = [...allSubjects, ...(subjectsRes.data.subjects || [])];
                }

                // Set statistics
                setStats({
                    students: studentsRes.data.length || 0,
                    teachers: teachersRes.data.teachers?.length || 0,
                    subjects: allSubjects.length || 0,
                    semesters: semestersRes.data.semesters?.length || 0
                });

                // Create semester distribution data for chart
                const distribution = semestersRes.data.semesters.map(semester => {
                    const studentCount = studentsRes.data.filter(
                        student => student.semester?._id === semester._id
                    ).length;

                    return {
                        semester: `Semester ${semester.semesterNumber}`,
                        students: studentCount,
                        divisions: semester.divisions.length
                    };
                });

                setSemesterDistribution(distribution);

                // Generate recent activities based on timestamps
                // Combine all entities and sort by creation date
                const allEntities = [
                    ...(studentsRes.data.map(item => ({
                        ...item,
                        type: 'student',
                        title: `${item.name} added`,
                        description: `Student added to Semester ${item.semester?.semesterNumber || 'Unknown'}, Division ${item.division}`
                    }))),
                    ...(teachersRes.data.teachers?.map(item => ({
                        ...item,
                        type: 'teacher',
                        title: `${item.name} added`,
                        description: `Teacher ID: ${item.teacherId}`
                    })) || []),
                    ...(allSubjects.map(item => ({
                        ...item,
                        type: 'subject',
                        title: `${item.subjectName} added`,
                        description: `Subject Code: ${item.subjectCode}`
                    }))),
                    ...(semestersRes.data.semesters?.map(item => ({
                        ...item,
                        type: 'semester',
                        title: `Semester ${item.semesterNumber} added`,
                        description: `With ${item.divisions.length} division(s): ${item.divisions.join(', ')}`
                    })) || [])
                ];

                // Sort by createdAt, newest first
                allEntities.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

                // Take only the 10 most recent activities
                setRecentActivities(allEntities.slice(0, 10));

            } catch (err) {
                console.error("Error fetching dashboard data:", err);
                setError("Failed to load dashboard data. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto" />
                    <p className="mt-2 text-gray-600">Loading dashboard data...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
                <div className="flex">
                    <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <div className="ml-3">
                        <p className="text-sm text-red-600">{error}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>
                <p className="text-gray-500">Welcome back, {auth?.name || 'Admin'}</p>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Students"
                    value={stats.students}
                    icon={GraduationCap}
                    color="#4F46E5"
                />
                <StatCard
                    title="Teachers"
                    value={stats.teachers}
                    icon={UserCog}
                    color="#10B981"
                />
                <StatCard
                    title="Subjects"
                    value={stats.subjects}
                    icon={BookOpen}
                    color="#8B5CF6"
                />
                <StatCard
                    title="Semesters"
                    value={stats.semesters}
                    icon={Users}
                    color="#F59E0B"
                />
            </div>

            {/* Dashboard Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Semester Information */}
                <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-medium mb-4">Semester Distribution</h3>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Semester
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Students
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Divisions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {semesterDistribution.length > 0 ? (
                                    semesterDistribution.map((item, index) => (
                                        <tr key={index}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {item.semester}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {item.students} students
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {item.divisions} divisions
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="3" className="px-6 py-4 text-center text-sm text-gray-500">
                                            No semester data available
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-medium mb-4">Recent Activity</h3>
                    <div className="divide-y divide-gray-100">
                        {recentActivities.length > 0 ? (
                            recentActivities.map((activity, index) => (
                                <ActivityItem
                                    key={index}
                                    title={activity.title}
                                    time={new Date(activity.createdAt).toLocaleDateString()}
                                    description={activity.description}
                                    type={activity.type}
                                />
                            ))
                        ) : (
                            <p className="text-gray-500 py-4 text-center">No recent activities found</p>
                        )}
                    </div>
                </div>
            </div>

            {/* System Info */}
            <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium mb-4">System Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="border border-gray-200 rounded-lg p-4">
                        <div className="text-sm font-medium text-gray-500 mb-1">System Name</div>
                        <div className="text-lg font-semibold">eduVerse</div>
                    </div>
                    <div className="border border-gray-200 rounded-lg p-4">
                        <div className="text-sm font-medium text-gray-500 mb-1">Current Academic Year</div>
                        <div className="text-lg font-semibold">{new Date().getFullYear()}</div>
                    </div>
                    <div className="border border-gray-200 rounded-lg p-4">
                        <div className="text-sm font-medium text-gray-500 mb-1">Last Updated</div>
                        <div className="text-lg font-semibold">{new Date().toLocaleDateString()}</div>
                    </div>
                </div>
            </div>
        </div>
    );
}