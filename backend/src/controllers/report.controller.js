// backend/src/controllers/report.controller.js
import { asyncHandler } from "../utils/asyncHandler.js";
import { InternalMark } from "../models/internalMark.model.js";
import { Student } from "../models/student.model.js";
import { Subject } from "../models/subject.model.js";
import { Semester } from "../models/semester.model.js";
import XLSX from 'xlsx';

// ================== INTERNAL MARKS REPORTS ==================

const getInternalMarksReport = asyncHandler(async (req, res) => {
    // Check permission
    if (!req.user.hasPermission('reportGeneration')) {
        return res.status(403).json({
            message: "Access denied. Report generation permission required."
        });
    }

    const { semesterId, examType, division } = req.query;

    if (!semesterId || !examType) {
        return res.status(400).json({
            message: "Semester ID and exam type are required"
        });
    }

    try {
        // Get semester info
        const semester = await Semester.findById(semesterId);
        if (!semester) {
            return res.status(404).json({
                message: "Semester not found"
            });
        }

        // Get all subjects for this semester
        const subjects = await Subject.find({ semester: semesterId }).sort({ subjectCode: 1 });

        if (subjects.length === 0) {
            return res.status(404).json({
                message: "No subjects found for this semester"
            });
        }

        // Build query for students
        let studentQuery = { semester: semesterId };
        if (division) {
            studentQuery.division = division;
        }

        // Get all students for this semester/division
        const students = await Student.find(studentQuery)
            .select('name uucmsNo division')
            .sort({ name: 1 });

        if (students.length === 0) {
            return res.status(404).json({
                message: "No students found"
            });
        }

        // Get internal marks for these students, subjects, and exam type
        const marks = await InternalMark.find({
            semester: semesterId,
            examType: examType,
            ...(division && { division: division })
        }).populate('student', 'name uucmsNo division')
            .populate('subject', 'subjectName subjectCode');

        // Process the data to create report
        const reportData = students.map(student => {
            const studentMarks = marks.filter(mark =>
                mark.student._id.toString() === student._id.toString()
            );

            const subjectMarks = {};
            let totalObtained = 0;
            let totalMax = 0;
            let subjectsWithMarks = 0;

            subjects.forEach(subject => {
                const mark = studentMarks.find(m =>
                    m.subject._id.toString() === subject._id.toString()
                );

                if (mark) {
                    subjectMarks[subject.subjectCode] = {
                        obtained: mark.obtainedMarks,
                        max: mark.maxMarks,
                        display: `${mark.obtainedMarks}/${mark.maxMarks}`
                    };
                    totalObtained += mark.obtainedMarks;
                    totalMax += mark.maxMarks;
                    subjectsWithMarks++;
                } else {
                    subjectMarks[subject.subjectCode] = {
                        obtained: 0,
                        max: 0,
                        display: 'N/A'
                    };
                }
            });

            const percentage = totalMax > 0 ? ((totalObtained / totalMax) * 100).toFixed(2) : 0;

            return {
                studentId: student._id,
                name: student.name,
                uucmsNo: student.uucmsNo,
                division: student.division,
                subjectMarks,
                totalObtained,
                totalMax,
                percentage: parseFloat(percentage),
                subjectsWithMarks
            };
        });

        // Sort by percentage (descending - highest first)
        reportData.sort((a, b) => b.percentage - a.percentage);

        // Add rank
        reportData.forEach((student, index) => {
            student.rank = index + 1;
        });

        // Calculate class statistics
        const validStudents = reportData.filter(s => s.subjectsWithMarks > 0);
        const classAverage = validStudents.length > 0
            ? (validStudents.reduce((sum, s) => sum + s.percentage, 0) / validStudents.length).toFixed(2)
            : 0;

        const stats = {
            totalStudents: students.length,
            studentsWithMarks: validStudents.length,
            classAverage: parseFloat(classAverage),
            highestPercentage: validStudents.length > 0 ? validStudents[0].percentage : 0,
            lowestPercentage: validStudents.length > 0 ? validStudents[validStudents.length - 1].percentage : 0
        };

        return res.status(200).json({
            report: {
                semester: {
                    id: semester._id,
                    number: semester.semesterNumber
                },
                examType,
                division: division || 'All Divisions',
                subjects: subjects.map(s => ({
                    code: s.subjectCode,
                    name: s.subjectName
                })),
                students: reportData,
                statistics: stats,
                generatedAt: new Date()
            }
        });

    } catch (error) {
        console.error('Error generating report:', error);
        return res.status(500).json({
            message: "Error generating report",
            error: error.message
        });
    }
});

