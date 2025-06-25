// backend/src/models/feeStructure.model.js
import mongoose, { Schema } from "mongoose";

const feeStructureSchema = new Schema({
    semester: {
        type: Schema.Types.ObjectId,
        ref: "Semester",
        required: true
    },
    academicYear: {
        type: String,
        required: true, // e.g., "2024-25"
    },
    feeComponents: {
        tuitionFee: {
            type: Number,
            required: true,
            default: 0
        },
        examFee: {
            type: Number,
            required: true,
            default: 0
        },
        libraryFee: {
            type: Number,
            required: true,
            default: 0
        },
        labFee: {
            type: Number,
            required: true,
            default: 0
        },
        developmentFee: {
            type: Number,
            required: true,
            default: 0
        },
        otherFee: {
            type: Number,
            default: 0
        }
    },
    totalAmount: {
        type: Number,
        required: true
    },
    dueDate: {
        type: Date,
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Calculate total amount before saving
feeStructureSchema.pre('save', function (next) {
    const components = this.feeComponents;
    this.totalAmount = components.tuitionFee + components.examFee +
        components.libraryFee + components.labFee +
        components.developmentFee + (components.otherFee || 0);
    next();
});

// Compound index to ensure one fee structure per semester per academic year
feeStructureSchema.index({ semester: 1, academicYear: 1 }, { unique: true });

export const FeeStructure = mongoose.model("FeeStructure", feeStructureSchema);