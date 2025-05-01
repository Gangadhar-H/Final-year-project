import mongoose, { Schema, model } from "mongoose";

const studentSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    uucmsNo: {
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    semester: {
        type: Schema.Types.ObjectId,
        ref: "Semester",
        required: true,
    },
    division: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        default: "student",
    },
});

export default model("Student", studentSchema);
