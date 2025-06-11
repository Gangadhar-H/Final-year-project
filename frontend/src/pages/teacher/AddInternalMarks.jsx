// frontend/src/pages/teacher/AddInternalMarks.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getStudentsForAttendance } from '../../services/teacherService';
import {
    addInternalMarks,
    updateInternalMarks,
    getInternalMarks,
    validateMarksData,
    handleApiError,
    checkDuplicateExamType
} from '../../services/internalMarksService';

const AddInternalMarks = () => {
    const { subjectId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();

    // Get initial data from navigation state (if editing)
    const initialData = location.state?.editData || null;
    const isEditing = !!initialData;

    // Form state
    const [formData, setFormData] = useState({
        division: initialData?.division || '',
        examType: initialData?.examType || '',
        maxMarks: initialData?.maxMarks || '',
        examDate: initialData?.examDate ? new Date(initialData.examDate).toISOString().split('T')[0] : '',
        remarks: initialData?.remarks || ''
    });

    // Students and marks data
    const [students, setStudents] = useState([]);
    const [marksData, setMarksData] = useState([]);
    const [subject, setSubject] = useState(null);

    // UI state
    const [loading, setLoading] = useState(false);
    const [loadingStudents, setLoadingStudents] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [validationErrors, setValidationErrors] = useState([]);

    // Configuration
    const examTypes = [
        'Internal 1',
        'Internal 2',
        'Internal 3',
        'Assignment',
        'Quiz',
        'Project',
        'Practical',
        'Viva'
    ];

    const divisions = ['A', 'B', 'C', 'D'];

    // Load subject details and students when component mounts
    useEffect(() => {
        if (subjectId) {
            loadSubjectAndStudents();
        }
    }, [subjectId]);

    // Load existing marks if editing
    useEffect(() => {
        if (isEditing && initialData && students.length > 0) {
            loadExistingMarks();
        }
    }, [isEditing, initialData, students]);

    const loadSubjectAndStudents = async () => {
        try {
            setLoadingStudents(true);
            setError('');

            // Get subject info from location state or API
            const subjectInfo = location.state?.subject;
            if (subjectInfo) {
                setSubject(subjectInfo);
                await loadStudents(formData.division || subjectInfo.divisions?.[0] || 'A');
            } else {
                // If no subject info, we'll need to get it from the students API response
                await loadStudents('A'); // Default division
            }
        } catch (error) {
            const errorInfo = handleApiError(error);
            setError(errorInfo.message);
        } finally {
            setLoadingStudents(false);
        }
    };

    const loadStudents = async (division) => {
        try {
            const response = await getStudentsForAttendance(subjectId, { division });

            if (response.students && Array.isArray(response.students)) {
                setStudents(response.students);

                // Set subject info if we don't have it
                if (!subject && response.subject) {
                    setSubject(response.subject);
                }

                // Initialize marks data for new entries
                if (!isEditing) {
                    const initialMarks = response.students.map(student => ({
                        studentId: student._id,
                        student: student,
                        obtainedMarks: ''
                    }));
                    setMarksData(initialMarks);
                }
            } else {
                setError('No students found for this subject and division');
                setStudents([]);
                setMarksData([]);
            }
        } catch (error) {
            const errorInfo = handleApiError(error);
            setError(errorInfo.message);
            setStudents([]);
            setMarksData([]);
        }
    };

    const loadExistingMarks = async () => {
        try {
            const response = await getInternalMarks(subjectId, {
                division: initialData.division,
                examType: initialData.examType
            });

            if (response.marks && response.marks.length > 0) {
                // Map existing marks to students
                const existingMarksMap = {};
                response.marks.forEach(mark => {
                    existingMarksMap[mark.student._id] = {
                        markId: mark._id,
                        obtainedMarks: mark.obtainedMarks
                    };
                });

                // Update marks data with existing values
                const updatedMarksData = students.map(student => ({
                    studentId: student._id,
                    student: student,
                    obtainedMarks: existingMarksMap[student._id]?.obtainedMarks || '',
                    markId: existingMarksMap[student._id]?.markId || null
                }));

                setMarksData(updatedMarksData);
            }
        } catch (error) {
            console.error('Error loading existing marks:', error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Clear validation errors when user starts typing
        if (validationErrors.length > 0) {
            setValidationErrors([]);
        }

        // If division changes, reload students
        if (name === 'division' && value !== formData.division) {
            loadStudents(value);
        }
    };

    const handleMarksChange = (studentId, value) => {
        // Validate marks input
        const marks = parseFloat(value);
        const maxMarks = parseFloat(formData.maxMarks);

        if (value !== '' && (isNaN(marks) || marks < 0)) {
            return; // Don't update if invalid
        }

        if (value !== '' && maxMarks && marks > maxMarks) {
            setError(`Marks cannot exceed maximum marks (${maxMarks})`);
            return;
        } else {
            setError(''); // Clear error if valid
        }

        setMarksData(prev =>
            prev.map(item =>
                item.studentId === studentId
                    ? { ...item, obtainedMarks: value }
                    : item
            )
        );
    };

    const validateForm = async () => {
        const errors = [];

        // Basic form validation
        if (!formData.division) errors.push('Division is required');
        if (!formData.examType) errors.push('Exam type is required');
        if (!formData.maxMarks || formData.maxMarks <= 0) errors.push('Valid maximum marks are required');
        if (!formData.examDate) errors.push('Exam date is required');

        // Check if exam date is not in future
        const examDate = new Date(formData.examDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (examDate > today) {
            errors.push('Exam date cannot be in the future');
        }

        // Check for duplicate exam type (only for new entries)
        if (!isEditing && formData.division && formData.examType) {
            try {
                const isDuplicate = await checkDuplicateExamType(subjectId, formData.division, formData.examType);
                if (isDuplicate) {
                    errors.push(`Marks for ${formData.examType} in division ${formData.division} already exist. Please edit the existing marks instead.`);
                }
            } catch (error) {
                console.error('Error checking duplicate exam type:', error);
            }
        }

        // Validate marks data
        const studentsWithMarks = marksData.filter(item => item.obtainedMarks !== '');
        if (studentsWithMarks.length === 0) {
            errors.push('Please enter marks for at least one student');
        }

        // Validate individual marks
        const maxMarks = parseFloat(formData.maxMarks);
        marksData.forEach((item, index) => {
            if (item.obtainedMarks !== '') {
                const marks = parseFloat(item.obtainedMarks);
                if (isNaN(marks) || marks < 0) {
                    errors.push(`Invalid marks for ${item.student.name}`);
                } else if (marks > maxMarks) {
                    errors.push(`Marks for ${item.student.name} cannot exceed maximum marks (${maxMarks})`);
                }
            }
        });

        return errors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setLoading(true);
            setError('');
            setSuccess('');
            setValidationErrors([]);

            // Validate form
            const errors = await validateForm();
            if (errors.length > 0) {
                setValidationErrors(errors);
                return;
            }

            // Prepare marks data for submission
            const submissionData = {
                division: formData.division,
                examType: formData.examType,
                maxMarks: parseFloat(formData.maxMarks),
                examDate: formData.examDate,
                remarks: formData.remarks,
                marksData: marksData
                    .filter(item => item.obtainedMarks !== '')
                    .map(item => ({
                        studentId: item.studentId,
                        obtainedMarks: parseFloat(item.obtainedMarks)
                    }))
            };

            // Validate using service function
            const validation = validateMarksData(submissionData);
            if (!validation.isValid) {
                setValidationErrors(validation.errors);
                return;
            }

            let response;
            if (isEditing) {
                // For editing, we need to handle individual mark updates
                const updatePromises = marksData
                    .filter(item => item.obtainedMarks !== '' && item.markId)
                    .map(item =>
                        updateInternalMarks(item.markId, {
                            obtainedMarks: parseFloat(item.obtainedMarks),
                            maxMarks: parseFloat(formData.maxMarks),
                            examDate: formData.examDate,
                            remarks: formData.remarks
                        })
                    );

                await Promise.all(updatePromises);
                setSuccess('Marks updated successfully!');
            } else {
                // Add new marks
                response = await addInternalMarks(subjectId, submissionData);
                setSuccess(`Marks added successfully! ${response.savedCount} student(s) processed.`);

                if (response.errors && response.errors.length > 0) {
                    setValidationErrors(response.errors);
                }
            }

            // Redirect after a short delay
            setTimeout(() => {
                navigate('/teacher/internal-marks', {
                    state: { success: isEditing ? 'Marks updated successfully!' : 'Marks added successfully!' }
                });
            }, 2000);

        } catch (error) {
            const errorInfo = handleApiError(error);
            setError(errorInfo.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        navigate('/teacher/internal-marks');
    };

    const fillAllMarks = (marks) => {
        const maxMarks = parseFloat(formData.maxMarks);
        const fillMarks = parseFloat(marks);

        if (isNaN(fillMarks) || fillMarks < 0 || fillMarks > maxMarks) {
            setError(`Please enter valid marks between 0 and ${maxMarks}`);
            return;
        }

        setMarksData(prev =>
            prev.map(item => ({
                ...item,
                obtainedMarks: fillMarks
            }))
        );
        setError('');
    };

    const clearAllMarks = () => {
        setMarksData(prev =>
            prev.map(item => ({
                ...item,
                obtainedMarks: ''
            }))
        );
    };

    if (loadingStudents) {
        return (
            <div className="p-6 max-w-7xl mx-auto">
                <div className="flex items-center justify-center py-16">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    <span className="ml-4 text-gray-600">Loading students...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            {isEditing ? 'Edit Internal Marks' : 'Add Internal Marks'}
                        </h1>
                        <p className="text-gray-600 mt-2">
                            {subject ? (
                                <>Managing marks for {subject.subjectName} ({subject.subjectCode})</>
                            ) : (
                                'Loading subject information...'
                            )}
                        </p>
                    </div>
                    <button
                        onClick={handleCancel}
                        className="px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 transition duration-200"
                    >
                        <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back to Marks
                    </button>
                </div>
            </div>

            {/* Error Messages */}
            {error && (
                <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                    <div className="flex justify-between items-start">
                        <span>{error}</span>
                        <button onClick={() => setError('')} className="text-red-700 hover:text-red-900">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>
            )}

            {/* Validation Errors */}
            {validationErrors.length > 0 && (
                <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                    <div className="flex justify-between items-start">
                        <div>
                            <h4 className="font-medium mb-2">Please fix the following errors:</h4>
                            <ul className="list-disc list-inside space-y-1">
                                {validationErrors.map((error, index) => (
                                    <li key={index} className="text-sm">{error}</li>
                                ))}
                            </ul>
                        </div>
                        <button onClick={() => setValidationErrors([])} className="text-red-700 hover:text-red-900">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>
            )}

            {/* Success Message */}
            {success && (
                <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
                    <div className="flex justify-between items-center">
                        <span>{success}</span>
                        <button onClick={() => setSuccess('')} className="text-green-700 hover:text-green-900">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Exam Details */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Exam Details</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Division <span className="text-red-500">*</span>
                            </label>
                            <select
                                name="division"
                                value={formData.division}
                                onChange={handleInputChange}
                                required
                                disabled={isEditing}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                            >
                                <option value="">Select Division</option>
                                {divisions.map(division => (
                                    <option key={division} value={division}>{division}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Exam Type <span className="text-red-500">*</span>
                            </label>
                            <select
                                name="examType"
                                value={formData.examType}
                                onChange={handleInputChange}
                                required
                                disabled={isEditing}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                            >
                                <option value="">Select Exam Type</option>
                                {examTypes.map(type => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Maximum Marks <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                name="maxMarks"
                                value={formData.maxMarks}
                                onChange={handleInputChange}
                                required
                                min="1"
                                max="100"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="e.g., 25"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Exam Date <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="date"
                                name="examDate"
                                value={formData.examDate}
                                onChange={handleInputChange}
                                required
                                max={new Date().toISOString().split('T')[0]}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Remarks (Optional)
                        </label>
                        <textarea
                            name="remarks"
                            value={formData.remarks}
                            onChange={handleInputChange}
                            rows="2"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Any additional remarks about this exam..."
                        />
                    </div>
                </div>

                {/* Students Marks */}
                {students.length > 0 && (
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold text-gray-900">
                                Student Marks ({students.length} students)
                            </h2>

                            {/* Bulk Actions */}
                            <div className="flex gap-2">
                                <div className="flex items-center gap-2">
                                    <input
                                        type="number"
                                        placeholder="Fill all"
                                        min="0"
                                        max={formData.maxMarks}
                                        className="w-20 px-2 py-1 text-sm border border-gray-300 rounded"
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter') {
                                                fillAllMarks(e.target.value);
                                                e.target.value = '';
                                            }
                                        }}
                                    />
                                    <button
                                        type="button"
                                        onClick={clearAllMarks}
                                        className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                                    >
                                        Clear All
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="min-w-full">
                                <thead>
                                    <tr className="bg-gray-50">
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Student
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            UUCMS No
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Marks (Max: {formData.maxMarks || 0})
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Percentage
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {marksData.map((item, index) => {
                                        const percentage = item.obtainedMarks && formData.maxMarks
                                            ? ((parseFloat(item.obtainedMarks) / parseFloat(formData.maxMarks)) * 100).toFixed(1)
                                            : '';

                                        return (
                                            <tr key={item.studentId} className="hover:bg-gray-50">
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {item.student.name}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                                    {item.student.uucmsNo}
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    <input
                                                        type="number"
                                                        value={item.obtainedMarks}
                                                        onChange={(e) => handleMarksChange(item.studentId, e.target.value)}
                                                        min="0"
                                                        max={formData.maxMarks}
                                                        step="0.5"
                                                        className="w-20 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        placeholder="0"
                                                    />
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                                    {percentage && `${percentage}%`}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* No Students Message */}
                {students.length === 0 && !loadingStudents && (
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="text-center py-8">
                            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5 0V9a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9v.75m18 0A2.25 2.25 0 0018.75 12H5.25a2.25 2.25 0 01-2.25-2.25V9z" />
                            </svg>
                            <h3 className="mt-2 text-sm font-medium text-gray-900">No Students Found</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                No students are enrolled for this subject and division.
                            </p>
                        </div>
                    </div>
                )}

                {/* Form Actions */}
                {students.length > 0 && (
                    <div className="flex justify-end gap-4 pt-6">
                        <button
                            type="button"
                            onClick={handleCancel}
                            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 transition duration-200"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    {isEditing ? 'Updating...' : 'Adding...'}
                                </>
                            ) : (
                                isEditing ? 'Update Marks' : 'Add Marks'
                            )}
                        </button>
                    </div>
                )}
            </form>
        </div>
    );
};

export default AddInternalMarks;