import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const TeacherHeader = () => {
    const [showProfileDropdown, setShowProfileDropdown] = useState(false);
    const { logout, user } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error('Logout error:', error);
            // Force navigate even if logout fails
            navigate('/login');
        }
    };

    const navigateToProfile = () => {
        setShowProfileDropdown(false);
        navigate('/teacher/profile');
    };

    return (
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm">
            {/* Left side - Welcome message */}
            <div className="flex items-center">
                <h1 className="text-xl font-semibold text-gray-800">
                    Welcome, {user?.name || 'Teacher'}
                </h1>
                {user?.teacherId && (
                    <span className="ml-3 px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                        ID: {user.teacherId}
                    </span>
                )}
            </div>

            {/* Right side - Profile menu */}
            <div className="flex items-center space-x-4">
                {/* Current time display */}
                <div className="hidden md:block text-sm text-gray-600">
                    {new Date().toLocaleDateString('en-IN', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    })}
                </div>

                {/* Profile dropdown */}
                <div className="relative">
                    <button
                        onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                        className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md p-2"
                    >
                        {/* Avatar */}
                        <div className="w-8 h-8 bg-cyan-500 rounded-full flex items-center justify-center text-white font-medium text-sm">
                            {user?.name?.charAt(0).toUpperCase() || 'T'}
                        </div>
                        <span className="hidden md:block font-medium">
                            {user?.name || 'Teacher'}
                        </span>
                        {/* Dropdown arrow */}
                        <svg
                            className={`w-4 h-4 transition-transform duration-200 ${showProfileDropdown ? 'rotate-180' : ''
                                }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>

                    {/* Dropdown menu */}
                    {showProfileDropdown && (
                        <>
                            {/* Backdrop */}
                            <div
                                className="fixed inset-0 z-10"
                                onClick={() => setShowProfileDropdown(false)}
                            />

                            {/* Dropdown content */}
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-20">
                                <div className="px-4 py-2 border-b border-gray-100">
                                    <p className="text-sm font-medium text-gray-900">
                                        {user?.name || 'Teacher'}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        {user?.email}
                                    </p>
                                </div>

                                <button
                                    onClick={navigateToProfile}
                                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 focus:outline-none focus:bg-gray-100"
                                >
                                    <div className="flex items-center">
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                        Profile Settings
                                    </div>
                                </button>

                                <button
                                    onClick={handleLogout}
                                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 focus:outline-none focus:bg-red-50"
                                >
                                    <div className="flex items-center">
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                        </svg>
                                        Sign Out
                                    </div>
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
};

export default TeacherHeader;