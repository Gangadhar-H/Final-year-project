// backend/src/controllers/fee.controller.js
import { FeeStructure } from "../models/feeStructure.model.js";
import { FeePayment } from "../models/feePayment.model.js";
import { Student } from "../models/student.model.js";
import { Semester } from "../models/semester.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import fs from 'fs';
import path from 'path';

// Admin Controllers
export const createFeeStructure = asyncHandler(async (req, res) => {
    const { semesterId, academicYear, feeComponents, dueDate } = req.body;

    // Check if fee structure already exists
    const existingFeeStructure = await FeeStructure.findOne({
        semester: semesterId,
        academicYear
    });

    if (existingFeeStructure) {
        return res.status(400).json({
            message: "Fee structure already exists for this semester and academic year",
            success: false
        });
    }

    // Calculate totalAmount from feeComponents
    const totalAmount = Object.values(feeComponents).reduce(
        (sum, fee) => sum + (parseFloat(fee) || 0),
        0
    );

    const feeStructure = new FeeStructure({
        semester: semesterId,
        academicYear,
        feeComponents,
        dueDate: new Date(dueDate),
        totalAmount // ✅ Include this field
    });

    await feeStructure.save();

    const populatedFeeStructure = await FeeStructure.findById(feeStructure._id)
        .populate('semester', 'semesterNumber');

    res.status(201).json({
        message: "Fee structure created successfully",
        success: true,
        data: populatedFeeStructure
    });
});


export const getAllFeeStructures = asyncHandler(async (req, res) => {
    const feeStructures = await FeeStructure.find({ isActive: true })
        .populate('semester', 'semesterNumber')
        .sort({ createdAt: -1 });

    res.status(200).json({
        message: "Fee structures retrieved successfully",
        success: true,
        data: feeStructures
    });
});

export const updateFeeStructure = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updates = req.body;

    const feeStructure = await FeeStructure.findByIdAndUpdate(
        id,
        updates,
        { new: true, runValidators: true }
    ).populate('semester', 'semesterNumber');

    if (!feeStructure) {
        return res.status(404).json({
            message: "Fee structure not found",
            success: false
        });
    }

    res.status(200).json({
        message: "Fee structure updated successfully",
        success: true,
        data: feeStructure
    });
});

export const deleteFeeStructure = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const feeStructure = await FeeStructure.findByIdAndDelete(
        id
    );

    if (!feeStructure) {
        return res.status(404).json({
            message: "Fee structure not found",
            success: false
        });
    }

    res.status(200).json({
        message: "Fee structure deleted successfully",
        success: true
    });
});

// Student Controllers
export const getStudentFeeDetails = asyncHandler(async (req, res) => {
    const studentId = req.user._id;

    const student = await Student.findById(studentId).populate('semester');

    const feeStructure = await FeeStructure.findOne({
        semester: student.semester._id,
        isActive: true
    }).populate('semester', 'semesterNumber');

    if (!feeStructure) {
        return res.status(404).json({
            message: "No fee structure found for your semester",
            success: false
        });
    }

    // Check if student has already paid
    const existingPayment = await FeePayment.findOne({
        student: studentId,
        feeStructure: feeStructure._id,
        isActive: true
    });

    res.status(200).json({
        message: "Fee details retrieved successfully",
        success: true,
        data: {
            feeStructure,
            paymentStatus: existingPayment ? existingPayment.status : 'not_paid',
            paymentDetails: existingPayment || null
        }
    });
});

export const submitFeePayment = asyncHandler(async (req, res) => {
    const studentId = req.user._id;
    const { feeStructureId, transactionId, paymentMethod, paidAmount, paymentDate } = req.body;

    if (!req.file) {
        return res.status(400).json({
            message: "Payment proof is required",
            success: false
        });
    }

    // Check if payment already exists
    const existingPayment = await FeePayment.findOne({
        student: studentId,
        feeStructure: feeStructureId,
        isActive: true
    });

    if (existingPayment) {
        return res.status(400).json({
            message: "Payment already submitted for this fee structure",
            success: false
        });
    }

    const feePayment = new FeePayment({
        student: studentId,
        feeStructure: feeStructureId,
        paymentDetails: {
            transactionId,
            paymentMethod,
            paidAmount,
            paymentDate: new Date(paymentDate),
            paymentProof: req.file.path
        }
    });

    await feePayment.save();

    const populatedPayment = await FeePayment.findById(feePayment._id)
        .populate('student', 'name uucmsNo')
        .populate('feeStructure');

    res.status(201).json({
        message: "Fee payment submitted successfully",
        success: true,
        data: populatedPayment
    });
});

