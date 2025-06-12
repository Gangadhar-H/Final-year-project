import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getAssignedSubjects, getStudentsForMarks } from '../../services/teacherService';
import { addInternalMarks, validateMarksData, checkDuplicateExamType } from '../../services/internalMarksService';

function AddInternalMarks() {
    const { subjectId } = useParams();
    const navigate = useNavigate();

    const [subject, setSubject] = useState(null);
    const [students, setStudents] = useState([]);
    const [formData, setFormData] = useState({
        division: '',
        examType: '',
        maxMarks: '',
        examDate: '',
        remarks: ''
    });
    const [marksData, setMarksData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [warnings, setWarnings] = useState([]);

    const examTypes = ["Internal 1", "Internal 2", "Internal 3", "Assignment", "Quiz", "Project"];

    useEffect(() => {
        fetchSubjectDetails();
    }, [subjectId]);

    useEffect(() => {
        fetchStudents();
    }, [subjectId, formData.division]);

    const fetchSubjectDetails = async () => {
        try {
            const response = await getAssignedSubjects();
            const assignedSubject = response.assignedSubjects?.find(
                sub => sub.subjectId._id === subjectId
            );

            if (assignedSubject) {
                setSubject(assignedSubject);
                setFormData(prev => ({
                    ...prev,
                    division: assignedSubject.division
                }));
            } else {
                setError('Subject not found or not assigned to you');
            }
        } catch (error) {
            setError('Failed to load subject details');
            console.error('Error fetching subject:', error);
        }
    };

    const fetchStudents = async () => {
        if (!formData.division) {
            return; // Don't fetch if division is not selected
        }
        try {
            const response = await getStudentsForMarks(subjectId, formData.division);
            setStudents(response.students || []);

            // Initialize marks data for all students
            const initialMarksData = (response.students || []).map(student => ({
                studentId: student._id,
                obtainedMarks: ''
            }));
            setMarksData(initialMarksData);
        } catch (error) {
            setError('Failed to load students');
            console.error('Error fetching students:', error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        setError('');
        setSuccess('');
    };

    const handleMarksChange = (studentId, value) => {
        setMarksData(prev =>
            prev.map(mark =>
                mark.studentId === studentId
                    ? { ...mark, obtainedMarks: value === '' ? '' : parseFloat(value) }
                    : mark
            )
        );
        setError('');
        setSuccess('');
    };

    const checkForDuplicates = async () => {
        if (!formData.division || !formData.examType) return false;

        try {
            const isDuplicate = await checkDuplicateExamType(
                subjectId,
                formData.division,
                formData.examType
            );

            if (isDuplicate) {
                setWarnings(['Marks for this exam type already exist. Adding new marks will update existing ones.']);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error checking duplicates:', error);
            return false;
        }
    };

    const validateForm = () => {
        const validation = validateMarksData({
            ...formData,
            maxMarks: parseFloat(formData.maxMarks),
            marksData: marksData.filter(mark => mark.obtainedMarks !== '')
        });

        if (!validation.isValid) {
            setError(validation.errors.join(', '));
            return false;
        }

        // Check if at least one student has marks
        const hasMarks = marksData.some(mark => mark.obtainedMarks !== '');
        if (!hasMarks) {
            setError('Please enter marks for at least one student');
            return false;
        }

        // Validate individual marks
        const maxMarks = parseFloat(formData.maxMarks);
        const invalidMarks = marksData.filter(mark =>
            mark.obtainedMarks !== '' &&
            (mark.obtainedMarks < 0 || mark.obtainedMarks > maxMarks)
        );

        if (invalidMarks.length > 0) {
            setError(`Invalid marks detected. Marks should be between 0 and ${maxMarks}`);
            return false;
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setLoading(true);
        setError('');
        setSuccess('');
        setWarnings([]);

        try {
            // Check for duplicates
            await checkForDuplicates();

            // Filter out empty marks
            const validMarksData = marksData.filter(mark => mark.obtainedMarks !== '');

            const payload = {
                division: formData.division,
                examType: formData.examType,
                maxMarks: parseFloat(formData.maxMarks),
                examDate: formData.examDate,
                remarks: formData.remarks,
                marksData: validMarksData
            };

            const response = await addInternalMarks(subjectId, payload);

            setSuccess(`Successfully processed marks for ${response.savedCount} students`);

            if (response.errors && response.errors.length > 0) {
                setWarnings(response.errors);
            }

            // Reset form after successful submission
            setTimeout(() => {
                navigate('/teacher/internal-marks');
            }, 2000);

        } catch (error) {
            setError(error.response?.data?.message || 'Failed to add internal marks');
            console.error('Error adding marks:', error);
        } finally {
            setLoading(false);
        }
    };

    const fillAllMarks = (value) => {
        if (value === '' || (value >= 0 && value <= parseFloat(formData.maxMarks))) {
            setMarksData(prev =>
                prev.map(mark => ({
                    ...mark,
                    obtainedMarks: value === '' ? '' : parseFloat(value)
                }))
            );
        }
    };

    const clearAllMarks = () => {
        setMarksData(prev =>
            prev.map(mark => ({
                ...mark,
                obtainedMarks: ''
            }))
        );
    };

    if (!subject) {
        return (
            <div className="p-6">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading subject details...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            {/* Header */}
            <div className="mb-6">
                <button
                    onClick={() => navigate('/teacher/internal-marks')}
                    className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
                >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to Internal Marks
                </button>

                <h1 className="text-2xl font-bold text-gray-900 mb-2">Add Internal Marks</h1>
                <p className="text-gray-600">
                    {subject.subjectId.subjectName} ({subject.subjectId.subjectCode}) - Division {subject.division}
                </p>
            </div>

            {/* Success Message */}
            {success && (
                <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6">
                    <div className="flex">
                        <svg className="w-5 h-5 text-green-400 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <p className="text-green-800">{success}</p>
                    </div>
                </div>
            )}

            {/* Warning Messages */}
            {warnings.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
                    <div className="flex">
                        <svg className="w-5 h-5 text-yellow-400 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                        <div>
                            <p className="text-yellow-800 font-medium mb-2">Warnings:</p>
                            <ul className="text-yellow-700 text-sm list-disc list-inside">
                                {warnings.map((warning, index) => (
                                    <li key={index}>{warning}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
                    <div className="flex">
                        <svg className="w-5 h-5 text-red-400 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-red-800">{error}</p>
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Exam Details */}
                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Exam Details</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Division
                            </label>
                            <input
                                type="text"
                                value={formData.division}
                                disabled
                                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Exam Type <span className="text-red-500">*</span>
                            </label>
                            <select
                                name="examType"
                                value={formData.examType}
                                onChange={handleInputChange}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Select Exam Type</option>
                                {examTypes.map(type => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Maximum Marks <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                name="maxMarks"
                                value={formData.maxMarks}
                                onChange={handleInputChange}
                                min="1"
                                max="200"
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Exam Date <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="date"
                                name="examDate"
                                value={formData.examDate}
                                onChange={handleInputChange}
                                max={new Date().toISOString().split('T')[0]}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Remarks (Optional)
                        </label>
                        <textarea
                            name="remarks"
                            value={formData.remarks}
                            onChange={handleInputChange}
                            rows="2"
                            maxLength="500"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Any additional remarks about the exam..."
                        />
                    </div>
                </div>

                {/* Quick Actions */}
                {formData.maxMarks && (
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                        <h3 className="text-md font-semibold text-gray-900 mb-3">Quick Actions</h3>
                        <div className="flex flex-wrap gap-2">
                            <button
                                type="button"
                                onClick={() => fillAllMarks(formData.maxMarks)}
                                className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded-md hover:bg-green-200"
                            >
                                Fill All ({formData.maxMarks})
                            </button>
                            <button
                                type="button"
                                onClick={() => fillAllMarks(Math.floor(formData.maxMarks * 0.8))}
                                className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
                            >
                                Fill 80% ({Math.floor(formData.maxMarks * 0.8)})
                            </button>
                            <button
                                type="button"
                                onClick={() => fillAllMarks(Math.floor(formData.maxMarks * 0.6))}
                                className="px-3 py-1 text-sm bg-yellow-100 text-yellow-700 rounded-md hover:bg-yellow-200"
                            >
                                Fill 60% ({Math.floor(formData.maxMarks * 0.6)})
                            </button>
                            <button
                                type="button"
                                onClick={clearAllMarks}
                                className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded-md hover:bg-red-200"
                            >
                                Clear All
                            </button>
                        </div>
                    </div>
                )}

                {/* Student Marks */}
                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">
                        Student Marks ({students.length} students)
                    </h2>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Student Name
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        UUCMS No
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Obtained Marks
                                        {formData.maxMarks && (
                                            <span className="text-gray-400 font-normal">
                                                (out of {formData.maxMarks})
                                            </span>
                                        )}
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Percentage
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {students.map((student, index) => {
                                    const studentMark = marksData.find(mark => mark.studentId === student._id);
                                    const obtainedMarks = studentMark?.obtainedMarks || '';
                                    const percentage = obtainedMarks !== '' && formData.maxMarks
                                        ? ((obtainedMarks / parseFloat(formData.maxMarks)) * 100).toFixed(2)
                                        : '';

                                    return (
                                        <tr key={student._id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {student.name}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {student.uucmsNo}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <input
                                                    type="number"
                                                    value={obtainedMarks}
                                                    onChange={(e) => handleMarksChange(student._id, e.target.value)}
                                                    min="0"
                                                    max={formData.maxMarks || 100}
                                                    step="0.5"
                                                    className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    placeholder="0"
                                                />
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {percentage && `${percentage}%`}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end space-x-4">
                    <button
                        type="button"
                        onClick={() => navigate('/teacher/internal-marks')}
                        className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Adding Marks...' : 'Add Internal Marks'}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default AddInternalMarks;