import { Router } from "express";
import {
    loginTeacher,
    getTeacherProfile,
    updateTeacherProfile,
    changePassword,
    getAssignedSubjects,
    logoutTeacher,
    getStudentsForAttendance,
    getAttendance,
    markAttendance,
    addInternalMarks,
    getInternalMarks,
    updateInternalMarks,
    deleteInternalMarks,
    getStudentPerformanceSummary
} from "../controllers/teacher.controller.js";
import { verifyTeacherJWT } from "../middlewares/teacherAuth.js";

const router = Router();

// Public routes (no authentication required)
router.route("/login").post(loginTeacher);

// Protected routes (authentication required)
router.route("/profile").get(verifyTeacherJWT, getTeacherProfile);
router.route("/profile").put(verifyTeacherJWT, updateTeacherProfile);
router.route("/change-password").post(verifyTeacherJWT, changePassword);
router.route("/assigned-subjects").get(verifyTeacherJWT, getAssignedSubjects);
router.route("/logout").post(verifyTeacherJWT, logoutTeacher);

// Attendance routes
router.route("/subjects/:subjectId/students").get(verifyTeacherJWT, getStudentsForAttendance);
router.route("/subjects/:subjectId/attendance").get(verifyTeacherJWT, getAttendance);
router.route("/subjects/:subjectId/attendance").post(verifyTeacherJWT, markAttendance);

// Internal Marks routes
router.route("/subjects/:subjectId/internal-marks").post(verifyTeacherJWT, addInternalMarks);
router.route("/subjects/:subjectId/internal-marks").get(verifyTeacherJWT, getInternalMarks);
router.route("/subjects/:subjectId/student-performance").get(verifyTeacherJWT, getStudentPerformanceSummary);
router.route("/internal-marks/:markId").put(verifyTeacherJWT, updateInternalMarks);
router.route("/internal-marks/:markId").delete(verifyTeacherJWT, deleteInternalMarks);

export default router;