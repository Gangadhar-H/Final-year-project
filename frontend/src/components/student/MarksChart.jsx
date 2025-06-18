import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

const MarksChart = ({ marksData, chartType = 'bar' }) => {
    // Handle case where marksData is undefined or null
    if (!marksData) {
        return (
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                        Subject-wise Performance
                    </h3>
                </div>
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-500">Loading marks data...</p>
                </div>
            </div>
        );
    }

    // Process marks data for chart
    const processedData = marksData.subjectWiseStats?.map(stat => ({
        subject: stat.subject.subjectName.length > 10
            ? stat.subject.subjectCode
            : stat.subject.subjectName,
        percentage: parseFloat(stat.averagePercentage),
        fullName: stat.subject.subjectName,
        totalExams: stat.totalExams
    })) || [];

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                    <p className="font-medium text-gray-900">{data.fullName}</p>
                    <p className="text-sm text-blue-600">
                        Average: {data.percentage}%
                    </p>
                    <p className="text-xs text-gray-500">
                        Total Exams: {data.totalExams}
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                    Subject-wise Performance
                </h3>
                <div className="text-sm text-gray-600">
                    Average: {marksData.statistics?.averagePercentage || 0}%
                </div>
            </div>

            {processedData.length > 0 ? (
                <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        {chartType === 'line' ? (
                            <LineChart data={processedData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis
                                    dataKey="subject"
                                    tick={{ fontSize: 12 }}
                                    angle={-45}
                                    textAnchor="end"
                                    height={80}
                                />
                                <YAxis
                                    domain={[0, 100]}
                                    tick={{ fontSize: 12 }}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Line
                                    type="monotone"
                                    dataKey="percentage"
                                    stroke="#3B82F6"
                                    strokeWidth={2}
                                    dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                                />
                            </LineChart>
                        ) : (
                            <BarChart data={processedData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis
                                    dataKey="subject"
                                    tick={{ fontSize: 12 }}
                                    angle={-45}
                                    textAnchor="end"
                                    height={80}
                                />
                                <YAxis
                                    domain={[0, 100]}
                                    tick={{ fontSize: 12 }}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar
                                    dataKey="percentage"
                                    fill="#3B82F6"
                                    radius={[4, 4, 0, 0]}
                                />
                            </BarChart>
                        )}
                    </ResponsiveContainer>
                </div>
            ) : (
                <div className="text-center py-12">
                    <div className="text-gray-400 text-6xl mb-4">📈</div>
                    <p className="text-gray-500">No marks data available</p>
                </div>
            )}

            {/* Performance indicators */}
            {processedData.length > 0 && (
                <div className="mt-4 grid grid-cols-3 gap-4">
                    <div className="text-center">
                        <p className="text-sm text-gray-600">Best Subject</p>
                        <p className="font-semibold text-green-600">
                            {processedData.reduce((best, current) =>
                                current.percentage > best.percentage ? current : best
                            ).subject}
                        </p>
                    </div>
                    <div className="text-center">
                        <p className="text-sm text-gray-600">Total Exams</p>
                        <p className="font-semibold text-blue-600">
                            {marksData.statistics?.totalExams || 0}
                        </p>
                    </div>
                    <div className="text-center">
                        <p className="text-sm text-gray-600">Avg. Percentage</p>
                        <p className={`font-semibold ${(marksData.statistics?.averagePercentage || 0) >= 80 ? 'text-green-600' :
                            (marksData.statistics?.averagePercentage || 0) >= 60 ? 'text-yellow-600' :
                                'text-red-600'
                            }`}>
                            {marksData.statistics?.averagePercentage || 0}%
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MarksChart;