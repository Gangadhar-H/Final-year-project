// src/pages/teacher/InternalMarks.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getAssignedSubjects } from '../../services/teacherService';
import {
    getInternalMarks,
    deleteInternalMarks,
    handleApiError,
    formatMarksForDisplay
} from '../../services/internalMarksService';
import InternalMarksForm from '../../components/teacher/InternalMarksForm';
import InternalMarksTable from '../../components/teacher/InternalMarksTable';

const InternalMarks = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    // State management
    const [subjects, setSubjects] = useState([]);
    const [selectedSubject, setSelectedSubject] = useState(null);
    const [selectedDivision, setSelectedDivision] = useState('');
    const [selectedExamType, setSelectedExamType] = useState('');
    const [marks, setMarks] = useState([]);
    const [students, setStudents] = useState([]);
    const [statistics, setStatistics] = useState(null);

    // UI state
    const [loading, setLoading] = useState(false);
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingMark, setEditingMark] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Filter state
    const [filters, setFilters] = useState({
        division: '',
        examType: '',
        studentSearch: ''
    });

    const examTypes = [
        'Internal 1',
        'Internal 2',
        'Internal 3',
        'Assignment',
        'Quiz',
        'Project'
    ];

    const divisions = ['A', 'B', 'C'];

    // Load assigned subjects on component mount
    useEffect(() => {
        loadAssignedSubjects();
    }, []);

    // Load marks when subject/filters change
    useEffect(() => {
        if (selectedSubject) {
            loadMarks();
        }
    }, [selectedSubject, filters.division, filters.examType]);

    const loadAssignedSubjects = async () => {
        try {
            setLoading(true);
            const response = await getAssignedSubjects();
            if (response.assignedSubjects && Array.isArray(response.assignedSubjects)) {
                setSubjects(response.assignedSubjects);
            } else {
                setError('Failed to fetch assigned subjects');
            }
        } catch (error) {
            const errorInfo = handleApiError(error);
            setError(errorInfo.message);
        } finally {
            setLoading(false);
        }
    };

    const loadMarks = async () => {
        if (!selectedSubject) return;

        try {
            setLoading(true);
            setError('');

            const params = {};
            if (filters.division) params.division = filters.division;
            if (filters.examType) params.examType = filters.examType;

            const response = await getInternalMarks(selectedSubject._id, params);

            if (response.marks) {
                const formattedMarks = formatMarksForDisplay(response.marks);
                setMarks(formattedMarks);
                setStatistics(response.statistics);
            }
        } catch (error) {
            const errorInfo = handleApiError(error);
            setError(errorInfo.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSubjectSelect = (subject) => {
        setSelectedSubject(subject);
        setMarks([]);
        setStatistics(null);
        setFilters({ division: '', examType: '', studentSearch: '' });
        setShowAddForm(false);
        setEditingMark(null);
        setError('');
        setSuccess('');
    };

    const handleFilterChange = (filterType, value) => {
        setFilters(prev => ({
            ...prev,
            [filterType]: value
        }));
    };

    const handleAddMarks = () => {
        if (!selectedSubject) {
            setError('Please select a subject first');
            return;
        }
        setShowAddForm(true);
        setEditingMark(null);
        setError('');
        setSuccess('');
    };

    const handleEditMark = (mark) => {
        setEditingMark(mark);
        setShowAddForm(true);
        setError('');
        setSuccess('');
    };

    const handleDeleteMark = async (markId) => {
        if (!window.confirm('Are you sure you want to delete this mark? This action cannot be undone.')) {
            return;
        }

        try {
            setLoading(true);
            await deleteInternalMarks(markId);
            setSuccess('Mark deleted successfully');
            loadMarks(); // Reload the marks
        } catch (error) {
            const errorInfo = handleApiError(error);
            setError(errorInfo.message);
        } finally {
            setLoading(false);
        }
    };

    const handleFormSubmit = async (formData) => {
        try {
            setLoading(true);
            setError('');

            // The form component will handle the API call
            // We just need to reload marks after successful submission
            setSuccess(editingMark ? 'Marks updated successfully' : 'Marks added successfully');
            setShowAddForm(false);
            setEditingMark(null);
            loadMarks();
        } catch (error) {
            const errorInfo = handleApiError(error);
            setError(errorInfo.message);
        } finally {
            setLoading(false);
        }
    };

    const handleFormCancel = () => {
        setShowAddForm(false);
        setEditingMark(null);
        setError('');
    };

    const clearMessages = () => {
        setError('');
        setSuccess('');
    };

    // Filter marks based on student search
    const filteredMarks = marks.filter(mark => {
        if (!filters.studentSearch) return true;
        const searchTerm = filters.studentSearch.toLowerCase();
        return (
            mark.student?.name?.toLowerCase().includes(searchTerm) ||
            mark.student?.uucmsNo?.toLowerCase().includes(searchTerm)
        );
    });

    // Group marks by exam type for better display
    const groupedMarks = filteredMarks.reduce((groups, mark) => {
        const examType = mark.examType;
        if (!groups[examType]) {
            groups[examType] = [];
        }
        groups[examType].push(mark);
        return groups;
    }, {});

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Internal Marks Management</h1>
                <p className="text-gray-600 mt-2">
                    Manage internal assessment marks for your assigned subjects
                </p>
            </div>

            {/* Error/Success Messages */}
            {error && (
                <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex justify-between items-center">
                    <span>{error}</span>
                    <button onClick={clearMessages} className="text-red-700 hover:text-red-900">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            )}

            {success && (
                <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md flex justify-between items-center">
                    <span>{success}</span>
                    <button onClick={clearMessages} className="text-green-700 hover:text-green-900">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            )}

            {/* Subject Selection */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Select Subject</h2>

                {loading && !selectedSubject ? (
                    <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <span className="ml-2 text-gray-600">Loading subjects...</span>
                    </div>
                ) : subjects.length === 0 ? (
                    <div className="text-center py-8">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No subjects assigned</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            You don't have any subjects assigned yet. Please contact your administrator.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {subjects.map((subjectAssignment) => (
                            <div
                                key={`${subjectAssignment.subjectId}-${subjectAssignment.division}`}
                                onClick={() => handleSubjectSelect(subjectAssignment.subjectId)}
                                className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md ${selectedSubject?._id === subjectAssignment.subjectId
                                    ? 'border-blue-500 bg-blue-50 shadow-md'
                                    : 'border-gray-200 hover:border-gray-300'
                                    }`}
                            >
                                <h3 className="font-semibold text-gray-900">
                                    {subjectAssignment.subjectId.subjectName}
                                </h3>
                                <p className="text-sm text-gray-600">
                                    Code: {subjectAssignment.subjectId.subjectCode}
                                </p>
                                <p className="text-sm text-gray-600">
                                    Division: {subjectAssignment.division}
                                </p>
                                {subjectAssignment.subjectId.semester && (
                                    <p className="text-sm text-gray-600">
                                        Semester: {subjectAssignment.subjectId.semester.semesterNumber}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Main Content - Show only when subject is selected */}
            {selectedSubject && !showAddForm && (
                <>
                    {/* Filters and Actions */}
                    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                            {/* Filters */}
                            <div className="flex flex-col sm:flex-row gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Division
                                    </label>
                                    <select
                                        value={filters.division}
                                        onChange={(e) => handleFilterChange('division', e.target.value)}
                                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">All Divisions</option>
                                        {divisions.map(division => (
                                            <option key={division} value={division}>{division}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Exam Type
                                    </label>
                                    <select
                                        value={filters.examType}
                                        onChange={(e) => handleFilterChange('examType', e.target.value)}
                                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">All Exam Types</option>
                                        {examTypes.map(type => (
                                            <option key={type} value={type}>{type}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Search Student
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Name or UUCMS No..."
                                        value={filters.studentSearch}
                                        onChange={(e) => handleFilterChange('studentSearch', e.target.value)}
                                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2">
                                <button
                                    onClick={handleAddMarks}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                                >
                                    <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                    Add Marks
                                </button>

                                <button
                                    onClick={() => navigate(`/teacher/student-performance?subject=${selectedSubject._id}`)}
                                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-200"
                                >
                                    <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                    Performance
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Statistics */}
                    {statistics && (
                        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Class Statistics</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-blue-50 p-4 rounded-lg">
                                    <p className="text-sm text-blue-600 font-medium">Total Students</p>
                                    <p className="text-2xl font-bold text-blue-900">{statistics.totalStudents}</p>
                                </div>
                                <div className="bg-green-50 p-4 rounded-lg">
                                    <p className="text-sm text-green-600 font-medium">Average Marks</p>
                                    <p className="text-2xl font-bold text-green-900">{statistics.averageMarks}</p>
                                </div>
                                <div className="bg-purple-50 p-4 rounded-lg">
                                    <p className="text-sm text-purple-600 font-medium">Average Percentage</p>
                                    <p className="text-2xl font-bold text-purple-900">{statistics.averagePercentage}%</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Marks Display */}
                    {loading ? (
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <div className="flex items-center justify-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                <span className="ml-2 text-gray-600">Loading marks...</span>
                            </div>
                        </div>
                    ) : filteredMarks.length === 0 ? (
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <div className="text-center py-8">
                                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <h3 className="mt-2 text-sm font-medium text-gray-900">No marks found</h3>
                                <p className="mt-1 text-sm text-gray-500">
                                    {filters.division || filters.examType || filters.studentSearch
                                        ? 'No marks match your current filters. Try adjusting the filters or add new marks.'
                                        : 'No marks have been added for this subject yet. Click "Add Marks" to get started.'
                                    }
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {Object.entries(groupedMarks).map(([examType, examMarks]) => (
                                <div key={examType} className="bg-white rounded-lg shadow-md">
                                    <div className="p-4 border-b border-gray-200">
                                        <h3 className="text-lg font-semibold text-gray-900">
                                            {examType} ({examMarks.length} students)
                                        </h3>
                                    </div>
                                    <InternalMarksTable
                                        marks={examMarks}
                                        onEdit={handleEditMark}
                                        onDelete={handleDeleteMark}
                                        loading={loading}
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}

            {/* Add/Edit Form */}
            {showAddForm && selectedSubject && (
                <InternalMarksForm
                    subject={selectedSubject}
                    students={students}
                    onSubmit={handleFormSubmit}
                    onCancel={handleFormCancel}
                    loading={loading}
                    initialData={editingMark}
                />
            )}
        </div>
    );
};

export default InternalMarks;