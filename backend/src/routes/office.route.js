import { Router } from "express";
import multer from 'multer';
import {
    // Authentication
    seedOfficeStaff,
    loginOfficeStaff,
    logoutOfficeStaff,

    // Profile Management
    getOfficeStaffProfile,
    updateOfficeStaffProfile,
    changePassword,

    // Student Management
    addSingleStudent,
    bulkAddStudents,
    downloadStudentTemplate,
    getAllStudents,
    getStudentById,
    updateStudent,
    deleteStudent,

    // Dashboard & Utilities
    getDashboard,
    getSemesters
} from "../controllers/office.controller.js";

import { verifyOfficeStaffJWT, checkPermission } from "../middlewares/officeStaffAuth.js";

const router = Router();

// Configure multer for Excel file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: function (req, file, cb) {
        const allowedTypes = [
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        ];

        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Only Excel files (.xls, .xlsx) are allowed'), false);
        }
    }
});

// ================== PUBLIC ROUTES ==================
router.route("/seed").post(seedOfficeStaff);
router.route("/login").post(loginOfficeStaff);

// ================== PROTECTED ROUTES ==================

// Profile Management
router.route("/profile").get(verifyOfficeStaffJWT, getOfficeStaffProfile);
router.route("/profile").put(verifyOfficeStaffJWT, updateOfficeStaffProfile);
router.route("/change-password").post(verifyOfficeStaffJWT, changePassword);
router.route("/logout").post(verifyOfficeStaffJWT, logoutOfficeStaff);

// Dashboard
router.route("/dashboard").get(verifyOfficeStaffJWT, getDashboard);

// Utility Routes
router.route("/semesters").get(verifyOfficeStaffJWT, getSemesters);

// ================== STUDENT MANAGEMENT ROUTES ==================
// All student management routes require studentManagement permission

// Single student operations
router.route("/students").post(
    verifyOfficeStaffJWT,
    checkPermission('studentManagement'),
    addSingleStudent
);

router.route("/students").get(
    verifyOfficeStaffJWT,
    checkPermission('studentManagement'),
    getAllStudents
);

// Bulk operations
router.route("/students/bulk-upload").post(
    verifyOfficeStaffJWT,
    checkPermission('studentManagement'),
    upload.single('excelFile'),
    bulkAddStudents
);

router.route("/students/download-template").get(
    verifyOfficeStaffJWT,
    checkPermission('studentManagement'),
    downloadStudentTemplate
);
router.route("/students/:id").get(
    verifyOfficeStaffJWT,
    checkPermission('studentManagement'),
    getStudentById
);

router.route("/students/:id").put(
    verifyOfficeStaffJWT,
    checkPermission('studentManagement'),
    updateStudent
);

router.route("/students/:id").delete(
    verifyOfficeStaffJWT,
    checkPermission('studentManagement'),
    deleteStudent
);

// Error handling middleware for multer
router.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                message: 'File size too large. Maximum allowed size is 5MB.'
            });
        }
    }

    if (error.message === 'Only Excel files (.xls, .xlsx) are allowed') {
        return res.status(400).json({
            message: error.message
        });
    }

    next(error);
});

export default router;