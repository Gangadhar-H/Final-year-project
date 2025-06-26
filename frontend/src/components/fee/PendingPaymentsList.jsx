import React, { useState, useEffect } from 'react';
import { Eye, Search, Filter, ChevronLeft, ChevronRight, Calendar, DollarSign, User, AlertCircle } from 'lucide-react';
import feeService from '../../services/feeService';
import toast from 'react-hot-toast';
import PaymentVerification from './PaymentVerification';

const PendingPaymentsList = () => {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        total: 0
    });
    const [filters, setFilters] = useState({
        status: 'pending',
        search: '',
        page: 1,
        limit: 10
    });
    const [selectedPaymentId, setSelectedPaymentId] = useState(null);
    const [showVerificationModal, setShowVerificationModal] = useState(false);

    useEffect(() => {
        fetchPayments();
    }, [filters]);

    const fetchPayments = async () => {
        setLoading(true);
        try {
            const response = await feeService.getPendingPayments({
                page: filters.page,
                limit: filters.limit,
                status: filters.status
            });

            setPayments(response.data.payments);
            setPagination({
                currentPage: parseInt(response.data.currentPage),
                totalPages: response.data.totalPages,
                total: response.data.total
            });
        } catch (error) {
            toast.error(error.message || 'Failed to fetch payments');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusFilter = (status) => {
        setFilters(prev => ({
            ...prev,
            status,
            page: 1
        }));
    };

    const handlePageChange = (page) => {
        setFilters(prev => ({
            ...prev,
            page
        }));
    };

    const handleViewPayment = (paymentId) => {
        setSelectedPaymentId(paymentId);
        setShowVerificationModal(true);
    };

    const handleVerificationComplete = () => {
        fetchPayments();
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            pending: { color: 'bg-yellow-100 text-yellow-800', text: 'Pending' },
            approved: { color: 'bg-green-100 text-green-800', text: 'Approved' },
            rejected: { color: 'bg-red-100 text-red-800', text: 'Rejected' }
        };

        const config = statusConfig[status] || statusConfig.pending;

        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
                {config.text}
            </span>
        );
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
            month: 'short',
            day: 'numeric'
        });
    };

    const filteredPayments = payments.filter(payment => {
        if (!filters.search) return true;
        const searchTerm = filters.search.toLowerCase();
        return (
            payment.student.name.toLowerCase().includes(searchTerm) ||
            payment.student.uucmsNo.toLowerCase().includes(searchTerm) ||
            payment.paymentDetails.transactionId.toLowerCase().includes(searchTerm)
        );
    });

    return (
        <div className="bg-white rounded-lg shadow">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-900">Fee Payments</h2>
                    <div className="flex items-center space-x-4">
                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Search by name, UUCMS No, or transaction ID..."
                                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent w-80"
                                value={filters.search}
                                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Status Filter Tabs */}
            <div className="px-6 py-3 border-b border-gray-200">
                <div className="flex space-x-1">
                    {['pending', 'approved', 'rejected'].map((status) => (
                        <button
                            key={status}
                            onClick={() => handleStatusFilter(status)}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${filters.status === status
                                    ? 'bg-blue-100 text-blue-700'
                                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                                }`}
                        >
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Payments List */}
            <div className="overflow-x-auto">
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                ) : filteredPayments.length === 0 ? (
                    <div className="text-center py-12">
                        <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No payments found</h3>
                        <p className="text-gray-500">
                            {filters.search ? 'No payments match your search criteria.' : `No ${filters.status} payments available.`}
                        </p>
                    </div>
                ) : (
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Student Details
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Payment Details
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Amount
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Date
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredPayments.map((payment) => (
                                <tr key={payment._id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-10">
                                                <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
                                                    <User className="h-5 w-5 text-white" />
                                                </div>
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {payment.student.name}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {payment.student.uucmsNo}
                                                </div>
                                                <div className="text-xs text-gray-400">
                                                    Sem {payment.student.semester?.semesterNumber} - Div {payment.student.division}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900 font-medium">
                                            {payment.paymentDetails.paymentMethod}
                                        </div>
                                        <div className="text-sm text-gray-500 font-mono">
                                            {payment.paymentDetails.transactionId}
                                        </div>
                                        <div className="text-xs text-gray-400">
                                            AY: {payment.feeStructure.academicYear}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">
                                            {formatCurrency(payment.paymentDetails.paidAmount)}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            of {formatCurrency(payment.feeStructure.totalAmount)}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">
                                            {formatDate(payment.paymentDetails.paymentDate)}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            Submitted: {formatDate(payment.createdAt)}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {getStatusBadge(payment.status)}
                                        {payment.receiptNumber && (
                                            <div className="text-xs text-gray-500 mt-1 font-mono">
                                                {payment.receiptNumber}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <button
                                            onClick={() => handleViewPayment(payment._id)}
                                            className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-colors"
                                        >
                                            <Eye className="w-4 h-4 mr-1" />
                                            View
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Pagination */}
            {!loading && filteredPayments.length > 0 && (
                <div className="px-6 py-4 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-500">
                            Showing {((pagination.currentPage - 1) * filters.limit) + 1} to{' '}
                            {Math.min(pagination.currentPage * filters.limit, pagination.total)} of{' '}
                            {pagination.total} results
                        </div>

                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => handlePageChange(pagination.currentPage - 1)}
                                disabled={pagination.currentPage === 1}
                                className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ChevronLeft className="w-4 h-4 mr-1" />
                                Previous
                            </button>

                            <div className="flex space-x-1">
                                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                                    .slice(
                                        Math.max(0, pagination.currentPage - 3),
                                        Math.min(pagination.totalPages, pagination.currentPage + 2)
                                    )
                                    .map((page) => (
                                        <button
                                            key={page}
                                            onClick={() => handlePageChange(page)}
                                            className={`px-3 py-1 border rounded-md text-sm font-medium ${page === pagination.currentPage
                                                    ? 'bg-blue-600 text-white border-blue-600'
                                                    : 'text-gray-700 border-gray-300 hover:bg-gray-50'
                                                }`}
                                        >
                                            {page}
                                        </button>
                                    ))}
                            </div>

                            <button
                                onClick={() => handlePageChange(pagination.currentPage + 1)}
                                disabled={pagination.currentPage === pagination.totalPages}
                                className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Next
                                <ChevronRight className="w-4 h-4 ml-1" />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Payment Verification Modal */}
            <PaymentVerification
                paymentId={selectedPaymentId}
                isOpen={showVerificationModal}
                onClose={() => {
                    setShowVerificationModal(false);
                    setSelectedPaymentId(null);
                }}
                onVerificationComplete={handleVerificationComplete}
            />
        </div>
    );
};

export default PendingPaymentsList;