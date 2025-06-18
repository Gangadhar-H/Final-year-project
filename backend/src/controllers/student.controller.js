import { asyncHandler } from "../utils/asyncHandler.js";
import { Student } from "../models/student.model.js";
import { Subject } from "../models/subject.model.js";
import { Attendance } from "../models/attendance.model.js";
import { InternalMark } from "../models/internalMark.model.js";
// import { StudyMaterial } from "../models/studyMaterial.model.js";
import generateAccessAndRefreshTokens from "../utils/generateTokens.js";
import mongoose from "mongoose";

// Student Login
const loginStudent = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "UUCMS Number and password are required" });
    }

    const student = await Student.findOne({ email }).populate('semester');
    if (!student) {
        return res.status(404).json({ message: "Student not found" });
    }

    const isPasswordValid = await student.isPasswordCorrect(password);
    if (!isPasswordValid) {
        return res.status(401).json({ message: "Incorrect password" });
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(student._id, 'student');

    const loggedInStudent = await Student.findById(student._id)
        .select("-password -refreshToken")
        .populate('semester', 'semesterNumber divisions');

    const options = {
        httpOnly: true,
        secure: true
    }

    return res.status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json({
            message: "Login successful",
            student: loggedInStudent,
            role: "student"
        });
});

// Get Student Dashboard Data
const getDashboard = asyncHandler(async (req, res) => {
    const studentId = req.user._id;

    const student = await Student.findById(studentId)
        .populate('semester', 'semesterNumber');

    if (!student) {
        return res.status(404).json({ message: "Student not found" });
    }

    // Get subjects for the student's semester
    const subjects = await Subject.find({ semester: student.semester._id });
    const subjectIds = subjects.map(subject => subject._id);

    // Get total attendance statistics
    const attendanceStats = await Attendance.aggregate([
        {
            $match: {
                subject: { $in: subjectIds },
                division: student.division,
                "attendanceRecords.student": new mongoose.Types.ObjectId(studentId)
            }
        },
        {
            $unwind: "$attendanceRecords"
        },
        {
            $match: {
                "attendanceRecords.student": new mongoose.Types.ObjectId(studentId)
            }
        },
        {
            $group: {
                _id: null,
                totalClasses: { $sum: 1 },
                presentClasses: {
                    $sum: {
                        $cond: [{ $eq: ["$attendanceRecords.status", "present"] }, 1, 0]
                    }
                }
            }
        }
    ]);

    const attendancePercentage = attendanceStats.length > 0
        ? ((attendanceStats[0].presentClasses / attendanceStats[0].totalClasses) * 100).toFixed(2)
        : 0;

    // Get recent internal marks
    const recentMarks = await InternalMark.find({
        student: studentId
    })
        .populate('subject', 'subjectName subjectCode')
        .sort({ examDate: -1 })
        .limit(5);

    // Get upcoming study materials (recent uploads)
    const recentMaterials = await StudyMaterial.find({
        semester: student.semester._id,
        division: { $in: [student.division, 'all'] }
    })
        .populate('subject', 'subjectName')
        .populate('uploadedBy', 'name teacherId')
        .sort({ uploadDate: -1 })
        .limit(5);

    // Calculate average marks
    const allMarks = await InternalMark.find({ student: studentId });
    const averagePercentage = allMarks.length > 0
        ? (allMarks.reduce((sum, mark) => sum + (mark.obtainedMarks / mark.maxMarks * 100), 0) / allMarks.length).toFixed(2)
        : 0;

    const dashboardData = {
        student: {
            name: student.name,
            uucmsNo: student.uucmsNo,
            email: student.email,
            semester: student.semester.semesterNumber,
            division: student.division
        },
        stats: {
            totalSubjects: subjects.length,
            totalClasses: attendanceStats.length > 0 ? attendanceStats[0].totalClasses : 0,
            presentClasses: attendanceStats.length > 0 ? attendanceStats[0].presentClasses : 0,
            attendancePercentage: parseFloat(attendancePercentage),
            averageMarks: parseFloat(averagePercentage),
            totalAssignments: allMarks.length
        },
        recentMarks,
        recentMaterials: recentMaterials.slice(0, 3)
    };

    return res.status(200).json({
        message: "Dashboard data retrieved successfully",
        data: dashboardData
    });
});

// Get Student Profile
const getStudentProfile = asyncHandler(async (req, res) => {
    const student = await Student.findById(req.user._id)
        .select("-password -refreshToken")
        .populate('semester', 'semesterNumber divisions');

    if (!student) {
        return res.status(404).json({ message: "Student not found" });
    }

    return res.status(200).json({ student });
});

