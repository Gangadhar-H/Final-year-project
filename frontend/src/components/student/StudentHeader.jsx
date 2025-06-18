import React, { useState } from 'react';
import { Menu, X, User, LogOut, Settings } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const StudentHeader = ({ onMenuToggle }) => {
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const { user, logout } = useAuth();

    const handleLogout = async () => {
        try {
            await logout();
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    return (
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
            <div className="flex items-center justify-between px-4 py-3">
                {/* Left side - Menu toggle and title */}
                <div className="flex items-center space-x-4">
                    <button
                        onClick={onMenuToggle}
                        className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 lg:hidden"
                    >
                        <Menu className="w-6 h-6" />
                    </button>
                    <div>
                        <h1 className="text-xl font-semibold text-gray-900">Student Portal</h1>
                        <p className="text-sm text-gray-500">Welcome back, {user?.student?.name || user?.name}</p>
                    </div>
                </div>

                {/* Right side - Profile dropdown */}
                <div className="relative">
                    <button
                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                        className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-white" />
                        </div>
                        <div className="hidden md:block text-left">
                            <p className="text-sm font-medium text-gray-700">
                                {user?.student?.name || user?.name}
                            </p>
                            <p className="text-xs text-gray-500">
                                {user?.uucmsNo} • Sem {user?.semester?.semesterNumber}
                            </p>
                        </div>
                    </button>

                    {/* Dropdown menu */}
                    {isProfileOpen && (
                        <>
                            <div
                                className="fixed inset-0 z-10"
                                onClick={() => setIsProfileOpen(false)}
                            />
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-20">
                                <div className="px-4 py-2 border-b border-gray-100">
                                    <p className="text-sm font-medium text-gray-900">
                                        {user?.student?.name || user?.name}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {user?.student?.email}
                                    </p>
                                </div>

                                <a
                                    href="#"
                                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setIsProfileOpen(false);
                                        // Navigate to profile page
                                        window.location.hash = '#/student/profile';
                                    }}
                                >
                                    <Settings className="w-4 h-4 mr-3" />
                                    Profile Settings
                                </a>

                                <button
                                    onClick={handleLogout}
                                    className="flex items-center w-full px-4 py-2 text-sm text-red-700 hover:bg-red-50"
                                >
                                    <LogOut className="w-4 h-4 mr-3" />
                                    Sign Out
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
};

export default StudentHeader;