import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllOfficeStaff, deleteOfficeStaff } from '../../services/adminService';

export default function OfficeStaffList() {
    const [staffList, setStaffList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    useEffect(() => {
        fetchOfficeStaff();
    }, []);

    const fetchOfficeStaff = async () => {
        try {
            setLoading(true);
            const response = await getAllOfficeStaff();
            setStaffList(response.officeStaff || []);
        } catch (err) {
            setError('Failed to fetch office staff');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            await deleteOfficeStaff(id);
            setStaffList(prev => prev.filter(staff => staff._id !== id));
            setDeleteConfirm(null);
        } catch (err) {
            setError('Failed to delete office staff');
            console.error(err);
        }
    };

    const getPermissionBadges = (permissions) => {
        const activePermissions = [];
        if (permissions.studentManagement) activePermissions.push('Student Mgmt');
        if (permissions.feeManagement) activePermissions.push('Fee Mgmt');
        if (permissions.reportGeneration) activePermissions.push('Reports');

        return activePermissions.length > 0 ? activePermissions : ['No permissions'];
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-gray-600">Loading office staff...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
            </div>
        );
    }

    return (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
            {staffList.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                    <p>No office staff found.</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Staff Details
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Designation
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Permissions
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {staffList.map((staff) => (
                                <tr key={staff._id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div>
                                            <div className="text-sm font-medium text-gray-900">
                                                {staff.name}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                ID: {staff.staffId}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {staff.email}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                            {staff.designation}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex flex-wrap gap-1">
                                            {getPermissionBadges(staff.permissions).map((permission, index) => (
                                                <span
                                                    key={index}
                                                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${permission === 'No permissions'
                                                            ? 'bg-gray-100 text-gray-800'
                                                            : 'bg-green-100 text-green-800'
                                                        }`}
                                                >
                                                    {permission}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                        <Link
                                            to={`/admin/office-staff/${staff._id}`}
                                            className="text-indigo-600 hover:text-indigo-900"
                                        >
                                            View
                                        </Link>
                                        <button
                                            onClick={() => setDeleteConfirm(staff._id)}
                                            className="text-red-600 hover:text-red-900"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteConfirm && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                        <div className="mt-3 text-center">
                            <h3 className="text-lg font-medium text-gray-900">
                                Confirm Delete
                            </h3>
                            <div className="mt-2 px-7 py-3">
                                <p className="text-sm text-gray-500">
                                    Are you sure you want to delete this office staff member?
                                    This action cannot be undone.
                                </p>
                            </div>
                            <div className="flex justify-center space-x-3 mt-4">
                                <button
                                    onClick={() => setDeleteConfirm(null)}
                                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => handleDelete(deleteConfirm)}
                                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}