// Office Staff Controllers
export const getPendingPayments = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, status = 'pending' } = req.query;

    const payments = await FeePayment.find({ status, isActive: true })
        .populate('student', 'name uucmsNo email semester division')
        .populate('feeStructure', 'academicYear totalAmount')
        .populate({
            path: 'student',
            populate: {
                path: 'semester',
                select: 'semesterNumber'
            }
        })
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

    const total = await FeePayment.countDocuments({ status, isActive: true });

    res.status(200).json({
        message: "Payments retrieved successfully",
        success: true,
        data: {
            payments,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total
        }
    });
});

export const verifyPayment = asyncHandler(async (req, res) => {
    const { paymentId } = req.params;
    const { status, remarks } = req.body;
    const verifiedBy = req.user._id;

    const payment = await FeePayment.findById(paymentId);

    if (!payment) {
        return res.status(404).json({
            message: "Payment not found",
            success: false
        });
    }

    payment.status = status;
    payment.verificationDetails = {
        verifiedBy,
        verifiedAt: new Date(),
        remarks: remarks || ''
    };

    // Generate receipt number if approved
    if (status === 'approved') {
        payment.receiptNumber = payment.generateReceiptNumber();
    }

    await payment.save();

    const populatedPayment = await FeePayment.findById(paymentId)
        .populate('student', 'name uucmsNo')
        .populate('feeStructure')
        .populate('verificationDetails.verifiedBy', 'name staffId');

    res.status(200).json({
        message: `Payment ${status} successfully`,
        success: true,
        data: populatedPayment
    });
});

export const getPaymentDetails = asyncHandler(async (req, res) => {
    const { paymentId } = req.params;

    const payment = await FeePayment.findById(paymentId)
        .populate('student', 'name uucmsNo email division')
        .populate('feeStructure')
        .populate({
            path: 'student',
            populate: {
                path: 'semester',
                select: 'semesterNumber'
            }
        })
        .populate('verificationDetails.verifiedBy', 'name staffId');

    if (!payment) {
        return res.status(404).json({
            message: "Payment not found",
            success: false
        });
    }

    res.status(200).json({
        message: "Payment details retrieved successfully",
        success: true,
        data: payment
    });
});

// Add this controller method to backend/src/controllers/fee.controller.js
// Updated getPaymentHistory method in backend/src/controllers/fee.controller.js
export const getPaymentHistory = asyncHandler(async (req, res) => {
    const studentId = req.user._id;

    const payments = await FeePayment.find({
        student: studentId,
        isActive: true
    })
        .populate({
            path: 'student',
            select: 'name uucmsNo email division semester',
            populate: {
                path: 'semester',
                select: 'semesterNumber'
            }
        })
        .populate({
            path: 'feeStructure',
            populate: {
                path: 'semester',
                select: 'semesterNumber'
            }
        })
        .populate('verificationDetails.verifiedBy', 'name staffId')
        .sort({ createdAt: -1 });

    res.status(200).json({
        message: "Payment history retrieved successfully",
        success: true,
        data: payments
    });
});

// Download receipt
export const downloadReceipt = asyncHandler(async (req, res) => {
    const { receiptNumber } = req.params;
    const studentId = req.user._id;

    const payment = await FeePayment.findOne({
        receiptNumber,
        student: studentId,
        status: 'approved'
    })
        .populate('student', 'name uucmsNo email division')
        .populate('feeStructure')
        .populate({
            path: 'student',
            populate: {
                path: 'semester',
                select: 'semesterNumber'
            }
        });

    if (!payment) {
        return res.status(404).json({
            message: "Receipt not found or not approved",
            success: false
        });
    }

    // Here you would generate a PDF receipt
    // For now, returning the payment details
    res.status(200).json({
        message: "Receipt retrieved successfully",
        success: true,
        data: payment
    });
});