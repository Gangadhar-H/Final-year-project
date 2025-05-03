import React from 'react';
import { XCircleIcon } from '@heroicons/react/24/solid';

const ErrorAlert = ({ message, onClose }) => {
    if (!message) return null;

    return (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4 mb-4">
            <div className="flex">
                <XCircleIcon className="h-5 w-5 text-red-400 mr-2" />
                <div className="flex-1">
                    <p>{message}</p>
                </div>
                {onClose && (
                    <button
                        onClick={onClose}
                        className="text-red-500 hover:text-red-700"
                    >
                        <span className="sr-only">Close</span>
                        <XCircleIcon className="h-5 w-5" />
                    </button>
                )}
            </div>
        </div>
    );
};

export default ErrorAlert;