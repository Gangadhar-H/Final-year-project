import { asyncHandler } from "../utils/asyncHandler.js";
import { Admin } from "../models/admin.model.js";
import jwt from "jsonwebtoken";
import generateAccessAndRefreshTokens from "../utils/generateTokens.js";
import { Semester } from "../models/semester.model.js";
import { Subject } from "../models/subject.model.js";
import { Teacher } from "../models/teacher.model.js";
import { Student } from "../models/student.model.js"


const seedAdmin = asyncHandler(async (req, res) => {
    const { adminId, name, email, password } = req.body;

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
        return res.status(400).json({ message: "Admin already exists" });
    }

    // Create new admin
    const admin = new Admin({
        adminId,
        name,
        email,
        password
    });

    await admin.save();

    return res.status(201).json({
        message: "Admin created successfully",
        admin: {
            _id: admin._id,
            adminId: admin.adminId,
            name: admin.name,
            email: admin.email,
            role: "admin"
        }
    });
});

const loginAdmin = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    if (!email && !password) {
        return res.status(400).json({ message: "Email and password are required" });
    }

    const admin = await Admin.findOne({ email });
    if (!admin) {
        return res.status(404).json({ message: "Admin not found" });
    }

    const isPasswordValid = await admin.isPasswordCorrect(password);
    if (!isPasswordValid) {
        return res.status(401).json({ message: "Incorrect password" });
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(admin._id);

    const loggedInAdmin = await Admin.findById(admin._id).select("-password -refreshToken");

    const options = {
        httpOnly: true,
        secure: true
    }

    return res.status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json({ message: "Logged In successful", admin: loggedInAdmin, role: "admin" });

});


// ---------- Semester Management ----------

const addSemester = asyncHandler(async (req, res) => {
    const { semesterNumber, divisions } = req.body;
    const existingSem = await Semester.findOne({ semesterNumber });
    if (existingSem) {
        return res.status(400).json({ message: 'Semester already added' });
    }

    const newSemester = new Semester({
        semesterNumber,
        divisions,
    });

    await newSemester.save();

    return res.status(200).json({ message: "Semester added successfully", semester: newSemester });

});

const getAllSemesters = asyncHandler(async (req, res) => {
    const semesters = await Semester.find();
    if (!semesters) {
        return res.status(404).json({ message: "Semesters not available" });
    }
    return res.status(201).json({ semesters });
});

const updateSemester = asyncHandler(async (req, res) => {
    const { semesterNumber } = req.params;
    const updates = req.body;

    const semester = await Semester.findOneAndUpdate(
        { semesterNumber },
        updates,
        {
            new: true,
        }
    );

    if (!semester) {
        return res.status(404).json({ message: "Semester not found" });
    }

    return res.status(200).json({ message: "Semester updated successfully", updatedSem: semester });

});

const deleteSemester = asyncHandler(async (req, res) => {
    const { semesterNumber } = req.params;
    const semester = await Semester.findOneAndDelete(
        { semesterNumber }
    )
    if (!semester) {
        return res.status(404).json({ message: 'Semester not found' });
    }
    return res.status(200).json({ message: "Semester deleted" });
});

// ---------- Division Management ----------
const addDivision = asyncHandler(async (req, res) => {
    const { semesterNumber } = req.params;
    const { division } = req.body;
    const semester = await Semester.findOne({ semesterNumber });
    if (!semester) {
        return res.status(404).json({ message: "Semester not found" });
    }

    if (semester.divisions.includes(division)) {
        return res.status(400).json({ message: "Division already exist" });
    }

    semester.divisions.push(division);
    await semester.save();

    return res.status(200).json({ message: "Division added succesfully" });

});

const removeDivision = asyncHandler(async (req, res) => {
    const { semesterNumber } = req.params;
    const { division } = req.body;

    const semester = await Semester.findOne({ semesterNumber });
    if (!semester) {
        return res.status(404).json({ message: 'Semester not found' });
    }

    if (!semester.divisions.includes(division)) {
        return res.status(400).json({ message: 'Division does not exist in this semester' });
    }

    semester.divisions = semester.divisions.filter((d) => d !== division);
    await semester.save();

    return res.status(200).json({ message: "Divison deleted" });

});


// -----------Subject management--------------
const addSubject = asyncHandler(async (req, res) => {
    const { subjectName, subjectCode } = req.body;
    const semesterNumber = req.params.semesterNumber;

    const semester = await Semester.findOne({ semesterNumber });
    if (!semester) {
        return res.status(404).json({ message: "Semester not found" });
    }

    const subject = new Subject({
        subjectName,
        subjectCode,
        semester: semester._id,
    });

    await subject.save();

    return res.status(201).json({ message: "Subject added", subject });

});

const getSubjectsBySemester = asyncHandler(async (req, res) => {
    const semesterNumber = req.params.semesterNumber;
    const semester = await Semester.findOne({ semesterNumber });
    if (!semester) {
        return res.status(404).json({ message: 'Semester not found' });
    }

    const subjects = await Subject.find({ semester: semester._id });
    return res.status(200).json({ subjects });
});

const updateSubject = asyncHandler(async (req, res) => {
    const { subjectCode, subjectName } = req.body;
    const { subjectId } = req.params;

    const updatedSubject = await Subject.findByIdAndUpdate(
        subjectId,
        { subjectCode, subjectName },
        { new: true }
    )

    if (!updatedSubject) {
        return res.status(404).json({ message: 'Subject not found' });
    }

    return res.status(200).json({ message: "Subject updated", updatedSubject });

});

