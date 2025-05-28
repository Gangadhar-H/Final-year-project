import mongoose, { Schema } from "mongoose";

const attendanceSchema = new Schema({
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
    date: {
        type: Date,
        required: true,
        default: Date.now
    },
    attendanceRecords: [
        {
            student: {
                type: Schema.Types.ObjectId,
                ref: "Student",
                required: true
            },
            status: {
                type: String,
                enum: ["present", "absent"],
                default: "absent"
            }
        }
    ],
    totalStudents: {
        type: Number,
        default: 0
    },
    presentCount: {
        type: Number,
        default: 0
    },
    absentCount: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Compound index to ensure one attendance record per subject-division-date
attendanceSchema.index({ subject: 1, division: 1, date: 1 }, { unique: true });

// Method to calculate attendance counts
attendanceSchema.methods.calculateCounts = function () {
    this.totalStudents = this.attendanceRecords.length;
    this.presentCount = this.attendanceRecords.filter(record => record.status === "present").length;
    this.absentCount = this.attendanceRecords.filter(record => record.status === "absent").length;
};

// Pre-save middleware to auto-calculate counts
attendanceSchema.pre('save', function (next) {
    this.calculateCounts();
    next();
});

export const Attendance = mongoose.model("Attendance", attendanceSchema);