// src/components/teacher/InternalMarksTable.jsx
import { useState } from 'react';
import { calculatePercentage, calculateGrade, formatMarksForDisplay } from '../../services/internalMarksService';

const InternalMarksTable = ({
    marks = [],
    subject,
    onEdit,
    onDelete,
    onViewStudent,
    loading = false,
    statistics = null
}) => {
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
    const [filterConfig, setFilterConfig] = useState({
        division: '',
        examType: '',
        search: ''
    });
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    // Get unique values for filters
    const divisions = [...new Set(marks.map(mark => mark.division))].sort();
    const examTypes = [...new Set(marks.map(mark => mark.examType))].sort();

    // Sort and filter marks
    const processedMarks = () => {
        let filtered = marks;

        // Apply filters
        if (filterConfig.division) {
            filtered = filtered.filter(mark => mark.division === filterConfig.division);
        }
        if (filterConfig.examType) {
            filtered = filtered.filter(mark => mark.examType === filterConfig.examType);
        }
        if (filterConfig.search) {
            const searchLower = filterConfig.search.toLowerCase();
            filtered = filtered.filter(mark =>
                mark.student.name.toLowerCase().includes(searchLower) ||
                mark.student.uucmsNo.toLowerCase().includes(searchLower)
            );
        }

        // Apply sorting
        if (sortConfig.key) {
            filtered.sort((a, b) => {
                let aValue, bValue;

                switch (sortConfig.key) {
                    case 'studentName':
                        aValue = a.student.name;
                        bValue = b.student.name;
                        break;
                    case 'uucmsNo':
                        aValue = a.student.uucmsNo;
                        bValue = b.student.uucmsNo;
                        break;
                    case 'obtainedMarks':
                        aValue = a.obtainedMarks;
                        bValue = b.obtainedMarks;
                        break;
                    case 'percentage':
                        aValue = (a.obtainedMarks / a.maxMarks) * 100;
                        bValue = (b.obtainedMarks / b.maxMarks) * 100;
                        break;
                    case 'examDate':
                        aValue = new Date(a.examDate);
                        bValue = new Date(b.examDate);
                        break;
                    default:
                        aValue = a[sortConfig.key];
                        bValue = b[sortConfig.key];
                }

                if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }

        return formatMarksForDisplay(filtered);
    };

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const handleFilterChange = (field, value) => {
        setFilterConfig(prev => ({ ...prev, [field]: value }));
    };

    const clearFilters = () => {
        setFilterConfig({ division: '', examType: '', search: '' });
    };

    const handleDeleteClick = (markId) => {
        setDeleteConfirm(markId);
    };

    const confirmDelete = () => {
        if (deleteConfirm && onDelete) {
            onDelete(deleteConfirm);
            setDeleteConfirm(null);
        }
    };

    const cancelDelete = () => {
        setDeleteConfirm(null);
    };

    const getGradeBadgeColor = (grade) => {
        switch (grade) {
            case 'A+': return 'bg-green-100 text-green-800';
            case 'A': return 'bg-green-100 text-green-700';
            case 'B+': return 'bg-blue-100 text-blue-800';
            case 'B': return 'bg-blue-100 text-blue-700';
            case 'C': return 'bg-yellow-100 text-yellow-800';
            case 'D': return 'bg-orange-100 text-orange-800';
            case 'F': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const SortIcon = ({ column }) => {
        if (sortConfig.key !== column) {
            return (
                <svg className="w-4 h-4 ml-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                </svg>
            );
        }
        return sortConfig.direction === 'asc' ? (
            <svg className="w-4 h-4 ml-1 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
        ) : (
            <svg className="w-4 h-4 ml-1 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
        );
    };

    const filteredMarks = processedMarks();

    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow-md p-6">
                <div className="animate-pulse space-y-4">
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="space-y-2">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="h-4 bg-gray-200 rounded"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-md">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900">Internal Marks</h2>
                        {subject && (
                            <p className="text-sm text-gray-600 mt-1">
                                {subject.subjectName} ({subject.subjectCode})
                            </p>
                        )}
                    </div>
                    <div className="mt-3 sm:mt-0">
                        <span className="text-sm text-gray-500">
                            Total Records: {filteredMarks.length}
                        </span>
                    </div>
                </div>
            </div>

            {/* Statistics */}
            {statistics && (
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">{statistics.averageMarks}</div>
                            <div className="text-sm text-gray-600">Average Marks</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">{statistics.averagePercentage}%</div>
                            <div className="text-sm text-gray-600">Average Percentage</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-purple-600">{statistics.totalStudents}</div>
                            <div className="text-sm text-gray-600">Total Students</div>
                        </div>
                    </div>
                </div>
            )}

            {/* Filters */}
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Division</label>
                        <select
                            value={filterConfig.division}
                            onChange={(e) => handleFilterChange('division', e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                            <option value="">All Divisions</option>
                            {divisions.map(division => (
                                <option key={division} value={division}>{division}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Exam Type</label>
                        <select
                            value={filterConfig.examType}
                            onChange={(e) => handleFilterChange('examType', e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                            <option value="">All Exam Types</option>
                            {examTypes.map(examType => (
                                <option key={examType} value={examType}>{examType}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Search Student</label>
                        <input
                            type="text"
                            placeholder="Name or UUCMS No"
                            value={filterConfig.search}
                            onChange={(e) => handleFilterChange('search', e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                    </div>
                    <div className="flex items-end">
                        <button
                            onClick={clearFilters}
                            className="w-full px-3 py-2 text-sm bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-500"
                        >
                            Clear Filters
                        </button>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                {filteredMarks.length === 0 ? (
                    <div className="px-6 py-12 text-center">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No marks found</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            {marks.length === 0 ? 'No marks have been added yet.' : 'No marks match the current filters.'}
                        </p>
                    </div>
                ) : (
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                    onClick={() => handleSort('studentName')}
                                >
                                    <div className="flex items-center">
                                        Student Name
                                        <SortIcon column="studentName" />
                                    </div>
                                </th>
                                <th
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                    onClick={() => handleSort('uucmsNo')}
                                >
                                    <div className="flex items-center">
                                        UUCMS No
                                        <SortIcon column="uucmsNo" />
                                    </div>
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Division
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Exam Type
                                </th>
                                <th
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                    onClick={() => handleSort('obtainedMarks')}
                                >
                                    <div className="flex items-center">
                                        Marks
                                        <SortIcon column="obtainedMarks" />
                                    </div>
                                </th>
                                <th
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                    onClick={() => handleSort('percentage')}
                                >
                                    <div className="flex items-center">
                                        Percentage
                                        <SortIcon column="percentage" />
                                    </div>
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Grade
                                </th>
                                <th
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                    onClick={() => handleSort('examDate')}
                                >
                                    <div className="flex items-center">
                                        Exam Date
                                        <SortIcon column="examDate" />
                                    </div>
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredMarks.map((mark) => (
                                <tr key={mark._id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {mark.student.name}
                                                </div>
                                                {mark.student.email && (
                                                    <div className="text-sm text-gray-500">
                                                        {mark.student.email}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {mark.student.uucmsNo}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                            {mark.division}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                            {mark.examType}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        <span className="font-medium">{mark.obtainedMarks}</span>
                                        <span className="text-gray-500">/{mark.maxMarks}</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {mark.percentage}%
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getGradeBadgeColor(mark.grade)}`}>
                                            {mark.grade}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {mark.formattedDate}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex space-x-2">
                                            {onViewStudent && (
                                                <button
                                                    onClick={() => onViewStudent(mark.student._id)}
                                                    className="text-blue-600 hover:text-blue-900"
                                                    title="View Student Performance"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                    </svg>
                                                </button>
                                            )}
                                            {onEdit && (
                                                <button
                                                    onClick={() => onEdit(mark)}
                                                    className="text-indigo-600 hover:text-indigo-900"
                                                    title="Edit Marks"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                </button>
                                            )}
                                            {onDelete && (
                                                <button
                                                    onClick={() => handleDeleteClick(mark._id)}
                                                    className="text-red-600 hover:text-red-900"
                                                    title="Delete Marks"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            {deleteConfirm && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                        <div className="mt-3 text-center">
                            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                                <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mt-2">Delete Internal Marks</h3>
                            <div className="mt-2 px-4 py-3">
                                <p className="text-sm text-gray-500">
                                    Are you sure you want to delete these marks? This action cannot be undone.
                                </p>
                            </div>
                            <div className="flex justify-center space-x-4 px-4 py-3">
                                <button
                                    onClick={cancelDelete}
                                    className="px-4 py-2 bg-white text-gray-500 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
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
};

export default InternalMarksTable;