const deleteSubject = asyncHandler(async (req, res) => {
    const { subjectId } = req.params;
    const deleted = await Subject.findByIdAndDelete(subjectId);
    if (!deleted) {
        return res.status(404).json({ message: 'Subject not found' });
    }

    return res.status(200).json({ message: "Subjected Deleted" });
})


// ------------ Teacher Management ------------
const addTeacher = asyncHandler(async (req, res) => {
    const { teacherId, name, email, password } = req.body;
    if (!teacherId || !name || !email || !password) {
        return res.status(400).json({ message: "Enter all fields" });
    }

    const existingTeacher = await Teacher.findOne({ email });
    if (existingTeacher) return res.status(400).json({ message: "Email already in use" });


    const teacher = new Teacher({
        teacherId,
        name,
        email,
        password
    });
    await teacher.save();
    if (!teacher) {
        return res.status(500).json({ message: "Something went wrong please try again later" });
    }
    return res.status(200).json({ message: "Teacher added", teacher });
});

const getAllTeachers = asyncHandler(async (req, res) => {
    const teachers = await Teacher.find().select("-password");
    if (!teachers) {
        return res.status(500).json({ message: "Error fetching teachers" });
    }
    return res.status(200).json({ message: "All teachers", teachers });
});

const getTeacherById = asyncHandler(async (req, res) => {
    const id = req.params.id;
    const teacher = await Teacher.findById(id).select("-password");
    if (!teacher) return res.status(404).json({ message: "Teacher not found" });
    return res.status(200).json({ teacher });
});

const updateTeacher = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;
    const teacher = await Teacher.findByIdAndUpdate(
        req.params.id,
        { name, email, password },
        { new: true }
    );

    if (!teacher) {
        return res.status(404).json({ message: "Teacher not found" });
    }

    return res.status(200).json({ message: "Teacher details updated", teacher });

});

const deleteTeacher = asyncHandler(async (req, res) => {
    const id = req.params.id;
    await Teacher.findByIdAndDelete(id);
    return res.status(200).json({ message: "Teacher deleted" });
});

const assignSubjectToTeacher = asyncHandler(async (req, res) => {
    const { teacherId, division } = req.body;
    const { subjectId } = req.params;
    const teacher = await Teacher.findById(teacherId).select("-password");
    if (!teacher) return res.status(404).json({ message: "Teacher not found" });

    const alreadyAssigned = teacher.assignedSubjects.some(
        (assignment) => assignment.subjectId.toString() === subjectId &&
            assignment.division === division
    );

    if (alreadyAssigned) {
        return res.status(400).json({ message: "Already assigned" });
    }

    teacher.assignedSubjects.push({ subjectId, division });
    await teacher.save();

    return res.status(200).json({ message: "Assigned Successfully", teacher })
});


// ------Student Management----------
const addStudent = asyncHandler(async (req, res) => {
    const { name, uucmsNo, email, semesterId, division } = req.body;

    // Check if semester exists
    const semester = await Semester.findById(semesterId);
    if (!semester) {
        return res.status(404).json({ message: "Semester not found" });
    }

    // Check for duplicate UUCMS No or email
    const existingStudent = await Student.findOne({
        $or: [{ uucmsNo }, { email }],
    });

    if (existingStudent) {
        return res.status(400).json({ message: "Student already exists" });
    }

    const newStudent = new Student({
        name,
        uucmsNo,
        email,
        semester: semesterId,
        division,
    });

    await newStudent.save();

    return res.status(201).json({ message: "Student added successfully", student: newStudent });
});

const getAllStudents = asyncHandler(async (req, res) => {
    const students = await Student.find().populate("semester");
    return res.status(200).json(students);
});

const getStudentById = asyncHandler(async (req, res) => {
    const student = await Student.findById(req.params.id).populate("semester");
    if (!student) {
        return res.status(404).json({ message: "Student not found" });
    }
    return res.status(200).json(student);
});

const updateStudent = asyncHandler(async (req, res) => {
    const { name, email, semesterId, division } = req.body;

    const updatedStudent = await Student.findByIdAndUpdate(
        req.params.id,
        {
            name,
            email,
            semester: semesterId,
            division,
        },
        { new: true }
    );

    if (!updatedStudent) {
        return res.status(404).json({ message: "Student not found" });
    }

    return res.status(200).json({ message: "Student updated successfully", student: updatedStudent });
});

const deleteStudent = asyncHandler(async (req, res) => {
    const deletedStudent = await Student.findByIdAndDelete(req.params.id);
    if (!deletedStudent) {
        return res.status(404).json({ message: "Student not found" });
    }
    return res.status(200).json({ message: "Student deleted successfully" });
});

export {
    seedAdmin,
    loginAdmin,
    addSemester,
    getAllSemesters,
    updateSemester,
    deleteSemester,
    addDivision,
    removeDivision,
    addSubject,
    getSubjectsBySemester,
    updateSubject,
    deleteSubject,
    addTeacher,
    getAllTeachers,
    getTeacherById,
    updateTeacher,
    deleteTeacher,
    assignSubjectToTeacher,
    addStudent,
    getAllStudents,
    getStudentById,
    updateStudent,
    deleteStudent
}
