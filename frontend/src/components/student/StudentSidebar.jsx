import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    Home,
    BookOpen,
    Calendar,
    TrendingUp,
    User,
    X,
    GraduationCap
} from 'lucide-react';

const StudentSidebar = ({ isOpen, onClose }) => {
    const menuItems = [
        {
            name: 'Dashboard',
            href: '/student/',
            icon: Home,
            exact: true
        },
        {
            name: 'Subjects',
            href: '/student/subjects',
            icon: BookOpen
        },
        {
            name: 'Attendance',
            href: '/student/attendance',
            icon: Calendar
        },
        {
            name: 'Internal Marks',
            href: '/student/internal-marks',
            icon: TrendingUp
        },
        {
            name: 'Profile',
            href: '/student/profile',
            icon: User
        }
    ];

    const handleLinkClick = () => {
        if (window.innerWidth < 1024) {
            onClose();
        }
    };

    return (
        <>
            {/* Overlay for mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed left-0 top-0 z-30 h-full w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:z-auto ${isOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                            <GraduationCap className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-lg font-semibold text-gray-900">Student</span>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-md text-gray-400 hover:text-gray-600 lg:hidden"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="mt-6 px-4">
                    <ul className="space-y-2">
                        {menuItems.map((item) => (
                            <li key={item.name}>
                                <NavLink
                                    to={item.href}
                                    end={item.exact}
                                    onClick={handleLinkClick}
                                    className={({ isActive }) =>
                                        `flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${isActive
                                            ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-700'
                                            : 'text-gray-700 hover:text-blue-700 hover:bg-gray-100'
                                        }`
                                    }
                                >
                                    <item.icon className="w-5 h-5 mr-3" />
                                    {item.name}
                                </NavLink>
                            </li>
                        ))}
                    </ul>
                </nav>

                {/* Footer */}
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
                    <div className="text-xs text-gray-500 text-center">
                        <p>Student Management System</p>
                        <p className="mt-1">v1.0.0</p>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default StudentSidebar;