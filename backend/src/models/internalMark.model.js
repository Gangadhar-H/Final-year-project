import mongoose, { Schema } from "mongoose";

const internalMarkSchema = new Schema({
    student: {
        type: Schema.Types.ObjectId,
        ref: "Student",
        required: true
    },
    subject: {
        type: Schema.Types.ObjectId,
        ref: "Subject",
        required: true
    },
    teacher: {
        type: Schema.Types.ObjectId,
        ref: "Teacher",
        required: true
    },
    division: {
        type: String,
        required: true
    },
    semester: {
        type: Schema.Types.ObjectId,
        ref: "Semester",
        required: true
    },
    examType: {
        type: String,
        enum: ["Internal 1", "Internal 2", "Internal 3", "Assignment", "Quiz", "Project"],
        required: true
    },
    maxMarks: {
        type: Number,
        required: true,
        min: 1
    },
    obtainedMarks: {
        type: Number,
        required: true,
        min: 0,
        validate: {
            validator: function (value) {
                return value <= this.maxMarks;
            },
            message: "Obtained marks cannot exceed maximum marks"
        }
    },
    examDate: {
        type: Date,
        required: true
    },
    remarks: {
        type: String,
        maxlength: 500
    }
}, {
    timestamps: true
});

// Compound index to prevent duplicate entries for same student-subject-examType
internalMarkSchema.index({
    student: 1,
    subject: 1,
    examType: 1
}, { unique: true });

// Index for efficient querying
internalMarkSchema.index({ subject: 1, division: 1, semester: 1 });
internalMarkSchema.index({ teacher: 1 });

// Method to calculate percentage
internalMarkSchema.methods.getPercentage = function () {
    return ((this.obtainedMarks / this.maxMarks) * 100).toFixed(2);
};

// Static method to get class average for a subject and exam type
internalMarkSchema.statics.getClassAverage = async function (subjectId, division, examType) {
    const result = await this.aggregate([
        {
            $match: {
                subject: new mongoose.Types.ObjectId(subjectId),
                division: division,
                examType: examType
            }
        },
        {
            $group: {
                _id: null,
                averageMarks: { $avg: "$obtainedMarks" },
                maxMarks: { $first: "$maxMarks" },
                totalStudents: { $sum: 1 }
            }
        }
    ]);

    if (result.length > 0) {
        return {
            averageMarks: result[0].averageMarks.toFixed(2),
            averagePercentage: ((result[0].averageMarks / result[0].maxMarks) * 100).toFixed(2),
            totalStudents: result[0].totalStudents
        };
    }
    return null;
};

export const InternalMark = mongoose.model("InternalMark", internalMarkSchema);