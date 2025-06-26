import React, { useState, useEffect } from 'react';
import { X, Eye, Download, Check, XCircle, AlertCircle, User, Calendar, CreditCard, FileText, DollarSign } from 'lucide-react';
import feeService from '../../services/feeService';
import toast from 'react-hot-toast';

const PaymentVerification = ({ paymentId, isOpen, onClose, onVerificationComplete }) => {
    const [payment, setPayment] = useState(null);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [verificationData, setVerificationData] = useState({
        status: '',
        remarks: ''
    });

    useEffect(() => {
        if (isOpen && paymentId) {
            fetchPaymentDetails();
        }
    }, [isOpen, paymentId]);

    const fetchPaymentDetails = async () => {
        setLoading(true);
        try {
            const response = await feeService.getPaymentDetails(paymentId);
            setPayment(response.data);
        } catch (error) {
            toast.error(error.message || 'Failed to fetch payment details');
        } finally {
            setLoading(false);
        }
    };

    const handleVerification = async (status) => {
        if (!verificationData.remarks.trim() && status === 'rejected') {
            toast.error('Remarks are required for rejection');
            return;
        }

        setSubmitting(true);
        try {
            await feeService.verifyPayment(paymentId, {
                status,
                remarks: verificationData.remarks
            });

            toast.success(`Payment ${status} successfully`);
            onVerificationComplete();
            onClose();
        } catch (error) {
            toast.error(error.message || `Failed to ${status} payment`);
        } finally {
            setSubmitting(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return 'text-yellow-600 bg-yellow-50';
            case 'approved': return 'text-green-600 bg-green-50';
            case 'rejected': return 'text-red-600 bg-red-50';
            default: return 'text-gray-600 bg-gray-50';
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR'
        }).format(amount);
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b">
                    <h2 className="text-xl font-semibold text-gray-900">Payment Verification</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                ) : payment ? (
                    <div className="p-6">
                        {/* Payment Status */}
                        <div className="mb-6">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(payment.status)}`}>
                                <AlertCircle className="w-4 h-4 mr-2" />
                                {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                            </span>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Student Information */}
                            <div className="bg-gray-50 rounded-lg p-4">
                                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                                    <User className="w-5 h-5 mr-2" />
                                    Student Information
                                </h3>
                                <div className="space-y-3">
                                    <div>
                                        <label className="text-sm font-medium text-gray-600">Name</label>
                                        <p className="text-gray-900">{payment.student.name}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-600">UUCMS No</label>
                                        <p className="text-gray-900">{payment.student.uucmsNo}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-600">Email</label>
                                        <p className="text-gray-900">{payment.student.email}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-600">Semester</label>
                                        <p className="text-gray-900">
                                            Semester {payment.student.semester?.semesterNumber} - Division {payment.student.division}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Fee Structure */}
                            <div className="bg-gray-50 rounded-lg p-4">
                                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                                    <FileText className="w-5 h-5 mr-2" />
                                    Fee Structure
                                </h3>
                                <div className="space-y-3">
                                    <div>
                                        <label className="text-sm font-medium text-gray-600">Academic Year</label>
                                        <p className="text-gray-900">{payment.feeStructure.academicYear}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-600">Total Amount</label>
                                        <p className="text-gray-900 font-semibold">
                                            {formatCurrency(payment.feeStructure.totalAmount)}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-600">Due Date</label>
                                        <p className="text-gray-900">
                                            {formatDate(payment.feeStructure.dueDate)}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Payment Details */}
                            <div className="bg-gray-50 rounded-lg p-4">
                                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                                    <CreditCard className="w-5 h-5 mr-2" />
                                    Payment Details
                                </h3>
                                <div className="space-y-3">
                                    <div>
                                        <label className="text-sm font-medium text-gray-600">Transaction ID</label>
                                        <p className="text-gray-900 font-mono">{payment.paymentDetails.transactionId}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-600">Payment Method</label>
                                        <p className="text-gray-900">{payment.paymentDetails.paymentMethod}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-600">Paid Amount</label>
                                        <p className="text-gray-900 font-semibold">
                                            {formatCurrency(payment.paymentDetails.paidAmount)}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-600">Payment Date</label>
                                        <p className="text-gray-900">
                                            {formatDate(payment.paymentDetails.paymentDate)}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Payment Proof */}
                            <div className="bg-gray-50 rounded-lg p-4">
                                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                                    <Download className="w-5 h-5 mr-2" />
                                    Payment Proof
                                </h3>
                                <div className="flex items-center space-x-3">
                                    <button
                                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                                        // onClick={() => window.open(`${import.meta.env.VITE_API_BASE_URL}/${payment.paymentDetails.paymentProof}`, '_blank')}
                                        onClick={() => window.open(`${import.meta.env.VITE_API_BASE_URL}/${payment.paymentDetails.paymentProof}`, '_blank')}
                                    >
                                        <Eye className="w-4 h-4 mr-2" />
                                        View Proof
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Verification Section */}
                        {payment.status === 'pending' && (
                            <div className="mt-6 bg-blue-50 rounded-lg p-4">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Verification</h3>

                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Remarks
                                    </label>
                                    <textarea
                                        value={verificationData.remarks}
                                        onChange={(e) => setVerificationData(prev => ({
                                            ...prev,
                                            remarks: e.target.value
                                        }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        rows="3"
                                        placeholder="Add remarks for verification..."
                                    />
                                </div>

                                <div className="flex space-x-3">
                                    <button
                                        onClick={() => handleVerification('approved')}
                                        disabled={submitting}
                                        className="flex items-center px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors"
                                    >
                                        <Check className="w-4 h-4 mr-2" />
                                        {submitting ? 'Processing...' : 'Approve'}
                                    </button>

                                    <button
                                        onClick={() => handleVerification('rejected')}
                                        disabled={submitting}
                                        className="flex items-center px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 transition-colors"
                                    >
                                        <XCircle className="w-4 h-4 mr-2" />
                                        {submitting ? 'Processing...' : 'Reject'}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Verification Details (if already verified) */}
                        {payment.status !== 'pending' && payment.verificationDetails && (
                            <div className="mt-6 bg-gray-50 rounded-lg p-4">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Verification Details</h3>
                                <div className="space-y-3">
                                    <div>
                                        <label className="text-sm font-medium text-gray-600">Verified By</label>
                                        <p className="text-gray-900">
                                            {payment.verificationDetails.verifiedBy?.name}
                                            ({payment.verificationDetails.verifiedBy?.staffId})
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-600">Verified At</label>
                                        <p className="text-gray-900">
                                            {formatDate(payment.verificationDetails.verifiedAt)}
                                        </p>
                                    </div>
                                    {payment.verificationDetails.remarks && (
                                        <div>
                                            <label className="text-sm font-medium text-gray-600">Remarks</label>
                                            <p className="text-gray-900">{payment.verificationDetails.remarks}</p>
                                        </div>
                                    )}
                                    {payment.receiptNumber && (
                                        <div>
                                            <label className="text-sm font-medium text-gray-600">Receipt Number</label>
                                            <p className="text-gray-900 font-mono">{payment.receiptNumber}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="flex items-center justify-center py-12">
                        <p className="text-gray-500">Failed to load payment details</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PaymentVerification;