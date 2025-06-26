import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true
}));

app.use(express.json({ limit: "20kb" }));
app.use(express.urlencoded({ extended: true, limit: "20kb" }));
app.use(cookieParser());
app.use(express.static("public"));

// Get the directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
import adminRouter from "./routes/admin.route.js";
import teacherRouter from "./routes/teacher.route.js";
import questionPaperRouter from "./routes/questionPaper.route.js"
import studentRouter from "./routes/student.route.js";
import officeRouter from "./routes/office.route.js";
import feeRouter from "./routes/fee.route.js";
import { verifyOfficeStaffJWT } from "./middlewares/officeStaffAuth.js";

app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/teacher", teacherRouter);
app.use("/api/v1/teacher", questionPaperRouter);
app.use("/api/v1/student", studentRouter);
app.use("/api/v1/office", officeRouter);
app.use("/api/v1/fee", feeRouter);
app.get("/", (req, res) => {
    res.status(200).json({
        message: "Welcome to the School Management System API",
        success: true
    });
});

// Secure route to serve payment proof files
app.get('/api/v1/uploads/payment-proofs/:filename', verifyOfficeStaffJWT, (req, res) => {
    const { filename } = req.params;
    const filePath = path.join(process.cwd(), 'uploads', 'payment-proofs', filename);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ message: 'File not found' });
    }

    // Send file
    res.sendFile(filePath);
});


app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.statusCode || 500).json({
        message: err.message || "Internal Server Error",
        success: false
    });
});

export default app;
