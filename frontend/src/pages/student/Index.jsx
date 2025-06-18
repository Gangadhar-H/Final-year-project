import { Routes, Route } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Dashboard from './Dashboard';
import Unauthorized from '../Unauthorized';
import StudentHeader from '../../components/student/StudentHeader';
import StudentSidebar from '../../components/student/StudentSidebar';

export default function StudentIndex() {
    const { user } = useAuth();

    // Show loading state while user data is being fetched
    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Sidebar */}
            <StudentSidebar />

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <StudentHeader />

                {/* Routes */}
                <main className="flex-1 overflow-auto">
                    <Routes>
                        <Route index element={<Dashboard />} />
                        <Route path="unauthorized" element={<Unauthorized />} />
                        <Route path="*" element={<NotFound />} />
                    </Routes>
                </main>
            </div>
        </div>
    );
}

// Simple 404 component
const NotFound = () => (
    <div className="min-h-full flex items-center justify-center px-4 py-16">
        <div className="text-center">
            <div className="mb-8">
                <svg
                    className="mx-auto h-24 w-24 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1}
                        d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0118 12a8 8 0 01-2.009 5.291m-9.982 0A7.962 7.962 0 016 12a8 8 0 012.009-5.291m9.982 10.582A7.962 7.962 0 0112 20a7.962 7.962 0 01-5.991-2.709"
                    />
                </svg>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Page Not Found</h1>
            <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
                The page you're looking for doesn't exist in the teacher dashboard.
            </p>
            <div className="space-y-4">
                <a
                    href="/teacher"
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-200"
                >
                    <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    Go to Dashboard
                </a>
                <div className="text-sm text-gray-500">
                    or use the navigation menu to find what you're looking for
                </div>
            </div>
        </div>
    </div>
);