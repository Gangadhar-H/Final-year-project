import jwt from "jsonwebtoken";
import { Student } from "../models/student.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const verifyStudentJWT = asyncHandler(async (req, res, next) => {
    try {
        const token =
            req.cookies?.accessToken ||
            req.header("Authorization")?.replace("Bearer ", "").trim();

        if (!token) {
            return res.status(401).json({ message: "Unauthorized Access" });
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        const student = await Student.findById(decodedToken._id).select("-password -refreshToken");
        if (!student) {
            return res.status(401).json({ message: "Invalid Student Token" });
        }

        req.user = student;
        next();
    } catch (error) {
        return res.status(401).json({ message: "Invalid Student Token", error });
    }
});
