import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    ArrowLeft,
    User,
    Mail,
    BookOpen,
    Calendar,
    Edit,
    Trash2,
    AlertCircle,
    CheckCircle
} from 'lucide-react';
import officeService from '../../services/officeService';

const StudentDetails = () => {
    const { studentId } = useParams();
    const navigate = useNavigate();

    const [student, setStudent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    useEffect(() => {
        fetchStudentDetails();
    }, [studentId]);

    const fetchStudentDetails = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await officeService.getStudent(studentId);
            setStudent(response.student);
        } catch (err) {
            console.error('Error fetching student details:', err);
            setError(err.message || 'Failed to fetch student details');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteStudent = async () => {
        try {
            setDeleteLoading(true);
            await officeService.deleteStudent(studentId);

            // Show success message briefly before navigating
            setShowDeleteModal(false);
            // You can add a toast notification here if you have a toast system

            // Navigate back to students list
            navigate('/office/students', {
                state: {
                    message: `Student ${student.name} has been deleted successfully`
                }
            });
        } catch (err) {
            console.error('Error deleting student:', err);
            setError(err.message || 'Failed to delete student');
            setShowDeleteModal(false);
        } finally {
            setDeleteLoading(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Student</h2>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <div className="space-x-3">
                        <button
                            onClick={fetchStudentDetails}
                            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                        >
                            Try Again
                        </button>
                        <Link
                            to="/office/students"
                            className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors inline-block"
                        >
                            Back to Students
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    if (!student) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Student Not Found</h2>
                    <p className="text-gray-600 mb-4">The requested student could not be found.</p>
                    <Link
                        to="/office/students"
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors inline-block"
                    >
                        Back to Students
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => navigate('/office/students')}
                            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
                        >
                            <ArrowLeft className="h-5 w-5 mr-1" />
                            Back to Students
                        </button>
                        <div className="h-6 border-l border-gray-300"></div>
                        <h1 className="text-2xl font-bold text-gray-900">Student Details</h1>
                    </div>

                    <div className="flex items-center space-x-3">
                        <Link
                            to={`/office/students/${student._id}/edit`}
                            className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                        >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Student
                        </Link>
                        <button
                            onClick={() => setShowDeleteModal(true)}
                            className="flex items-center bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
                        >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Student
                        </button>
                    </div>
                </div>
            </div>

            {/* Student Information Card */}
            <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                {/* Header with student name and status */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-8">
                    <div className="flex items-center space-x-4">
                        <div className="bg-white/20 p-3 rounded-full">
                            <User className="h-8 w-8 text-white" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-white">{student.name}</h2>
                            <p className="text-blue-100">UUCMS No: {student.uucmsNo}</p>
                        </div>
                    </div>
                </div>

                {/* Student Details */}
                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Basic Information */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">
                                Basic Information
                            </h3>
                            <div className="space-y-4">
                                <div className="flex items-start space-x-3">
                                    <User className="h-5 w-5 text-gray-400 mt-1" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Full Name</p>
                                        <p className="text-gray-900">{student.name}</p>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-3">
                                    <Mail className="h-5 w-5 text-gray-400 mt-1" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Email Address</p>
                                        <p className="text-gray-900">{student.email}</p>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-3">
                                    <BookOpen className="h-5 w-5 text-gray-400 mt-1" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">UUCMS Number</p>
                                        <p className="text-gray-900 font-mono">{student.uucmsNo}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Academic Information */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">
                                Academic Information
                            </h3>
                            <div className="space-y-4">
                                <div className="flex items-start space-x-3">
                                    <BookOpen className="h-5 w-5 text-gray-400 mt-1" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Semester</p>
                                        <p className="text-gray-900">
                                            {student.semester?.semesterNumber
                                                ? `Semester ${student.semester.semesterNumber}`
                                                : 'N/A'
                                            }
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-3">
                                    <div className="h-5 w-5 bg-gray-400 rounded-full mt-1 flex items-center justify-center">
                                        <span className="text-xs font-bold text-white">D</span>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Division</p>
                                        <p className="text-gray-900">{student.division}</p>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-3">
                                    <Calendar className="h-5 w-5 text-gray-400 mt-1" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Enrolled Date</p>
                                        <p className="text-gray-900">{formatDate(student.createdAt)}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Additional Information */}
                    <div className="mt-8 pt-6 border-t border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">System Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <p className="text-sm font-medium text-gray-500 mb-1">Student ID</p>
                                <p className="text-gray-900 font-mono text-sm">{student._id}</p>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-lg">
                                <p className="text-sm font-medium text-gray-500 mb-1">Created At</p>
                                <p className="text-gray-900 text-sm">{formatDate(student.createdAt)}</p>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-lg">
                                <p className="text-sm font-medium text-gray-500 mb-1">Last Updated</p>
                                <p className="text-gray-900 text-sm">{formatDate(student.updatedAt)}</p>
                            </div>
                        </div>
                    </div>

                    {/* Status Badge */}
                    <div className="mt-6 flex items-center">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                        <span className="text-green-700 bg-green-100 px-3 py-1 rounded-full text-sm font-medium">
                            Active Student
                        </span>
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg max-w-md w-full mx-4">
                        <div className="p-6">
                            <div className="flex items-center mb-4">
                                <div className="bg-red-100 p-2 rounded-full mr-3">
                                    <AlertCircle className="h-6 w-6 text-red-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900">Confirm Delete</h3>
                            </div>

                            <p className="text-gray-600 mb-6">
                                Are you sure you want to delete <strong>{student.name}</strong>?
                                This action cannot be undone and will permanently remove all associated data.
                            </p>

                            <div className="flex justify-end space-x-3">
                                <button
                                    onClick={() => setShowDeleteModal(false)}
                                    disabled={deleteLoading}
                                    className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDeleteStudent}
                                    disabled={deleteLoading}
                                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center"
                                >
                                    {deleteLoading ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                            Deleting...
                                        </>
                                    ) : (
                                        <>
                                            <Trash2 className="h-4 w-4 mr-2" />
                                            Delete Student
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentDetails;