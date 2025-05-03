import React from 'react';
import { CheckCircleIcon, XMarkIcon } from '@heroicons/react/24/solid';

const SuccessAlert = ({ message, onClose }) => {
    if (!message) return null;

    return (
        <div className="bg-green-50 border border-green-200 text-green-800 rounded-md p-4 mb-4">
            <div className="flex">
                <CheckCircleIcon className="h-5 w-5 text-green-400 mr-2" />
                <div className="flex-1">
                    <p>{message}</p>
                </div>
                {onClose && (
                    <button
                        onClick={onClose}
                        className="text-green-500 hover:text-green-700"
                    >
                        <span className="sr-only">Close</span>
                        <XMarkIcon className="h-5 w-5" />
                    </button>
                )}
            </div>
        </div>
    );
};

export default SuccessAlert;