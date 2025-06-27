// frontend/src/pages/student/FeePaymentPage.jsx
import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import PaymentCard from '../../components/fee/PaymentCard';
import PaymentForm from '../../components/fee/PaymentForm';
import feeService from '../../services/feeService';
import { useNavigate } from 'react-router-dom';
import ReceiptViewer from '../../components/fee/ReceiptViewer';

const FeePaymentPage = () => {
    const navigate = useNavigate();
    const [feeData, setFeeData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showPaymentForm, setShowPaymentForm] = useState(false);
    const [submittingPayment, setSubmittingPayment] = useState(false);
    const [showReceiptViewer, setShowReceiptViewer] = useState(false);
    const [selectedReceipt, setSelectedReceipt] = useState(null);

    // Fetch fee details on component mount
    useEffect(() => {
        fetchFeeDetails();
    }, []);

    const fetchFeeDetails = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await feeService.getStudentFeeDetails();

            if (response.success) {
                setFeeData(response.data);
            } else {
                setError(response.message);
            }
        } catch (err) {
            console.error('Error fetching fee details:', err);
            setError(err.message || 'Failed to fetch fee details');
            toast.error('Failed to load fee details');
        } finally {
            setLoading(false);
        }
    };

    const handlePayNow = () => {
        setShowPaymentForm(true);
    };

    const handlePaymentSubmit = async (paymentData) => {
        try {
            setSubmittingPayment(true);
            const response = await feeService.submitFeePayment(paymentData);

            if (response.success) {
                toast.success('Payment submitted successfully! It will be verified within 1-2 business days.');
                setShowPaymentForm(false);
                // Refresh fee details to show updated payment status
                await fetchFeeDetails();
            } else {
                toast.error(response.message || 'Failed to submit payment');
            }
        } catch (err) {
            console.error('Error submitting payment:', err);
            toast.error(err.message || 'Failed to submit payment. Please try again.');
        } finally {
            setSubmittingPayment(false);
        }
    };

    const handlePaymentCancel = () => {
        setShowPaymentForm(false);
    };

    const handleRefresh = () => {
        fetchFeeDetails();
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

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 py-6">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="animate-pulse">
                            <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                <div className="space-y-2">
                                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                                </div>
                                <div className="space-y-2">
                                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                                </div>
                            </div>
                            <div className="h-10 bg-gray-200 rounded w-32"></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 py-6">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="text-center py-12">
                            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.996-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                Unable to Load Fee Details
                            </h3>
                            <p className="text-gray-600 mb-6">{error}</p>
                            <button
                                onClick={handleRefresh}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                Retry
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-6">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Page Header */}
                <div className="mb-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Fee Payment</h1>
                            <p className="text-gray-600 mt-1">
                                Manage your semester fee payment and view payment status
                            </p>
                        </div>
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
                        <button
                            onClick={handleRefresh}
                            disabled={loading}
                            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                        >
                            <svg
                                className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`}
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            Refresh
                        </button>
                    </div>
                </div>

                {/* Main Content */}
                {!showPaymentForm ? (
                    <PaymentCard
                        feeStructure={feeData?.feeStructure}
                        paymentStatus={feeData?.paymentStatus}
                        paymentDetails={feeData?.paymentDetails}
                        onPayNow={handlePayNow}
                    />
                ) : (
                    <PaymentForm
                        feeStructure={feeData.feeStructure}
                        onSubmit={handlePaymentSubmit}
                        onCancel={handlePaymentCancel}
                        isLoading={submittingPayment}
                    />
                )}

                {/* Additional Information */}
                {!showPaymentForm && (
                    <div className="mt-6 bg-white rounded-lg shadow-md p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Instructions</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h4 className="font-medium text-gray-900 mb-2">Accepted Payment Methods</h4>
                                <ul className="text-sm text-gray-600 space-y-1">
                                    <li>• UPI (PhonePe, Google Pay, Paytm, etc.)</li>
                                    <li>• Net Banking</li>
                                    <li>• Debit/Credit Card</li>
                                    <li>• Cash (at office counter)</li>
                                    <li>• Cheque/Demand Draft</li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-medium text-gray-900 mb-2">Important Notes</h4>
                                <ul className="text-sm text-gray-600 space-y-1">
                                    <li>• Payment verification takes 1-2 business days</li>
                                    <li>• Keep your transaction receipt safe</li>
                                    <li>• Contact office for payment-related queries</li>
                                    <li>• Late payment may incur additional charges</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                )}

                {/* Contact Information */}
                <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <h4 className="text-sm font-medium text-blue-800">Need Help?</h4>
                            <p className="text-sm text-blue-700 mt-1">
                                For any payment-related queries or issues, please contact the accounts office during working hours
                                (Monday to Friday, 9:00 AM to 5:00 PM) or send an email to accounts@college.edu
                            </p>
                        </div>
                    </div>
                </div>

                {/* Receipt Viewer Modal */}
                {showReceiptViewer && (
                    <ReceiptViewer
                        paymentDetails={selectedReceipt}
                        onClose={() => {
                            setShowReceiptViewer(false);
                            setSelectedReceipt(null);
                        }}
                    />
                )}
            </div>
        </div>
    );
};

export default FeePaymentPage;