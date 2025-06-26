import React, { forwardRef } from 'react';
// @ts-ignore
import html2pdf from 'html2pdf.js';

const ReceiptViewer = forwardRef(({ payment, onClose, showActions = true }, ref) => {
    // Format currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 2
        }).format(amount);
    };

    // Format date
    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    // Format date and time
    const formatDateTime = (date) => {
        return new Date(date).toLocaleString('en-IN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    // Handle print
    const handlePrint = () => {
        window.print();
    };

    // Updated Download Function
    const handleDownload = () => {
        console.log("Download clicked, ref:", ref);
        console.log("Ref current:", ref?.current);

        if (!ref?.current) {
            alert("Unable to generate PDF. Please try again.");
            return;
        }

        // Get receipt number safely
        const receiptNumber = payment?.receiptNumber || 'student';

        const opt = {
            margin: 0.5,
            filename: `receipt-${receiptNumber}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: {
                scale: 2,
                useCORS: true,
                allowTaint: true,
                scrollX: 0,
                scrollY: 0
            },
            jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
        };

        // Show loading state
        const originalText = document.querySelector('.download-btn')?.textContent;
        const downloadBtn = document.querySelector('.download-btn');
        if (downloadBtn) {
            downloadBtn.textContent = 'Generating PDF...';
            downloadBtn.disabled = true;
        }

        console.log("Done till here");

        html2pdf()
            .set(opt)
            .from(ref.current)
            .save()
            .then(() => {
                console.log('PDF generated successfully');
            })
            .catch((err) => {
                console.error("PDF generation error:", err);
                alert("Failed to generate PDF. Please try again.");
            })
            .finally(() => {
                // Restore button state
                if (downloadBtn) {
                    downloadBtn.textContent = originalText || 'Download';
                    downloadBtn.disabled = false;
                }
            });
    };

    if (!payment) {
        return null;
    }

    const { student, feeStructure, paymentDetails, receiptNumber, verificationDetails } = payment;

    return (
        <div className="bg-white">
            {/* Header with actions */}
            {showActions && (
                <div className="flex justify-between items-center p-4 border-b print:hidden">
                    <h2 className="text-xl font-semibold text-gray-900">Fee Receipt</h2>
                    <div className="flex space-x-3">
                        <button
                            onClick={handlePrint}
                            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                            </svg>
                            Print
                        </button>
                        <button
                            onClick={handleDownload}
                            className="download-btn inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Download
                        </button>
                        <button
                            onClick={onClose}
                            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                        >
                            <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            Close
                        </button>
                    </div>
                </div>
            )}

            {/* Receipt Content */}
            <div ref={ref} id="receipt-content" className="receipt-content max-w-4xl mx-auto p-8 bg-white border border-gray-800">

                {/* College Header */}
                <div className="text-center mb-8 border-b-2 border-gray-900 pb-6">
                    <div className="mb-4">
                        <div className="w-20 h-20 mx-auto mb-4 bg-blue-600 rounded-full flex items-center justify-center">
                            <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                            </svg>
                        </div>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                        UNIVERSITY COLLEGE OF COMPUTER & MANAGEMENT STUDIES
                    </h1>
                    <p className="text-gray-600 mb-2">
                        Affiliated to University of Mumbai
                    </p>
                    <p className="text-gray-600 text-sm mb-4">
                        Address: College Campus, Mumbai - 400001 | Phone: +91-22-1234567 | Email: info@uucms.edu.in
                    </p>
                    <div className="inline-block bg-green-100 text-green-800 px-4 py-2 rounded-full font-semibold">
                        FEE PAYMENT RECEIPT
                    </div>
                </div>

                {/* Receipt Details Header */}
                <div className="grid grid-cols-2 gap-6 mb-8">
                    <div className="space-y-2">
                        <div className="flex">
                            <span className="font-semibold text-gray-700 w-32">Receipt No:</span>
                            <span className="text-gray-900 font-mono text-lg">{receiptNumber}</span>
                        </div>
                        <div className="flex">
                            <span className="font-semibold text-gray-700 w-32">Date:</span>
                            <span className="text-gray-900">{formatDate(verificationDetails?.verifiedAt)}</span>
                        </div>
                        <div className="flex">
                            <span className="font-semibold text-gray-700 w-32">Academic Year:</span>
                            <span className="text-gray-900">{feeStructure?.academicYear}</span>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <div className="flex">
                            <span className="font-semibold text-gray-700 w-32">Payment Mode:</span>
                            <span className="text-gray-900">{paymentDetails?.paymentMethod}</span>
                        </div>
                        <div className="flex">
                            <span className="font-semibold text-gray-700 w-32">Transaction ID:</span>
                            <span className="text-gray-900 font-mono">{paymentDetails?.transactionId}</span>
                        </div>
                        <div className="flex">
                            <span className="font-semibold text-gray-700 w-32">Payment Date:</span>
                            <span className="text-gray-900">{formatDate(paymentDetails?.paymentDate)}</span>
                        </div>
                    </div>
                </div>

                {/* Student Details */}
                <div className="bg-gray-50 p-6 rounded-lg mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-300 pb-2">
                        Student Information
                    </h3>
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-3">
                            <div className="flex">
                                <span className="font-semibold text-gray-700 w-36">Student Name:</span>
                                <span className="text-gray-900 font-medium">{student?.name}</span>
                            </div>
                            <div className="flex">
                                <span className="font-semibold text-gray-700 w-36">UUCMS No:</span>
                                <span className="text-gray-900 font-mono">{student?.uucmsNo}</span>
                            </div>
                        </div>
                        <div className="space-y-3">
                            <div className="flex">
                                <span className="font-semibold text-gray-700 w-36">Course:</span>
                                <span className="text-gray-900">BCA</span>
                            </div>
                            <div className="flex">
                                <span className="font-semibold text-gray-700 w-36">Semester:</span>
                                <span className="text-gray-900">{feeStructure?.semester?.semesterNumber}</span>
                            </div>
                            <div className="flex">
                                <span className="font-semibold text-gray-700 w-36">Division:</span>
                                <span className="text-gray-900">{student?.division}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Fee Breakdown */}
                <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-300 pb-2">
                        Fee Breakdown
                    </h3>
                    <div className="overflow-hidden border border-gray-300 rounded-lg">
                        <table className="min-w-full divide-y divide-gray-300">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Fee Component
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Amount
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {feeStructure?.feeComponents && Object.entries(feeStructure.feeComponents).map(([key, value]) => {
                                    if (value > 0) {
                                        const componentName = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                                        return (
                                            <tr key={key}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {componentName}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-mono">
                                                    {formatCurrency(value)}
                                                </td>
                                            </tr>
                                        );
                                    }
                                    return null;
                                })}
                                <tr className="bg-gray-50 font-semibold">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border-t-2 border-gray-300">
                                        Total Amount
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-mono border-t-2 border-gray-300">
                                        {formatCurrency(feeStructure?.totalAmount)}
                                    </td>
                                </tr>
                                <tr className="bg-green-50 font-bold text-green-800">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        Amount Paid
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-mono">
                                        {formatCurrency(paymentDetails?.paidAmount)}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Payment Status */}
                <div className="mb-8">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <h3 className="text-lg font-semibold text-green-800">Payment Verified & Approved</h3>
                                <p className="text-green-700 text-sm mt-1">
                                    Your fee payment has been successfully verified and approved by the office.
                                </p>
                                {verificationDetails?.verifiedAt && (
                                    <p className="text-green-600 text-sm mt-1">
                                        Verified on: {formatDateTime(verificationDetails.verifiedAt)}
                                    </p>
                                )}
                                {verificationDetails?.remarks && (
                                    <p className="text-green-600 text-sm mt-2">
                                        <span className="font-medium">Remarks:</span> {verificationDetails.remarks}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Amount in Words */}
                <div className="mb-8 p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-700">
                        <span className="font-semibold">Amount in Words:</span>
                        <span className="ml-2 capitalize font-medium">
                            {formatCurrency(paymentDetails?.paidAmount)} Only
                        </span>
                    </p>
                </div>

                {/* Footer */}
                <div className="border-t-2 border-gray-900 pt-6">
                    <div className="grid grid-cols-2 gap-8">
                        <div className="text-center">
                            <div className="border-b border-gray-400 w-48 mx-auto mb-2"></div>
                            <p className="text-sm text-gray-600">Student Signature</p>
                        </div>
                        <div className="text-center">
                            <div className="border-b border-gray-400 w-48 mx-auto mb-2"></div>
                            <p className="text-sm text-gray-600">Authorized Signature</p>
                            <p className="text-xs text-gray-500 mt-1">Office Staff</p>
                        </div>
                    </div>

                    <div className="text-center mt-8 pt-4 border-t border-gray-300">
                        <p className="text-xs text-gray-500">
                            This is a computer generated receipt and does not require physical signature.
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                            For any queries, please contact the college office or email us at fees@uucms.edu.in
                        </p>
                        <p className="text-xs text-gray-400 mt-2">
                            Generated on: {formatDateTime(new Date())}
                        </p>
                    </div>
                </div>
            </div>

            {/* Print Styles */}
            <style>{`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    .print\\:hidden {
                        display: none !important;
                    }
                    .receipt-content, .receipt-content * {
                        visibility: visible;
                    }
                    .receipt-content {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        border: 1px solid black;
                        padding: 1rem;
                    }
                    @page {
                        margin: 1cm;
                        size: A4;
                    }
                }
            `}</style>
        </div>
    );
});

ReceiptViewer.displayName = 'ReceiptViewer';

export default ReceiptViewer;