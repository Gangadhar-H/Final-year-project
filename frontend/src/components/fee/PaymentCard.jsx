// frontend/src/components/fee/PaymentCard.jsx
import React from 'react';
import ReceiptViewer from '../../components/fee/ReceiptViewer';
import feeService from '../../services/feeService';
import { useState, useEffect } from 'react';

const PaymentCard = ({ feeStructure, paymentStatus, paymentDetails, onPayNow }) => {

    const [showReceiptViewer, setShowReceiptViewer] = useState(false);
    const [selectedReceipt, setSelectedReceipt] = useState(null);

    const [feeData, setFeeData] = useState(null);
    const getStatusColor = (status) => {
        switch (status) {
            case 'approved':
                return 'text-green-600 bg-green-100';
            case 'pending':
                return 'text-yellow-600 bg-yellow-100';
            case 'rejected':
                return 'text-red-600 bg-red-100';
            default:
                return 'text-gray-600 bg-gray-100';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'approved':
                return 'Paid';
            case 'pending':
                return 'Verification Pending';
            case 'rejected':
                return 'Payment Rejected';
            default:
                return 'Not Paid';
        }
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR'
        }).format(amount);
    };
    const handleViewReceipt = async (receiptNumber) => {
        try {
            const response = await feeService.downloadReceipt(receiptNumber);
            if (response.success) {
                setSelectedReceipt(response.data);
                setShowReceiptViewer(true);
            } else {
                toast.error('Failed to load receipt details');
            }
        } catch (error) {
            console.error('Error loading receipt:', error);
            toast.error('Failed to load receipt details');
        }
    };
    useEffect(() => {
        fetchFeeDetails();
    }, []);

    const fetchFeeDetails = async () => {
        try {
            const response = await feeService.getStudentFeeDetails();

            if (response.success) {
                setFeeData(response.data);
            } else {
                toast.error('Failed to load fee details');
            }
        } catch (err) {
            console.error('Error fetching fee details:', err);
            toast.error('Failed to load fee details');
        }
    };

    if (!feeStructure) {
        return (
            <div className="bg-white rounded-lg shadow-md p-6">
                <div className="text-center text-gray-500">
                    <p>No fee structure found for your semester.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                        Fee Details - Semester {feeStructure.semester.semesterNumber}
                    </h3>
                    <p className="text-gray-600">Academic Year: {feeStructure.academicYear}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(paymentStatus)}`}>
                    {getStatusText(paymentStatus)}
                </span>
            </div>

            {/* Fee Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="space-y-2">
                    <h4 className="font-medium text-gray-900">Fee Components</h4>
                    {Object.entries(feeStructure.feeComponents).map(([key, value]) => (
                        value > 0 && (
                            <div key={key} className="flex justify-between text-sm">
                                <span className="text-gray-600 capitalize">
                                    {key.replace(/([A-Z])/g, ' $1').trim()}:
                                </span>
                                <span className="text-gray-900">{formatCurrency(value)}</span>
                            </div>
                        )
                    ))}
                    <div className="border-t pt-2 mt-2">
                        <div className="flex justify-between font-semibold">
                            <span>Total Amount:</span>
                            <span className="text-blue-600">{formatCurrency(feeStructure.totalAmount)}</span>
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <h4 className="font-medium text-gray-900">Payment Information</h4>
                    <div className="text-sm space-y-1">
                        <div className="flex justify-between">
                            <span className="text-gray-600">Due Date:</span>
                            <span className="text-gray-900">{formatDate(feeStructure.dueDate)}</span>
                        </div>
                        {paymentDetails && (
                            <>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Payment Date:</span>
                                    <span className="text-gray-900">
                                        {formatDate(paymentDetails.paymentDetails.paymentDate)}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Transaction ID:</span>
                                    <span className="text-gray-900 font-mono">
                                        {paymentDetails.paymentDetails.transactionId}
                                    </span>
                                </div>
                                {paymentDetails.receiptNumber && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Receipt No:</span>
                                        <span className="text-gray-900 font-mono">
                                            {paymentDetails.receiptNumber}
                                        </span>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
                {paymentStatus === 'not_paid' && (
                    <button
                        onClick={onPayNow}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Pay Now
                    </button>
                )}

                {paymentStatus === 'approved' && paymentDetails?.receiptNumber && (
                    <button
                        onClick={() => {
                            if (feeData?.paymentDetails?.receiptNumber) {
                                handleViewReceipt(feeData.paymentDetails.receiptNumber);
                            } else {
                                navigate('/student/fee-receipts');
                            }
                        }}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                        <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        View Receipts
                    </button>
                )}
                {paymentStatus === 'rejected' && (
                    <div className="text-red-600 text-sm">
                        <p>Payment was rejected. Please contact the office for more details.</p>
                        {paymentDetails?.verificationDetails?.remarks && (
                            <p className="mt-1 italic">Reason: {paymentDetails.verificationDetails.remarks}</p>
                        )}
                    </div>
                )}
            </div>

            {/* Due Date Warning */}
            {paymentStatus === 'not_paid' && new Date(feeStructure.dueDate) < new Date() && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-red-700 text-sm">
                        ⚠️ Payment is overdue. Please make the payment as soon as possible to avoid late fees.
                    </p>
                </div>
            )}
        </div>
    );
};

export default PaymentCard;