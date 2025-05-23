import jwt from "jsonwebtoken";
import { Teacher } from "../models/teacher.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const verifyTeacherJWT = asyncHandler(async (req, res, next) => {
    try {
        const token =
            req.cookies?.accessToken ||
            req.header("Authorization")?.replace("Bearer ", "").trim();

        if (!token) {
            return res.status(401).json({ message: "Unauthorized Access" });
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        const teacher = await Teacher.findById(decodedToken._id).select("-password -refreshToken");
        if (!teacher) {
            return res.status(401).json({ message: "Invalid Teacher Token" });
        }

        req.user = teacher;
        next();
    } catch (error) {
        return res.status(401).json({ message: "Invalid Teacher Token", error });
    }
});