// Update Student Profile
const updateStudentProfile = asyncHandler(async (req, res) => {
    const { name, email } = req.body;

    if (!name && !email) {
        return res.status(400).json({ message: "At least one field is required to update" });
    }

    const updatedStudent = await Student.findByIdAndUpdate(
        req.user._id,
        { ...(name && { name }), ...(email && { email }) },
        { new: true }
    ).select("-password -refreshToken")
        .populate('semester', 'semesterNumber divisions');

    if (!updatedStudent) {
        return res.status(404).json({ message: "Student not found" });
    }

    return res.status(200).json({
        message: "Profile updated successfully",
        student: updatedStudent
    });
});

// Change Password
// const changePassword = asyncHandler(async (req, res) => {
//     const { currentPassword, newPassword } = req.body;

//     if (!currentPassword || !newPassword) {
//         return res.status(400).json({ message: "Current password and new password are required" });
//     }

//     const student = await Student.findById(req.user._id);

//     const isPasswordValid = await student.isPasswordCorrect(currentPassword);
//     if (!isPasswordValid) {
//         return res.status(401).json({ message: "Current password is incorrect" });
//     }

//     student.password = newPassword;
//     await student.save();

//     return res.status(200).json({ message: "Password changed successfully" });
// });

// Get Student's Subjects
const getSubjects = asyncHandler(async (req, res) => {
    const student = await Student.findById(req.user._id).populate('semester');

    if (!student) {
        return res.status(404).json({ message: "Student not found" });
    }

    const subjects = await Subject.find({ semester: student.semester._id })
        .populate('semester', 'semesterNumber');

    return res.status(200).json({
        message: "Subjects retrieved successfully",
        subjects,
        semester: student.semester.semesterNumber,
        division: student.division
    });
});

// Get Student's Attendance
const getAttendance = asyncHandler(async (req, res) => {
    const studentId = req.user._id;
    const { subjectId, startDate, endDate } = req.query;

    const student = await Student.findById(studentId).populate('semester');
    if (!student) {
        return res.status(404).json({ message: "Student not found" });
    }

    // Build query
    let query = {
        division: student.division,
        "attendanceRecords.student": new mongoose.Types.ObjectId(studentId)
    };

    if (subjectId) {
        query.subject = new mongoose.Types.ObjectId(subjectId);
    } else {
        // Get all subjects for student's semester
        const subjects = await Subject.find({ semester: student.semester._id });
        query.subject = { $in: subjects.map(s => s._id) };
    }

    if (startDate && endDate) {
        query.date = {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
        };
    }

    const attendanceRecords = await Attendance.find(query)
        .populate('subject', 'subjectName subjectCode')
        .populate('teacher', 'name teacherId')
        .sort({ date: -1 });

    // Extract student's specific attendance from each record
    const studentAttendance = attendanceRecords.map(record => {
        const studentRecord = record.attendanceRecords.find(
            ar => ar.student.toString() === studentId.toString()
        );

        return {
            _id: record._id,
            subject: record.subject,
            teacher: record.teacher,
            division: record.division,
            date: record.date,
            status: studentRecord ? studentRecord.status : 'absent'
        };
    });

    // Calculate statistics
    const totalClasses = studentAttendance.length;
    const presentClasses = studentAttendance.filter(record => record.status === 'present').length;
    const attendancePercentage = totalClasses > 0 ? ((presentClasses / totalClasses) * 100).toFixed(2) : 0;

    // Subject-wise statistics if no specific subject requested
    let subjectWiseStats = [];
    if (!subjectId) {
        const subjectStats = {};
        studentAttendance.forEach(record => {
            const subjectKey = record.subject._id.toString();
            if (!subjectStats[subjectKey]) {
                subjectStats[subjectKey] = {
                    subject: record.subject,
                    totalClasses: 0,
                    presentClasses: 0
                };
            }
            subjectStats[subjectKey].totalClasses++;
            if (record.status === 'present') {
                subjectStats[subjectKey].presentClasses++;
            }
        });

        subjectWiseStats = Object.values(subjectStats).map(stat => ({
            ...stat,
            attendancePercentage: ((stat.presentClasses / stat.totalClasses) * 100).toFixed(2)
        }));
    }

    return res.status(200).json({
        message: "Attendance retrieved successfully",
        attendance: studentAttendance,
        statistics: {
            totalClasses,
            presentClasses,
            absentClasses: totalClasses - presentClasses,
            attendancePercentage: parseFloat(attendancePercentage)
        },
        subjectWiseStats
    });
});

