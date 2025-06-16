import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getAssignedSubjects } from '../../services/teacherService';
import { getStudentPerformanceSummary, getInternalMarks } from '../../services/internalMarksService';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';

export default function StudentPerformance() {
    const navigate = useNavigate();
    const [subjects, setSubjects] = useState([]);
    const [selectedSubject, setSelectedSubject] = useState('');
    const [selectedDivision, setSelectedDivision] = useState('');
    const [selectedStudent, setSelectedStudent] = useState('');
    const [students, setStudents] = useState([]);
    const [performanceData, setPerformanceData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [studentsLoading, setStudentsLoading] = useState(false);
    const [error, setError] = useState('');
    const [chartType, setChartType] = useState('line');

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

    const handleSubjectChange = async (subjectId) => {
        setSelectedSubject(subjectId);
        setSelectedDivision('');
        setSelectedStudent('');
        setStudents([]);
        setPerformanceData(null);
        setError('');

        if (subjectId) {
            const subjectDetails = getSubjectDetails(subjectId);
            if (subjectDetails) {
                setSelectedDivision(subjectDetails.division);
                await fetchStudentsForSubject(subjectId, subjectDetails.division);
            }
        }
    };

    const fetchStudentsForSubject = async (subjectId, division) => {
        setStudentsLoading(true);
        try {
            // Get all marks for this subject and division to find students
            const response = await getInternalMarks(subjectId, { division });
            const marks = response.marks || [];

            // Extract unique students
            const uniqueStudents = marks.reduce((acc, mark) => {
                const existingStudent = acc.find(s => s._id === mark.student._id);
                if (!existingStudent) {
                    acc.push(mark.student);
                }
                return acc;
            }, []);

            // Sort students by name
            uniqueStudents.sort((a, b) => a.name.localeCompare(b.name));
            setStudents(uniqueStudents);
        } catch (error) {
            console.error('Error fetching students:', error);
            setError('Failed to load students for this subject');
        } finally {
            setStudentsLoading(false);
        }
    };

    const handleStudentChange = async (studentId) => {
        setSelectedStudent(studentId);
        setPerformanceData(null);
        setError('');

        if (studentId && selectedSubject) {
            await fetchStudentPerformance(studentId);
        }
    };

    const fetchStudentPerformance = async (studentId) => {
        setLoading(true);
        try {
            const params = {
                studentId,
                division: selectedDivision
            };

            const response = await getStudentPerformanceSummary(selectedSubject, params);
            setPerformanceData(response);
        } catch (error) {
            setError('Failed to load student performance data');
            console.error('Error fetching performance:', error);
        } finally {
            setLoading(false);
        }
    };

    const getSubjectDetails = (subjectId) => {
        return subjects.find(sub => sub.subjectId._id === subjectId);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-IN');
    };

    const calculatePercentage = (obtained, max) => {
        return ((obtained / max) * 100).toFixed(2);
    };

    const getGrade = (percentage) => {
        if (percentage >= 90) return { grade: 'A+', color: 'text-green-800 bg-green-100' };
        if (percentage >= 80) return { grade: 'A', color: 'text-green-700 bg-green-50' };
        if (percentage >= 70) return { grade: 'B+', color: 'text-blue-800 bg-blue-100' };
        if (percentage >= 60) return { grade: 'B', color: 'text-blue-700 bg-blue-50' };
        if (percentage >= 50) return { grade: 'C', color: 'text-yellow-800 bg-yellow-100' };
        if (percentage >= 40) return { grade: 'D', color: 'text-orange-800 bg-orange-100' };
        return { grade: 'F', color: 'text-red-800 bg-red-100' };
    };

    const getPerformanceTrend = (marks) => {
        if (marks.length < 2) return null;

        const sorted = marks.sort((a, b) => new Date(a.examDate) - new Date(b.examDate));
        const latest = sorted[sorted.length - 1];
        const previous = sorted[sorted.length - 2];

        const latestPercentage = (latest.obtainedMarks / latest.maxMarks) * 100;
        const previousPercentage = (previous.obtainedMarks / previous.maxMarks) * 100;

        const difference = latestPercentage - previousPercentage;

        if (Math.abs(difference) < 1) {
            return { trend: 'stable', difference: 0, color: 'text-gray-600' };
        } else if (difference > 0) {
            return { trend: 'improving', difference: difference.toFixed(2), color: 'text-green-600' };
        } else {
            return { trend: 'declining', difference: Math.abs(difference).toFixed(2), color: 'text-red-600' };
        }
    };

    const prepareChartData = (marks) => {
        return marks
            .sort((a, b) => new Date(a.examDate) - new Date(b.examDate))
            .map((mark, index) => ({
                examNumber: index + 1,
                examType: mark.examType,
                date: formatDate(mark.examDate),
                percentage: parseFloat(calculatePercentage(mark.obtainedMarks, mark.maxMarks)),
                obtainedMarks: mark.obtainedMarks,
                maxMarks: mark.maxMarks,
                fullDate: mark.examDate
            }));
    };

    // Custom tooltip for the chart
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                    <p className="font-semibold text-gray-900">{`Exam ${label}: ${data.examType}`}</p>
                    <p className="text-sm text-gray-600">{`Date: ${data.date}`}</p>
                    <p className="text-blue-600">{`Percentage: ${data.percentage}%`}</p>
                    <p className="text-green-600">{`Marks: ${data.obtainedMarks}/${data.maxMarks}`}</p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="p-6">
            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">Student Performance Analysis</h1>
                        <p className="text-gray-600">View detailed performance analysis for individual students</p>
                    </div>
                    <button
                        onClick={() => navigate('/teacher/internal-marks')}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back to Internal Marks
                    </button>
                </div>
            </div>

            {/* Selection Filters */}
            <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Student</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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

                    {/* Division Display */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Division</label>
                        <input
                            type="text"
                            value={selectedDivision}
                            readOnly
                            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-700"
                            placeholder="Select subject first"
                        />
                    </div>

                    {/* Student Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Student <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={selectedStudent}
                            onChange={(e) => handleStudentChange(e.target.value)}
                            disabled={!selectedSubject || studentsLoading}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                        >
                            <option value="">
                                {studentsLoading ? 'Loading students...' : 'Select Student'}
                            </option>
                            {students.map((student) => (
                                <option key={student._id} value={student._id}>
                                    {student.name} ({student.uucmsNo})
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
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

            {/* Loading State */}
            {loading && (
                <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading performance data...</p>
                </div>
            )}

            {/* Performance Data */}
            {performanceData && !loading && (
                <div className="space-y-6">
                    {/* Student Info & Summary */}
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <div className="flex items-start justify-between mb-6">
                            <div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-1">
                                    {performanceData.summary.student.name}
                                </h3>
                                <p className="text-gray-600 mb-2">UUCMS No: {performanceData.summary.student.uucmsNo}</p>
                                <p className="text-gray-600">
                                    Subject: {performanceData.summary.subject.subjectName} ({performanceData.summary.subject.subjectCode})
                                </p>
                            </div>
                            <div className="text-right">
                                <div className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getGrade(performanceData.summary.averagePercentage).color}`}>
                                    Overall Grade: {getGrade(performanceData.summary.averagePercentage).grade}
                                </div>
                            </div>
                        </div>

                        {/* Summary Statistics */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="bg-blue-50 p-4 rounded-lg">
                                <p className="text-sm text-blue-600 font-medium">Total Exams</p>
                                <p className="text-2xl font-bold text-blue-900">{performanceData.summary.totalExams}</p>
                            </div>
                            <div className="bg-green-50 p-4 rounded-lg">
                                <p className="text-sm text-green-600 font-medium">Total Marks</p>
                                <p className="text-2xl font-bold text-green-900">
                                    {performanceData.summary.totalObtainedMarks}/{performanceData.summary.totalMaxMarks}
                                </p>
                            </div>
                            <div className="bg-purple-50 p-4 rounded-lg">
                                <p className="text-sm text-purple-600 font-medium">Average Percentage</p>
                                <p className="text-2xl font-bold text-purple-900">{performanceData.summary.averagePercentage}%</p>
                            </div>
                            <div className="bg-orange-50 p-4 rounded-lg">
                                <p className="text-sm text-orange-600 font-medium">Performance Trend</p>
                                {(() => {
                                    const trend = getPerformanceTrend(performanceData.marks);
                                    if (!trend) {
                                        return <p className="text-lg font-bold text-gray-600">Insufficient Data</p>;
                                    }
                                    return (
                                        <div className="flex items-center">
                                            <p className={`text-lg font-bold ${trend.color}`}>
                                                {trend.trend === 'improving' && '↗'}
                                                {trend.trend === 'declining' && '↘'}
                                                {trend.trend === 'stable' && '→'}
                                                {trend.difference > 0 ? `+${trend.difference}%` : trend.difference === 0 ? 'Stable' : `-${trend.difference}%`}
                                            </p>
                                        </div>
                                    );
                                })()}
                            </div>
                        </div>
                    </div>

                    {/* Detailed Marks Table */}
                    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900">Detailed Performance Records</h3>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Exam Type
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Exam Date
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Marks Obtained
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Max Marks
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Percentage
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Grade
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Remarks
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {performanceData.marks
                                        .sort((a, b) => new Date(a.examDate) - new Date(b.examDate))
                                        .map((mark) => {
                                            const percentage = calculatePercentage(mark.obtainedMarks, mark.maxMarks);
                                            const gradeInfo = getGrade(parseFloat(percentage));

                                            return (
                                                <tr key={mark._id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                                            {mark.examType}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {formatDate(mark.examDate)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                        {mark.obtainedMarks}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {mark.maxMarks}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {percentage}%
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${gradeInfo.color}`}>
                                                            {gradeInfo.grade}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                                                        {mark.remarks || '-'}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Performance Chart */}
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">Performance Trend</h3>
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => setChartType('line')}
                                    className={`px-3 py-1 text-sm rounded-md ${chartType === 'line'
                                        ? 'bg-blue-100 text-blue-700 border border-blue-300'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                >
                                    Line Chart
                                </button>
                                <button
                                    onClick={() => setChartType('bar')}
                                    className={`px-3 py-1 text-sm rounded-md ${chartType === 'bar'
                                        ? 'bg-blue-100 text-blue-700 border border-blue-300'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                >
                                    Bar Chart
                                </button>
                            </div>
                        </div>

                        {performanceData.marks.length > 0 ? (
                            <div className="h-80">
                                <ResponsiveContainer width="100%" height="100%">
                                    {chartType === 'line' ? (
                                        <LineChart data={prepareChartData(performanceData.marks)}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                            <XAxis
                                                dataKey="examNumber"
                                                stroke="#6b7280"
                                                fontSize={12}
                                                tickFormatter={(value) => `Exam ${value}`}
                                            />
                                            <YAxis
                                                stroke="#6b7280"
                                                fontSize={12}
                                                domain={[0, 100]}
                                                tickFormatter={(value) => `${value}%`}
                                            />
                                            <Tooltip content={<CustomTooltip />} />
                                            <Legend />
                                            <Line
                                                type="monotone"
                                                dataKey="percentage"
                                                stroke="#3b82f6"
                                                strokeWidth={3}
                                                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 6 }}
                                                activeDot={{ r: 8, fill: '#1d4ed8' }}
                                                name="Percentage (%)"
                                            />
                                            {/* Reference lines for grades */}
                                            <Line
                                                type="monotone"
                                                dataKey={() => 90}
                                                stroke="#10b981"
                                                strokeDasharray="5 5"
                                                strokeWidth={1}
                                                dot={false}
                                                name="A+ Grade (90%)"
                                            />
                                            <Line
                                                type="monotone"
                                                dataKey={() => 80}
                                                stroke="#f59e0b"
                                                strokeDasharray="5 5"
                                                strokeWidth={1}
                                                dot={false}
                                                name="A Grade (80%)"
                                            />
                                            <Line
                                                type="monotone"
                                                dataKey={() => 60}
                                                stroke="#ef4444"
                                                strokeDasharray="5 5"
                                                strokeWidth={1}
                                                dot={false}
                                                name="B Grade (60%)"
                                            />
                                        </LineChart>
                                    ) : (
                                        <BarChart data={prepareChartData(performanceData.marks)}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                            <XAxis
                                                dataKey="examNumber"
                                                stroke="#6b7280"
                                                fontSize={12}
                                                tickFormatter={(value) => `Exam ${value}`}
                                            />
                                            <YAxis
                                                stroke="#6b7280"
                                                fontSize={12}
                                                domain={[0, 100]}
                                                tickFormatter={(value) => `${value}%`}
                                            />
                                            <Tooltip content={<CustomTooltip />} />
                                            <Legend />
                                            <Bar dataKey="percentage" name="Percentage (%)" radius={[4, 4, 0, 0]}>
                                                {prepareChartData(performanceData.marks).map((entry, index) => (
                                                    <Cell
                                                        key={`cell-${index}`}
                                                        fill={
                                                            entry.percentage >= 90 ? '#10b981' :
                                                                entry.percentage >= 80 ? '#3b82f6' :
                                                                    entry.percentage >= 70 ? '#8b5cf6' :
                                                                        entry.percentage >= 60 ? '#f59e0b' :
                                                                            entry.percentage >= 50 ? '#f97316' :
                                                                                entry.percentage >= 40 ? '#ef4444' :
                                                                                    '#dc2626'
                                                        }
                                                    />
                                                ))}
                                            </Bar>
                                        </BarChart>

                                    )}
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                                <div className="text-center">
                                    <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                    <p className="text-gray-500">No exam data available to display chart</p>
                                </div>
                            </div>
                        )}

                        {/* Chart Legend */}
                        {performanceData.marks.length > 0 && (
                            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                                <h4 className="text-sm font-medium text-gray-700 mb-2">Grade Reference:</h4>
                                <div className="flex flex-wrap gap-4 text-xs">
                                    <div className="flex items-center">
                                        <div className="w-3 h-3 bg-green-500 rounded mr-2"></div>
                                        <span>A+ (90%+)</span>
                                    </div>
                                    <div className="flex items-center">
                                        <div className="w-3 h-3 bg-blue-500 rounded mr-2"></div>
                                        <span>A (80-89%)</span>
                                    </div>
                                    <div className="flex items-center">
                                        <div className="w-3 h-3 bg-purple-500 rounded mr-2"></div>
                                        <span>B+ (70-79%)</span>
                                    </div>
                                    <div className="flex items-center">
                                        <div className="w-3 h-3 bg-yellow-500 rounded mr-2"></div>
                                        <span>B (60-69%)</span>
                                    </div>
                                    <div className="flex items-center">
                                        <div className="w-3 h-3 bg-orange-500 rounded mr-2"></div>
                                        <span>C (50-59%)</span>
                                    </div>
                                    <div className="flex items-center">
                                        <div className="w-3 h-3 bg-red-500 rounded mr-2"></div>
                                        <span>D/F (Below 50%)</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* No Data Message */}
            {!loading && !performanceData && selectedStudent && (
                <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0118 12a8 8 0 01-2.009 5.291" />
                    </svg>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Performance Data Found</h3>
                    <p className="text-gray-500 mb-4">
                        No internal marks found for the selected student in this subject.
                    </p>
                </div>
            )}

            {/* Empty State */}
            {!selectedSubject && (
                <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Select Subject and Student</h3>
                    <p className="text-gray-500">
                        Choose a subject and student to view detailed performance analysis
                    </p>
                </div>
            )}
        </div>
    );
}