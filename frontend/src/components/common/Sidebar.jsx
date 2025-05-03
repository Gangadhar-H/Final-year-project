import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
    AcademicCapIcon,
    UserGroupIcon,
    BookOpenIcon,
    UserIcon,
    XMarkIcon,
    ArrowRightOnRectangleIcon,
    ChartBarIcon
} from '@heroicons/react/24/outline';

const Sidebar = ({ isOpen, setIsOpen }) => {
    const { currentUser, logout } = useAuth();
    const location = useLocation();

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
        <>
            {/* Mobile backdrop */}
            <div
                className={`fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden ${isOpen ? 'block' : 'hidden'}`}
                onClick={() => setIsOpen(false)}
            ></div>

            {/* Sidebar */}
            <div
                className={`fixed top-0 left-0 w-64 h-full bg-primary-800 text-white z-30 transform transition-transform duration-300 lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                <div className="flex items-center justify-between p-4 border-b border-primary-700">
                    <h1 className="text-xl font-bold">Admin Portal</h1>
                    <button onClick={() => setIsOpen(false)} className="lg:hidden">
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
        </>
    );
};

export default Sidebar;