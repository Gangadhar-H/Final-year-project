// src/components/teacher/InternalMarksForm.jsx
import { useState, useEffect } from 'react';
import { validateMarksData, checkDuplicateExamType } from '../../services/internalMarksService';

const InternalMarksForm = ({
    subject,
    students,
    onSubmit,
    onCancel,
    loading = false,
    initialData = null
}) => {
    const [formData, setFormData] = useState({
        division: '',
        examType: '',
        maxMarks: '',
        examDate: '',
        remarks: '',
        marksData: []
    });
    const [errors, setErrors] = useState({});
    const [duplicateWarning, setDuplicateWarning] = useState('');

    const examTypes = [
        'Internal 1',
        'Internal 2',
        'Internal 3',
        'Assignment',
        'Quiz',
        'Project'
    ];

    useEffect(() => {
        if (students && students.length > 0 && !initialData) {
            const marksData = students.map(student => ({
                studentId: student._id,
                obtainedMarks: 0
            }));
            setFormData(prev => ({ ...prev, marksData }));
        }
    }, [students, initialData]);

    useEffect(() => {
        if (initialData) {
            setFormData({
                division: initialData.division || '',
                examType: initialData.examType || '',
                maxMarks: initialData.maxMarks || '',
                examDate: initialData.examDate ? new Date(initialData.examDate).toISOString().split('T')[0] : '',
                remarks: initialData.remarks || '',
                marksData: initialData.marksData || []
            });
        }
    }, [initialData]);

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));

        // Clear specific error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const handleMarksChange = (studentId, obtainedMarks) => {
        const marks = parseFloat(obtainedMarks) || 0;

        setFormData(prev => ({
            ...prev,
            marksData: prev.marksData.map(mark =>
                mark.studentId === studentId
                    ? { ...mark, obtainedMarks: marks }
                    : mark
            )
        }));
    };

    const checkExamTypeDuplicate = async () => {
        if (formData.division && formData.examType && subject) {
            try {
                const isDuplicate = await checkDuplicateExamType(
                    subject._id,
                    formData.division,
                    formData.examType,
                    initialData?._id
                );

                if (isDuplicate) {
                    setDuplicateWarning(
                        `Warning: Marks for ${formData.examType} in division ${formData.division} already exist. Submitting will update existing marks.`
                    );
                } else {
                    setDuplicateWarning('');
                }
            } catch (error) {
                console.error('Error checking duplicate:', error);
            }
        }
    };

    useEffect(() => {
        checkExamTypeDuplicate();
    }, [formData.division, formData.examType]);

    const handleSubmit = (e) => {
        e.preventDefault();

        const validation = validateMarksData(formData);
        if (!validation.isValid) {
            const errorObj = {};
            validation.errors.forEach(error => {
                if (error.includes('Division')) errorObj.division = error;
                if (error.includes('Exam type')) errorObj.examType = error;
                if (error.includes('maximum marks')) errorObj.maxMarks = error;
                if (error.includes('Exam date')) errorObj.examDate = error;
                if (error.includes('Marks data')) errorObj.marksData = error;
            });
            setErrors(errorObj);
            return;
        }

        onSubmit(formData);
    };

    const setAllMarks = (marks) => {
        const marksValue = parseFloat(marks) || 0;
        if (marksValue > parseFloat(formData.maxMarks)) {
            alert('Marks cannot exceed maximum marks');
            return;
        }

        setFormData(prev => ({
            ...prev,
            marksData: prev.marksData.map(mark => ({
                ...mark,
                obtainedMarks: marksValue
            }))
        }));
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                    {initialData ? 'Edit Internal Marks' : 'Add Internal Marks'}
                </h2>
                {subject && (
                    <p className="text-gray-600 mt-1">
                        Subject: {subject.subjectName} ({subject.subjectCode})
                    </p>
                )}
            </div>

            {duplicateWarning && (
                <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                    <div className="flex">
                        <svg className="h-5 w-5 text-yellow-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        <p className="text-sm text-yellow-800">{duplicateWarning}</p>
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Division *
                        </label>
                        <select
                            value={formData.division}
                            onChange={(e) => handleInputChange('division', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        >
                            <option value="">Select Division</option>
                            <option value="A">A</option>
                            <option value="B">B</option>
                            <option value="C">C</option>
                        </select>
                        {errors.division && <p className="text-red-500 text-xs mt-1">{errors.division}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Exam Type *
                        </label>
                        <select
                            value={formData.examType}
                            onChange={(e) => handleInputChange('examType', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        >
                            <option value="">Select Exam Type</option>
                            {examTypes.map(type => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>
                        {errors.examType && <p className="text-red-500 text-xs mt-1">{errors.examType}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Maximum Marks *
                        </label>
                        <input
                            type="number"
                            min="1"
                            value={formData.maxMarks}
                            onChange={(e) => handleInputChange('maxMarks', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                        {errors.maxMarks && <p className="text-red-500 text-xs mt-1">{errors.maxMarks}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Exam Date *
                        </label>
                        <input
                            type="date"
                            value={formData.examDate}
                            onChange={(e) => handleInputChange('examDate', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                        {errors.examDate && <p className="text-red-500 text-xs mt-1">{errors.examDate}</p>}
                    </div>
                </div>

                {/* Remarks */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Remarks (Optional)
                    </label>
                    <textarea
                        value={formData.remarks}
                        onChange={(e) => handleInputChange('remarks', e.target.value)}
                        rows="2"
                        maxLength="500"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Any additional remarks about the exam..."
                    />
                </div>

                {/* Quick Actions */}
                {formData.maxMarks && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="text-sm font-medium text-gray-700 mb-2">Quick Fill Options:</h3>
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => setAllMarks(formData.maxMarks)}
                                className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded hover:bg-green-200"
                            >
                                Set All to Max ({formData.maxMarks})
                            </button>
                            <button
                                type="button"
                                onClick={() => setAllMarks(0)}
                                className="px-3 py-1 bg-red-100 text-red-800 text-sm rounded hover:bg-red-200"
                            >
                                Set All to 0
                            </button>
                            <button
                                type="button"
                                onClick={() => setAllMarks(formData.maxMarks * 0.8)}
                                className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded hover:bg-blue-200"
                            >
                                Set All to 80%
                            </button>
                        </div>
                    </div>
                )}

                {/* Students Marks */}
                {students && students.length > 0 && (
                    <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4">
                            Student Marks ({students.length} students)
                        </h3>
                        <div className="overflow-x-auto">
                            <table className="min-w-full bg-white border border-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                            Student Name
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                            UUCMS No
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                            Obtained Marks *
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                            Percentage
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {students.map(student => {
                                        const studentMark = formData.marksData.find(
                                            mark => mark.studentId === student._id
                                        );
                                        const obtainedMarks = studentMark?.obtainedMarks || 0;
                                        const percentage = formData.maxMarks ?
                                            ((obtainedMarks / formData.maxMarks) * 100).toFixed(1) : 0;

                                        return (
                                            <tr key={student._id} className="hover:bg-gray-50">
                                                <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                                    {student.name}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-500">
                                                    {student.uucmsNo}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        max={formData.maxMarks || 100}
                                                        value={obtainedMarks}
                                                        onChange={(e) => handleMarksChange(student._id, e.target.value)}
                                                        className="w-20 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                        required
                                                    />
                                                    <span className="text-gray-500 text-sm ml-1">
                                                        / {formData.maxMarks || '?'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-500">
                                                    {percentage}%
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                        {errors.marksData && <p className="text-red-500 text-sm mt-2">{errors.marksData}</p>}
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex justify-end space-x-4 pt-6">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
                        disabled={loading}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading || !students || students.length === 0}
                        className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Saving...' : initialData ? 'Update Marks' : 'Save Marks'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default InternalMarksForm;