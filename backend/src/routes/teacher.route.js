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
    markAttendance
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

export default router;