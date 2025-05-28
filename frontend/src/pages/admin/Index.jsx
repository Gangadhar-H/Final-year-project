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
import AddSubject from '../../components/subject/AddSubject';
import SubjectDetail from '../../components/subject/SubjectDetail';
import AddStudent from '../../components/student/AddStudent';
import StudentDetail from '../../components/student/StudentDetails';
import AddTeacher from '../../components/teacher/AddTeacher';
import TeacherDetail from '../../components/teacher/TeacherDetail';

export default function Index() {
    return (
        <Routes>
            <Route path="/" element={<AdminLayout />}>
                <Route index element={<DashboardHome />} />

                {/* Semester Routes */}
                <Route path="semesters">
                    <Route index element={<SemesterPage />} />
                    <Route path="add" element={<AddSemester />} />
                    <Route path=":semesterId" element={<SemesterDetail />} />
                </Route>

                {/* Subject Routes */}
                <Route path="subjects">
                    <Route index element={<SubjectPage />} />
                    <Route path="add" element={<AddSubject />} />
                    <Route path=":subjectId" element={<SubjectDetail />} />
                </Route>

                {/* Student Routes */}
                <Route path="students">
                    <Route index element={<StudentPage />} />
                    <Route path="add" element={<AddStudent />} />
                    <Route path=":studentId" element={<StudentDetail />} />
                </Route>

                {/* Teacher Routes */}
                <Route path="teachers">
                    <Route index element={<TeacherAssignPage />} />
                    <Route path="add" element={<AddTeacher />} />
                    <Route path=":id" element={<TeacherDetail />} />
                </Route>

                <Route path="profile" element={<ProfilePage />} />
                <Route path="unauthorized" element={<Unauthorized />} />
            </Route>
        </Routes>
    );
}