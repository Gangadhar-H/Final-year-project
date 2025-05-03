import React from 'react';

const Loader = ({ size = 'medium' }) => {
    const sizeClass = {
        small: 'h-6 w-6',
        medium: 'h-12 w-12',
        large: 'h-16 w-16'
    };

    return (
        <div className="flex justify-center items-center">
            <div className={`animate-spin rounded-full border-t-2 border-b-2 border-primary-600 ${sizeClass[size]}`}></div>
        </div>
    );
};

export default Loader;