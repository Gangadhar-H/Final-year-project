import { NavLink, Outlet } from 'react-router-dom';

const navItems = [
    { to: '/admin', label: 'Dashboard' },
    { to: '/admin/semesters', label: 'Semesters' },
    { to: '/admin/subjects', label: 'Subjects' },
    { to: '/admin/students', label: 'Students' },
    { to: '/admin/teachers', label: 'Teachers' },
    { to: '/admin/profile', label: 'Profile' },
];

export default function AdminLayout() {
    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r">
                <div className="p-4 text-2xl font-bold">eduVerse: Admin</div>
                <nav className="mt-6">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            end
                            className={({ isActive }) =>
                                `block px-4 py-2 text-gray-700 hover:bg-gray-200 ${isActive ? 'bg-gray-200 font-semibold' : ''
                                }`
                            }
                        >
                            {item.label}
                        </NavLink>
                    ))}
                </nav>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
                {/* Header */}
                <header className="h-16 bg-white border-b flex items-center px-6 shadow-sm">
                    <h1 className="text-xl font-semibold flex-1">Welcome, Admin</h1>
                    {/* e.g. Logout Button */}
                    <button className="text-red-500 hover:underline">Logout</button>
                </header>

                {/* Content Area */}
                <main className="flex-1 overflow-auto p-6">
                    <Outlet />
                </main>

                {/* Footer */}
                <footer className="h-12 bg-white border-t flex items-center justify-center text-sm text-gray-500">
                    © 2025 eduVerse. All rights reserved.
                </footer>
            </div>
        </div>
    );
}
