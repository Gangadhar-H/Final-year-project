import mongoose, { Schema } from "mongoose";

const teacherSchema = new Schema({
    teacherId: {
        type: String,
        required: true,
        unique: true,
    },
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    assignedSubjects: [
        {
            subjectId: { type: mongoose.Schema.Types.ObjectId, ref: "Subject" },
            division: { type: String, required: true },
        }
    ]
}, { timestamps: true, });

export const Teacher = mongoose.model("Teacher", teacherSchema);
