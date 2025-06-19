import { Admin } from "../models/admin.model.js";
import { Teacher } from "../models/teacher.model.js";
import { Student } from "../models/student.model.js";
import { OfficeStaff } from "../models/office.model.js";

class ApiError extends Error {
    constructor(statusCode, message) {
        super(message);
        this.statusCode = statusCode;
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}

const generateAccessAndRefreshTokens = async (userId, userType = 'admin') => {
    try {
        let user;
        // Determine which model to use based on userType
        if (userType === 'admin') {
            user = await Admin.findById(userId);
        } else if (userType === 'teacher') {
            user = await Teacher.findById(userId);
        } else if (userType === 'student') {
            user = await Student.findById(userId);
        } else if (userType === 'officeStaff') {
            user = await OfficeStaff.findById(userId);
        } else {
            throw new ApiError(400, "Invalid user type");
        }

        if (!user) {
            throw new ApiError(404, `${userType} not found`);
        }

        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(500, "Something went wrong while generating refresh and access token");
    }
}

export default generateAccessAndRefreshTokens;