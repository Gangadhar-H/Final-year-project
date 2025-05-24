import { asyncHandler } from "../utils/asyncHandler.js";
import { Teacher } from "../models/teacher.model.js";
import generateAccessAndRefreshTokens from "../utils/generateTokens.js";
import { Subject } from "../models/subject.model.js";

// Teacher Login
const loginTeacher = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
    }

    const teacher = await Teacher.findOne({ email });
    if (!teacher) {
        return res.status(404).json({ message: "Teacher not found" });
    }

    const isPasswordValid = await teacher.isPasswordCorrect(password);
    if (!isPasswordValid) {
        return res.status(401).json({ message: "Incorrect password" });
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(teacher._id, 'teacher');

    const loggedInTeacher = await Teacher.findById(teacher._id).select("-password -refreshToken");

    const options = {
        httpOnly: true,
        secure: true
    }

    return res.status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json({
            message: "Login successful",
            teacher: loggedInTeacher,
            role: "teacher"
        });
});

// Get Teacher Profile
const getTeacherProfile = asyncHandler(async (req, res) => {
    const teacher = await Teacher.findById(req.user._id)
        .select("-password -refreshToken")
        .populate({
            path: 'assignedSubjects.subjectId',
            select: 'subjectName subjectCode'
        });

    if (!teacher) {
        return res.status(404).json({ message: "Teacher not found" });
    }

    return res.status(200).json({ teacher });
});

// Update Teacher Profile
const updateTeacherProfile = asyncHandler(async (req, res) => {
    const { name, email } = req.body;

    const updatedTeacher = await Teacher.findByIdAndUpdate(
        req.user._id,
        { name, email },
        { new: true }
    ).select("-password -refreshToken");

    if (!updatedTeacher) {
        return res.status(404).json({ message: "Teacher not found" });
    }

    return res.status(200).json({
        message: "Profile updated successfully",
        teacher: updatedTeacher
    });
});

// Change Password
const changePassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: "Current password and new password are required" });
    }

    const teacher = await Teacher.findById(req.user._id);

    const isPasswordValid = await teacher.isPasswordCorrect(currentPassword);
    if (!isPasswordValid) {
        return res.status(401).json({ message: "Current password is incorrect" });
    }

    teacher.password = newPassword;
    await teacher.save();

    return res.status(200).json({ message: "Password changed successfully" });
});

// Get Assigned Subjects
const getAssignedSubjects = asyncHandler(async (req, res) => {
    const teacher = await Teacher.findById(req.user._id)
        .populate({
            path: 'assignedSubjects.subjectId',
            select: 'subjectName subjectCode',
            populate: {
                path: 'semester',
                select: 'semesterNumber'
            }
        });

    if (!teacher) {
        return res.status(404).json({ message: "Teacher not found" });
    }

    return res.status(200).json({
        assignedSubjects: teacher.assignedSubjects
    });
});

// Logout Teacher
const logoutTeacher = asyncHandler(async (req, res) => {
    await Teacher.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1
            }
        },
        { new: true }
    );

    const options = {
        httpOnly: true,
        secure: true
    }

    return res.status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json({ message: "Teacher logged out successfully" });
});

export {
    loginTeacher,
    getTeacherProfile,
    updateTeacherProfile,
    changePassword,
    getAssignedSubjects,
    logoutTeacher
}