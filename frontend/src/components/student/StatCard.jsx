import React from 'react';

const StatCard = ({ title, value, subtitle, icon: Icon, color = 'blue', trend }) => {
    const colorClasses = {
        blue: {
            bg: 'bg-blue-50',
            icon: 'text-blue-600',
            text: 'text-blue-600',
            border: 'border-blue-200'
        },
        green: {
            bg: 'bg-green-50',
            icon: 'text-green-600',
            text: 'text-green-600',
            border: 'border-green-200'
        },
        yellow: {
            bg: 'bg-yellow-50',
            icon: 'text-yellow-600',
            text: 'text-yellow-600',
            border: 'border-yellow-200'
        },
        red: {
            bg: 'bg-red-50',
            icon: 'text-red-600',
            text: 'text-red-600',
            border: 'border-red-200'
        },
        purple: {
            bg: 'bg-purple-50',
            icon: 'text-purple-600',
            text: 'text-purple-600',
            border: 'border-purple-200'
        }
    };

    const currentColor = colorClasses[color] || colorClasses.blue;

    return (
        <div className={`bg-white p-6 rounded-lg shadow-sm border ${currentColor.border} hover:shadow-md transition-shadow duration-200`}>
            <div className="flex items-center justify-between">
                <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 mb-1">
                        {title}
                    </p>
                    <p className={`text-2xl font-bold ${currentColor.text} mb-1`}>
                        {value}
                    </p>
                    {subtitle && (
                        <p className="text-sm text-gray-500">
                            {subtitle}
                        </p>
                    )}
                    {trend && (
                        <div className={`flex items-center mt-2 text-xs ${trend.direction === 'up' ? 'text-green-600' :
                                trend.direction === 'down' ? 'text-red-600' :
                                    'text-gray-600'
                            }`}>
                            {trend.direction === 'up' && (
                                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L10 4.414 4.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                </svg>
                            )}
                            {trend.direction === 'down' && (
                                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L10 15.586l5.293-5.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                            )}
                            {trend.value}
                        </div>
                    )}
                </div>
                {Icon && (
                    <div className={`p-3 rounded-full ${currentColor.bg} ml-4`}>
                        <Icon className={`w-6 h-6 ${currentColor.icon}`} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default StatCard;