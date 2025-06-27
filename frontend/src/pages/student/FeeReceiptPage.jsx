// frontend/src/pages/student/FeeReceiptsPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import feeService from '../../services/feeService';
import ReceiptViewer from '../../components/fee/ReceiptViewer';

const FeeReceiptsPage = () => {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [showReceiptModal, setShowReceiptModal] = useState(false);
    const receiptRef = useRef();
    const navigate = useNavigate();

    useEffect(() => {
        fetchPaymentHistory();
    }, []);

    const fetchPaymentHistory = async () => {
        try {
            setLoading(true);
            const response = await feeService.getPaymentHistory();
            if (response.success) {
                setPayments(response.data);
            } else {
                setError(response.message || 'Failed to fetch payment history');
            }
        } catch (error) {
            console.error('Error fetching payment history:', error);
            setError(error.message || 'Failed to fetch payment history');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 2
        }).format(amount);
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            pending: {
                bg: 'bg-yellow-100',
                text: 'text-yellow-800',
                label: 'Pending'
            },
            approved: {
                bg: 'bg-green-100',
                text: 'text-green-800',
                label: 'Approved'
            },
            rejected: {
                bg: 'bg-red-100',
                text: 'text-red-800',
                label: 'Rejected'
            }
        };

        const config = statusConfig[status] || statusConfig.pending;

        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
                {config.label}
            </span>
        );
    };

    const handleViewReceipt = (payment) => {
        if (payment.status === 'approved') {
            setSelectedPayment(payment);
            setShowReceiptModal(true);
        }
    };

    const closeReceiptModal = () => {
        setShowReceiptModal(false);
        setSelectedPayment(null);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading payment history...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="bg-white shadow-sm rounded-lg p-6 mb-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Fee Receipts</h1>
                            <p className="mt-1 text-sm text-gray-600">
                                View and download your fee payment receipts
                            </p>
                        </div>
                        <button
                            onClick={() => navigate('/student/fee-payment')}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Make Payment
                        </button>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-red-800">{error}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Payment History */}
                {payments.length === 0 ? (
                    <div className="bg-white shadow-sm rounded-lg p-12 text-center">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No payment history</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            You haven't made any fee payments yet.
                        </p>
                        <div className="mt-6">
                            <button
                                onClick={() => navigate('/student/fee-payment')}
                                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Make Your First Payment
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white shadow-sm rounded-lg overflow-hidden">
                        <div className="px-4 py-5 sm:p-6">
                            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                                Payment History ({payments.length})
                            </h3>
                            <div className="space-y-4">
                                {payments.map((payment) => (
                                    <div
                                        key={payment._id}
                                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-4">
                                                    <div className="flex-shrink-0">
                                                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                                            <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                            </svg>
                                                        </div>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center space-x-3">
                                                            <h4 className="text-sm font-medium text-gray-900">
                                                                BCA {payment.feeStructure?.semester?.semesterNumber} Semester - {payment.feeStructure?.academicYear}
                                                            </h4>
                                                            {getStatusBadge(payment.status)}
                                                        </div>
                                                        <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                                                            <span>Amount: {formatCurrency(payment.paymentDetails?.paidAmount)}</span>
                                                            <span>•</span>
                                                            <span>Payment Date: {formatDate(payment.paymentDetails?.paymentDate)}</span>
                                                            <span>•</span>
                                                            <span>Method: {payment.paymentDetails?.paymentMethod}</span>
                                                        </div>
                                                        {payment.receiptNumber && (
                                                            <div className="mt-1 text-sm text-gray-500">
                                                                Receipt No: {payment.receiptNumber}
                                                            </div>
                                                        )}
                                                        {payment.paymentDetails?.transactionId && (
                                                            <div className="mt-1 text-sm text-gray-500">
                                                                Transaction ID: {payment.paymentDetails.transactionId}
                                                            </div>
                                                        )}
                                                        {payment.verificationDetails?.remarks && (
                                                            <div className="mt-2 text-sm text-gray-600">
                                                                <span className="font-medium">Remarks:</span> {payment.verificationDetails.remarks}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                {/* {payment.status === 'approved' && payment.receiptNumber && (
                                                    <button
                                                        onClick={() => handleViewReceipt(payment)}
                                                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                                    >
                                                        <svg className="mr-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                        </svg>
                                                        View Receipt
                                                    </button>
                                                )} */}
                                                {payment.status === 'pending' && (
                                                    <span className="inline-flex items-center px-3 py-2 border border-yellow-300 text-sm leading-4 font-medium rounded-md text-yellow-700 bg-yellow-50">
                                                        <svg className="mr-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                        Under Review
                                                    </span>
                                                )}
                                                {payment.status === 'rejected' && (
                                                    <span className="inline-flex items-center px-3 py-2 border border-red-300 text-sm leading-4 font-medium rounded-md text-red-700 bg-red-50">
                                                        <svg className="mr-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                        </svg>
                                                        Rejected
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Receipt Modal */}
                {/* {showReceiptModal && selectedPayment && (
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50" onClick={closeReceiptModal}>
                        <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-6xl shadow-lg rounded-md bg-white" onClick={(e) => e.stopPropagation()}>
                            {console.log("receipt ref: ", receiptRef.current)}
                            <div className="mt-3">
                                <ReceiptViewer
                                    ref={receiptRef}
                                    payment={selectedPayment}
                                    onClose={closeReceiptModal}
                                    showActions={true}
                                />

                            </div>
                        </div>
                    </div>
                )} */}
            </div>
        </div>
    );
};

export default FeeReceiptsPage;