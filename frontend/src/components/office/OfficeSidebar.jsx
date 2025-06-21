import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const OfficeSidebar = ({ isCollapsed = false }) => {
    const { user } = useAuth();
    const location = useLocation();

    // Navigation items based on permissions
    const getNavigationItems = () => {
        const items = [
            {
                name: 'Dashboard',
                href: '/office/',
                icon: (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m8 5l4-4 4 4" />
                    </svg>
                ),
                always: true
            },
            {
                name: 'Profile',
                href: '/office/profile',
                icon: (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                ),
                always: true
            }
        ];

        // Add permission-based items
        if (user?.permissions?.studentManagement) {
            items.splice(1, 0, {
                name: 'Students',
                href: '/office/students',
                icon: (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                    </svg>
                ),
                permission: 'studentManagement',
                // badge: 'Student Mgmt'
            });
        }

        if (user?.permissions?.feeManagement) {
            items.push({
                name: 'Fee Management',
                href: '/office/fees',
                icon: (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                ),
                permission: 'feeManagement',
                // badge: 'Fee'
            });
        }

        if (user?.permissions?.reportGeneration) {
            items.push({
                name: 'Reports',
                href: '/office/reports',
                icon: (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                ),
                permission: 'reportGeneration',
                // badge: 'Report'
            });
        }

        return items;
    };

    const navigationItems = getNavigationItems();

    const isActiveRoute = (href) => {
        if (href === '/office/dashboard') {
            return location.pathname === '/office' || location.pathname === '/office/dashboard';
        }
        return location.pathname.startsWith(href);
    };

    return (
        <div className={`bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-64'
            }`}>
            {/* Logo/Brand section */}
            <div className="p-4 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                    </div>
                    {!isCollapsed && (
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900">Office Portal</h2>
                            <p className="text-xs text-gray-500">Management System</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4">
                <ul className="space-y-2">
                    {navigationItems.map((item) => (
                        <li key={item.name}>
                            <NavLink
                                to={item.href}
                                className={({ isActive }) =>
                                    `flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${isActiveRoute(item.href)
                                        ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-700'
                                        : 'text-gray-700 hover:text-blue-700 hover:bg-gray-100'
                                    }`
                                }
                                title={isCollapsed ? item.name : ''}
                            >
                                <span className="flex-shrink-0">{item.icon}</span>
                                {!isCollapsed && (
                                    <>
                                        <span className="ml-3 truncate">{item.name}</span>
                                        {item.badge && (
                                            <span className="ml-auto inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                {item.badge}
                                            </span>
                                        )}
                                    </>
                                )}
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </nav>

            {/* Permission summary */}
            {!isCollapsed && (
                <div className="p-4 border-t border-gray-200">
                    <div className="text-xs text-gray-500 mb-2 font-medium">Active Permissions</div>
                    <div className="flex flex-wrap gap-1">
                        {user?.permissions && Object.entries(user.permissions).map(([key, value]) => {
                            if (!value) return null;
                            const permissionNames = {
                                studentManagement: 'Students',
                                feeManagement: 'Fees',
                                reportGeneration: 'Reports'
                            };
                            return (
                                <span
                                    key={key}
                                    className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 border border-green-200"
                                >
                                    {permissionNames[key]}
                                </span>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Footer */}
            <div className={`p-4 border-t border-gray-200 ${isCollapsed ? 'text-center' : ''}`}>
                <div className="text-xs text-gray-500">
                    {isCollapsed ? (
                        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mx-auto">
                            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    ) : (
                        <div className="text-center">
                            <div className="font-medium text-gray-700">EduVerse</div>
                            <div className="mt-1">Office Module v1.0</div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OfficeSidebar;