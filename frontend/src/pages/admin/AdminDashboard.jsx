import React, { useEffect, useState } from 'react';
import {
    AcademicCapIcon,
    UserGroupIcon,
    BookOpenIcon,
    UserIcon
} from '@heroicons/react/24/outline';
import useAxios from '../../hooks/useAxios';
import Loader from '../../components/common/Loader';
import ErrorAlert from '../../components/common/ErrorAlert';

const AdminDashboard = () => {
    const { data: semestersData, loading: semestersLoading, error: semestersError } = useAxios('/api/v1/admin/semesters/getAllSemesters');
    const { data: teachersData, loading: teachersLoading, error: teachersError } = useAxios('/api/v1/admin/teachers');
    const { data: studentsData, loading: studentsLoading, error: studentsError } = useAxios('/api/v1/admin/students');

    const [stats, setStats] = useState({
        semesters: 0,
        teachers: 0,
        subjects: 0,
        students: 0,
    });

    useEffect(() => {
        if (semestersData) {
            setStats(prev => ({ ...prev, semesters: semestersData.semesters?.length || 0 }));
        }

        if (teachersData) {
            setStats(prev => ({ ...prev, teachers: teachersData.teachers?.length || 0 }));
        }

        if (studentsData) {
            setStats(prev => ({ ...prev, students: studentsData?.length || 0 }));
        }
    }, [semestersData, teachersData, studentsData]);

    const isLoading = semestersLoading || teachersLoading || studentsLoading;
    const error = semestersError || teachersError || studentsError;

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader />
            </div>
        );
    }

    if (error) {
        return <ErrorAlert message={error} />;
    }

    const statCards = [
        {
            title: 'Semesters',
            count: stats.semesters,
            icon: AcademicCapIcon,
            color: 'bg-blue-500'
        },
        {
            title: 'Teachers',
            count: stats.teachers,
            icon: UserIcon,
            color: 'bg-green-500'
        },
        {
            title: 'Subjects',
            count: stats.subjects,
            icon: BookOpenIcon,
            color: 'bg-purple-500'
        },
        {
            title: 'Students',
            count: stats.students,
            icon: UserGroupIcon,
            color: 'bg-orange-500'
        },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="page-heading">Admin Dashboard</h1>
                <p className="text-gray-600 mt-1">Overview of the college management system</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat, index) => (
                    <div key={index} className="bg-white rounded-lg shadow-sm overflow-hidden">
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className={`${stat.color} rounded-full p-3`}>
                                    <stat.icon className="h-6 w-6 text-white" />
                                </div>
                                <div className="ml-5">
                                    <p className="text-sm font-medium text-gray-500 mb-1">{stat.title}</p>
                                    <p className="text-2xl font-bold text-gray-900">{stat.count}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <div className="p-5">
                        <h2 className="text-lg font-semibold mb-4">Recent Activities</h2>
                        <div className="space-y-3">
                            <div className="flex items-center p-3 bg-gray-50 rounded">
                                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                                <p className="text-sm">Admin logged in</p>
                                <p className="text-xs text-gray-500 ml-auto">Today</p>
                            </div>
                            <div className="flex items-center p-3 bg-gray-50 rounded">
                                <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                                <p className="text-sm">New student added</p>
                                <p className="text-xs text-gray-500 ml-auto">Yesterday</p>
                            </div>
                            <div className="flex items-center p-3 bg-gray-50 rounded">
                                <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                                <p className="text-sm">Subject assigned to teacher</p>
                                <p className="text-xs text-gray-500 ml-auto">2 days ago</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <div className="p-5">
                        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <a href="/admin/students" className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100">
                                <UserGroupIcon className="h-8 w-8 text-blue-500 mb-2" />
                                <p className="text-sm font-medium">Manage Students</p>
                            </a>
                            <a href="/admin/teachers" className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100">
                                <UserIcon className="h-8 w-8 text-green-500 mb-2" />
                                <p className="text-sm font-medium">Manage Teachers</p>
                            </a>
                            <a href="/admin/subjects" className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100">
                                <BookOpenIcon className="h-8 w-8 text-purple-500 mb-2" />
                                <p className="text-sm font-medium">Manage Subjects</p>
                            </a>
                            <a href="/admin/semesters" className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100">
                                <AcademicCapIcon className="h-8 w-8 text-orange-500 mb-2" />
                                <p className="text-sm font-medium">Manage Semesters</p>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;