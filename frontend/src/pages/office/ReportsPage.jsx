// frontend/src/pages/office/ReportsPage.jsx
import React, { useState, useEffect } from 'react';
import {
    FileText,
    Download,
    Search,
    Filter,
    Users,
    TrendingUp,
    Award,
    AlertCircle,
    Calendar,
    BookOpen,
    UserCheck
} from 'lucide-react';
import reportService from '../../services/reportService';

const ReportsPage = () => {
    const [reportOptions, setReportOptions] = useState({
        semesters: [],
        examTypes: [],
        divisions: []
    });
    const [filters, setFilters] = useState({
        semesterId: '',
        examType: '',
        division: ''
    });
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [downloading, setDownloading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchReportOptions();
    }, []);

    const fetchReportOptions = async () => {
        try {
            const response = await reportService.getReportOptions();
            setReportOptions(response.availableOptions);
        } catch (error) {
            setError('Failed to load report options');
        }
    };

    const handleFilterChange = (name, value) => {
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const generateReport = async () => {
        const validation = reportService.validateReportParams(filters);
        if (!validation.isValid) {
            setError(Object.values(validation.errors)[0]);
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await reportService.getInternalMarksReport(filters);
            setReportData(reportService.formatReportData(response.report));
        } catch (error) {
            setError(error.message || 'Failed to generate report');
        } finally {
            setLoading(false);
        }
    };

    const downloadReport = async () => {
        const validation = reportService.validateReportParams(filters);
        if (!validation.isValid) {
            setError(Object.values(validation.errors)[0]);
            return;
        }

        setDownloading(true);

        try {
            await reportService.downloadInternalMarksReport(filters);
        } catch (error) {
            setError(error.message || 'Failed to download report');
        } finally {
            setDownloading(false);
        }
    };

    const getGradeDisplay = (percentage) => {
        const gradeInfo = reportService.getGradeFromPercentage(percentage);
        return (
            <span className={`font-semibold ${gradeInfo.color}`}>
                {gradeInfo.grade}
            </span>
        );
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            <FileText className="w-7 h-7 text-blue-600" />
                            Reports Generation
                        </h1>
                        <p className="text-gray-600 mt-1">
                            Generate and download internal marks reports
                        </p>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center gap-2 mb-4">
                    <Filter className="w-5 h-5 text-gray-500" />
                    <h2 className="text-lg font-semibold text-gray-900">Report Filters</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Semester Filter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Semester *
                        </label>
                        <select
                            value={filters.semesterId}
                            onChange={(e) => handleFilterChange('semesterId', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Select Semester</option>
                            {reportOptions.semesters.map(semester => (
                                <option key={semester.id} value={semester.id}>
                                    {semester.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Exam Type Filter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Exam Type *
                        </label>
                        <select
                            value={filters.examType}
                            onChange={(e) => handleFilterChange('examType', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Select Exam Type</option>
                            {reportOptions.examTypes.map(examType => (
                                <option key={examType} value={examType}>
                                    {examType}
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
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">All Divisions</option>
                            {reportOptions.divisions.map(division => (
                                <option key={division} value={division}>
                                    Division {division}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 mt-6">
                    <button
                        onClick={generateReport}
                        disabled={loading}
                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <Search className="w-5 h-5" />
                        )}
                        {loading ? 'Generating...' : 'Generate Report'}
                    </button>

                    {reportData && (
                        <button
                            onClick={downloadReport}
                            disabled={downloading}
                            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {downloading ? (
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <Download className="w-5 h-5" />
                            )}
                            {downloading ? 'Downloading...' : 'Download Excel'}
                        </button>
                    )}
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-red-500" />
                        <span className="text-red-700">{error}</span>
                    </div>
                )}
            </div>

            {/* Report Statistics */}
            {reportData && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <Users className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Total Students</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {reportData.statistics.totalStudents}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <UserCheck className="w-6 h-6 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">With Marks</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {reportData.statistics.studentsWithMarks}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-yellow-100 rounded-lg">
                                <TrendingUp className="w-6 h-6 text-yellow-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Class Average</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {reportData.statistics.classAverage}%
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-100 rounded-lg">
                                <Award className="w-6 h-6 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Highest Score</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {reportData.statistics.highestPercentage}%
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Report Table */}
            {reportData && (
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">
                                    Internal Marks Report
                                </h3>
                                <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                                    <span className="flex items-center gap-1">
                                        <BookOpen className="w-4 h-4" />
                                        Semester {reportData.semester?.number || 'N/A'}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Calendar className="w-4 h-4" />
                                        {reportData.examType}
                                    </span>
                                    <span>Division: {reportData.division || 'All'}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Student Details
                                    </th>
                                    {reportData.subjects?.map(subject => (
                                        <th key={subject.code} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            {subject.name}
                                        </th>
                                    ))}
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Total
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Percentage
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Grade
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {reportData.students?.map((student, index) => (
                                    <tr key={student.studentId} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">
                                                    {student.name}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    UUCMS No: {student.uucmsNo}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    Division: {student.division}
                                                </div>
                                            </div>
                                        </td>
                                        {reportData.subjects?.map(subject => (
                                            <td key={subject.code} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {student.subjectMarks?.[subject.code]?.display || 'N/A'}
                                            </td>
                                        ))}
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {student.totalDisplay || `${student.totalObtained || 0}/${student.totalMax || 0}`}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {student.percentageDisplay || `${student.percentage || 0}%`}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            {getGradeDisplay(student.percentage || 0)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* No Data Message */}
                    {reportData.students?.length === 0 && (
                        <div className="px-6 py-12 text-center">
                            <div className="text-gray-500">
                                <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                                <p className="text-lg font-medium">No students found</p>
                                <p className="text-sm">
                                    No students match the selected criteria.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ReportsPage;