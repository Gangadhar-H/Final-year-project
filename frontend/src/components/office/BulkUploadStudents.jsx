import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import officeService from '../../services/officeService';

const BulkUploadStudents = () => {
    const navigate = useNavigate();

    // State management
    const [file, setFile] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadResults, setUploadResults] = useState(null);
    const [showResults, setShowResults] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const [error, setError] = useState('');

    // Handle file selection
    const handleFileSelect = useCallback((selectedFile) => {
        // Reset previous states
        setError('');
        setUploadResults(null);
        setShowResults(false);
        setUploadProgress(0);

        // Validate file type
        const allowedTypes = [
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        ];

        if (!allowedTypes.includes(selectedFile.type)) {
            setError('Please select a valid Excel file (.xls or .xlsx)');
            return;
        }

        // Validate file size (5MB limit)
        if (selectedFile.size > 5 * 1024 * 1024) {
            setError('File size should not exceed 5MB');
            return;
        }

        setFile(selectedFile);
    }, []);

    // Handle drag and drop
    const handleDrag = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    }, []);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileSelect(e.dataTransfer.files[0]);
        }
    }, [handleFileSelect]);

    // Handle file input change
    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            handleFileSelect(e.target.files[0]);
        }
    };

    // Download template
    const handleDownloadTemplate = async () => {
        try {
            await officeService.downloadStudentTemplate();
        } catch (error) {
            setError(error.message || 'Failed to download template');
        }
    };

    // Upload file
    const handleUpload = async () => {
        if (!file) {
            setError('Please select a file first');
            return;
        }

        setIsUploading(true);
        setError('');
        setUploadProgress(0);

        try {
            const results = await officeService.bulkUploadStudents(
                file,
                (progress) => setUploadProgress(progress)
            );

            const processedResults = officeService.processBulkUploadResults(results);
            setUploadResults(processedResults);
            setShowResults(true);

            // Clear file after successful upload
            setFile(null);

        } catch (error) {
            setError(error.message || 'Upload failed');
        } finally {
            setIsUploading(false);
        }
    };

    // Reset form
    const handleReset = () => {
        setFile(null);
        setError('');
        setUploadResults(null);
        setShowResults(false);
        setUploadProgress(0);
    };

    // Results component
    const ResultsDisplay = ({ results }) => {
        const { summary, successful, errors, duplicates, hasErrors } = results;

        return (
            <div className="mt-6 space-y-4">
                {/* Summary */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload Summary</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">{summary.totalRecords}</div>
                            <div className="text-sm text-gray-600">Total Records</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">{summary.successful}</div>
                            <div className="text-sm text-gray-600">Successful</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-red-600">{summary.errors}</div>
                            <div className="text-sm text-gray-600">Errors</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-yellow-600">{summary.duplicates}</div>
                            <div className="text-sm text-gray-600">Duplicates</div>
                        </div>
                    </div>
                </div>

                {/* Successful uploads */}
                {successful.length > 0 && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <h4 className="text-lg font-medium text-green-800 mb-3">
                            Successfully Added Students ({successful.length})
                        </h4>
                        <div className="max-h-40 overflow-y-auto">
                            <div className="space-y-2">
                                {successful.map((item, index) => (
                                    <div key={index} className="text-sm text-green-700">
                                        Row {item.row}: {item.student.name} ({item.student.uucmsNo}) - {item.student.division}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Errors */}
                {errors.length > 0 && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <h4 className="text-lg font-medium text-red-800 mb-3">
                            Errors ({errors.length})
                        </h4>
                        <div className="max-h-40 overflow-y-auto">
                            <div className="space-y-2">
                                {errors.map((item, index) => (
                                    <div key={index} className="text-sm">
                                        <span className="font-medium text-red-700">Row {item.row}:</span>
                                        <span className="text-red-600 ml-2">{item.error}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Duplicates */}
                {duplicates.length > 0 && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <h4 className="text-lg font-medium text-yellow-800 mb-3">
                            Duplicate Records ({duplicates.length})
                        </h4>
                        <div className="max-h-40 overflow-y-auto">
                            <div className="space-y-2">
                                {duplicates.map((item, index) => (
                                    <div key={index} className="text-sm">
                                        <span className="font-medium text-yellow-700">Row {item.row}:</span>
                                        <span className="text-yellow-600 ml-2">{item.error}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Bulk Upload Students</h1>
                        <p className="text-gray-600 mt-1">Upload multiple students using Excel file</p>
                    </div>
                    <button
                        onClick={() => navigate('/office/students')}
                        className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                    >
                        ← Back to Students
                    </button>
                </div>
            </div>

            {/* Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h3 className="text-lg font-medium text-blue-800 mb-2">Instructions</h3>
                <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Download the template file and fill in student information</li>
                    <li>• Required fields: name, uucmsNo, email, semesterNumber, division</li>
                    <li>• Make sure UUCMS numbers and emails are unique</li>
                    <li>• File size should not exceed 5MB</li>
                    <li>• Supported formats: .xls, .xlsx</li>
                </ul>
            </div>

            {/* Template Download */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Step 1: Download Template</h3>
                <p className="text-gray-600 mb-4">
                    Download the Excel template with the correct format for student data.
                </p>
                <button
                    onClick={handleDownloadTemplate}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                    📥 Download Template
                </button>
            </div>

            {/* File Upload */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Step 2: Upload Excel File</h3>

                {/* Drag and Drop Area */}
                <div
                    className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${dragActive
                            ? 'border-blue-400 bg-blue-50'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                >
                    <div className="space-y-4">
                        <div className="text-4xl">📁</div>
                        <div>
                            <p className="text-lg font-medium text-gray-900">
                                {file ? file.name : 'Drag and drop your Excel file here'}
                            </p>
                            <p className="text-gray-600">
                                or{' '}
                                <label className="text-blue-600 hover:text-blue-700 cursor-pointer">
                                    browse to upload
                                    <input
                                        type="file"
                                        className="hidden"
                                        accept=".xlsx,.xls"
                                        onChange={handleFileChange}
                                        disabled={isUploading}
                                    />
                                </label>
                            </p>
                        </div>
                        {file && (
                            <div className="text-sm text-gray-600">
                                Size: {(file.size / 1024 / 1024).toFixed(2)} MB
                            </div>
                        )}
                    </div>
                </div>

                {/* Error Display */}
                {error && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                        <p className="text-red-700">{error}</p>
                    </div>
                )}

                {/* Progress Bar */}
                {isUploading && (
                    <div className="mt-4">
                        <div className="flex justify-between text-sm text-gray-600 mb-1">
                            <span>Uploading...</span>
                            <span>{uploadProgress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${uploadProgress}%` }}
                            ></div>
                        </div>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="mt-6 flex space-x-4">
                    <button
                        onClick={handleUpload}
                        disabled={!file || isUploading}
                        className={`px-6 py-2 rounded-md transition-colors ${!file || isUploading
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-green-600 text-white hover:bg-green-700'
                            }`}
                    >
                        {isUploading ? 'Uploading...' : '📤 Upload Students'}
                    </button>

                    <button
                        onClick={handleReset}
                        disabled={isUploading}
                        className="px-6 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors disabled:opacity-50"
                    >
                        🔄 Reset
                    </button>
                </div>
            </div>

            {/* Results */}
            {showResults && uploadResults && (
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">Upload Results</h3>
                        <button
                            onClick={() => setShowResults(false)}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            ✕
                        </button>
                    </div>

                    <ResultsDisplay results={uploadResults} />

                    {/* Action buttons after upload */}
                    <div className="mt-6 flex space-x-4">
                        <button
                            onClick={() => navigate('/office/students')}
                            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                        >
                            View All Students
                        </button>

                        <button
                            onClick={handleReset}
                            className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors"
                        >
                            Upload More Students
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BulkUploadStudents;