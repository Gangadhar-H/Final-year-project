import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAssignedSubjects } from '../../services/teacherService';
import { getInternalMarks } from '../../services/internalMarksService';

export default function InternalMarks() {
    const [subjects, setSubjects] = useState([]);
    const [selectedSubject, setSelectedSubject] = useState('');
    const [selectedDivision, setSelectedDivision] = useState('');
    const [selectedExamType, setSelectedExamType] = useState('');
    const [marks, setMarks] = useState([]);
    const [statistics, setStatistics] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

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
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Internal Marks Management</h1>
                <p className="text-gray-600">Manage and view internal examination marks for your subjects</p>
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
                            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
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
                            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            Add Internal Marks
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
        </div>
    );
}