// Get Student's Internal Marks
const getInternalMarks = asyncHandler(async (req, res) => {
    const studentId = req.user._id;
    const { subjectId, examType } = req.query;

    // Build query
    let query = { student: studentId };
    if (subjectId) query.subject = subjectId;
    if (examType) query.examType = examType;

    const marks = await InternalMark.find(query)
        .populate('subject', 'subjectName subjectCode')
        .populate('teacher', 'name teacherId')
        .populate('semester', 'semesterNumber')
        .sort({ examDate: -1 });

    // Calculate statistics
    const totalMarks = marks.reduce((sum, mark) => sum + mark.obtainedMarks, 0);
    const totalMaxMarks = marks.reduce((sum, mark) => sum + mark.maxMarks, 0);
    const averagePercentage = totalMaxMarks > 0 ? ((totalMarks / totalMaxMarks) * 100).toFixed(2) : 0;

    // Subject-wise statistics
    const subjectStats = {};
    marks.forEach(mark => {
        const subjectKey = mark.subject._id.toString();
        if (!subjectStats[subjectKey]) {
            subjectStats[subjectKey] = {
                subject: mark.subject,
                marks: [],
                totalObtained: 0,
                totalMax: 0
            };
        }
        subjectStats[subjectKey].marks.push(mark);
        subjectStats[subjectKey].totalObtained += mark.obtainedMarks;
        subjectStats[subjectKey].totalMax += mark.maxMarks;
    });

    const subjectWiseStats = Object.values(subjectStats).map(stat => ({
        subject: stat.subject,
        totalExams: stat.marks.length,
        totalObtained: stat.totalObtained,
        totalMax: stat.totalMax,
        averagePercentage: ((stat.totalObtained / stat.totalMax) * 100).toFixed(2)
    }));

    return res.status(200).json({
        message: "Internal marks retrieved successfully",
        marks,
        statistics: {
            totalExams: marks.length,
            totalObtainedMarks: totalMarks,
            totalMaxMarks: totalMaxMarks,
            averagePercentage: parseFloat(averagePercentage)
        },
        subjectWiseStats
    });
});

// Get Study Materials
// const getStudyMaterials = asyncHandler(async (req, res) => {
//     const student = await Student.findById(req.user._id).populate('semester');
//     const { subjectId, materialType } = req.query;

//     if (!student) {
//         return res.status(404).json({ message: "Student not found" });
//     }

//     // Build query
//     let query = {
//         semester: student.semester._id,
//         $or: [
//             { division: student.division },
//             { division: 'all' }
//         ]
//     };

//     if (subjectId) query.subject = subjectId;
//     if (materialType) query.materialType = materialType;

//     const materials = await StudyMaterial.find(query)
//         .populate('subject', 'subjectName subjectCode')
//         .populate('uploadedBy', 'name teacherId')
//         .sort({ uploadDate: -1 });

//     return res.status(200).json({
//         message: "Study materials retrieved successfully",
//         materials,
//         count: materials.length
//     });
// });

// Download Study Material
// const downloadStudyMaterial = asyncHandler(async (req, res) => {
//     const { materialId } = req.params;
//     const student = await Student.findById(req.user._id).populate('semester');

//     if (!student) {
//         return res.status(404).json({ message: "Student not found" });
//     }

//     const material = await StudyMaterial.findById(materialId)
//         .populate('subject', 'subjectName')
//         .populate('uploadedBy', 'name');

//     if (!material) {
//         return res.status(404).json({ message: "Study material not found" });
//     }

//     // Check if student has access to this material
//     const hasAccess = material.semester.toString() === student.semester._id.toString() &&
//                      (material.division === student.division || material.division === 'all');

//     if (!hasAccess) {
//         return res.status(403).json({ message: "You don't have access to this material" });
//     }

//     // Increment download count
//     material.downloadCount = (material.downloadCount || 0) + 1;
//     await material.save();

//     return res.status(200).json({
//         message: "Material access granted",
//         material: {
//             _id: material._id,
//             title: material.title,
//             fileName: material.fileName,
//             fileUrl: material.fileUrl,
//             subject: material.subject,
//             uploadedBy: material.uploadedBy,
//             uploadDate: material.uploadDate
//         }
//     });
// });

// Logout Student
const logoutStudent = asyncHandler(async (req, res) => {
    await Student.findByIdAndUpdate(
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
        .json({ message: "Student logged out successfully" });
});

export {
    loginStudent,
    getDashboard,
    getStudentProfile,
    updateStudentProfile,
    // changePassword,
    getSubjects,
    getAttendance,
    getInternalMarks,
    // getStudyMaterials,
    // downloadStudyMaterial,
    logoutStudent
};