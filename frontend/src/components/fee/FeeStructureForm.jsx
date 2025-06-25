// components/fee/FeeStructureForm.jsx
import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import feeService from '../../services/feeService';
import { getSemesters } from '../../services/adminService'; // Import from adminService instead

const FeeStructureForm = ({ feeStructure, onSuccess, onCancel }) => {
    const [formData, setFormData] = useState({
        semesterId: '',
        academicYear: '',
        feeComponents: {
            tuitionFee: 0,
            examFee: 0,
            libraryFee: 0,
            labFee: 0,
            developmentFee: 0,
            otherFee: 0
        },
        dueDate: ''
    });

    const [semesters, setSemesters] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isEdit, setIsEdit] = useState(false);

    useEffect(() => {
        fetchSemesters();
        if (feeStructure) {
            setIsEdit(true);
            setFormData({
                semesterId: feeStructure.semester._id,
                academicYear: feeStructure.academicYear,
                feeComponents: { ...feeStructure.feeComponents },
                dueDate: new Date(feeStructure.dueDate).toISOString().split('T')[0]
            });
        }
    }, [feeStructure]);

    const fetchSemesters = async () => {
        try {
            const response = await getSemesters(); // Use getSemesters from adminService
            setSemesters(response.semesters || []); // Access semesters from response
        } catch (error) {
            console.error('Error fetching semesters:', error);
            toast.error('Failed to fetch semesters');
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: parseFloat(value) || 0
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const calculateTotal = () => {
        const { feeComponents } = formData;
        return Object.values(feeComponents).reduce((sum, fee) => sum + (parseFloat(fee) || 0), 0);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const submitData = {
                ...formData,
                totalAmount: calculateTotal()
            };

            if (isEdit) {
                await feeService.updateFeeStructure(feeStructure._id, submitData);
                toast.success('Fee structure updated successfully');
            } else {
                await feeService.createFeeStructure(submitData);
                toast.success('Fee structure created successfully');
            }

            onSuccess && onSuccess();
        } catch (error) {
            console.error('Error saving fee structure:', error);
            toast.error(error.message || 'Failed to save fee structure');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            semesterId: '',
            academicYear: '',
            feeComponents: {
                tuitionFee: 0,
                examFee: 0,
                libraryFee: 0,
                labFee: 0,
                developmentFee: 0,
                otherFee: 0
            },
            dueDate: ''
        });
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                    {isEdit ? 'Edit Fee Structure' : 'Create Fee Structure'}
                </h2>
                {onCancel && (
                    <button
                        onClick={onCancel}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Semester Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Semester <span className="text-red-500">*</span>
                        </label>
                        <select
                            name="semesterId"
                            value={formData.semesterId}
                            onChange={handleInputChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Select Semester</option>
                            {semesters.map(semester => (
                                <option key={semester._id} value={semester._id}>
                                    Semester {semester.semesterNumber}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Academic Year */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Academic Year <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="academicYear"
                            value={formData.academicYear}
                            onChange={handleInputChange}
                            placeholder="e.g., 2024-25"
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                {/* Fee Components */}
                <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Fee Components</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {Object.entries(formData.feeComponents).map(([key, value]) => (
                            <div key={key}>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} (₹)
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    name={`feeComponents.${key}`}
                                    value={value}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Due Date */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Due Date <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="date"
                        name="dueDate"
                        value={formData.dueDate}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* Total Amount Display */}
                <div className="bg-gray-50 p-4 rounded-md">
                    <div className="flex justify-between items-center">
                        <span className="text-lg font-semibold text-gray-700">Total Amount:</span>
                        <span className="text-xl font-bold text-blue-600">₹{calculateTotal()}</span>
                    </div>
                </div>

                {/* Submit & Reset */}
                <div className="flex items-center justify-between">
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
                    >
                        {loading ? 'Saving...' : isEdit ? 'Update Structure' : 'Create Structure'}
                    </button>
                    <button
                        type="button"
                        onClick={resetForm}
                        className="text-sm text-gray-600 hover:text-gray-800"
                    >
                        Reset Form
                    </button>
                </div>
            </form>
        </div>
    );
};

export default FeeStructureForm;