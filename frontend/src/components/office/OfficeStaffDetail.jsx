import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getOfficeStaffById, updateOfficeStaff, deleteOfficeStaff } from '../../services/adminService';
import { ArrowLeft, Edit, Trash2, Save, X, User, Mail, CreditCard, Briefcase, Shield } from 'lucide-react';

const OfficeStaffDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [staff, setStaff] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({
        name: '',
        email: '',
        designation: '',
        permissions: {
            studentManagement: false,
            feeManagement: false,
            reportGeneration: false
        }
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState(false);

    const designationOptions = [
        "Office Manager",
        "Accounts Officer",
        "Admission Officer",
        "Student Coordinator",
        "Exam Officer",
        "Clerk",
        "Other"
    ];

    useEffect(() => {
        fetchStaffDetails();
    }, [id]);

    const fetchStaffDetails = async () => {
        try {
            setLoading(true);
            const response = await getOfficeStaffById(id);
            setStaff(response.officeStaff);
            setEditForm({
                name: response.officeStaff.name,
                email: response.officeStaff.email,
                designation: response.officeStaff.designation,
                permissions: response.officeStaff.permissions
            });
        } catch (error) {
            setError('Failed to fetch staff details');
            console.error('Error fetching staff details:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;

        if (name.startsWith('permissions.')) {
            const permissionKey = name.split('.')[1];
            setEditForm(prev => ({
                ...prev,
                permissions: {
                    ...prev.permissions,
                    [permissionKey]: checked
                }
            }));
        } else {
            setEditForm(prev => ({
                ...prev,
                [name]: type === 'checkbox' ? checked : value
            }));
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const response = await updateOfficeStaff(id, editForm);
            setStaff(response.officeStaff);
            setIsEditing(false);
            setError('');
        } catch (error) {
            setError('Failed to update staff details');
            console.error('Error updating staff:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteConfirm) {
            setDeleteConfirm(true);
            return;
        }

        setIsSubmitting(true);
        try {
            await deleteOfficeStaff(id);
            navigate('/admin/office-staff');
        } catch (error) {
            setError('Failed to delete staff member');
            console.error('Error deleting staff:', error);
            setIsSubmitting(false);
        }
    };

    const cancelEdit = () => {
        setIsEditing(false);
        setEditForm({
            name: staff.name,
            email: staff.email,
            designation: staff.designation,
            permissions: staff.permissions
        });
        setError('');
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!staff) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Staff Member Not Found</h2>
                    <Link
                        to="/admin/office-staff"
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Office Staff
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <Link
                                to="/admin/office-staff"
                                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                            >
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back
                            </Link>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">{staff.name}</h1>
                                <p className="text-sm text-gray-600">Staff ID: {staff.staffId}</p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-3">
                            {!isEditing ? (
                                <>
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                                    >
                                        <Edit className="w-4 h-4 mr-2" />
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => setDeleteConfirm(true)}
                                        disabled={isSubmitting}
                                        className="inline-flex items-center px-3 py-2 border border-red-300 rounded-md text-sm font-medium text-red-700 bg-white hover:bg-red-50 disabled:opacity-50"
                                    >
                                        <Trash2 className="w-4 h-4 mr-2" />
                                        Delete
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button
                                        onClick={handleUpdate}
                                        disabled={isSubmitting}
                                        className="inline-flex items-center px-3 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                                    >
                                        <Save className="w-4 h-4 mr-2" />
                                        {isSubmitting ? 'Saving...' : 'Save'}
                                    </button>
                                    <button
                                        onClick={cancelEdit}
                                        disabled={isSubmitting}
                                        className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                                    >
                                        <X className="w-4 h-4 mr-2" />
                                        Cancel
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
                        <div className="flex">
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-red-800">Error</h3>
                                <div className="mt-2 text-sm text-red-700">{error}</div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Staff Details */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-lg font-medium text-gray-900">Staff Information</h2>
                    </div>

                    <div className="p-6">
                        {!isEditing ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div className="flex items-center space-x-3">
                                        <User className="w-5 h-5 text-gray-400" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-500">Full Name</p>
                                            <p className="text-sm text-gray-900">{staff.name}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-3">
                                        <Mail className="w-5 h-5 text-gray-400" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-500">Email</p>
                                            <p className="text-sm text-gray-900">{staff.email}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center space-x-3">
                                        <CreditCard className="w-5 h-5 text-gray-400" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-500">Staff ID</p>
                                            <p className="text-sm text-gray-900">{staff.staffId}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-3">
                                        <Briefcase className="w-5 h-5 text-gray-400" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-500">Designation</p>
                                            <p className="text-sm text-gray-900">{staff.designation}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div onSubmit={handleUpdate} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                            Full Name
                                        </label>
                                        <input
                                            type="text"
                                            id="name"
                                            name="name"
                                            value={editForm.name}
                                            onChange={handleInputChange}
                                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                            Email
                                        </label>
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            value={editForm.email}
                                            onChange={handleInputChange}
                                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="designation" className="block text-sm font-medium text-gray-700">
                                            Designation
                                        </label>
                                        <select
                                            id="designation"
                                            name="designation"
                                            value={editForm.designation}
                                            onChange={handleInputChange}
                                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                            required
                                        >
                                            <option value="">Select designation</option>
                                            {designationOptions.map((option) => (
                                                <option key={option} value={option}>
                                                    {option}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Permissions Section */}
                        <div className="mt-8 pt-6 border-t border-gray-200">
                            <div className="flex items-center space-x-2 mb-4">
                                <Shield className="w-5 h-5 text-gray-400" />
                                <h3 className="text-lg font-medium text-gray-900">Permissions</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <span className="text-sm font-medium text-gray-700">Student Management</span>
                                    {isEditing ? (
                                        <input
                                            type="checkbox"
                                            name="permissions.studentManagement"
                                            checked={editForm.permissions.studentManagement}
                                            onChange={handleInputChange}
                                            className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                        />
                                    ) : (
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${staff.permissions.studentManagement
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-gray-100 text-gray-800'
                                            }`}>
                                            {staff.permissions.studentManagement ? 'Enabled' : 'Disabled'}
                                        </span>
                                    )}
                                </div>

                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <span className="text-sm font-medium text-gray-700">Fee Management</span>
                                    {isEditing ? (
                                        <input
                                            type="checkbox"
                                            name="permissions.feeManagement"
                                            checked={editForm.permissions.feeManagement}
                                            onChange={handleInputChange}
                                            className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                        />
                                    ) : (
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${staff.permissions.feeManagement
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-gray-100 text-gray-800'
                                            }`}>
                                            {staff.permissions.feeManagement ? 'Enabled' : 'Disabled'}
                                        </span>
                                    )}
                                </div>

                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <span className="text-sm font-medium text-gray-700">Report Generation</span>
                                    {isEditing ? (
                                        <input
                                            type="checkbox"
                                            name="permissions.reportGeneration"
                                            checked={editForm.permissions.reportGeneration}
                                            onChange={handleInputChange}
                                            className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                        />
                                    ) : (
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${staff.permissions.reportGeneration
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-gray-100 text-gray-800'
                                            }`}>
                                            {staff.permissions.reportGeneration ? 'Enabled' : 'Disabled'}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Delete Confirmation Modal */}
                {deleteConfirm && (
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                        <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                            <div className="mt-3 text-center">
                                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                                    <Trash2 className="h-6 w-6 text-red-600" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 mt-4">Delete Staff Member</h3>
                                <div className="mt-2 px-7 py-3">
                                    <p className="text-sm text-gray-500">
                                        Are you sure you want to delete <strong>{staff.name}</strong>?
                                        This action cannot be undone.
                                    </p>
                                </div>
                                <div className="items-center px-4 py-3">
                                    <button
                                        onClick={handleDelete}
                                        disabled={isSubmitting}
                                        className="px-4 py-2 bg-red-500 text-white text-base font-medium rounded-md w-24 mr-4 hover:bg-red-600 disabled:opacity-50"
                                    >
                                        {isSubmitting ? 'Deleting...' : 'Delete'}
                                    </button>
                                    <button
                                        onClick={() => setDeleteConfirm(false)}
                                        disabled={isSubmitting}
                                        className="px-4 py-2 bg-gray-500 text-white text-base font-medium rounded-md w-24 hover:bg-gray-600 disabled:opacity-50"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OfficeStaffDetail;