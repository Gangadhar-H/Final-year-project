// src/components/teacher/StudentPerformanceCard.jsx
import { useState } from 'react';
import { calculatePercentage, calculateGrade } from '../../services/internalMarksService';

const StudentPerformanceCard = ({
    student,
    marks = [],
    subject,
    onViewDetails,
    loading = false
}) => {
    const [expanded, setExpanded] = useState(false);

    // Calculate overall performance
    const totalMarks = marks.reduce((sum, mark) => sum + mark.obtainedMarks, 0);
    const totalMaxMarks = marks.reduce((sum, mark) => sum + mark.maxMarks, 0);
    const overallPercentage = totalMaxMarks > 0 ? calculatePercentage(totalMarks, totalMaxMarks) : 0;
    const overallGrade = totalMaxMarks > 0 ? calculateGrade(totalMarks, totalMaxMarks) : 'N/A';

    // Get best and worst performance
    const percentages = marks.map(mark => parseFloat(calculatePercentage(mark.obtainedMarks, mark.maxMarks)));
    const bestPerformance = Math.max(...percentages, 0);
    const worstPerformance = Math.min(...percentages, 100);

    // Get grade color
    const getGradeColor = (grade) => {
        switch (grade) {
            case 'A+': return 'text-green-600 bg-green-100';
            case 'A': return 'text-green-600 bg-green-100';
            case 'B+': return 'text-blue-600 bg-blue-100';
            case 'B': return 'text-blue-600 bg-blue-100';
            case 'C': return 'text-yellow-600 bg-yellow-100';
            case 'D': return 'text-orange-600 bg-orange-100';
            case 'F': return 'text-red-600 bg-red-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    // Get performance trend
    const getTrend = () => {
        if (marks.length < 2) return null;

        const sortedMarks = [...marks].sort((a, b) => new Date(a.examDate) - new Date(b.examDate));
        const firstPercentage = parseFloat(calculatePercentage(sortedMarks[0].obtainedMarks, sortedMarks[0].maxMarks));
        const lastPercentage = parseFloat(calculatePercentage(sortedMarks[sortedMarks.length - 1].obtainedMarks, sortedMarks[sortedMarks.length - 1].maxMarks));

        if (lastPercentage > firstPercentage) return 'improving';
        if (lastPercentage < firstPercentage) return 'declining';
        return 'stable';
    };

    const trend = getTrend();

    const getTrendIcon = () => {
        switch (trend) {
            case 'improving':
                return (
                    <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                );
            case 'declining':
                return (
                    <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                    </svg>
                );
            default:
                return (
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                );
        }
    };

    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow-md p-6 animate-pulse">
                <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                    <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                </div>
                <div className="mt-4 space-y-2">
                    <div className="h-3 bg-gray-200 rounded"></div>
                    <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                </div>
            </div>
        );
    }

    if (!student) {
        return (
            <div className="bg-white rounded-lg shadow-md p-6 text-center text-gray-500">
                <p>No student data available</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200">
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
                <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-semibold text-lg">
                                {student.name ? student.name.charAt(0).toUpperCase() : 'S'}
                            </span>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">{student.name}</h3>
                            <p className="text-sm text-gray-600">UUCMS: {student.uucmsNo}</p>
                            {student.email && (
                                <p className="text-xs text-gray-500">{student.email}</p>
                            )}
                        </div>
                    </div>

                    {/* Overall Grade */}
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${getGradeColor(overallGrade)}`}>
                        {overallGrade}
                    </div>
                </div>
            </div>

            {/* Performance Summary */}
            <div className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{marks.length}</div>
                        <div className="text-xs text-gray-600">Total Exams</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{overallPercentage}%</div>
                        <div className="text-xs text-gray-600">Overall</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-emerald-600">{bestPerformance}%</div>
                        <div className="text-xs text-gray-600">Best Score</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600">{worstPerformance}%</div>
                        <div className="text-xs text-gray-600">Lowest Score</div>
                    </div>
                </div>

                {/* Performance Trend */}
                {trend && (
                    <div className="flex items-center justify-center space-x-2 mb-4">
                        {getTrendIcon()}
                        <span className="text-sm text-gray-600 capitalize">
                            Performance is {trend}
                        </span>
                    </div>
                )}

                {/* Subject Info */}
                {subject && (
                    <div className="bg-gray-50 rounded-lg p-3 mb-4">
                        <div className="text-sm font-medium text-gray-700">
                            {subject.subjectName}
                        </div>
                        <div className="text-xs text-gray-600">
                            Code: {subject.subjectCode}
                        </div>
                    </div>
                )}

                {/* Recent Marks Preview */}
                {marks.length > 0 && (
                    <div className="space-y-2">
                        <h4 className="text-sm font-medium text-gray-700 mb-3">
                            Recent Exams {marks.length > 3 && `(Showing 3 of ${marks.length})`}
                        </h4>
                        {marks
                            .sort((a, b) => new Date(b.examDate) - new Date(a.examDate))
                            .slice(0, expanded ? marks.length : 3)
                            .map((mark, index) => {
                                const percentage = calculatePercentage(mark.obtainedMarks, mark.maxMarks);
                                const grade = calculateGrade(mark.obtainedMarks, mark.maxMarks);

                                return (
                                    <div key={mark._id || index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-2">
                                                <span className="text-sm font-medium text-gray-900">
                                                    {mark.examType}
                                                </span>
                                                <span className={`px-2 py-1 rounded text-xs font-medium ${getGradeColor(grade)}`}>
                                                    {grade}
                                                </span>
                                            </div>
                                            <div className="text-xs text-gray-600 mt-1">
                                                {new Date(mark.examDate).toLocaleDateString('en-IN')}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm font-semibold text-gray-900">
                                                {mark.obtainedMarks}/{mark.maxMarks}
                                            </div>
                                            <div className="text-xs text-gray-600">
                                                {percentage}%
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                    </div>
                )}

                {/* No Marks Message */}
                {marks.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                        <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        <p className="text-sm">No marks recorded yet</p>
                    </div>
                )}
            </div>

            {/* Footer Actions */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                {marks.length > 3 && (
                    <button
                        onClick={() => setExpanded(!expanded)}
                        className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                    >
                        {expanded ? 'Show Less' : `Show All ${marks.length} Exams`}
                    </button>
                )}

                <div className="flex space-x-2 ml-auto">
                    {onViewDetails && (
                        <button
                            onClick={() => onViewDetails(student)}
                            className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors duration-200"
                        >
                            View Details
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StudentPerformanceCard;