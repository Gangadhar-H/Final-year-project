import mongoose, { Schema } from "mongoose";

const semesterSchema = new Schema({
    semesterNumber: { // Changed from semNumber to match controller
        type: Number,
        required: true,
        unique: true,
    },
    divisions: {
        type: [String], // Changed to simple array of strings to match controller
        default: []
    }
});

export const Semester = mongoose.model('Semester', semesterSchema);