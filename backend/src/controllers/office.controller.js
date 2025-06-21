import { asyncHandler } from "../utils/asyncHandler.js";
import { OfficeStaff } from "../models/office.model.js";
import { Student } from "../models/student.model.js";
import { Semester } from "../models/semester.model.js";
import generateAccessAndRefreshTokens from "../utils/generateTokens.js";
import XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';

// ================== AUTHENTICATION ==================

const seedOfficeStaff = asyncHandler(async (req, res) => {
    const { staffId, name, email, password, designation, permissions } = req.body;

    // Check if office staff already exists
    const existingStaff = await OfficeStaff.findOne({
        $or: [{ email }, { staffId }]
    });

    if (existingStaff) {
        return res.status(400).json({
            message: "Office staff with this email or staff ID already exists"
        });
    }

    // Create new office staff
    const officeStaff = new OfficeStaff({
        staffId,
        name,
        email,
        password,
        designation,
        permissions: permissions || {
            studentManagement: false,
            feeManagement: false,
            reportGeneration: false
        }
    });

    await officeStaff.save();

    const staffData = officeStaff.toObject();
    delete staffData.password;
    delete staffData.refreshToken;

    return res.status(201).json({
        message: "Office staff created successfully",
        staff: staffData
    });
});

const loginOfficeStaff = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            message: "Email and password are required"
        });
    }

    const officeStaff = await OfficeStaff.findOne({ email });
    if (!officeStaff) {
        return res.status(404).json({
            message: "Office staff not found"
        });
    }

    const isPasswordValid = officeStaff.isPasswordCorrect(password);
    if (!isPasswordValid) {
        return res.status(401).json({
            message: "Invalid credentials"
        });
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
        officeStaff._id,
        'office'
    );

    const loggedInStaff = await OfficeStaff.findById(officeStaff._id)
        .select("-password -refreshToken");

    const options = {
        httpOnly: true,
        secure: true
    };

    return res.status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json({
            message: "Login successful",
            staff: loggedInStaff,
            role: "officeStaff"
        });
});

const logoutOfficeStaff = asyncHandler(async (req, res) => {
    await OfficeStaff.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1
            }
        },
        {
            new: true
        }
    );

    const options = {
        httpOnly: true,
        secure: true
    };

    return res.status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json({ message: "Logout successful" });
});

// ================== PROFILE MANAGEMENT ==================

const getOfficeStaffProfile = asyncHandler(async (req, res) => {
    const staff = await OfficeStaff.findById(req.user._id)
        .select("-password -refreshToken");

    return res.status(200).json({ staff });
});

const updateOfficeStaffProfile = asyncHandler(async (req, res) => {
    const { name, email } = req.body;

    const updatedStaff = await OfficeStaff.findByIdAndUpdate(
        req.user._id,
        { name, email },
        { new: true }
    ).select("-password -refreshToken");

    if (!updatedStaff) {
        return res.status(404).json({
            message: "Office staff not found"
        });
    }

    return res.status(200).json({
        message: "Profile updated successfully",
        staff: updatedStaff
    });
});

const changePassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
        return res.status(400).json({
            message: "Current password and new password are required"
        });
    }

    const staff = await OfficeStaff.findById(req.user._id);

    if (!staff.isPasswordCorrect(currentPassword)) {
        return res.status(401).json({
            message: "Current password is incorrect"
        });
    }

    staff.password = newPassword;
    await staff.save();

    return res.status(200).json({
        message: "Password changed successfully"
    });
});

// ================== STUDENT MANAGEMENT ==================

const addSingleStudent = asyncHandler(async (req, res) => {
    // Check permission
    if (!req.user.hasPermission('studentManagement')) {
        return res.status(403).json({
            message: "Access denied. Student management permission required."
        });
    }

    const { name, uucmsNo, email, semesterId, division } = req.body;

    // Check if semester exists
    const semester = await Semester.findById(semesterId);
    if (!semester) {
        return res.status(404).json({
            message: "Semester not found"
        });
    }

    // Check for duplicate UUCMS No or email
    const existingStudent = await Student.findOne({
        $or: [{ uucmsNo }, { email }]
    });

    if (existingStudent) {
        return res.status(400).json({
            message: "Student with this UUCMS number or email already exists"
        });
    }

    const newStudent = new Student({
        name,
        uucmsNo,
        email,
        semester: semesterId,
        division
    });

    await newStudent.save();

    return res.status(201).json({
        message: "Student added successfully",
        student: newStudent
    });
});

