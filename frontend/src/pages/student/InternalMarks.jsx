import React, { useState, useEffect } from 'react';
import { BookOpen, TrendingUp, Calendar, Filter, Download, Eye, BarChart3, LineChart } from 'lucide-react';
import studentService from '../../services/studentService';
import MarksChart from '../../components/student/MarksChart';

const InternalMarks = () => {
    const [marksData, setMarksData] = useState(null);
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filters, setFilters] = useState({
        subjectId: '',
        examType: ''
    });
    const [chartType, setChartType] = useState('bar');
    const [viewMode, setViewMode] = useState('overview'); // 'overview' or 'detailed'

    const examTypes = [
        'Internal 1',
        'Internal 2',
        'Internal 3',
        'Assignment',
        'Quiz',
        'Project'
    ];

    useEffect(() => {
        fetchSubjects();
        fetchMarks();
    }, []);

    useEffect(() => {
        fetchMarks();
    }, [filters]);

    const fetchSubjects = async () => {
        try {
            const response = await studentService.getSubjects();
            setSubjects(response.subjects || []);
        } catch (error) {
            console.error('Error fetching subjects:', error);
        }
    };

    const fetchMarks = async () => {
        try {
            setLoading(true);
            setError('');
            const response = await studentService.getInternalMarks(filters);
            setMarksData(response);
        } catch (error) {
            console.error('Error fetching marks:', error);
            setError(error.message || 'Failed to fetch marks data');
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const clearFilters = () => {
        setFilters({
            subjectId: '',
            examType: ''
        });
    };

    const getGradeColor = (percentage) => {
        if (percentage >= 90) return 'text-green-600 bg-green-50';
        if (percentage >= 80) return 'text-blue-600 bg-blue-50';
        if (percentage >= 70) return 'text-yellow-600 bg-yellow-50';
        if (percentage >= 60) return 'text-orange-600 bg-orange-50';
        return 'text-red-600 bg-red-50';
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

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const exportMarks = () => {
        if (!marksData?.marks) return;

        const csvContent = [
            ['Subject', 'Exam Type', 'Max Marks', 'Obtained Marks', 'Percentage', 'Grade', 'Date', 'Remarks'].join(','),
            ...marksData.marks.map(mark => [
                mark.subject.subjectName,
                mark.examType,
                mark.maxMarks,
                mark.obtainedMarks,
                ((mark.obtainedMarks / mark.maxMarks) * 100).toFixed(2),
                getGrade((mark.obtainedMarks / mark.maxMarks) * 100),
                formatDate(mark.examDate),
                mark.remarks || ''
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'internal_marks.csv';
        link.click();
        window.URL.revokeObjectURL(url);
    };

    if (loading) {
        return (
            <div className="p-6">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
                        ))}
                    </div>
                    <div className="h-96 bg-gray-200 rounded-lg"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                    <div className="text-red-400 text-6xl mb-4">⚠️</div>
                    <h3 className="text-lg font-medium text-red-800 mb-2">Error Loading Marks</h3>
                    <p className="text-red-600 mb-4">{error}</p>
                    <button
                        onClick={fetchMarks}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Internal Marks</h1>
                    <p className="text-gray-600 mt-1">View your exam performance and track your progress</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center bg-white border border-gray-200 rounded-lg p-1">
                        <button
                            onClick={() => setChartType('bar')}
                            className={`p-2 rounded ${chartType === 'bar' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                            title="Bar Chart"
                        >
                            <BarChart3 className="h-4 w-4" />
                        </button>
                        <button
                            onClick={() => setChartType('line')}
                            className={`p-2 rounded ${chartType === 'line' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                            title="Line Chart"
                        >
                            <LineChart className="h-4 w-4" />
                        </button>
                    </div>
                    <button
                        onClick={() => setViewMode(viewMode === 'overview' ? 'detailed' : 'overview')}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        <Eye className="h-4 w-4" />
                        {viewMode === 'overview' ? 'Detailed View' : 'Overview'}
                    </button>
                    <button
                        onClick={exportMarks}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        disabled={!marksData?.marks?.length}
                    >
                        <Download className="h-4 w-4" />
                        Export
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center gap-4 flex-wrap">
                    <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-700">Filters:</span>
                    </div>

                    <select
                        value={filters.subjectId}
                        onChange={(e) => handleFilterChange('subjectId', e.target.value)}
                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">All Subjects</option>
                        {subjects.map(subject => (
                            <option key={subject._id} value={subject._id}>
                                {subject.subjectName}
                            </option>
                        ))}
                    </select>

                    <select
                        value={filters.examType}
                        onChange={(e) => handleFilterChange('examType', e.target.value)}
                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">All Exam Types</option>
                        {examTypes.map(type => (
                            <option key={type} value={type}>{type}</option>
                        ))}
                    </select>

                    {(filters.subjectId || filters.examType) && (
                        <button
                            onClick={clearFilters}
                            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                        >
                            Clear Filters
                        </button>
                    )}
                </div>
            </div>

            {/* Statistics Cards */}
            {marksData?.statistics && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <div className="flex items-center">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <BookOpen className="h-6 w-6 text-blue-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm text-gray-600">Total Exams</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {marksData.statistics.totalExams}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <div className="flex items-center">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <TrendingUp className="h-6 w-6 text-green-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm text-gray-600">Average %</p>
                                <p className={`text-2xl font-bold ${getGradeColor(marksData.statistics.averagePercentage).split(' ')[0]}`}>
                                    {marksData.statistics.averagePercentage}%
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <div className="flex items-center">
                            <div className="p-2 bg-purple-100 rounded-lg">
                                <Calendar className="h-6 w-6 text-purple-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm text-gray-600">Total Marks</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {marksData.statistics.totalObtainedMarks}/{marksData.statistics.totalMaxMarks}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <div className="flex items-center">
                            <div className="p-2 bg-yellow-100 rounded-lg">
                                <span className="text-lg font-bold text-yellow-600">
                                    {getGrade(marksData.statistics.averagePercentage)}
                                </span>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm text-gray-600">Overall Grade</p>
                                <p className="text-lg font-semibold text-gray-900">
                                    {getGrade(marksData.statistics.averagePercentage)} Grade
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Charts */}
            {viewMode === 'overview' && (
                <MarksChart marksData={marksData} chartType={chartType} />
            )}

            {/* Detailed Marks Table */}
            {viewMode === 'detailed' && marksData?.marks && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900">Detailed Marks</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Subject
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
                                        Date
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {marksData.marks.map((mark, index) => {
                                    const percentage = (mark.obtainedMarks / mark.maxMarks) * 100;
                                    const grade = getGrade(percentage);
                                    return (
                                        <tr key={index} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {mark.subject.subjectName}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {mark.subject.subjectCode}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                                                    {mark.examType}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                <span className="font-medium">{mark.obtainedMarks}</span>
                                                <span className="text-gray-500">/{mark.maxMarks}</span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getGradeColor(percentage)}`}>
                                                    {percentage.toFixed(2)}%
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 py-1 text-sm font-medium rounded ${getGradeColor(percentage)}`}>
                                                    {grade}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {formatDate(mark.examDate)}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Subject-wise Performance */}
            {marksData?.subjectWiseStats && marksData.subjectWiseStats.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900">Subject-wise Performance</h3>
                    </div>
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {marksData.subjectWiseStats.map((stat, index) => (
                                <div key={index} className="border border-gray-200 rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <h4 className="font-medium text-gray-900 truncate">
                                            {stat.subject.subjectName}
                                        </h4>
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getGradeColor(stat.averagePercentage)}`}>
                                            {getGrade(stat.averagePercentage)}
                                        </span>
                                    </div>
                                    <div className="space-y-1 text-sm text-gray-600">
                                        <div className="flex justify-between">
                                            <span>Exams:</span>
                                            <span className="font-medium">{stat.totalExams}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Marks:</span>
                                            <span className="font-medium">{stat.totalObtained}/{stat.totalMax}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Average:</span>
                                            <span className={`font-medium ${getGradeColor(stat.averagePercentage).split(' ')[0]}`}>
                                                {stat.averagePercentage}%
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* No Data State */}
            {(!marksData?.marks || marksData.marks.length === 0) && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                    <div className="text-gray-400 text-6xl mb-4">📊</div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Marks Available</h3>
                    <p className="text-gray-600">
                        {filters.subjectId || filters.examType
                            ? 'No marks found for the selected filters. Try adjusting your search criteria.'
                            : 'Your internal marks will appear here once teachers upload them.'
                        }
                    </p>
                    {(filters.subjectId || filters.examType) && (
                        <button
                            onClick={clearFilters}
                            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Clear Filters
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default InternalMarks;