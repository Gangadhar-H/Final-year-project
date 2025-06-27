import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addOfficeStaff } from '../../services/adminService';

export default function AddOfficeStaff() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        staffId: '',
        name: '',
        email: '',
        password: '',
        designation: '',
        permissions: {
            studentManagement: false,
            feeManagement: false,
            reportGeneration: false
        }
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const designations = [
        'Office Manager',
        'Accounts Officer',
        'Admission Officer',
        'Student Coordinator',
        'Exam Officer',
        'Clerk',
        'Other'
    ];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handlePermissionChange = (permission) => {
        setFormData(prev => ({
            ...prev,
            permissions: {
                ...prev.permissions,
                [permission]: !prev.permissions[permission]
            }
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await addOfficeStaff(formData);
            navigate('/admin/office-staff');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to add office staff');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 max-w-2xl mx-auto">
            <div className="flex items-center mb-6">
                <button
                    onClick={() => navigate('/admin/office-staff')}
                    className="mr-4 text-gray-600 hover:text-gray-800"
                >
                    ← Back
                </button>
                <h1 className="text-2xl font-bold">Add Office Staff</h1>
            </div>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Staff ID *
                        </label>
                        <input
                            type="text"
                            name="staffId"
                            value={formData.staffId}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Full Name *
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email *
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Password *
                        </label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Designation *
                    </label>
                    <select
                        name="designation"
                        value={formData.designation}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">Select Designation</option>
                        {designations.map(designation => (
                            <option key={designation} value={designation}>
                                {designation}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Permissions
                    </label>
                    <div className="space-y-2">
                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                checked={formData.permissions.studentManagement}
                                onChange={() => handlePermissionChange('studentManagement')}
                                className="mr-2"
                            />
                            Student Management
                        </label>
                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                checked={formData.permissions.feeManagement}
                                onChange={() => handlePermissionChange('feeManagement')}
                                className="mr-2"
                            />
                            Fee Management
                        </label>
                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                checked={formData.permissions.reportGeneration}
                                onChange={() => handlePermissionChange('reportGeneration')}
                                className="mr-2"
                            />
                            Report Generation
                        </label>
                    </div>
                </div>

                <div className="flex justify-end space-x-3">
                    <button
                        type="button"
                        onClick={() => navigate('/admin/office-staff')}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
                    >
                        {loading ? 'Adding...' : 'Add Staff'}
                    </button>
                </div>
            </form>
        </div>
    );
}