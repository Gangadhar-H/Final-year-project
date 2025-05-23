import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";

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
    refreshToken: {
        type: String
    },
    assignedSubjects: [
        {
            subjectId: { type: mongoose.Schema.Types.ObjectId, ref: "Subject" },
            division: { type: String, required: true },
        }
    ]
}, { timestamps: true, });

// Simple password comparison (no bcrypt)
teacherSchema.methods.isPasswordCorrect = function (password) {
    return this.password === password;
}

// Generate Access Token
teacherSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            teacherId: this.teacherId,
            name: this.name
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

// Generate Refresh Token
teacherSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export const Teacher = mongoose.model("Teacher", teacherSchema);