import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true
}));

app.use(express.json({ limit: "20kb" }));
app.use(express.urlencoded({ extended: true, limit: "20kb" }));
app.use(cookieParser());
app.use(express.static("public"));

// Routes
import adminRouter from "./routes/admin.route.js";
import teacherRouter from "./routes/teacher.route.js";
import questionPapaerRouter from "./routes/questionPaper.route.js"

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.statusCode || 500).json({
        message: err.message || "Internal Server Error",
        success: false
    });
});

app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/teacher", teacherRouter);
app.use("/api/v1/teacher", questionPapaerRouter);
app.get("/", (req, res) => {
    res.status(200).json({
        message: "Welcome to the School Management System API",
        success: true
    });
});

export default app;
