import { Router } from "express";
import {
    loginStudent,
    getDashboard,
    getStudentProfile,
    updateStudentProfile,
    // changePassword,
    getSubjects,
    getAttendance,
    getInternalMarks,
    // getStudyMaterials,
    // downloadStudyMaterial,
    logoutStudent
} from "../controllers/student.controller.js";
import { verifyStudentJWT } from "../middlewares/studentAuth.js";

const router = Router();

// Public routes (no authentication required)
router.route("/login").post(loginStudent);

// Protected routes (authentication required)
// Dashboard
router.route("/dashboard").get(verifyStudentJWT, getDashboard);

// Profile Management
router.route("/profile").get(verifyStudentJWT, getStudentProfile);
router.route("/profile").put(verifyStudentJWT, updateStudentProfile);
// router.route("/change-password").post(verifyStudentJWT, changePassword);

// Academic Information
router.route("/subjects").get(verifyStudentJWT, getSubjects);
router.route("/attendance").get(verifyStudentJWT, getAttendance);
router.route("/internal-marks").get(verifyStudentJWT, getInternalMarks);

// Study Materials
// router.route("/study-materials").get(verifyStudentJWT, getStudyMaterials);
// router.route("/study-materials/:materialId/download").get(verifyStudentJWT, downloadStudyMaterial);

// Authentication
router.route("/logout").post(verifyStudentJWT, logoutStudent);

export default router;