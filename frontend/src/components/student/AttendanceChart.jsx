import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const AttendanceChart = ({ attendanceData }) => {
    const data = [
        {
            name: 'Present',
            value: attendanceData.presentClasses || 0,
            color: '#10B981'
        },
        {
            name: 'Absent',
            value: attendanceData.absentClasses || 0,
            color: '#EF4444'
        }
    ];

    const COLORS = {
        'Present': '#10B981',
        'Absent': '#EF4444'
    };

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const data = payload[0];
            return (
                <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                    <p className="text-sm font-medium" style={{ color: data.payload.color }}>
                        {data.name}: {data.value} classes
                    </p>
                </div>
            );
        }
        return null;
    };

    const CustomLegend = ({ payload }) => (
        <ul className="flex justify-center space-x-6 mt-4">
            {payload.map((entry, index) => (
                <li key={index} className="flex items-center">
                    <span
                        className="w-3 h-3 rounded-full mr-2"
                        style={{ backgroundColor: entry.color }}
                    />
                    <span className="text-sm text-gray-600">
                        {entry.value}: {data[index].value}
                    </span>
                </li>
            ))}
        </ul>
    );

    const renderLabel = (entry) => {
        const total = attendanceData.totalClasses || 1;
        const percentage = ((entry.value / total) * 100).toFixed(1);
        return `${percentage}%`;
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Attendance Overview
            </h3>

            {attendanceData.totalClasses > 0 ? (
                <div>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={renderLabel}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {data.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={COLORS[entry.name]}
                                        />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    <CustomLegend payload={[
                        { value: 'Present', color: COLORS.Present },
                        { value: 'Absent', color: COLORS.Absent }
                    ]} />

                    <div className="mt-4 text-center">
                        <p className="text-sm text-gray-600">
                            Total Classes: {attendanceData.totalClasses}
                        </p>
                        <p className="text-lg font-semibold text-gray-900">
                            Overall Attendance: {attendanceData.attendancePercentage}%
                        </p>
                    </div>
                </div>
            ) : (
                <div className="text-center py-8">
                    <div className="text-gray-400 text-6xl mb-4">📊</div>
                    <p className="text-gray-500">No attendance data available</p>
                </div>
            )}
        </div>
    );
};

export default AttendanceChart;