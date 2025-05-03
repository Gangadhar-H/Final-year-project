import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';

// Layouts
import AuthLayout from './layouts/AuthLayout';
import DashboardLayout from './layouts/DashboardLayout';

// Pages
import Login from './pages/Login';
import AdminDashboard from './pages/admin/AdminDashboard';
import SemesterManagement from './pages/admin/SemesterManagement';
import SubjectManagement from './pages/admin/SubjectManagement';
import TeacherManagement from './pages/admin/TeacherManagement';
import StudentManagement from './pages/admin/StudentManagement';

// Route Guard Component
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('accessToken');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-right" />
        <Routes>
          {/* Auth Routes */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
          </Route>

          {/* Admin Dashboard Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="semesters" element={<SemesterManagement />} />
            <Route path="subjects" element={<SubjectManagement />} />
            <Route path="teachers" element={<TeacherManagement />} />
            <Route path="students" element={<StudentManagement />} />
          </Route>

          {/* Placeholder Routes for Future Development */}
          <Route path="/student/*" element={<div>Student Portal (Coming Soon)</div>} />
          <Route path="/teacher/*" element={<div>Teacher Portal (Coming Soon)</div>} />
          <Route path="/office/*" element={<div>Office Staff Portal (Coming Soon)</div>} />

          {/* Default Route */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;