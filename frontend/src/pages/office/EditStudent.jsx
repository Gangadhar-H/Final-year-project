import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import officeService from '../../services/officeService';

const EditStudent = () => {
    const { studentId } = useParams();
    const navigate = useNavigate();

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        uucmsNo: '',
        email: '',
        semesterId: '',
        division: ''
    });

    // UI state
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState({});
    const [semesters, setSemesters] = useState([]);
    const [originalData, setOriginalData] = useState({});

    // Fetch student data and semesters on component mount
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                // Fetch student details and semesters in parallel
                const [studentResponse, semestersResponse] = await Promise.all([
                    officeService.getStudent(studentId),
                    officeService.getSemesters()
                ]);

                const student = studentResponse.student;
                const studentFormData = {
                    name: student.name || '',
                    uucmsNo: student.uucmsNo || '',
                    email: student.email || '',
                    semesterId: student.semester?._id || '',
                    division: student.division || ''
                };

                setFormData(studentFormData);
                setOriginalData(studentFormData);
                setSemesters(semestersResponse.semesters || []);

            } catch (error) {
                console.error('Error fetching data:', error);
                toast.error(error.message || 'Failed to load student data');
                // Redirect back to students page if student not found
                if (error.message?.includes('not found')) {
                    navigate('/office/students');
                }
            } finally {
                setLoading(false);
            }
        };

        if (studentId) {
            fetchData();
        }
    }, [studentId, navigate]);

    // Handle input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Clear field-specific error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    // Validate form data
    const validateForm = () => {
        const validation = officeService.validateStudentData(formData);
        setErrors(validation.errors);
        return validation.isValid;
    };

    // Check if form has changes
    const hasChanges = () => {
        return JSON.stringify(formData) !== JSON.stringify(originalData);
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            toast.error('Please fix the errors in the form');
            return;
        }

        if (!hasChanges()) {
            toast.info('No changes to save');
            return;
        }

        try {
            setSubmitting(true);

            await officeService.updateStudent(studentId, formData);

            toast.success('Student updated successfully!');
            navigate('/office/students');

        } catch (error) {
            console.error('Update error:', error);
            toast.error(error.message || 'Failed to update student');

            // Handle specific validation errors from backend
            if (error.errors) {
                setErrors(error.errors);
            }
        } finally {
            setSubmitting(false);
        }
    };

    // Handle cancel action
    const handleCancel = () => {
        if (hasChanges()) {
            if (window.confirm('You have unsaved changes. Are you sure you want to cancel?')) {
                navigate('/office/students');
            }
        } else {
            navigate('/office/students');
        }
    };

    // Loading state
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">Loading student data...</span>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Edit Student</h1>
                        <p className="mt-2 text-gray-600">
                            Update student information and details
                        </p>
                    </div>
                    <Link
                        to="/office/students"
                        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                    >
                        ← Back to Students
                    </Link>
                </div>
            </div>

            {/* Form */}
            <div className="bg-white shadow-lg rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">Student Information</h2>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Name */}
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                                Student Name *
                            </label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.name
                                        ? 'border-red-300 focus:border-red-500'
                                        : 'border-gray-300 focus:border-blue-500'
                                    }`}
                                placeholder="Enter student's full name"
                                disabled={submitting}
                            />
                            {errors.name && (
                                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                            )}
                        </div>

                        {/* UUCMS Number */}
                        <div>
                            <label htmlFor="uucmsNo" className="block text-sm font-medium text-gray-700 mb-2">
                                UUCMS Number *
                            </label>
                            <input
                                type="text"
                                id="uucmsNo"
                                name="uucmsNo"
                                value={formData.uucmsNo}
                                onChange={handleInputChange}
                                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.uucmsNo
                                        ? 'border-red-300 focus:border-red-500'
                                        : 'border-gray-300 focus:border-blue-500'
                                    }`}
                                placeholder="e.g., 21CS001"
                                disabled={submitting}
                            />
                            {errors.uucmsNo && (
                                <p className="mt-1 text-sm text-red-600">{errors.uucmsNo}</p>
                            )}
                        </div>

                        {/* Email */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                Email Address *
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.email
                                        ? 'border-red-300 focus:border-red-500'
                                        : 'border-gray-300 focus:border-blue-500'
                                    }`}
                                placeholder="student@example.com"
                                disabled={submitting}
                            />
                            {errors.email && (
                                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                            )}
                        </div>

                        {/* Division */}
                        <div>
                            <label htmlFor="division" className="block text-sm font-medium text-gray-700 mb-2">
                                Division *
                            </label>
                            <select
                                id="division"
                                name="division"
                                value={formData.division}
                                onChange={handleInputChange}
                                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.division
                                        ? 'border-red-300 focus:border-red-500'
                                        : 'border-gray-300 focus:border-blue-500'
                                    }`}
                                disabled={submitting}
                            >
                                <option value="">Select Division</option>
                                <option value="A">Division A</option>
                                <option value="B">Division B</option>
                                <option value="C">Division C</option>
                                <option value="D">Division D</option>
                            </select>
                            {errors.division && (
                                <p className="mt-1 text-sm text-red-600">{errors.division}</p>
                            )}
                        </div>

                        {/* Semester */}
                        <div className="md:col-span-2">
                            <label htmlFor="semesterId" className="block text-sm font-medium text-gray-700 mb-2">
                                Semester *
                            </label>
                            <select
                                id="semesterId"
                                name="semesterId"
                                value={formData.semesterId}
                                onChange={handleInputChange}
                                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.semesterId
                                        ? 'border-red-300 focus:border-red-500'
                                        : 'border-gray-300 focus:border-blue-500'
                                    }`}
                                disabled={submitting}
                            >
                                <option value="">Select Semester</option>
                                {semesters.map((semester) => (
                                    <option key={semester._id} value={semester._id}>
                                        Semester {semester.semesterNumber}
                                    </option>
                                ))}
                            </select>
                            {errors.semesterId && (
                                <p className="mt-1 text-sm text-red-600">{errors.semesterId}</p>
                            )}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={handleCancel}
                            disabled={submitting}
                            className="px-6 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={submitting || !hasChanges()}
                            className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {submitting ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Saving...
                                </>
                            ) : (
                                'Save Changes'
                            )}
                        </button>
                    </div>
                </form>
            </div>

            {/* Change Summary */}
            {hasChanges() && (
                <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-yellow-800">
                                Unsaved Changes
                            </h3>
                            <p className="mt-1 text-sm text-yellow-700">
                                You have made changes to the student information. Don't forget to save your changes.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EditStudent;