const bulkAddStudents = asyncHandler(async (req, res) => {
    // Check permission
    if (!req.user.hasPermission('studentManagement')) {
        return res.status(403).json({
            message: "Access denied. Student management permission required."
        });
    }

    if (!req.file) {
        return res.status(400).json({
            message: "Excel file is required"
        });
    }

    try {
        // Read Excel file
        const workbook = XLSX.readFile(req.file.path);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        if (jsonData.length === 0) {
            return res.status(400).json({
                message: "Excel file is empty"
            });
        }

        const results = {
            success: [],
            errors: [],
            duplicates: []
        };

        // Process each student record
        for (let i = 0; i < jsonData.length; i++) {
            const row = jsonData[i];
            const rowNumber = i + 2; // Excel row number (header is row 1)

            try {
                // Validate required fields
                const requiredFields = ['name', 'uucmsNo', 'email', 'semesterNumber', 'division'];
                const missingFields = requiredFields.filter(field => !row[field]);

                if (missingFields.length > 0) {
                    results.errors.push({
                        row: rowNumber,
                        data: row,
                        error: `Missing required fields: ${missingFields.join(', ')}`
                    });
                    continue;
                }

                // Find semester by number
                const semester = await Semester.findOne({
                    semesterNumber: parseInt(row.semesterNumber)
                });

                if (!semester) {
                    results.errors.push({
                        row: rowNumber,
                        data: row,
                        error: `Semester ${row.semesterNumber} not found`
                    });
                    continue;
                }

                // Check for duplicates in database
                const existingStudent = await Student.findOne({
                    $or: [
                        { uucmsNo: row.uucmsNo.toString() },
                        { email: row.email.toString().toLowerCase() }
                    ]
                });

                if (existingStudent) {
                    results.duplicates.push({
                        row: rowNumber,
                        data: row,
                        error: "Student with this UUCMS number or email already exists"
                    });
                    continue;
                }

                // Create new student
                const newStudent = new Student({
                    name: row.name.toString().trim(),
                    uucmsNo: row.uucmsNo.toString().trim(),
                    email: row.email.toString().toLowerCase().trim(),
                    semester: semester._id,
                    division: row.division.toString().trim()
                });

                await newStudent.save();

                results.success.push({
                    row: rowNumber,
                    student: {
                        name: newStudent.name,
                        uucmsNo: newStudent.uucmsNo,
                        email: newStudent.email,
                        division: newStudent.division
                    }
                });

            } catch (error) {
                results.errors.push({
                    row: rowNumber,
                    data: row,
                    error: error.message
                });
            }
        }

        // Clean up uploaded file
        fs.unlinkSync(req.file.path);

        return res.status(200).json({
            message: "Bulk student upload completed",
            summary: {
                totalRecords: jsonData.length,
                successful: results.success.length,
                errors: results.errors.length,
                duplicates: results.duplicates.length
            },
            results
        });

    } catch (error) {
        // Clean up uploaded file in case of error
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }

        return res.status(500).json({
            message: "Error processing Excel file",
            error: error.message
        });
    }
});

const downloadStudentTemplate = asyncHandler(async (req, res) => {
    // Check permission
    if (!req.user.hasPermission('studentManagement')) {
        return res.status(403).json({
            message: "Access denied. Student management permission required."
        });
    }

    try {
        // Sample data
        const sampleData = [
            {
                name: "John Doe",
                uucmsNo: "21CS001",
                email: "john.doe@example.com",
                semesterNumber: 1,
                division: "A"
            },
            {
                name: "Jane Smith",
                uucmsNo: "21CS002",
                email: "jane.smith@example.com",
                semesterNumber: 1,
                division: "B"
            }
        ];

        // Create workbook and worksheet
        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.json_to_sheet(sampleData);
        XLSX.utils.book_append_sheet(workbook, worksheet, "Students");

        // Write workbook to binary string
        const binaryString = XLSX.write(workbook, {
            bookType: 'xlsx',
            type: 'binary'
        });

        // Convert to buffer
        const buffer = Buffer.from(binaryString, 'binary');

        // Set headers
        res.setHeader(
            'Content-Type',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        );
        res.setHeader(
            'Content-Disposition',
            'attachment; filename="student_upload_template.xlsx"'
        );

        return res.send(buffer);

    } catch (error) {
        console.error('Error generating Excel file:', error);
        return res.status(500).json({
            message: "Error generating template",
            error: error.message
        });
    }
});

