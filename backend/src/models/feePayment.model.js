// backend/src/models/feePayment.model.js
import mongoose, { Schema } from "mongoose";

const feePaymentSchema = new Schema({
    student: {
        type: Schema.Types.ObjectId,
        ref: "Student",
        required: true
    },
    feeStructure: {
        type: Schema.Types.ObjectId,
        ref: "FeeStructure",
        required: true
    },
    paymentDetails: {
        transactionId: {
            type: String,
            required: true
        },
        paymentMethod: {
            type: String,
            enum: ["UPI", "Net Banking", "Card", "Cash", "Cheque", "DD"],
            required: true
        },
        paidAmount: {
            type: Number,
            required: true
        },
        paymentDate: {
            type: Date,
            required: true
        },
        paymentProof: {
            type: String, // File path for uploaded receipt
            required: true
        }
    },
    status: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending"
    },
    verificationDetails: {
        verifiedBy: {
            type: Schema.Types.ObjectId,
            ref: "OfficeStaff"
        },
        verifiedAt: {
            type: Date
        },
        remarks: {
            type: String,
            maxlength: 500
        }
    },
    receiptNumber: {
        type: String,
        unique: true,
        sparse: true // Only unique if not null
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Generate receipt number after approval
feePaymentSchema.methods.generateReceiptNumber = function () {
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `RCP${year}${month}${random}`;
};

// Index for efficient querying
feePaymentSchema.index({ student: 1, feeStructure: 1 });
feePaymentSchema.index({ status: 1 });
feePaymentSchema.index({ receiptNumber: 1 });

export const FeePayment = mongoose.model("FeePayment", feePaymentSchema);