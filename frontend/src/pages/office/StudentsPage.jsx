import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import officeService from '../../services/officeService';
import AddStudent from '../../components/office/AddStudent';
import BulkUploadStudents from '../../components/office/BulkUploadStudents';

const StudentsPage = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // State management
    const [students, setStudents] = useState([]);
    const [semesters, setSemesters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchLoading, setSearchLoading] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showBulkUpload, setShowBulkUpload] = useState(false);

    // Filters and pagination
    const [filters, setFilters] = useState({
        search: '',
        semester: '',
        division: '',
        page: 1,
        limit: 20
    });

    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 0,
        totalStudents: 0,
        hasMore: false
    });

    // Success message from navigation state
    const [successMessage, setSuccessMessage] = useState(location.state?.message || '');

    useEffect(() => {
        fetchSemesters();
        fetchStudents();
    }, []);

    useEffect(() => {
        fetchStudents();
    }, [filters.page, filters.limit]);

    // Clear success message after 5 seconds
    useEffect(() => {
        if (successMessage) {
            const timer = setTimeout(() => {
                setSuccessMessage('');
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [successMessage]);

    const fetchSemesters = async () => {
        try {
            const response = await officeService.getSemesters();
            setSemesters(response.semesters || []);
        } catch (error) {
            console.error('Error fetching semesters:', error);
        }
    };

    const fetchStudents = async () => {
        const loadingState = filters.page === 1 ? setLoading : setSearchLoading;
        loadingState(true);

        try {
            const response = await officeService.getStudents(filters);
            setStudents(response.students || []);
            setPagination(response.pagination || {});
        } catch (error) {
            console.error('Error fetching students:', error);
            alert(error.message || 'Failed to fetch students');
        } finally {
            loadingState(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setFilters(prev => ({ ...prev, page: 1 }));
        fetchStudents();
    };

    const handleFilterChange = (name, value) => {
        setFilters(prev => ({
            ...prev,
            [name]: value,
            page: 1 // Reset to first page when filtering
        }));
    };

    const handlePageChange = (newPage) => {
        setFilters(prev => ({ ...prev, page: newPage }));
    };

    const handleDeleteStudent = async (studentId, studentName) => {
        if (!window.confirm(`Are you sure you want to delete ${studentName}? This action cannot be undone.`)) {
            return;
        }

        setDeleteLoading(studentId);
        try {
            await officeService.deleteStudent(studentId);
            setSuccessMessage('Student deleted successfully');
            fetchStudents(); // Refresh the list
        } catch (error) {
            alert(error.message || 'Failed to delete student');
        } finally {
            setDeleteLoading(null);
        }
    };

    const handleAddStudentSuccess = (newStudent) => {
        setShowAddModal(false);
        setSuccessMessage('Student added successfully');
        fetchStudents(); // Refresh the list
    };

    const clearFilters = () => {
        setFilters({
            search: '',
            semester: '',
            division: '',
            page: 1,
            limit: 20
        });
        setTimeout(fetchStudents, 100);
    };

    const divisions = ['A', 'B', 'C', 'D'];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Success Message */}
            {successMessage && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg flex items-center justify-between">
                    <span>{successMessage}</span>
                    <button
                        onClick={() => setSuccessMessage('')}
                        className="text-green-700 hover:text-green-900"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            )}

            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Student Management</h1>
                    <p className="text-gray-600">Manage student records and information</p>
                </div>
                <div className="flex space-x-3">
                    <Link
                        to='/office/students/bulk-upload'
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
                    >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        Bulk Upload
                    </Link>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                    >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add Student
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Filters & Search</h3>

                <form onSubmit={handleSearch} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {/* Search */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Search Students
                            </label>
                            <input
                                type="text"
                                value={filters.search}
                                onChange={(e) => handleFilterChange('search', e.target.value)}
                                placeholder="Search by name, UUCMS No, or email..."
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        {/* Semester Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Semester
                            </label>
                            <select
                                value={filters.semester}
                                onChange={(e) => handleFilterChange('semester', e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="">All Semesters</option>
                                {semesters.map((semester) => (
                                    <option key={semester._id} value={semester.semesterNumber}>
                                        Semester {semester.semesterNumber}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Division Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Division
                            </label>
                            <select
                                value={filters.division}
                                onChange={(e) => handleFilterChange('division', e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="">All Divisions</option>
                                {divisions.map((division) => (
                                    <option key={division} value={division}>
                                        Division {division}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-between">
                        <div className="flex space-x-3">
                            <button
                                type="submit"
                                disabled={searchLoading}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
                            >
                                {searchLoading && (
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                )}
                                Search
                            </button>
                            <button
                                type="button"
                                onClick={clearFilters}
                                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Clear Filters
                            </button>
                        </div>

                        {/* Results Count */}
                        <div className="text-sm text-gray-600">
                            Showing {students.length} of {pagination.totalStudents} students
                        </div>
                    </div>
                </form>
            </div>

            {/* Students Table */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                {students.length === 0 ? (
                    <div className="p-8 text-center">
                        <div className="text-gray-400 mb-4">
                            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No Students Found</h3>
                        <p className="text-gray-600 mb-4">
                            {filters.search || filters.semester || filters.division
                                ? 'No students match your current filters.'
                                : 'Get started by adding your first student.'}
                        </p>
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Add First Student
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Student Details
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            UUCMS No
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Semester
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Division
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {students.map((student) => {
                                        const formattedStudent = officeService.formatStudentData(student);
                                        return (
                                            <tr key={student._id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {student.name}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            {formattedStudent.formattedEmail}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {student.uucmsNo}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {formattedStudent.semesterText}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                        Division {student.division}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <div className="flex items-center space-x-3">
                                                        <Link
                                                            to={`/office/students/${student._id}`}
                                                            className="text-blue-600 hover:text-blue-900 transition-colors"
                                                        >
                                                            View
                                                        </Link>
                                                        <Link
                                                            to={`/office/students/${student._id}/edit`}
                                                            className="text-green-600 hover:text-green-900 transition-colors"
                                                        >
                                                            Edit
                                                        </Link>
                                                        <button
                                                            onClick={() => handleDeleteStudent(student._id, student.name)}
                                                            disabled={deleteLoading === student._id}
                                                            className="text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                        >
                                                            {deleteLoading === student._id ? 'Deleting...' : 'Delete'}
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {pagination.totalPages > 1 && (
                            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                                <div className="text-sm text-gray-700">
                                    Page {pagination.currentPage} of {pagination.totalPages}
                                </div>
                                <div className="flex items-center space-x-2">
                                    <button
                                        onClick={() => handlePageChange(pagination.currentPage - 1)}
                                        disabled={pagination.currentPage === 1}
                                        className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        Previous
                                    </button>

                                    {/* Page Numbers */}
                                    {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, index) => {
                                        const startPage = Math.max(1, pagination.currentPage - 2);
                                        const pageNumber = startPage + index;

                                        if (pageNumber > pagination.totalPages) return null;

                                        return (
                                            <button
                                                key={pageNumber}
                                                onClick={() => handlePageChange(pageNumber)}
                                                className={`px-3 py-2 rounded-lg transition-colors ${pageNumber === pagination.currentPage
                                                    ? 'bg-blue-600 text-white'
                                                    : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                                                    }`}
                                            >
                                                {pageNumber}
                                            </button>
                                        );
                                    })}

                                    <button
                                        onClick={() => handlePageChange(pagination.currentPage + 1)}
                                        disabled={pagination.currentPage === pagination.totalPages}
                                        className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Add Student Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto">
                        <div className="p-6">
                            <AddStudent
                                isModal={true}
                                onSuccess={handleAddStudentSuccess}
                                onCancel={() => setShowAddModal(false)}
                            />
                        </div>
                    </div>
                </div>
            )}
            {/* Bulk Upload Modal */}
            {/* {showBulkUpload && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto">
                        <div className="p-6">
                            <BulkUploadStudents
                                isModal={true}
                                onSuccess={() => {
                                    // Refresh students list
                                    fetchStudents();
                                    setShowBulkUpload(false);
                                }}
                                onCancel={() => setShowBulkUpload(false)}
                            />
                        </div>
                    </div>
                </div>
            )}*/}
        </div>
    );
};

export default StudentsPage;