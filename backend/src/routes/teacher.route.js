import { Router } from "express";
import { 
    loginTeacher,
    getTeacherProfile,
    updateTeacherProfile,
    changePassword,
    getAssignedSubjects,
    logoutTeacher
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

export default router;