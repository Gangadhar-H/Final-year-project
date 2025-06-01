import React, { useState } from 'react';
import { Upload, FileText, Download, AlertCircle, Loader2 } from 'lucide-react';

const QuestionPaperGenerator = () => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [dragActive, setDragActive] = useState(false);
    const [questions, setQuestions] = useState({
        twoMarks: 5,
        fourMarks: 3,
        eightMarks: 2
    });
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedContent, setGeneratedContent] = useState(null);
    const [error, setError] = useState('');

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        const files = e.dataTransfer.files;
        if (files && files[0]) {
            handleFileSelect(files[0]);
        }
    };

    const handleFileSelect = (file) => {
        setError('');

        // Check file type
        const allowedTypes = [
            'application/pdf',
            'application/vnd.ms-powerpoint',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            'text/plain'
        ];

        if (!allowedTypes.includes(file.type)) {
            setError('Please upload a PDF, PowerPoint, or text file.');
            return;
        }

        // Check file size (20MB limit for API compatibility)
        const maxSize = 20 * 1024 * 1024; // 20MB
        if (file.size > maxSize) {
            setError('File size should be less than 20MB. For larger files, consider splitting them into smaller units.');
            return;
        }

        setSelectedFile(file);
    };

    const handleInputChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            handleFileSelect(file);
        }
    };

    const handleQuestionCountChange = (type, value) => {
        setQuestions(prev => ({
            ...prev,
            [type]: Math.max(0, parseInt(value) || 0)
        }));
    };

    const generateQuestionPaper = async () => {
        if (!selectedFile) {
            setError('Please upload a file first.');
            return;
        }

        if (questions.twoMarks + questions.fourMarks + questions.eightMarks === 0) {
            setError('Please specify at least one question.');
            return;
        }

        setIsGenerating(true);
        setError('');

        try {
            // Create FormData for file upload
            const formData = new FormData();
            formData.append('file', selectedFile);
            formData.append('twoMarks', questions.twoMarks);
            formData.append('fourMarks', questions.fourMarks);
            formData.append('eightMarks', questions.eightMarks);

            // This would be your API call
            const response = await fetch('/api/v1/teacher/generate-question-paper', {
                method: 'POST',
                body: formData,
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            setGeneratedContent(result);

        } catch (err) {
            setError('Failed to generate question paper. Please try again.');
            console.error('Generation error:', err);
        } finally {
            setIsGenerating(false);
        }
    };

    const downloadPDF = () => {
        // Implementation for PDF download
        console.log('Downloading PDF...');
    };

    const downloadDOCX = () => {
        // Implementation for DOCX download
        console.log('Downloading DOCX...');
    };

    const totalMarks = (questions.twoMarks * 2) + (questions.fourMarks * 4) + (questions.eightMarks * 8);

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
                <h1 className="text-2xl font-bold text-gray-800 mb-6">Question Paper Generator</h1>

                {/* File Upload Section */}
                <div className="mb-8">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                        Upload Study Material
                    </label>

                    <div
                        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${dragActive
                                ? 'border-blue-400 bg-blue-50'
                                : 'border-gray-300 hover:border-gray-400'
                            }`}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                    >
                        <input
                            type="file"
                            onChange={handleInputChange}
                            accept=".pdf,.ppt,.pptx,.txt"
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />

                        <div className="space-y-3">
                            <Upload className="mx-auto h-12 w-12 text-gray-400" />
                            <div>
                                <p className="text-lg font-medium text-gray-700">
                                    Drop your file here or click to browse
                                </p>
                                <p className="text-sm text-gray-500 mt-1">
                                    Supports PDF, PowerPoint, and text files (max 20MB)
                                </p>
                            </div>
                        </div>
                    </div>

                    {selectedFile && (
                        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
                            <div className="flex items-center">
                                <FileText className="h-5 w-5 text-green-600 mr-2" />
                                <div>
                                    <p className="text-sm font-medium text-green-800">{selectedFile.name}</p>
                                    <p className="text-xs text-green-600">
                                        {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Question Configuration */}
                <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Question Configuration</h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                2 Marks Questions
                            </label>
                            <input
                                type="number"
                                min="0"
                                value={questions.twoMarks}
                                onChange={(e) => handleQuestionCountChange('twoMarks', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="e.g., 5"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                4 Marks Questions
                            </label>
                            <input
                                type="number"
                                min="0"
                                value={questions.fourMarks}
                                onChange={(e) => handleQuestionCountChange('fourMarks', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="e.g., 3"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                8 Marks Questions
                            </label>
                            <input
                                type="number"
                                min="0"
                                value={questions.eightMarks}
                                onChange={(e) => handleQuestionCountChange('eightMarks', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="e.g., 2"
                            />
                        </div>
                    </div>

                    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                        <p className="text-sm text-blue-800">
                            <strong>Total Questions:</strong> {questions.twoMarks + questions.fourMarks + questions.eightMarks} |
                            <strong> Total Marks:</strong> {totalMarks}
                        </p>
                    </div>
                </div>

                {/* Error Display */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
                        <div className="flex items-center">
                            <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
                            <p className="text-sm text-red-800">{error}</p>
                        </div>
                    </div>
                )}

                {/* Generate Button */}
                <div className="mb-8">
                    <button
                        onClick={generateQuestionPaper}
                        disabled={isGenerating || !selectedFile}
                        className="w-full md:w-auto px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {isGenerating ? (
                            <div className="flex items-center justify-center">
                                <Loader2 className="animate-spin h-5 w-5 mr-2" />
                                Generating Questions...
                            </div>
                        ) : (
                            'Generate Question Paper'
                        )}
                    </button>
                </div>

                {/* Generated Content */}
                {generatedContent && (
                    <div className="border-t pt-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Generated Question Paper</h3>

                        <div className="bg-gray-50 rounded-md p-6 mb-4">
                            <h4 className="font-medium mb-3">Preview:</h4>
                            <div className="text-sm text-gray-700 space-y-2">
                                <p>✓ Generated {questions.twoMarks} two-mark questions</p>
                                <p>✓ Generated {questions.fourMarks} four-mark questions</p>
                                <p>✓ Generated {questions.eightMarks} eight-mark questions</p>
                                <p className="font-medium">Total: {totalMarks} marks</p>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={downloadPDF}
                                className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                            >
                                <Download className="h-4 w-4 mr-2" />
                                Download PDF
                            </button>

                            <button
                                onClick={downloadDOCX}
                                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                            >
                                <Download className="h-4 w-4 mr-2" />
                                Download DOCX
                            </button>
                        </div>
                    </div>
                )}

                {/* Tips Section */}
                <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                    <h4 className="font-medium text-yellow-800 mb-2">Tips for Better Results:</h4>
                    <ul className="text-sm text-yellow-700 space-y-1">
                        <li>• Keep files under 20MB for optimal processing</li>
                        <li>• Use clear, well-structured content for better question quality</li>
                        <li>• For large files (100-200 pages), consider splitting into smaller units</li>
                        <li>• PDF files generally work better than PowerPoint files</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default QuestionPaperGenerator;