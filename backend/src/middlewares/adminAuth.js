import jwt from "jsonwebtoken";
import { Admin } from "../models/admin.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const verifyAdminJWT = asyncHandler(async (req, res, next) => {
    try {
        const token =
            req.cookies?.accessToken ||
            req.header("Authorization")?.replace("Bearer ", "").trim();

        if (!token) {
            return res.status(401).json({ message: "Unauthorized Access" });
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        const admin = await Admin.findById(decodedToken._id).select("-password -refreshToken");
        if (!admin) {
            return res.status(401).json({ message: "Invalid Admin Token" });
        }

        req.user = admin;
        next();
    } catch (error) {
        return res.status(401).json({ message: "Invalid Admin Token", error });
    }
});
