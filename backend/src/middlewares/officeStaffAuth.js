import jwt from "jsonwebtoken";
import { OfficeStaff } from "../models/office.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const verifyOfficeStaffJWT = asyncHandler(async (req, res, next) => {
    try {
        const token =
            req.cookies?.accessToken ||
            req.header("Authorization")?.replace("Bearer ", "").trim();

        if (!token) {
            return res.status(401).json({ message: "Unauthorized Access" });
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        const officeStaff = await OfficeStaff.findById(decodedToken._id)
            .select("-password -refreshToken");

        if (!officeStaff) {
            return res.status(401).json({ message: "Invalid Office Staff Token" });
        }

        req.user = officeStaff;
        next();
    } catch (error) {
        return res.status(401).json({
            message: "Invalid Office Staff Token",
            error: error.message
        });
    }
});

// Middleware to check specific permissions
export const checkPermission = (permission) => {
    return asyncHandler(async (req, res, next) => {
        if (!req.user || !req.user.hasPermission(permission)) {
            return res.status(403).json({
                message: `Access denied. ${permission} permission required.`
            });
        }
        next();
    });
};