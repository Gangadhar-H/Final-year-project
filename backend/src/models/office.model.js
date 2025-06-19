import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";

const officeStaffSchema = new Schema(
    {
        staffId: {
            type: String,
            required: true,
            unique: true
        },
        name: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true,
            unique: true
        },
        password: {
            type: String,
            required: true
        },
        designation: {
            type: String,
            required: true,
            enum: [
                "Office Manager",
                "Accounts Officer", 
                "Admission Officer",
                "Student Coordinator",
                "Exam Officer",
                "Clerk",
                "Other"
            ]
        },
        permissions: {
            studentManagement: {
                type: Boolean,
                default: false
            },
            feeManagement: {
                type: Boolean,
                default: false
            },
            certificateIssue: {
                type: Boolean,
                default: false
            },
            noticeManagement: {
                type: Boolean,
                default: false
            },
            reportGeneration: {
                type: Boolean,
                default: false
            }
        },
        refreshToken: {
            type: String
        }
    }, 
    { 
        timestamps: true 
    }
);

// Simple password comparison (no bcrypt)
officeStaffSchema.methods.isPasswordCorrect = function (password) {
    return this.password === password;
};

// Generate Access Token
officeStaffSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            staffId: this.staffId,
            name: this.name,
            designation: this.designation,
            permissions: this.permissions
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    );
};

// Generate Refresh Token
officeStaffSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    );
};

// Method to check if staff has specific permission
officeStaffSchema.methods.hasPermission = function (permission) {
    return this.permissions[permission] === true;
};

export const OfficeStaff = mongoose.model("OfficeStaff", officeStaffSchema);