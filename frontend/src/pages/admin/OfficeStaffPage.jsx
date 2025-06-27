import React from 'react';
import { Link } from 'react-router-dom';
import OfficeStaffList from '../../components/office/OfficeStaffList';

export default function OfficeStaffPage() {
    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Office Staff Management</h1>
                <Link
                    to="/admin/office-staff/add"
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium"
                >
                    Add New Staff
                </Link>
            </div>
            <OfficeStaffList />
        </div>
    );
}