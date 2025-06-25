// frontend/src/components/fee/PaymentForm.jsx
import React, { useState } from 'react';

const PaymentForm = ({ feeStructure, onSubmit, onCancel, isLoading }) => {
    const [formData, setFormData] = useState({
        feeStructureId: feeStructure._id,
        transactionId: '',
        paymentMethod: '',
        paidAmount: feeStructure.totalAmount,
        paymentDate: new Date().toISOString().split('T')[0],
        paymentProof: null
    });

    const [errors, setErrors] = useState({});
    const [dragActive, setDragActive] = useState(false);

    const paymentMethods = [
        { value: 'UPI', label: 'UPI' },
        { value: 'Net Banking', label: 'Net Banking' },
        { value: 'Card', label: 'Debit/Credit Card' },
        { value: 'Cash', label: 'Cash' },
        { value: 'Cheque', label: 'Cheque' },
        { value: 'DD', label: 'Demand Draft' }
    ];

    const validateForm = () => {
        const newErrors = {};

        if (!formData.transactionId.trim()) {
            newErrors.transactionId = 'Transaction ID is required';
        }

        if (!formData.paymentMethod) {
            newErrors.paymentMethod = 'Payment method is required';
        }

        if (!formData.paidAmount || formData.paidAmount <= 0) {
            newErrors.paidAmount = 'Valid amount is required';
        }

        if (!formData.paymentDate) {
            newErrors.paymentDate = 'Payment date is required';
        }

        if (!formData.paymentProof) {
            newErrors.paymentProof = 'Payment proof is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validateForm()) {
            onSubmit(formData);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        handleFile(file);
    };

    const handleFile = (file) => {
        if (file) {
            // Validate file type
            const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
            if (!allowedTypes.includes(file.type)) {
                setErrors(prev => ({
                    ...prev,
                    paymentProof: 'Only JPG, PNG, and PDF files are allowed'
                }));
                return;
            }

            // Validate file size (5MB)
            if (file.size > 5 * 1024 * 1024) {
                setErrors(prev => ({
                    ...prev,
                    paymentProof: 'File size must be less than 5MB'
                }));
                return;
            }

            setFormData(prev => ({
                ...prev,
                paymentProof: file
            }));

            // Clear error
            if (errors.paymentProof) {
                setErrors(prev => ({
                    ...prev,
                    paymentProof: ''
                }));
            }
        }
    };

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR'
        }).format(amount);
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Submit Fee Payment</h3>
                <p className="text-gray-600">
                    Please fill in the payment details and upload proof of payment.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Amount Display */}
                <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex justify-between items-center">
                        <span className="text-gray-700">Total Fee Amount:</span>
                        <span className="text-xl font-bold text-blue-600">
                            {formatCurrency(feeStructure.totalAmount)}
                        </span>
                    </div>
                </div>

                {/* Transaction ID */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Transaction ID *
                    </label>
                    <input
                        type="text"
                        name="transactionId"
                        value={formData.transactionId}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.transactionId ? 'border-red-500' : 'border-gray-300'
                            }`}
                        placeholder="Enter transaction/reference ID"
                        disabled={isLoading}
                    />
                    {errors.transactionId && (
                        <p className="mt-1 text-sm text-red-600">{errors.transactionId}</p>
                    )}
                </div>

                {/* Payment Method */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Payment Method *
                    </label>
                    <select
                        name="paymentMethod"
                        value={formData.paymentMethod}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.paymentMethod ? 'border-red-500' : 'border-gray-300'
                            }`}
                        disabled={isLoading}
                    >
                        <option value="">Select payment method</option>
                        {paymentMethods.map(method => (
                            <option key={method.value} value={method.value}>
                                {method.label}
                            </option>
                        ))}
                    </select>
                    {errors.paymentMethod && (
                        <p className="mt-1 text-sm text-red-600">{errors.paymentMethod}</p>
                    )}
                </div>

                {/* Paid Amount */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Paid Amount *
                    </label>
                    <input
                        type="number"
                        name="paidAmount"
                        value={formData.paidAmount}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.paidAmount ? 'border-red-500' : 'border-gray-300'
                            }`}
                        min="0"
                        step="0.01"
                        disabled={isLoading}
                    />
                    {errors.paidAmount && (
                        <p className="mt-1 text-sm text-red-600">{errors.paidAmount}</p>
                    )}
                </div>

                {/* Payment Date */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Payment Date *
                    </label>
                    <input
                        type="date"
                        name="paymentDate"
                        value={formData.paymentDate}
                        onChange={handleInputChange}
                        max={new Date().toISOString().split('T')[0]}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.paymentDate ? 'border-red-500' : 'border-gray-300'
                            }`}
                        disabled={isLoading}
                    />
                    {errors.paymentDate && (
                        <p className="mt-1 text-sm text-red-600">{errors.paymentDate}</p>
                    )}
                </div>

                {/* Payment Proof Upload */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Payment Proof *
                    </label>
                    <div
                        className={`border-2 border-dashed rounded-lg p-6 text-center ${dragActive ? 'border-blue-500 bg-blue-50' :
                                errors.paymentProof ? 'border-red-500' : 'border-gray-300'
                            }`}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                    >
                        <input
                            type="file"
                            id="paymentProof"
                            onChange={handleFileChange}
                            accept=".jpg,.jpeg,.png,.pdf"
                            className="hidden"
                            disabled={isLoading}
                        />
                        {formData.paymentProof ? (
                            <div className="text-green-600">
                                <svg className="mx-auto h-12 w-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 48 48">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m6 0h6m-6 6v6m0 0v6" />
                                </svg>
                                <p className="text-sm font-medium">{formData.paymentProof.name}</p>
                                <p className="text-xs text-gray-500">
                                    {(formData.paymentProof.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                            </div>
                        ) : (
                            <div>
                                <svg className="mx-auto h-12 w-12 text-gray-400 mb-2" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                <p className="text-sm text-gray-600 mb-2">
                                    Drop your payment receipt here, or{' '}
                                    <label htmlFor="paymentProof" className="text-blue-600 cursor-pointer hover:text-blue-700">
                                        browse
                                    </label>
                                </p>
                                <p className="text-xs text-gray-500">
                                    Supports: JPG, PNG, PDF (Max 5MB)
                                </p>
                            </div>
                        )}
                    </div>
                    {errors.paymentProof && (
                        <p className="mt-1 text-sm text-red-600">{errors.paymentProof}</p>
                    )}
                </div>

                {/* Form Actions */}
                <div className="flex gap-3 pt-4">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {isLoading ? 'Submitting...' : 'Submit Payment'}
                    </button>
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={isLoading}
                        className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        Cancel
                    </button>
                </div>

                {/* Information */}
                <div className="bg-yellow-50 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-yellow-800 mb-1">Important Instructions:</h4>
                    <ul className="text-sm text-yellow-700 space-y-1">
                        <li>• Ensure the transaction ID is correct and matches your payment receipt</li>
                        <li>• Upload a clear image or PDF of your payment receipt</li>
                        <li>• Payment verification may take 1-2 business days</li>
                        <li>• You will receive a confirmation once payment is approved</li>
                    </ul>
                </div>
            </form>
        </div>
    );
};

export default PaymentForm;