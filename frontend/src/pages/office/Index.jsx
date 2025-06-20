import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import OfficeSidebar from '../../components/office/OfficeSidebar';
import OfficeHeader from '../../components/office/OfficeHeader';
// import Dashboard from './Dashboard';
import Profile from './Profile';
// import StudentsPage from './StudentsPage';
// import StudentDetails from './StudentDetails';
import officeService from '../../services/officeService';

const OfficeIndex = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchUserProfile();
    }, []);

    const fetchUserProfile = async () => {
        try {
            setLoading(true);
            const response = await officeService.getProfile();
            setUser(response.staff);
        } catch (error) {
            console.error('Failed to fetch user profile:', error);
            // If unauthorized, redirect to login
            if (error.status === 401 || error.status === 403) {
                navigate('/office/login');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        try {
            await officeService.logout();
            navigate('/office/login');
        } catch (error) {
            console.error('Logout failed:', error);
            // Force logout even if API call fails
            navigate('/office/login');
        }
    };

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center space-y-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    <p className="text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/office/login" replace />;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Toaster
                position="top-right"
                toastOptions={{
                    duration: 4000,
                    style: {
                        background: '#363636',
                        color: '#fff',
                    },
                    success: {
                        duration: 3000,
                        theme: {
                            primary: 'green',
                            secondary: 'black',
                        },
                    },
                }}
            />

            {/* Sidebar */}
            <OfficeSidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
                user={user}
            />

            {/* Main Content */}
            <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-16'
                }`}>
                {/* Header */}
                <OfficeHeader
                    user={user}
                    onToggleSidebar={toggleSidebar}
                    onLogout={handleLogout}
                />

                {/* Page Content */}
                <main className="p-6">
                    <Routes>
                        <Route path="/" element={<Navigate to="/office/dashboard" replace />} />
                        {/* <Route path="/dashboard" element={<Dashboard user={user} />} /> */}
                        <Route
                            path="/profile"
                            element={
                                <Profile
                                    user={user}
                                    onProfileUpdate={fetchUserProfile}
                                />
                            }
                        />
                        {/* <Route 
                            path="/students" 
                            element={<StudentsPage user={user} />} 
                        /> */}
                        {/* <Route 
                            path="/students/:id" 
                            element={<StudentDetails user={user} />} 
                        /> */}

                        {/* Fallback route */}
                        <Route path="*" element={<Navigate to="/office/dashboard" replace />} />
                    </Routes>
                </main>
            </div>

            {/* Mobile sidebar overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                ></div>
            )}
        </div>
    );
};

export default OfficeIndex;