import { Routes, Route } from 'react-router-dom';
import { Outlet } from 'react-router-dom';
import OfficeSidebar from '../../components/office/OfficeSidebar';
import OfficeHeader from '../../components/office/OfficeHeader';
// import Dashboard from './Dashboard';
import Profile from './Profile';
// import StudentsPage from './StudentsPage';
// import StudentDetails from './StudentDetails';
// import AddStudent from '../../components/office/AddStudent';
// import EditStudent from '../../components/office/EditStudent';
// import BulkUploadStudents from '../../components/office/BulkUploadStudents';
import Unauthorized from '../Unauthorized';
import { useAuth } from '../../context/AuthContext';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Layout component for office module
const OfficeLayout = () => {
    const { user, hasRole } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!user || !hasRole('officeStaff')) {
            navigate('/unauthorized');
        }
    }, [user, hasRole, navigate]);

    if (!user || !hasRole('officeStaff')) {
        return null;
    }

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Sidebar */}
            <div className="w-64 bg-white shadow-lg">
                <OfficeSidebar />
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <OfficeHeader />

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

// Main Index component with routing
export default function Index() {
    return (
        <Routes>
            <Route path="/" element={<OfficeLayout />}>
                {/* Dashboard */}
                {/* <Route index element={<Dashboard />} /> */}

                {/* Profile */}
                <Route path="profile" element={<Profile />} />

                {/* Student Management Routes */}
                {/* <Route path="students">
                    <Route index element={<StudentsPage />} />
                    <Route path="add" element={<AddStudent />} />
                    <Route path="bulk-upload" element={<BulkUploadStudents />} />
                    <Route path=":studentId" element={<StudentDetails />} />
                    <Route path=":studentId/edit" element={<EditStudent />} />
                </Route> */}

                {/* Unauthorized access */}
                <Route path="unauthorized" element={<Unauthorized />} />
            </Route>
        </Routes>
    );
}