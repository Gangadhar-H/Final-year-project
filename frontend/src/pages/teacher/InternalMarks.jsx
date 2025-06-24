import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAssignedSubjects } from '../../services/teacherService';
import { getInternalMarks, updateInternalMarks, deleteInternalMarks } from '../../services/internalMarksService';

function InternalMarks() {
    const [subjects, setSubjects] = useState([]);
    const [selectedSubject, setSelectedSubject] = useState('');
    const [selectedDivision, setSelectedDivision] = useState('');
    const [selectedExamType, setSelectedExamType] = useState('');
    const [marks, setMarks] = useState([]);
    const [statistics, setStatistics] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Edit Modal States
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editingMark, setEditingMark] = useState(null);
    const [editFormData, setEditFormData] = useState({
        obtainedMarks: '',
        maxMarks: '',
        examDate: '',
        remarks: ''
    });
    const [editLoading, setEditLoading] = useState(false);

    // Delete Confirmation States
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [deletingMark, setDeletingMark] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    const examTypes = ["Internal 1", "Internal 2", "Internal 3", "Assignment", "Quiz", "Project"];

    useEffect(() => {
        fetchAssignedSubjects();
    }, []);

    const fetchAssignedSubjects = async () => {
        try {
            const response = await getAssignedSubjects();
            setSubjects(response.assignedSubjects || []);
        } catch (error) {
            setError('Failed to load assigned subjects');
            console.error('Error fetching subjects:', error);
        }
    };

    const handleSubjectChange = (subjectId) => {
        setSelectedSubject(subjectId);
        setSelectedDivision('');
        setSelectedExamType('');
        setMarks([]);
        setStatistics(null);
    };

    const handleSearch = async () => {
        if (!selectedSubject) {
            setError('Please select a subject');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const params = {};
            if (selectedDivision) params.division = selectedDivision;
            if (selectedExamType) params.examType = selectedExamType;

            const response = await getInternalMarks(selectedSubject, params);
            setMarks(response.marks || []);
            setStatistics(response.statistics || null);
        } catch (error) {
            setError('Failed to load internal marks');
            console.error('Error fetching marks:', error);
        } finally {
            setLoading(false);
        }
    };

    // Edit Functions
    const handleEditClick = (mark) => {
        setEditingMark(mark);
        setEditFormData({
            obtainedMarks: mark.obtainedMarks,
            maxMarks: mark.maxMarks,
            examDate: new Date(mark.examDate).toISOString().split('T')[0],
            remarks: mark.remarks || ''
        });
        setEditModalOpen(true);
    };

    const handleEditFormChange = (e) => {
        const { name, value } = e.target;
        setEditFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (editFormData.obtainedMarks < 0 || editFormData.obtainedMarks > editFormData.maxMarks) {
            setError('Obtained marks should be between 0 and maximum marks');
            return;
        }

        setEditLoading(true);
        setError('');

        try {
            await updateInternalMarks(editingMark._id, editFormData);
            setEditModalOpen(false);
            setEditingMark(null);
            setEditFormData({
                obtainedMarks: '',
                maxMarks: '',
                examDate: '',
                remarks: ''
            });
            // Refresh the marks list
            handleSearch();
        } catch (error) {
            setError('Failed to update internal marks');
            console.error('Error updating marks:', error);
        } finally {
            setEditLoading(false);
        }
    };

    const handleEditCancel = () => {
        setEditModalOpen(false);
        setEditingMark(null);
        setEditFormData({
            obtainedMarks: '',
            maxMarks: '',
            examDate: '',
            remarks: ''
        });
    };

    // Delete Functions
    const handleDeleteClick = (mark) => {
        setDeletingMark(mark);
        setDeleteConfirmOpen(true);
    };

    const handleDeleteConfirm = async () => {
        setDeleteLoading(true);
        setError('');

        try {
            await deleteInternalMarks(deletingMark._id);
            setDeleteConfirmOpen(false);
            setDeletingMark(null);
            // Refresh the marks list
            handleSearch();
        } catch (error) {
            setError('Failed to delete internal marks');
            console.error('Error deleting marks:', error);
        } finally {
            setDeleteLoading(false);
        }
    };

    const handleDeleteCancel = () => {
        setDeleteConfirmOpen(false);
        setDeletingMark(null);
    };

    const getSubjectDetails = (subjectId) => {
        return subjects.find(sub => sub.subjectId._id === subjectId);
    };

    const getAvailableDivisions = () => {
        if (!selectedSubject) return [];
        const subjectDetails = getSubjectDetails(selectedSubject);
        return subjectDetails ? [subjectDetails.division] : [];
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-IN');
    };

    const calculatePercentage = (obtained, max) => {
        return ((obtained / max) * 100).toFixed(2);
    };

    const getGrade = (percentage) => {
        if (percentage >= 90) return 'A+';
        if (percentage >= 80) return 'A';
        if (percentage >= 70) return 'B+';
        if (percentage >= 60) return 'B';
        if (percentage >= 50) return 'C';
        if (percentage >= 40) return 'D';
        return 'F';
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Internal Marks Management</h1>
                    <p className="text-gray-600">Manage and view internal examination marks for your subjects</p>
                </div>

                <div className="mb-2">
                    <Link
                        to={`/teacher/student-performance`}
                        className="inline-flex items-center px-4 py-2 bg-orange-300 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                        Student Performance
                    </Link>
                </div>
            </div>

            {/* Search Filters */}
            <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Search Internal Marks</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    {/* Subject Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Subject <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={selectedSubject}
                            onChange={(e) => handleSubjectChange(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Select Subject</option>
                            {subjects.map((subject) => (
                                <option key={subject.subjectId._id} value={subject.subjectId._id}>
                                    {subject.subjectId.subjectName} ({subject.subjectId.subjectCode})
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Division Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Division</label>
                        <select
                            value={selectedDivision}
                            onChange={(e) => setSelectedDivision(e.target.value)}
                            disabled={!selectedSubject}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                        >
                            <option value="">All Divisions</option>
                            {getAvailableDivisions().map((division) => (
                                <option key={division} value={division}>
                                    {division}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Exam Type Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Exam Type</label>
                        <select
                            value={selectedExamType}
                            onChange={(e) => setSelectedExamType(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">All Exam Types</option>
                            {examTypes.map((type) => (
                                <option key={type} value={type}>
                                    {type}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Search Button */}
                    <div className="flex items-end">
                        <button
                            onClick={handleSearch}
                            disabled={loading || !selectedSubject}
                            className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Searching...' : 'Search'}
                        </button>
                    </div>
                </div>

                {/* Add Marks Button */}
                {selectedSubject && (
                    <div className="flex justify-end">
                        <Link
                            to={`/teacher/add-internal-marks/${selectedSubject}`}
                            className="inline-flex items-center px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            Add Marks
                        </Link>
                    </div>
                )}
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
                    <div className="flex">
                        <svg className="w-5 h-5 text-red-400 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-red-800">{error}</p>
                    </div>
                </div>
            )}

            {/* Statistics */}
            {statistics && (
                <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
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

            {/* Marks Table */}
            {marks.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900">Internal Marks ({marks.length} records)</h3>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Student
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        UUCMS No
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Exam Type
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Marks
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Percentage
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Grade
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Exam Date
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
                                {marks.map((mark) => {
                                    const percentage = calculatePercentage(mark.obtainedMarks, mark.maxMarks);
                                    const grade = getGrade(parseFloat(percentage));

                                    return (
                                        <tr key={mark._id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {mark.student.name}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {mark.student.uucmsNo}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                                    {mark.examType}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {mark.obtainedMarks}/{mark.maxMarks}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {percentage}%
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${grade === 'A+' || grade === 'A' ? 'bg-green-100 text-green-800' :
                                                    grade === 'B+' || grade === 'B' ? 'bg-yellow-100 text-yellow-800' :
                                                        grade === 'C' || grade === 'D' ? 'bg-orange-100 text-orange-800' :
                                                            'bg-red-100 text-red-800'
                                                    }`}>
                                                    {grade}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {formatDate(mark.examDate)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {mark.division}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={() => handleEditClick(mark)}
                                                        className="text-indigo-600 hover:text-indigo-900 inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                                    >
                                                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                        </svg>
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteClick(mark)}
                                                        className="text-red-600 hover:text-red-900 inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                                    >
                                                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* No Data Message */}
            {!loading && marks.length === 0 && selectedSubject && (
                <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0118 12a8 8 0 01-2.009 5.291" />
                    </svg>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Internal Marks Found</h3>
                    <p className="text-gray-500 mb-4">
                        No internal marks found for the selected criteria. Start by adding marks for your students.
                    </p>
                    {selectedSubject && (
                        <Link
                            to={`/teacher/add-internal-marks/${selectedSubject}`}
                            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            Add Internal Marks
                        </Link>
                    )}
                </div>
            )}

            {/* Edit Modal */}
            {editModalOpen && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                        <div className="mt-3">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Edit Internal Marks</h3>

                            <form onSubmit={handleEditSubmit}>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Student: {editingMark?.student?.name}
                                    </label>
                                    <p className="text-sm text-gray-500">UUCMS: {editingMark?.student?.uucmsNo}</p>
                                </div>

                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Exam Type: {editingMark?.examType}
                                    </label>
                                </div>

                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Maximum Marks <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        name="maxMarks"
                                        value={editFormData.maxMarks}
                                        onChange={handleEditFormChange}
                                        min="1"
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Obtained Marks <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        name="obtainedMarks"
                                        value={editFormData.obtainedMarks}
                                        onChange={handleEditFormChange}
                                        min="0"
                                        max={editFormData.maxMarks}
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Exam Date <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        name="examDate"
                                        value={editFormData.examDate}
                                        onChange={handleEditFormChange}
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Remarks
                                    </label>
                                    <textarea
                                        name="remarks"
                                        value={editFormData.remarks}
                                        onChange={handleEditFormChange}
                                        rows="3"
                                        maxLength="500"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Optional remarks..."
                                    />
                                </div>

                                <div className="flex justify-end space-x-3">
                                    <button
                                        type="button"
                                        onClick={handleEditCancel}
                                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={editLoading}
                                        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-blue-300"
                                    >
                                        {editLoading ? 'Updating...' : 'Update'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteConfirmOpen && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                        <div className="mt-3 text-center">
                            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                                <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Internal Marks</h3>
                            <p className="text-sm text-gray-500 mb-4">
                                Are you sure you want to delete the internal marks for{' '}
                                <span className="font-semibold">{deletingMark?.student?.name}</span>?
                                This action cannot be undone.
                            </p>
                            <div className="bg-gray-50 p-3 rounded-md mb-4">
                                <p className="text-sm text-gray-700">
                                    <span className="font-medium">Student:</span> {deletingMark?.student?.name}
                                </p>
                                <p className="text-sm text-gray-700">
                                    <span className="font-medium">Exam Type:</span> {deletingMark?.examType}
                                </p>
                                <p className="text-sm text-gray-700">
                                    <span className="font-medium">Marks:</span> {deletingMark?.obtainedMarks} / {deletingMark?.maxMarks}
                                </p>
                                <p className="text-sm text-gray-700">
                                    <span className="font-medium">Exam Date:</span> {deletingMark?.examDate}
                                </p>
                                {deletingMark?.remarks && (
                                    <p className="text-sm text-gray-700">
                                        <span className="font-medium">Remarks:</span> {deletingMark.remarks}
                                    </p>
                                )}
                            </div>
                            <div className="flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={handleDeleteCancel}
                                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleDeleteConfirm}
                                    disabled={deleteLoading}
                                    className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:bg-red-300"
                                >
                                    {deleteLoading ? 'Deleting...' : 'Delete'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default InternalMarks;