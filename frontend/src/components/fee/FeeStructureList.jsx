// components/fee/FeeStructureList.jsx
import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import feeService from '../../services/feeService';

const FeeStructureList = ({ onEdit, onDelete, refreshTrigger }) => {
    const [feeStructures, setFeeStructures] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deleteModal, setDeleteModal] = useState({ show: false, item: null });

    useEffect(() => {
        fetchFeeStructures();
    }, [refreshTrigger]);

    const fetchFeeStructures = async () => {
        try {
            setLoading(true);
            const response = await feeService.getAllFeeStructures();
            setFeeStructures(response.data || []);
        } catch (error) {
            console.error('Error fetching fee structures:', error);
            toast.error('Failed to fetch fee structures');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (feeStructure) => {
        try {
            await feeService.deleteFeeStructure(feeStructure._id);
            toast.success('Fee structure deleted successfully');
            fetchFeeStructures();
            onDelete && onDelete();
        } catch (error) {
            console.error('Error deleting fee structure:', error);
            toast.error(error.message || 'Failed to delete fee structure');
        } finally {
            setDeleteModal({ show: false, item: null });
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const formatCurrency = (amount) => {
        return `₹ ${amount.toLocaleString('en-IN')}`;
    };

    const getStatusBadge = (dueDate) => {
        const today = new Date();
        const due = new Date(dueDate);
        const diffTime = due - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) {
            return <span className="px-2 py-1 text-xs font-semibold bg-red-100 text-red-800 rounded-full">Overdue</span>;
        } else if (diffDays <= 7) {
            return <span className="px-2 py-1 text-xs font-semibold bg-yellow-100 text-yellow-800 rounded-full">Due Soon</span>;
        } else {
            return <span className="px-2 py-1 text-xs font-semibold bg-green-100 text-green-800 rounded-full">Active</span>;
        }
    };

    const DeleteConfirmationModal = () => (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                <div className="flex items-center mb-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.966-.833-2.736 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                    </div>
                    <div className="ml-4">
                        <h3 className="text-lg font-medium text-gray-900">Delete Fee Structure</h3>
                    </div>
                </div>
                <div className="mb-6">
                    <p className="text-sm text-gray-500">
                        Are you sure you want to delete the fee structure for Semester {deleteModal.item?.semester?.semesterNumber}
                        ({deleteModal.item?.academicYear})? This action cannot be undone.
                    </p>
                </div>
                <div className="flex justify-end space-x-3">
                    <button
                        onClick={() => setDeleteModal({ show: false, item: null })}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => handleDelete(deleteModal.item)}
                        className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );

    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow-md p-6">
                <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                    <div className="space-y-3">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="h-16 bg-gray-200 rounded"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-800">Fee Structures</h2>
                <p className="text-sm text-gray-600 mt-1">
                    {feeStructures.length} fee structure{feeStructures.length !== 1 ? 's' : ''} found
                </p>
            </div>

            {feeStructures.length === 0 ? (
                <div className="p-8 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Fee Structures</h3>
                    <p className="text-gray-500">Create your first fee structure to get started.</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Semester & Year
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Fee Components
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Total Amount
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Due Date
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
                            {feeStructures.map((feeStructure) => (
                                <tr key={feeStructure._id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div>
                                            <div className="text-sm font-medium text-gray-900">
                                                Semester {feeStructure.semester?.semesterNumber}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {feeStructure.academicYear}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-gray-900">
                                            <div className="grid grid-cols-2 gap-1 text-xs">
                                                <span>Tuition: {formatCurrency(feeStructure.feeComponents.tuitionFee)}</span>
                                                <span>Exam: {formatCurrency(feeStructure.feeComponents.examFee)}</span>
                                                <span>Library: {formatCurrency(feeStructure.feeComponents.libraryFee)}</span>
                                                <span>Lab: {formatCurrency(feeStructure.feeComponents.labFee)}</span>
                                                <span>Development: {formatCurrency(feeStructure.feeComponents.developmentFee)}</span>
                                                {feeStructure.feeComponents.otherFee > 0 && (
                                                    <span>Other: {formatCurrency(feeStructure.feeComponents.otherFee)}</span>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-semibold text-green-600">
                                            {formatCurrency(feeStructure.totalAmount)}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {formatDate(feeStructure.dueDate)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {getStatusBadge(feeStructure.dueDate)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => onEdit && onEdit(feeStructure)}
                                                className="text-indigo-600 hover:text-indigo-900 p-1 rounded hover:bg-indigo-50"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={() => setDeleteModal({ show: true, item: feeStructure })}
                                                className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {deleteModal.show && <DeleteConfirmationModal />}
        </div>
    );
};

export default FeeStructureList;