const downloadInternalMarksReport = asyncHandler(async (req, res) => {
    // Check permission
    if (!req.user.hasPermission('reportGeneration')) {
        return res.status(403).json({
            message: "Access denied. Report generation permission required."
        });
    }

    const { semesterId, examType, division } = req.query;

    if (!semesterId || !examType) {
        return res.status(400).json({
            message: "Semester ID and exam type are required"
        });
    }

    try {
        // Get the report data (reuse the logic from above)
        const semester = await Semester.findById(semesterId);
        const subjects = await Subject.find({ semester: semesterId }).sort({ subjectCode: 1 });

        let studentQuery = { semester: semesterId };
        if (division) {
            studentQuery.division = division;
        }

        const students = await Student.find(studentQuery)
            .select('name uucmsNo division')
            .sort({ name: 1 });

        const marks = await InternalMark.find({
            semester: semesterId,
            examType: examType,
            ...(division && { division: division })
        }).populate('student', 'name uucmsNo division')
            .populate('subject', 'subjectName subjectCode');

        const reportData = students.map(student => {
            const studentMarks = marks.filter(mark =>
                mark.student._id.toString() === student._id.toString()
            );

            const subjectMarks = {};
            let totalObtained = 0;
            let totalMax = 0;

            subjects.forEach(subject => {
                const mark = studentMarks.find(m =>
                    m.subject._id.toString() === subject._id.toString()
                );

                if (mark) {
                    subjectMarks[subject.subjectCode] = `${mark.obtainedMarks}/${mark.maxMarks}`;
                    totalObtained += mark.obtainedMarks;
                    totalMax += mark.maxMarks;
                } else {
                    subjectMarks[subject.subjectCode] = 'N/A';
                }
            });

            const percentage = totalMax > 0 ? ((totalObtained / totalMax) * 100).toFixed(2) : 0;

            return {
                'Rank': 0, // Will be set after sorting
                'Name': student.name,
                'UUCMS No': student.uucmsNo,
                'Division': student.division,
                ...subjectMarks,
                'Total': `${totalObtained}/${totalMax}`,
                'Percentage': `${percentage}%`
            };
        });

        // Sort by percentage and add rank
        reportData.sort((a, b) => {
            const percentageA = parseFloat(a.Percentage.replace('%', ''));
            const percentageB = parseFloat(b.Percentage.replace('%', ''));
            return percentageB - percentageA;
        });

        reportData.forEach((student, index) => {
            student.Rank = index + 1;
        });

        // Create Excel workbook
        const workbook = XLSX.utils.book_new();

        // Add title and info at the top (without creating the worksheet yet)
        const title = `Internal Marks Report - Semester ${semester.semesterNumber} - ${examType}`;
        const info = [
            [title],
            [`Division: ${division || 'All Divisions'}`],
            [`Generated on: ${new Date().toLocaleDateString()}`],
            [] // Empty row
        ];

        // Create worksheet from the info first
        const worksheet = XLSX.utils.aoa_to_sheet(info);

        // Now add the JSON data starting from row 5, with headers
        XLSX.utils.sheet_add_json(worksheet, reportData, {
            origin: 'A5',
            skipHeader: false // This ensures headers are added
        });

        XLSX.utils.book_append_sheet(workbook, worksheet, 'Internal Marks Report');

        // Generate Excel file
        const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });

        // Set response headers
        const filename = `Internal_Marks_Report_Sem${semester.semesterNumber}_${examType}_${Date.now()}.xlsx`;
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

        return res.send(buffer);

    } catch (error) {
        console.error('Error downloading report:', error);
        return res.status(500).json({
            message: "Error downloading report",
            error: error.message
        });
    }
});

const getAvailableReports = asyncHandler(async (req, res) => {
    // Check permission
    if (!req.user.hasPermission('reportGeneration')) {
        return res.status(403).json({
            message: "Access denied. Report generation permission required."
        });
    }

    try {
        // Get all semesters
        const semesters = await Semester.find().sort({ semesterNumber: 1 });

        // Get unique exam types from internal marks
        const examTypes = await InternalMark.distinct('examType');

        // Get unique divisions from students
        const divisions = await Student.distinct('division');

        return res.status(200).json({
            availableOptions: {
                semesters: semesters.map(s => ({
                    id: s._id,
                    number: s.semesterNumber,
                    label: `Semester ${s.semesterNumber}`
                })),
                examTypes: examTypes.sort(),
                divisions: divisions.sort()
            }
        });

    } catch (error) {
        return res.status(500).json({
            message: "Error fetching report options",
            error: error.message
        });
    }
});

export {
    getInternalMarksReport,
    downloadInternalMarksReport,
    getAvailableReports
};