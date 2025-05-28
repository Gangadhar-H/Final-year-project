import { asyncHandler } from "../utils/asyncHandler.js";
import { Teacher } from "../models/teacher.model.js";
import generateAccessAndRefreshTokens from "../utils/generateTokens.js";
import { Subject } from "../models/subject.model.js";
import { Attendance } from "../models/attendance.model.js";
import { Student } from "../models/student.model.js";

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

// Mark Attendance
const markAttendance = asyncHandler(async (req, res) => {
    const { subjectId } = req.params;
    const { division, attendanceData, date } = req.body;

    // Validate required fields
    if (!division || !attendanceData || !Array.isArray(attendanceData)) {
        return res.status(400).json({ message: "Division and attendance data are required" });
    }

    // Check if teacher is assigned to this subject and division
    const teacher = await Teacher.findById(req.user._id);
    const isAssigned = teacher.assignedSubjects.some(
        assignment => assignment.subjectId.toString() === subjectId &&
            assignment.division === division
    );

    if (!isAssigned) {
        return res.status(403).json({
            message: "You are not assigned to teach this subject in this division"
        });
    }

    // Use provided date or current date
    const attendanceDate = date ? new Date(date) : new Date();
    attendanceDate.setHours(0, 0, 0, 0); // Set to start of day

    try {
        // Check if attendance already exists for this date
        let attendance = await Attendance.findOne({
            subject: subjectId,
            division,
            date: attendanceDate
        });

        if (attendance) {
            // Update existing attendance
            attendance.attendanceRecords = attendanceData.map(record => ({
                student: record.studentId,
                status: record.status,
                markedAt: new Date()
            }));
            attendance.teacher = req.user._id;
        } else {
            // Create new attendance record
            attendance = new Attendance({
                subject: subjectId,
                teacher: req.user._id,
                division,
                date: attendanceDate,
                attendanceRecords: attendanceData.map(record => ({
                    student: record.studentId,
                    status: record.status,
                    markedAt: new Date()
                }))
            });
        }

        await attendance.save();

        // Populate and return the saved attendance
        const populatedAttendance = await Attendance.findById(attendance._id)
            .populate('subject', 'subjectName subjectCode')
            .populate('teacher', 'name teacherId')
            .populate('attendanceRecords.student', 'name uucmsNo');

        return res.status(200).json({
            message: "Attendance marked successfully",
            attendance: populatedAttendance
        });

    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({
                message: "Attendance already marked for this date"
            });
        }
        throw error;
    }
});

// Get Attendance for a Subject
const getAttendance = asyncHandler(async (req, res) => {
    const { subjectId } = req.params;
    const { division, date, startDate, endDate } = req.query;

    // Check if teacher is assigned to this subject
    const teacher = await Teacher.findById(req.user._id);
    const isAssigned = teacher.assignedSubjects.some(
        assignment => assignment.subjectId.toString() === subjectId
    );

    if (!isAssigned) {
        return res.status(403).json({
            message: "You are not assigned to teach this subject"
        });
    }

    // Build query
    let query = { subject: subjectId };

    if (division) {
        query.division = division;
    }

    // Date filtering
    if (date) {
        const specificDate = new Date(date);
        specificDate.setHours(0, 0, 0, 0);
        query.date = specificDate;
    } else if (startDate && endDate) {
        query.date = {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
        };
    }

    const attendanceRecords = await Attendance.find(query)
        .populate('subject', 'subjectName subjectCode')
        .populate('teacher', 'name teacherId')
        .populate('attendanceRecords.student', 'name uucmsNo')
        .sort({ date: -1 });

    return res.status(200).json({
        message: "Attendance records retrieved successfully",
        attendance: attendanceRecords,
        count: attendanceRecords.length
    });
});

// Get Students for Attendance (helper function)
const getStudentsForAttendance = asyncHandler(async (req, res) => {
    const { subjectId } = req.params;
    const { division } = req.query;

    if (!division) {
        return res.status(400).json({ message: "Division is required" });
    }

    // Check if teacher is assigned to this subject and division
    const teacher = await Teacher.findById(req.user._id);
    const isAssigned = teacher.assignedSubjects.some(
        assignment => assignment.subjectId.toString() === subjectId &&
            assignment.division === division
    );

    if (!isAssigned) {
        return res.status(403).json({
            message: "You are not assigned to teach this subject in this division"
        });
    }

    // Get subject details to find semester
    const subject = await Subject.findById(subjectId).populate('semester');
    if (!subject) {
        return res.status(404).json({ message: "Subject not found" });
    }

    // Get all students from the same semester and division
    const students = await Student.find({
        semester: subject.semester._id,
        division: division
    }).select('name uucmsNo email').sort({ name: 1 });

    return res.status(200).json({
        message: "Students retrieved successfully",
        students,
        subject: {
            name: subject.subjectName,
            code: subject.subjectCode,
            semester: subject.semester.semesterNumber
        },
        division
    });
});

export {
    loginTeacher,
    getTeacherProfile,
    updateTeacherProfile,
    changePassword,
    getAssignedSubjects,
    logoutTeacher,
    markAttendance,
    getAttendance,
    getStudentsForAttendance
}