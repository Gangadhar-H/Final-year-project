// frontend/src/components/fee/ReceiptViewer.jsx
import React, { forwardRef } from 'react';

const ReceiptViewer = forwardRef(({ payment, onClose, showActions = true }, ref) => {
    if (!payment) {
        return (
            <div className="text-center py-8">
                <p className="text-gray-500">No payment data available</p>
            </div>
        );
    }

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

    const numberToWords = (num) => {
        const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
        const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
        const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];

        const convertHundreds = (n) => {
            let result = '';
            if (n >= 100) {
                result += ones[Math.floor(n / 100)] + ' Hundred ';
                n %= 100;
            }
            if (n >= 20) {
                result += tens[Math.floor(n / 10)] + ' ';
                n %= 10;
            } else if (n >= 10) {
                result += teens[n - 10] + ' ';
                return result;
            }
            if (n > 0) {
                result += ones[n] + ' ';
            }
            return result;
        };

        if (num === 0) return 'Zero';

        let result = '';
        let crore = Math.floor(num / 10000000);
        if (crore > 0) {
            result += convertHundreds(crore) + 'Crore ';
            num %= 10000000;
        }

        let lakh = Math.floor(num / 100000);
        if (lakh > 0) {
            result += convertHundreds(lakh) + 'Lakh ';
            num %= 100000;
        }

        let thousand = Math.floor(num / 1000);
        if (thousand > 0) {
            result += convertHundreds(thousand) + 'Thousand ';
            num %= 1000;
        }

        if (num > 0) {
            result += convertHundreds(num);
        }

        return result.trim() + ' Only';
    };

    const handlePrint = () => {
        window.print();
    };

    const handleDownload = () => {
        // Create a new window for printing
        const printWindow = window.open('', '_blank');
        const receiptContent = ref.current.innerHTML;

        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Fee Receipt - ${payment.receiptNumber}</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
                    .receipt-container { max-width: 800px; margin: 0 auto; }
                    .header { text-align: center; border: 2px solid #000; padding: 10px; margin-bottom: 0; }
                    .college-logo { width: 60px; height: 60px; float: left; margin-right: 15px; }
                    .college-info { text-align: center; }
                    .college-name { font-size: 18px; font-weight: bold; margin: 5px 0; }
                    .college-details { font-size: 12px; margin: 2px 0; }
                    .receipt-title { background: #000; color: white; text-align: center; padding: 8px; font-weight: bold; margin: 0; }
                    .receipt-info { border: 2px solid #000; border-top: none; padding: 15px; }
                    .info-row { display: flex; justify-content: space-between; margin: 5px 0; }
                    .fee-table { width: 100%; border-collapse: collapse; margin: 15px 0; }
                    .fee-table th, .fee-table td { border: 1px solid #000; padding: 8px; text-align: left; }
                    .fee-table th { background: #f0f0f0; font-weight: bold; }
                    .amount-col, .tax-col { text-align: right; }
                    .total-row { font-weight: bold; background: #f5f5f5; }
                    .payment-details { margin-top: 20px; border-top: 1px solid #ccc; padding-top: 10px; }
                    .signature-section { margin-top: 30px; display: flex; justify-content: space-between; }
                    .signature-box { text-align: center; width: 200px; }
                    .signature-line { border-bottom: 1px solid #000; margin-bottom: 5px; height: 40px; }
                    .stamp-area { width: 150px; height: 150px; border: 2px solid #000; border-radius: 50%; position: relative; margin: 20px auto; }
                    .stamp-text { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center; font-size: 12px; font-weight: bold; }
                    @media print {
                        body { margin: 0; }
                        .print-button { display: none; }
                    }
                </style>
            </head>
            <body>
                ${receiptContent}
            </body>
            </html>
        `);

        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        printWindow.close();
    };

    return (
        <div className="max-w-4xl mx-auto bg-white">
            {showActions && (
                <div className="flex justify-between items-center mb-6 print:hidden">
                    <h2 className="text-xl font-bold text-gray-900">Fee Receipt</h2>
                    <div className="flex space-x-3">
                        <button
                            onClick={handlePrint}
                            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                            </svg>
                            Print
                        </button>
                        <button
                            onClick={handleDownload}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Download
                        </button>
                        {onClose && (
                            <button
                                onClick={onClose}
                                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                            >
                                Close
                            </button>
                        )}
                    </div>
                </div>
            )}

            <div ref={ref} className="receipt-container bg-white border-2 border-gray-300 print:border-black print:shadow-none">
                {/* Header */}
                <div className="border-2 border-gray-800 p-4 mb-0">
                    <div className="flex items-center justify-center">
                        <div className="w-16 h-16 border-2 border-gray-600 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                            <svg className="w-10 h-10 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                            </svg>
                        </div>
                        <div className="text-center flex-1">
                            <h1 className="text-lg font-bold text-gray-900">K.L.E. Society's</h1>
                            <h2 className="text-base font-bold text-gray-900 mb-1">BACHELOR OF COMPUTER APPLICATIONS, RLSI, BELAGAVI</h2>
                            <p className="text-xs text-gray-700">Lingaraj College Campus, College Road, Belgavi</p>
                            <p className="text-xs text-gray-700">GSTIN No.: 29AAATK2644N7Z2</p>
                            <p className="text-xs text-gray-700">Ph.No.:-0831-2461928 &nbsp;&nbsp;&nbsp;&nbsp; Email ID:-klesbca.rlsibgm@gmail.com</p>
                        </div>
                    </div>
                </div>

                {/* Receipt Title */}
                <div className="bg-gray-800 text-white text-center py-2 font-bold border-l-2 border-r-2 border-gray-800">
                    UG BCA (CHALLAN NEXT INSTALLMENT RECEIPT)
                </div>

                {/* Receipt Details */}
                <div className="border-2 border-gray-800 border-t-0 p-4">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <p className="text-sm"><strong>Rec. No.:</strong> {payment.receiptNumber}</p>
                            <p className="text-sm"><strong>Name:</strong> {payment.student?.name}</p>
                            <p className="text-sm"><strong>Class:</strong> BCA {payment.student?.semester?.semesterNumber} SEMESTER</p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm"><strong>Date:</strong> {formatDate(payment.verificationDetails?.verifiedAt || payment.createdAt)}</p>
                            <p className="text-sm"><strong>State of Supply:</strong> KA</p>
                        </div>
                    </div>

                    {/* Fee Breakdown Table */}
                    <table className="w-full border-collapse border border-gray-800 mb-4">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="border border-gray-800 px-3 py-2 text-left text-sm font-bold">Particulars</th>
                                <th className="border border-gray-800 px-3 py-2 text-center text-sm font-bold">HSN/SAC</th>
                                <th className="border border-gray-800 px-3 py-2 text-center text-sm font-bold">Tax</th>
                                <th className="border border-gray-800 px-3 py-2 text-right text-sm font-bold">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {payment.feeStructure?.feeComponents?.tuitionFee > 0 && (
                                <tr>
                                    <td className="border border-gray-800 px-3 py-2 text-sm">Tuition Fees</td>
                                    <td className="border border-gray-800 px-3 py-2 text-center text-sm">999241</td>
                                    <td className="border border-gray-800 px-3 py-2 text-center text-sm">0%</td>
                                    <td className="border border-gray-800 px-3 py-2 text-right text-sm">{payment.feeStructure.feeComponents.tuitionFee.toFixed(2)}</td>
                                </tr>
                            )}
                            {payment.feeStructure?.feeComponents?.examFee > 0 && (
                                <tr>
                                    <td className="border border-gray-800 px-3 py-2 text-sm">Statutory Fees</td>
                                    <td className="border border-gray-800 px-3 py-2 text-center text-sm">999241</td>
                                    <td className="border border-gray-800 px-3 py-2 text-center text-sm">0%</td>
                                    <td className="border border-gray-800 px-3 py-2 text-right text-sm">{payment.feeStructure.feeComponents.examFee.toFixed(2)}</td>
                                </tr>
                            )}
                            {payment.feeStructure?.feeComponents?.libraryFee > 0 && (
                                <tr>
                                    <td className="border border-gray-800 px-3 py-2 text-sm">Curricular Activities Fees</td>
                                    <td className="border border-gray-800 px-3 py-2 text-center text-sm">999241</td>
                                    <td className="border border-gray-800 px-3 py-2 text-center text-sm">0%</td>
                                    <td className="border border-gray-800 px-3 py-2 text-right text-sm">{payment.feeStructure.feeComponents.libraryFee.toFixed(2)}</td>
                                </tr>
                            )}
                            {(payment.feeStructure?.feeComponents?.labFee > 0 || payment.feeStructure?.feeComponents?.developmentFee > 0 || payment.feeStructure?.feeComponents?.otherFee > 0) && (
                                <tr>
                                    <td className="border border-gray-800 px-3 py-2 text-sm">Special Purpose Fees</td>
                                    <td className="border border-gray-800 px-3 py-2 text-center text-sm">NA</td>
                                    <td className="border border-gray-800 px-3 py-2 text-center text-sm">0%</td>
                                    <td className="border border-gray-800 px-3 py-2 text-right text-sm">
                                        {((payment.feeStructure.feeComponents.labFee || 0) +
                                            (payment.feeStructure.feeComponents.developmentFee || 0) +
                                            (payment.feeStructure.feeComponents.otherFee || 0)).toFixed(2)}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>

                    {/* Tax Details */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div></div>
                        <div className="border border-gray-800">
                            <table className="w-full">
                                <tbody>
                                    <tr>
                                        <td className="border-b border-gray-800 px-3 py-1 text-sm text-right">Taxable Value</td>
                                        <td className="border-b border-l border-gray-800 px-3 py-1 text-sm text-right">-</td>
                                    </tr>
                                    <tr>
                                        <td className="border-b border-gray-800 px-3 py-1 text-sm text-right">Output IGST @ 18%</td>
                                        <td className="border-b border-l border-gray-800 px-3 py-1 text-sm text-right">-</td>
                                    </tr>
                                    <tr>
                                        <td className="border-b border-gray-800 px-3 py-1 text-sm text-right">Output CGST @ 9%</td>
                                        <td className="border-b border-l border-gray-800 px-3 py-1 text-sm text-right">-</td>
                                    </tr>
                                    <tr>
                                        <td className="px-3 py-1 text-sm text-right">Output SGST @ 9%</td>
                                        <td className="border-l border-gray-800 px-3 py-1 text-sm text-right">-</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Total */}
                    <div className="border-2 border-gray-800 bg-gray-50 p-2 mb-4">
                        <div className="flex justify-between items-center">
                            <span className="font-bold text-sm">Total :</span>
                            <span className="font-bold text-sm">{formatCurrency(payment.paymentDetails.paidAmount)}</span>
                        </div>
                    </div>

                    {/* Amount in Words */}
                    <p className="text-sm mb-4">
                        <strong>In words :</strong> {numberToWords(Math.floor(payment.paymentDetails.paidAmount))}
                    </p>

                    {/* Payment Details */}
                    <div className="text-sm space-y-1 mb-4">
                        <p><strong>UPI Amount :</strong> {formatCurrency(payment.paymentDetails.paidAmount)} <strong>Bank Info :</strong> Transaction ID : {payment.paymentDetails.transactionId}</p>
                        <p><strong>Date :</strong> {formatDate(payment.paymentDetails.paymentDate)}, <strong>Bank Name :</strong> {payment.paymentDetails.paymentMethod} Payment</p>
                        <p><strong>Location :</strong> BELAGAVI</p>
                        <p><strong>Remarks :</strong> Outstanding Fees : 0</p>
                    </div>

                    {/* Bank Details */}
                    <div className="text-sm space-y-1 mb-6">
                        <p><strong>Bank Name :</strong> {payment.paymentDetails.paymentMethod} Payment</p>
                        <p><strong>Bank Account Number :</strong> 001002300001125</p>
                        <p><strong>IFSC Code:</strong> IBKL0101BZR</p>
                    </div>

                    {/* Signature Section */}
                    <div className="flex justify-between items-end">
                        <div className="text-left">
                            <div className="border-b border-gray-800 w-40 mb-2"></div>
                            <p className="text-xs">Sign of Remitter</p>
                            <p className="text-xs mt-4">BN7-9001A CHOUGUN F23/H-2025</p>
                        </div>

                        <div className="text-center">
                            <div className="w-32 h-32 border-2 border-gray-800 rounded-full flex items-center justify-center mx-auto mb-2">
                                <div className="text-center">
                                    <div className="text-xs font-bold transform -rotate-12">K.L.E SBCA RLSI</div>
                                    <div className="text-xs font-bold transform rotate-12 mt-1">BELAGAVI</div>
                                </div>
                            </div>
                        </div>

                        <div className="text-right">
                            <div className="border-b border-gray-800 w-40 mb-2"></div>
                            <p className="text-xs">Cashier/Clerk</p>
                            <p className="text-xs mt-4">Page 1 of 1</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
});

ReceiptViewer.displayName = 'ReceiptViewer';

export default ReceiptViewer;