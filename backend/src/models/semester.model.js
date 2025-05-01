import mongoose, { Schema } from "mongoose";

const semesterSchema = new Schema({
    semesterNumber: {
        type: Number,
        required: true,
        unique: true,
    },
    divisions: [
        {
            name: {
                type: String,
                required: true
            },
        },
    ],
})

export const Semester = mongoose.model('Semester', semesterSchema);
