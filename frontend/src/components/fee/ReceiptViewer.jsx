import React, { useState, useRef } from 'react';
import { toast } from 'react-hot-toast';

const ReceiptViewer = ({ paymentDetails, onClose }) => {
    const [isDownloading, setIsDownloading] = useState(false);
    const receiptRef = useRef();

    const downloadAsPDF = async () => {
        setIsDownloading(true);
        try {
            // Import jsPDF dynamically
            const { jsPDF } = await import('jspdf');
            const doc = new jsPDF();

            // College Header
            doc.setFontSize(20);
            doc.setFont('helvetica', 'bold');
            doc.text('COLLEGE NAME', 105, 20, { align: 'center' });

            doc.setFontSize(12);
            doc.setFont('helvetica', 'normal');
            doc.text('College Address, City, State - PIN', 105, 30, { align: 'center' });
            doc.text('Phone: +91-XXXXXXXXXX | Email: info@college.edu', 105, 38, { align: 'center' });

            // Receipt Title
            doc.setFontSize(16);
            doc.setFont('helvetica', 'bold');
            doc.text('FEE PAYMENT RECEIPT', 105, 55, { align: 'center' });

            // Draw line
            doc.line(20, 60, 190, 60);

            // Receipt Details
            let yPos = 75;
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');

            // Receipt Number and Date
            doc.text(`Receipt No: ${paymentDetails.receiptNumber}`, 20, yPos);
            doc.text(`Date: ${new Date(paymentDetails.verificationDetails?.verifiedAt).toLocaleDateString()}`, 140, yPos);
            yPos += 15;

            // Student Details
            doc.setFont('helvetica', 'bold');
            doc.text('STUDENT DETAILS:', 20, yPos);
            yPos += 8;
            doc.setFont('helvetica', 'normal');
            doc.text(`Name: ${paymentDetails.student.name}`, 20, yPos);
            yPos += 6;
            doc.text(`UUCMS No: ${paymentDetails.student.uucmsNo}`, 20, yPos);
            yPos += 6;
            doc.text(`Email: ${paymentDetails.student.email}`, 20, yPos);
            yPos += 6;
            doc.text(`Semester: ${paymentDetails.student.semester?.semesterNumber}`, 20, yPos);
            yPos += 6;
            doc.text(`Division: ${paymentDetails.student.division}`, 20, yPos);
            yPos += 15;

            // Fee Details
            doc.setFont('helvetica', 'bold');
            doc.text('FEE DETAILS:', 20, yPos);
            yPos += 8;
            doc.setFont('helvetica', 'normal');
            doc.text(`Academic Year: ${paymentDetails.feeStructure.academicYear}`, 20, yPos);
            yPos += 10;

            // Fee Components Table
            const components = paymentDetails.feeStructure.feeComponents;
            doc.text('Fee Components:', 20, yPos);
            yPos += 8;

            Object.entries(components).forEach(([key, value]) => {
                if (value > 0) {
                    const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                    doc.text(`${label}:`, 25, yPos);
                    doc.text(`₹${value.toFixed(2)}`, 160, yPos);
                    yPos += 6;
                }
            });

            // Draw line for total
            doc.line(25, yPos + 2, 170, yPos + 2);
            yPos += 8;
            doc.setFont('helvetica', 'bold');
            doc.text('Total Amount:', 25, yPos);
            doc.text(`₹${paymentDetails.feeStructure.totalAmount.toFixed(2)}`, 160, yPos);
            yPos += 15;

            // Payment Details
            doc.setFont('helvetica', 'bold');
            doc.text('PAYMENT DETAILS:', 20, yPos);
            yPos += 8;
            doc.setFont('helvetica', 'normal');
            doc.text(`Payment Method: ${paymentDetails.paymentDetails.paymentMethod}`, 20, yPos);
            yPos += 6;
            doc.text(`Transaction ID: ${paymentDetails.paymentDetails.transactionId}`, 20, yPos);
            yPos += 6;
            doc.text(`Payment Date: ${new Date(paymentDetails.paymentDetails.paymentDate).toLocaleDateString()}`, 20, yPos);
            yPos += 6;
            doc.text(`Amount Paid: ₹${paymentDetails.paymentDetails.paidAmount.toFixed(2)}`, 20, yPos);
            yPos += 15;

            // Verification Details
            if (paymentDetails.verificationDetails) {
                doc.setFont('helvetica', 'bold');
                doc.text('VERIFICATION DETAILS:', 20, yPos);
                yPos += 8;
                doc.setFont('helvetica', 'normal');
                doc.text(`Verified By: ${paymentDetails.verificationDetails.verifiedBy?.name || 'Office Staff'}`, 20, yPos);
                yPos += 6;
                doc.text(`Verified On: ${new Date(paymentDetails.verificationDetails.verifiedAt).toLocaleDateString()}`, 20, yPos);
                if (paymentDetails.verificationDetails.remarks) {
                    yPos += 6;
                    doc.text(`Remarks: ${paymentDetails.verificationDetails.remarks}`, 20, yPos);
                }
            }

            // Footer
            yPos = 270;
            doc.line(20, yPos, 190, yPos);
            yPos += 10;
            doc.setFontSize(8);
            doc.text('This is a computer generated receipt and does not require signature.', 105, yPos, { align: 'center' });
            doc.text('For any queries, please contact the accounts office.', 105, yPos + 5, { align: 'center' });

            // Save PDF
            doc.save(`Fee_Receipt_${paymentDetails.receiptNumber}.pdf`);
            toast.success('Receipt downloaded successfully!');
        } catch (error) {
            console.error('Error generating PDF:', error);
            toast.error('Failed to download receipt');
        } finally {
            setIsDownloading(false);
        }
    };

    const downloadAsImage = () => {
        setIsDownloading(true);
        try {
            // Create canvas
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = 800;
            canvas.height = 1000;

            // White background
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Set default font
            ctx.fillStyle = '#000000';
            ctx.textAlign = 'left';

            let yPos = 40;

            // College Header
            ctx.font = 'bold 24px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('COLLEGE NAME', canvas.width / 2, yPos);
            yPos += 25;

            ctx.font = '14px Arial';
            ctx.fillText('College Address, City, State - PIN', canvas.width / 2, yPos);
            yPos += 18;
            ctx.fillText('Phone: +91-XXXXXXXXXX | Email: info@college.edu', canvas.width / 2, yPos);
            yPos += 35;

            // Receipt Title
            ctx.font = 'bold 20px Arial';
            ctx.fillText('FEE PAYMENT RECEIPT', canvas.width / 2, yPos);
            yPos += 25;

            // Draw line
            ctx.beginPath();
            ctx.moveTo(50, yPos);
            ctx.lineTo(canvas.width - 50, yPos);
            ctx.stroke();
            yPos += 25;

            // Receipt details
            ctx.textAlign = 'left';
            ctx.font = '12px Arial';

            // Receipt Number and Date
            ctx.fillText(`Receipt No: ${paymentDetails.receiptNumber}`, 50, yPos);
            ctx.fillText(`Date: ${new Date(paymentDetails.verificationDetails?.verifiedAt).toLocaleDateString()}`, 550, yPos);
            yPos += 25;

            // Student Details
            ctx.font = 'bold 14px Arial';
            ctx.fillText('STUDENT DETAILS:', 50, yPos);
            yPos += 20;
            ctx.font = '12px Arial';
            ctx.fillText(`Name: ${paymentDetails.student.name}`, 50, yPos);
            yPos += 18;
            ctx.fillText(`UUCMS No: ${paymentDetails.student.uucmsNo}`, 50, yPos);
            yPos += 18;
            ctx.fillText(`Email: ${paymentDetails.student.email}`, 50, yPos);
            yPos += 18;
            ctx.fillText(`Semester: ${paymentDetails.student.semester?.semesterNumber}`, 50, yPos);
            yPos += 18;
            ctx.fillText(`Division: ${paymentDetails.student.division}`, 50, yPos);
            yPos += 30;

            // Fee Details
            ctx.font = 'bold 14px Arial';
            ctx.fillText('FEE DETAILS:', 50, yPos);
            yPos += 20;
            ctx.font = '12px Arial';
            ctx.fillText(`Academic Year: ${paymentDetails.feeStructure.academicYear}`, 50, yPos);
            yPos += 25;

            // Fee Components
            ctx.fillText('Fee Components:', 50, yPos);
            yPos += 20;

            const components = paymentDetails.feeStructure.feeComponents;
            Object.entries(components).forEach(([key, value]) => {
                if (value > 0) {
                    const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                    ctx.fillText(`${label}:`, 70, yPos);
                    ctx.fillText(`₹${value.toFixed(2)}`, 600, yPos);
                    yPos += 18;
                }
            });

            // Draw line for total
            ctx.beginPath();
            ctx.moveTo(70, yPos + 5);
            ctx.lineTo(650, yPos + 5);
            ctx.stroke();
            yPos += 20;

            ctx.font = 'bold 12px Arial';
            ctx.fillText('Total Amount:', 70, yPos);
            ctx.fillText(`₹${paymentDetails.feeStructure.totalAmount.toFixed(2)}`, 600, yPos);
            yPos += 30;

            // Payment Details
            ctx.font = 'bold 14px Arial';
            ctx.fillText('PAYMENT DETAILS:', 50, yPos);
            yPos += 20;
            ctx.font = '12px Arial';
            ctx.fillText(`Payment Method: ${paymentDetails.paymentDetails.paymentMethod}`, 50, yPos);
            yPos += 18;
            ctx.fillText(`Transaction ID: ${paymentDetails.paymentDetails.transactionId}`, 50, yPos);
            yPos += 18;
            ctx.fillText(`Payment Date: ${new Date(paymentDetails.paymentDetails.paymentDate).toLocaleDateString()}`, 50, yPos);
            yPos += 18;
            ctx.fillText(`Amount Paid: ₹${paymentDetails.paymentDetails.paidAmount.toFixed(2)}`, 50, yPos);
            yPos += 30;

            // Verification Details
            if (paymentDetails.verificationDetails) {
                ctx.font = 'bold 14px Arial';
                ctx.fillText('VERIFICATION DETAILS:', 50, yPos);
                yPos += 20;
                ctx.font = '12px Arial';
                ctx.fillText(`Verified By: ${paymentDetails.verificationDetails.verifiedBy?.name || 'Office Staff'}`, 50, yPos);
                yPos += 18;
                ctx.fillText(`Verified On: ${new Date(paymentDetails.verificationDetails.verifiedAt).toLocaleDateString()}`, 50, yPos);
                if (paymentDetails.verificationDetails.remarks) {
                    yPos += 18;
                    ctx.fillText(`Remarks: ${paymentDetails.verificationDetails.remarks}`, 50, yPos);
                }
            }

            // Footer
            yPos = canvas.height - 50;
            ctx.beginPath();
            ctx.moveTo(50, yPos - 20);
            ctx.lineTo(canvas.width - 50, yPos - 20);
            ctx.stroke();

            ctx.font = '10px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('This is a computer generated receipt and does not require signature.', canvas.width / 2, yPos);
            ctx.fillText('For any queries, please contact the accounts office.', canvas.width / 2, yPos + 15);

            // Download image
            const link = document.createElement('a');
            link.download = `Fee_Receipt_${paymentDetails.receiptNumber}.png`;
            link.href = canvas.toDataURL();
            link.click();

            toast.success('Receipt downloaded successfully!');
        } catch (error) {
            console.error('Error generating image:', error);
            toast.error('Failed to download receipt');
        } finally {
            setIsDownloading(false);
        }
    };

    if (!paymentDetails) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                    <div className="text-center">
                        <p className="text-gray-600">No payment details available</p>
                        <button
                            onClick={onClose}
                            className="mt-4 px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b">
                    <h2 className="text-xl font-semibold text-gray-900">Fee Payment Receipt</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Receipt Content */}
                <div ref={receiptRef} className="p-8 bg-white">
                    {/* College Header */}
                    <div className="text-center mb-8">
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">COLLEGE NAME</h1>
                        <p className="text-sm text-gray-600">College Address, City, State - PIN</p>
                        <p className="text-sm text-gray-600">Phone: +91-XXXXXXXXXX | Email: info@college.edu</p>
                    </div>

                    {/* Receipt Title */}
                    <div className="text-center mb-6">
                        <h2 className="text-xl font-bold text-gray-900 border-b-2 border-gray-300 pb-2">
                            FEE PAYMENT RECEIPT
                        </h2>
                    </div>

                    {/* Receipt Info */}
                    <div className="flex justify-between mb-6">
                        <div>
                            <p className="text-sm"><strong>Receipt No:</strong> {paymentDetails.receiptNumber}</p>
                        </div>
                        <div>
                            <p className="text-sm"><strong>Date:</strong> {new Date(paymentDetails.verificationDetails?.verifiedAt).toLocaleDateString()}</p>
                        </div>
                    </div>

                    {/* Student Details */}
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold mb-3 text-gray-900">STUDENT DETAILS:</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                            <p><strong>Name:</strong> {paymentDetails.student.name}</p>
                            <p><strong>UUCMS No:</strong> {paymentDetails.student.uucmsNo}</p>
                            <p><strong>Email:</strong> {paymentDetails.student.email}</p>
                            <p><strong>Semester:</strong> {paymentDetails.student.semester?.semesterNumber}</p>
                            <p><strong>Division:</strong> {paymentDetails.student.division}</p>
                        </div>
                    </div>

                    {/* Fee Details */}
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold mb-3 text-gray-900">FEE DETAILS:</h3>
                        <p className="text-sm mb-3"><strong>Academic Year:</strong> {paymentDetails.feeStructure.academicYear}</p>

                        <div className="border border-gray-300">
                            <div className="bg-gray-50 px-4 py-2 border-b">
                                <p className="font-semibold">Fee Components:</p>
                            </div>
                            <div className="p-4">
                                {Object.entries(paymentDetails.feeStructure.feeComponents).map(([key, value]) => (
                                    value > 0 && (
                                        <div key={key} className="flex justify-between py-1 text-sm">
                                            <span>{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:</span>
                                            <span>₹{value.toFixed(2)}</span>
                                        </div>
                                    )
                                ))}
                                <div className="border-t pt-2 mt-2">
                                    <div className="flex justify-between font-semibold">
                                        <span>Total Amount:</span>
                                        <span>₹{paymentDetails.feeStructure.totalAmount.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Payment Details */}
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold mb-3 text-gray-900">PAYMENT DETAILS:</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                            <p><strong>Payment Method:</strong> {paymentDetails.paymentDetails.paymentMethod}</p>
                            <p><strong>Transaction ID:</strong> {paymentDetails.paymentDetails.transactionId}</p>
                            <p><strong>Payment Date:</strong> {new Date(paymentDetails.paymentDetails.paymentDate).toLocaleDateString()}</p>
                            <p><strong>Amount Paid:</strong> ₹{paymentDetails.paymentDetails.paidAmount.toFixed(2)}</p>
                        </div>
                    </div>

                    {/* Verification Details */}
                    {paymentDetails.verificationDetails && (
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold mb-3 text-gray-900">VERIFICATION DETAILS:</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                                <p><strong>Verified By:</strong> {paymentDetails.verificationDetails.verifiedBy?.name || 'Office Staff'}</p>
                                <p><strong>Verified On:</strong> {new Date(paymentDetails.verificationDetails.verifiedAt).toLocaleDateString()}</p>
                                {paymentDetails.verificationDetails.remarks && (
                                    <p className="col-span-2"><strong>Remarks:</strong> {paymentDetails.verificationDetails.remarks}</p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Footer */}
                    <div className="border-t pt-4 mt-8 text-center text-xs text-gray-600">
                        <p>This is a computer generated receipt and does not require signature.</p>
                        <p>For any queries, please contact the accounts office.</p>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-center gap-4 p-6 border-t bg-gray-50">
                    <button
                        onClick={downloadAsPDF}
                        disabled={isDownloading}
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                        {isDownloading ? (
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : (
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        )}
                        Download PDF
                    </button>
                    <button
                        onClick={downloadAsImage}
                        disabled={isDownloading}
                        className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                    >
                        {isDownloading ? (
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : (
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        )}
                        Download Image
                    </button>
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ReceiptViewer;