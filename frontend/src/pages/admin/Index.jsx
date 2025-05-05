import { Routes, Route } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import DashboardHome from './DashboardHome';
import SemesterPage from './SemesterPage';
import SubjectPage from './SubjectPage';
import StudentPage from './StudentPage';
import TeacherAssignPage from './TeacherAssignPage';
import ProfilePage from './ProfilePage';
import Unauthorized from '../Unauthorized';
import AddSemester from '../../components/semester/AddSemester';
import SemesterDetail from '../../components/semester/SemesterDetail';

export default function Index() {
    return (
        <Routes>
            <Route path="/" element={<AdminLayout />}>
                <Route index element={<DashboardHome />} />
                <Route path="semesters/*" element={<SemesterPage />} />
                <Route path="semesters/add" element={<AddSemester />} />
                <Route path="semesters/:semesterId" element={<SemesterDetail />} />
                <Route path="subjects/*" element={<SubjectPage />} />
                <Route path="students/*" element={<StudentPage />} />
                <Route path="teachers/*" element={<TeacherAssignPage />} />
                <Route path="profile" element={<ProfilePage />} />
                <Route path="unauthorized" element={<Unauthorized />} />
            </Route>
        </Routes>
    );
}
