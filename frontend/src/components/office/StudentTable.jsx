import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import officeService from '../../services/officeService';

const StudentTable = ({
    students = [],
    loading = false,
    onEdit,
    onDelete,
    onRefresh,
    pagination = {},
    filters = {},
    onFiltersChange
}) => {
    const [deleteLoading, setDeleteLoading] = useState(null);
    const [semesters, setSemesters] = useState([]);
    const [localFilters, setLocalFilters] = useState({
        search: filters.search || '',
        semester: filters.semester || '',
        division: filters.division || ''
    });

    useEffect(() => {
        fetchSemesters();
    }, []);

    const fetchSemesters = async () => {
        try {
            const response = await officeService.getSemesters();
            setSemesters(response.semesters || []);
        } catch (error) {
            console.error('Error fetching semesters:', error);
        }
    };

    const handleDelete = async (studentId, studentName) => {
        if (window.confirm(`Are you sure you want to delete ${studentName}?`)) {
            setDeleteLoading(studentId);
            try {
                await officeService.deleteStudent(studentId);
                if (onDelete) onDelete(studentId);
                if (onRefresh) onRefresh();
            } catch (error) {
                alert(error.message || 'Failed to delete student');
            } finally {
                setDeleteLoading(null);
            }
        }
    };

    const handleFilterChange = (key, value) => {
        const newFilters = { ...localFilters, [key]: value };
        setLocalFilters(newFilters);
        if (onFiltersChange) {
            onFiltersChange(newFilters);
        }
    };

    const clearFilters = () => {
        const emptyFilters = { search: '', semester: '', division: '' };
        setLocalFilters(emptyFilters);
        if (onFiltersChange) {
            onFiltersChange(emptyFilters);
        }
    };

    const getPageNumbers = () => {
        const { currentPage, totalPages } = pagination;
        const pages = [];
        const maxPagesToShow = 5;

        let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
        let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

        if (endPage - startPage + 1 < maxPagesToShow) {
            startPage = Math.max(1, endPage - maxPagesToShow + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }

        return pages;
    };

    return (
        <div className="bg-white rounded-lg shadow-md">
            {/* Filters Section */}
            <div className="p-6 border-b border-gray-200">
                <div className="flex flex-wrap gap-4 items-center justify-between">
                    <div className="flex flex-wrap gap-4 items-center">
                        {/* Search Input */}
                        <div className="flex-1 min-w-64">
                            <input
                                type="text"
                                placeholder="Search by name, UUCMS no, or email..."
                                value={localFilters.search}
                                onChange={(e) => handleFilterChange('search', e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        {/* Semester Filter */}
                        <select
                            value={localFilters.semester}
                            onChange={(e) => handleFilterChange('semester', e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="">All Semesters</option>
                            {semesters.map((sem) => (
                                <option key={sem._id} value={sem.semesterNumber}>
                                    Semester {sem.semesterNumber}
                                </option>
                            ))}
                        </select>

                        {/* Division Filter */}
                        <input
                            type="text"
                            placeholder="Division (A, B, C...)"
                            value={localFilters.division}
                            onChange={(e) => handleFilterChange('division', e.target.value.toUpperCase())}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-32"
                            maxLength={1}
                        />

                        {/* Clear Filters */}
                        <button
                            onClick={clearFilters}
                            className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            Clear Filters
                        </button>
                    </div>

                    {/* Refresh Button */}
                    <button
                        onClick={onRefresh}
                        disabled={loading}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {loading ? 'Refreshing...' : 'Refresh'}
                    </button>
                </div>
            </div>

            {/* Table Section */}
            <div className="overflow-x-auto">
                {loading ? (
                    <div className="flex justify-center items-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <span className="ml-2 text-gray-600">Loading students...</span>
                    </div>
                ) : students.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-gray-500 text-lg mb-2">No students found</div>
                        <p className="text-gray-400">Try adjusting your filters or add new students</p>
                    </div>
                ) : (
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Student Info
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Email
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Semester
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Division
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Added Date
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {students.map((student) => (
                                <tr key={student._id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div>
                                            <div className="text-sm font-medium text-gray-900">
                                                {student.name}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {student.uucmsNo}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">
                                            {student.email}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">
                                            {student.semester?.semesterNumber
                                                ? `Semester ${student.semester.semesterNumber}`
                                                : 'N/A'
                                            }
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                            {student.division}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {student.createdAt
                                            ? new Date(student.createdAt).toLocaleDateString()
                                            : 'N/A'
                                        }
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex items-center justify-end space-x-2">
                                            {/* View Details */}
                                            <Link
                                                to={`/office/students/${student._id}`}
                                                className="text-blue-600 hover:text-blue-900 transition-colors"
                                                title="View Details"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                            </Link>

                                            {/* Edit */}
                                            <button
                                                onClick={() => onEdit && onEdit(student)}
                                                className="text-indigo-600 hover:text-indigo-900 transition-colors"
                                                title="Edit Student"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                            </button>

                                            {/* Delete */}
                                            <button
                                                onClick={() => handleDelete(student._id, student.name)}
                                                disabled={deleteLoading === student._id}
                                                className="text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                title="Delete Student"
                                            >
                                                {deleteLoading === student._id ? (
                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                                                ) : (
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                )}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Pagination Section */}
            {pagination.totalPages > 1 && (
                <div className="px-6 py-4 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-700">
                            Showing {((pagination.currentPage - 1) * 50) + 1} to{' '}
                            {Math.min(pagination.currentPage * 50, pagination.totalStudents)} of{' '}
                            {pagination.totalStudents} students
                        </div>

                        <div className="flex items-center space-x-2">
                            {/* Previous Button */}
                            <button
                                onClick={() => onFiltersChange && onFiltersChange({
                                    ...localFilters,
                                    page: pagination.currentPage - 1
                                })}
                                disabled={pagination.currentPage <= 1}
                                className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Previous
                            </button>

                            {/* Page Numbers */}
                            {getPageNumbers().map((pageNum) => (
                                <button
                                    key={pageNum}
                                    onClick={() => onFiltersChange && onFiltersChange({
                                        ...localFilters,
                                        page: pageNum
                                    })}
                                    className={`px-3 py-1 text-sm border rounded-md ${pageNum === pagination.currentPage
                                            ? 'bg-blue-600 text-white border-blue-600'
                                            : 'border-gray-300 hover:bg-gray-50'
                                        }`}
                                >
                                    {pageNum}
                                </button>
                            ))}

                            {/* Next Button */}
                            <button
                                onClick={() => onFiltersChange && onFiltersChange({
                                    ...localFilters,
                                    page: pagination.currentPage + 1
                                })}
                                disabled={pagination.currentPage >= pagination.totalPages}
                                className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentTable;