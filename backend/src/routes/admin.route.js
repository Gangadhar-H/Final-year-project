import { Router } from "express";
import {
    addDivision, addSemester, addStudent, addSubject, addTeacher, assignSubjectToTeacher, deleteSemester, deleteStudent, deleteSubject, deleteTeacher, getAllSemesters, getAllStudents, getAllTeachers, getStudentById, getSubjectsBySemester, getTeacherById, loginAdmin, removeDivision, seedAdmin, updateSemester, updateStudent, updateSubject, updateTeacher, addOfficeStaff,
    getAllOfficeStaff,
    getOfficeStaffById,
    updateOfficeStaff,
    deleteOfficeStaff
} from "../controllers/admin.controller.js";

import { verifyAdminJWT } from "../middlewares/adminAuth.js";

const router = Router();

router.route("/seed").post(seedAdmin);
router.route("/login").post(loginAdmin);

// Semester routes
router.route("/semesters").post(verifyAdminJWT, addSemester);
router.route("/semesters/getAllSemesters").get(getAllSemesters);
router.route("/semesters/updateSemester").put(verifyAdminJWT, updateSemester);
router.route("/semesters/deleteSemester").delete(verifyAdminJWT, deleteSemester);
router.route("/semesters/:semesterNumber/addDivision").patch(verifyAdminJWT, addDivision);
router.route("/semesters/:semesterNumber/deleteDivison").patch(verifyAdminJWT, removeDivision);

// Subject routes
router.route("/semesters/:semesterNumber/subjects").post(verifyAdminJWT, addSubject);
router.route("/semesters/:semesterNumber/subjects").get(getSubjectsBySemester);
router.route("/subjects/:subjectId").put(verifyAdminJWT, updateSubject);
router.route("/subjects/:subjectId").delete(verifyAdminJWT, deleteSubject);

// Teacher routes 
router.route("/teacher").post(verifyAdminJWT, addTeacher);
router.route("/teachers").get(verifyAdminJWT, getAllTeachers);
router.route("/teacher/:id").get(verifyAdminJWT, getTeacherById);
router.route("/teacher/:id").put(verifyAdminJWT, updateTeacher);
router.route("/teacher/:id").delete(verifyAdminJWT, deleteTeacher);
router.route("/subjects/:subjectId/assign-teacher").post(verifyAdminJWT, assignSubjectToTeacher);

// Student Routes
router.route("/students").post(verifyAdminJWT, addStudent);
router.route("/students").get(getAllStudents);
router.route("/students/:id").get(getStudentById);
router.route("/students/:id").put(verifyAdminJWT, updateStudent);
router.route("/students/:id").delete(verifyAdminJWT, deleteStudent);

// Office Staff routes
router.route("/office-staff").post(verifyAdminJWT, addOfficeStaff);
router.route("/office-staff").get(verifyAdminJWT, getAllOfficeStaff);
router.route("/office-staff/:id").get(verifyAdminJWT, getOfficeStaffById);
router.route("/office-staff/:id").put(verifyAdminJWT, updateOfficeStaff);
router.route("/office-staff/:id").delete(verifyAdminJWT, deleteOfficeStaff);

export default router;
