import { Router } from "express";
import multer from 'multer';
import {
    generateQuestionPaper,
    downloadQuestionPaperPDF,
    downloadQuestionPaperDOCX
} from "../controllers/questionPaper.controller.js";
import { verifyTeacherJWT } from "../middlewares/teacherAuth.js";

const router = Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads/') // Add ./ to make it relative to backend root
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname)
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 20 * 1024 * 1024 // 20MB limit
    },
    fileFilter: function (req, file, cb) {
        const allowedTypes = [
            'application/pdf',
            'text/plain',
            'application/vnd.ms-powerpoint',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation'
        ];

        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type'), false);
        }
    }
});

// Question paper generation routes
router.route("/generate-question-paper").post(
    verifyTeacherJWT,
    upload.single('file'),
    generateQuestionPaper
);

router.route("/download/pdf").post(verifyTeacherJWT, downloadQuestionPaperPDF);
router.route("/download/docx").post(verifyTeacherJWT, downloadQuestionPaperDOCX);

export default router;