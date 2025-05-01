import mongoose from "mongoose";

const subjectSchema = new mongoose.Schema({
    subjectCode: {
        type: String,
        required: true,
        unique: true,
    },
    subjectName: {
        type: String,
        required: true,
        unique: true,
    },
    semester: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Semester',
        required: true
    }
}, { timestamps: true });

export const Subject = mongoose.model("Subject", subjectSchema);
