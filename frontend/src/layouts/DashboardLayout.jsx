import React, { useState } from 'react';
import { Outlet, Navigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

// Icons
import {
    AcademicCapIcon, UserGroupIcon, BookOpenIcon,
    UserIcon, Bars3Icon, XMarkIcon, ArrowRightOnRectangleIcon,
    ChartBarIcon
} from '@heroicons/react/24/outline';

const DashboardLayout = () => {
    const { currentUser, loading, logout, isAuthenticated } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const location = useLocation();

    // Show loading indicator
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    // Redirect if not authenticated
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    const navigation = [
        { name: 'Dashboard', href: '/admin', icon: ChartBarIcon },
        { name: 'Semesters', href: '/admin/semesters', icon: AcademicCapIcon },
        { name: 'Subjects', href: '/admin/subjects', icon: BookOpenIcon },
        { name: 'Teachers', href: '/admin/teachers', icon: UserIcon },
        { name: 'Students', href: '/admin/students', icon: UserGroupIcon },
    ];

    const isActive = (path) => {
        return location.pathname === path;
    };

    const handleLogout = () => {
        logout();
    };

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Mobile sidebar */}
            <div className={`fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`} onClick={() => setSidebarOpen(false)}></div>

            <div className={`fixed top-0 left-0 w-64 h-full bg-primary-800 text-white z-30 transform transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="flex items-center justify-between p-4 border-b border-primary-700">
                    <h1 className="text-xl font-bold">Admin Portal</h1>
                    <button onClick={() => setSidebarOpen(false)} className="lg:hidden">
                        <XMarkIcon className="h-6 w-6" />
                    </button>
                </div>

                <div className="p-4 border-b border-primary-700">
                    <div className="text-sm text-primary-300">Welcome,</div>
                    <div className="font-medium">{currentUser?.name || 'Admin'}</div>
                </div>

                <nav className="mt-6">
                    <ul>
                        {navigation.map((item) => (
                            <li key={item.name}>
                                <Link
                                    to={item.href}
                                    className={`flex items-center px-4 py-3 text-sm ${isActive(item.href)
                                            ? 'bg-primary-700 text-white font-medium'
                                            : 'text-primary-100 hover:bg-primary-700'
                                        }`}
                                >
                                    <item.icon className="h-5 w-5 mr-3" />
                                    {item.name}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>

                <div className="absolute bottom-0 w-full p-4 border-t border-primary-700">
                    <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-sm text-primary-100 hover:bg-primary-700 rounded"
                    >
                        <ArrowRightOnRectangleIcon className="h-5 w-5 mr-3" />
                        Logout
                    </button>
                </div>
            </div>

            {/* Main content */}
            <div className="lg:ml-64 min-h-screen flex flex-col">
                {/* Top navbar */}
                <header className="bg-white shadow-sm">
                    <div className="flex items-center justify-between px-4 py-3">
                        <button onClick={() => setSidebarOpen(true)} className="lg:hidden">
                            <Bars3Icon className="h-6 w-6" />
                        </button>
                        <div className="text-xl font-bold lg:hidden">Admin Portal</div>
                        <div className="flex items-center space-x-4">
                            <span className="text-sm font-medium hidden md:inline">
                                {currentUser?.email || 'admin@example.com'}
                            </span>
                        </div>
                    </div>
                </header>

                {/* Page content */}
                <main className="flex-1 p-6">
                    <Outlet />
                </main>

                {/* Footer */}
                <footer className="bg-white p-4 text-center text-sm text-gray-500">
                    © {new Date().getFullYear()} College Management System. All rights reserved.
                </footer>
            </div>
        </div>
    );
};

export default DashboardLayout;