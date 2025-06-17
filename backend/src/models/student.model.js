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
    refreshToken: {
        type: String
    },
});

studentSchema.methods.isPasswordCorrect = function (password) {
    return this.password === password;
}

// Generate Access Token
studentSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            uucmsNo: this.uucmsNo,
            name: this.name
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

// Generate Refresh Token
studentSchema.methods.generateRefreshToken = function () {
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

// Static method to get students by semester and division
studentSchema.statics.findBySemesterAndDivision = function (semesterId, division) {
    return this.find({ semester: semesterId, division: division, isActive: true })
        .populate('semester', 'semesterNumber')
        .select('-password -refreshToken');
}

// Instance method to get student's full name with UUCMS number
studentSchema.methods.getDisplayName = function () {
    return `${this.name} (${this.uucmsNo})`;
}

export const Student = mongoose.model("Student", studentSchema);
