// backend/src/routes/fee.route.js
import { Router } from "express";
import multer from 'multer';
import {
    createFeeStructure,
    getAllFeeStructures,
    updateFeeStructure,
    deleteFeeStructure,
    getStudentFeeDetails,
    submitFeePayment,
    getPendingPayments,
    verifyPayment,
    getPaymentDetails,
    downloadReceipt
} from "../controllers/fee.controller.js";
import path from 'path';

import { verifyAdminJWT } from "../middlewares/adminAuth.js";
import { verifyStudentJWT } from "../middlewares/studentAuth.js";
import { verifyOfficeStaffJWT, checkPermission } from "../middlewares/officeStaffAuth.js";

const router = Router();

// Configure multer for payment proof uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads/payment-proofs/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'payment-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: function (req, file, cb) {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Only JPG, PNG, and PDF files are allowed'), false);
        }
    }
});

// ================== ADMIN ROUTES ==================
router.route("/admin/fee-structure").post(verifyAdminJWT, createFeeStructure);
router.route("/admin/fee-structure").get(verifyAdminJWT, getAllFeeStructures);
router.route("/admin/fee-structure/:id").put(verifyAdminJWT, updateFeeStructure);
router.route("/admin/fee-structure/:id").delete(verifyAdminJWT, deleteFeeStructure);

// ================== STUDENT ROUTES ==================
router.route("/student/fee-details").get(verifyStudentJWT, getStudentFeeDetails);
router.route("/student/submit-payment").post(
    verifyStudentJWT,
    upload.single('paymentProof'),
    submitFeePayment
);
router.route("/student/receipt/:receiptNumber").get(verifyStudentJWT, downloadReceipt);

// ================== OFFICE STAFF ROUTES ==================
router.route("/office/pending-payments").get(
    verifyOfficeStaffJWT,
    checkPermission('feeManagement'),
    getPendingPayments
);

router.route("/office/payment/:paymentId").get(
    verifyOfficeStaffJWT,
    checkPermission('feeManagement'),
    getPaymentDetails
);

router.route("/office/verify-payment/:paymentId").put(
    verifyOfficeStaffJWT,
    checkPermission('feeManagement'),
    verifyPayment
);

// ================== PUBLIC ROUTES ==================
router.route("/fee-structures").get(getAllFeeStructures);

export default router;