const getAllStudents = asyncHandler(async (req, res) => {
    // Check permission
    if (!req.user.hasPermission('studentManagement')) {
        return res.status(403).json({
            message: "Access denied. Student management permission required."
        });
    }

    const { page = 1, limit = 50, semester, division, search } = req.query;

    // Build filter query
    let filterQuery = {};

    if (semester) {
        const semesterObj = await Semester.findOne({
            semesterNumber: parseInt(semester)
        });
        if (semesterObj) {
            filterQuery.semester = semesterObj._id;
        }
    }

    if (division) {
        filterQuery.division = division;
    }

    if (search) {
        filterQuery.$or = [
            { name: { $regex: search, $options: 'i' } },
            { uucmsNo: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } }
        ];
    }

    const students = await Student.find(filterQuery)
        .populate('semester', 'semesterNumber')
        .select('-password -refreshToken')
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .sort({ createdAt: -1 });

    const total = await Student.countDocuments(filterQuery);

    return res.status(200).json({
        students,
        pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(total / limit),
            totalStudents: total,
            hasMore: page * limit < total
        }
    });
});

const getStudentById = asyncHandler(async (req, res) => {
    // Check permission
    if (!req.user.hasPermission('studentManagement')) {
        return res.status(403).json({
            message: "Access denied. Student management permission required."
        });
    }

    const student = await Student.findById(req.params.id)
        .populate('semester', 'semesterNumber')
        .select('-password -refreshToken');

    if (!student) {
        return res.status(404).json({
            message: "Student not found"
        });
    }

    return res.status(200).json({ student });
});

const updateStudent = asyncHandler(async (req, res) => {
    // Check permission
    if (!req.user.hasPermission('studentManagement')) {
        return res.status(403).json({
            message: "Access denied. Student management permission required."
        });
    }

    const { name, email, semesterId, division } = req.body;

    const updatedStudent = await Student.findByIdAndUpdate(
        req.params.id,
        { name, email, semester: semesterId, division },
        { new: true }
    ).populate('semester', 'semesterNumber');

    if (!updatedStudent) {
        return res.status(404).json({
            message: "Student not found"
        });
    }

    return res.status(200).json({
        message: "Student updated successfully",
        student: updatedStudent
    });
});

const deleteStudent = asyncHandler(async (req, res) => {
    // Check permission
    if (!req.user.hasPermission('studentManagement')) {
        return res.status(403).json({
            message: "Access denied. Student management permission required."
        });
    }

    const deletedStudent = await Student.findByIdAndDelete(req.params.id);

    if (!deletedStudent) {
        return res.status(404).json({
            message: "Student not found"
        });
    }

    return res.status(200).json({
        message: "Student deleted successfully"
    });
});

// ================== DASHBOARD & REPORTS ==================

const getDashboard = asyncHandler(async (req, res) => {
    try {
        const totalStudents = await Student.countDocuments();
        const totalSemesters = await Semester.countDocuments();

        // Get student distribution by semester
        const studentsBySemester = await Student.aggregate([
            {
                $lookup: {
                    from: 'semesters',
                    localField: 'semester',
                    foreignField: '_id',
                    as: 'semesterInfo'
                }
            },
            {
                $unwind: '$semesterInfo'
            },
            {
                $group: {
                    _id: '$semesterInfo.semesterNumber',
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { _id: 1 }
            }
        ]);

        // Get recent student additions (last 7 days)
        const recentStudents = await Student.countDocuments({
            createdAt: {
                $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
            }
        });

        return res.status(200).json({
            dashboard: {
                totalStudents,
                totalSemesters,
                recentStudents,
                studentsBySemester,
                permissions: req.user.permissions
            }
        });

    } catch (error) {
        return res.status(500).json({
            message: "Error fetching dashboard data",
            error: error.message
        });
    }
});

// ================== UTILITY FUNCTIONS ==================

const getSemesters = asyncHandler(async (req, res) => {
    const semesters = await Semester.find().sort({ semesterNumber: 1 });
    return res.status(200).json({ semesters });
});

export {
    // Authentication
    seedOfficeStaff,
    loginOfficeStaff,
    logoutOfficeStaff,

    // Profile Management
    getOfficeStaffProfile,
    updateOfficeStaffProfile,
    changePassword,

    // Student Management
    addSingleStudent,
    bulkAddStudents,
    downloadStudentTemplate,
    getAllStudents,
    getStudentById,
    updateStudent,
    deleteStudent,

    // Dashboard & Utilities
    getDashboard,
    getSemesters
};