import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import studentService from '../../services/studentService';
import {
    BookOpenIcon,
    AcademicCapIcon,
    CalendarIcon,
    ClockIcon,
    UserGroupIcon,
    ChevronRightIcon,
    ExclamationTriangleIcon,
    InformationCircleIcon
} from '@heroicons/react/24/outline';

export default function Subjects() {
    const { user } = useAuth();
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedSubject, setSelectedSubject] = useState(null);
    const [showDetails, setShowDetails] = useState(false);

    useEffect(() => {
        fetchSubjects();
    }, []);

    const fetchSubjects = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await studentService.getSubjects();
            setSubjects(response.subjects || []);
        } catch (err) {
            setError(err.message || 'Failed to fetch subjects');
            console.error('Error fetching subjects:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubjectClick = (subject) => {
        setSelectedSubject(subject);
        setShowDetails(true);
    };

    const closeDetails = () => {
        setShowDetails(false);
        setSelectedSubject(null);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
                <div className="max-w-7xl mx-auto">
                    <div className="animate-pulse">
                        <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="bg-white rounded-lg shadow-sm p-6">
                                    <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
                <div className="max-w-7xl mx-auto">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                        <div className="flex items-center">
                            <ExclamationTriangleIcon className="h-8 w-8 text-red-600 mr-3" />
                            <div>
                                <h3 className="text-lg font-medium text-red-800">Error Loading Subjects</h3>
                                <p className="text-red-600 mt-1">{error}</p>
                                <button
                                    onClick={fetchSubjects}
                                    className="mt-4 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
                                >
                                    Try Again
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="sm:flex sm:items-center sm:justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">My Subjects</h1>
                            <p className="mt-2 text-gray-600">
                                Semester {user?.semester?.semesterNumber || 'N/A'} - Division {user?.division || 'N/A'}
                            </p>
                        </div>
                        <div className="mt-4 sm:mt-0">
                            <div className="flex items-center bg-blue-50 text-blue-700 px-4 py-2 rounded-lg">
                                <InformationCircleIcon className="h-5 w-5 mr-2" />
                                <span className="text-sm font-medium">
                                    Total Subjects: {subjects.length}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Subjects Grid */}
                {subjects.length === 0 ? (
                    <div className="text-center py-12">
                        <BookOpenIcon className="mx-auto h-24 w-24 text-gray-300" />
                        <h3 className="mt-4 text-lg font-medium text-gray-900">No Subjects Found</h3>
                        <p className="mt-2 text-gray-500">
                            No subjects are currently assigned to your semester and division.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {subjects.map((subject) => (
                            <SubjectCard
                                key={subject._id}
                                subject={subject}
                                onClick={() => handleSubjectClick(subject)}
                            />
                        ))}
                    </div>
                )}

                {/* Subject Details Modal */}
                {showDetails && selectedSubject && (
                    <SubjectDetailsModal
                        subject={selectedSubject}
                        onClose={closeDetails}
                    />
                )}
            </div>
        </div>
    );
}

function SubjectCard({ subject, onClick }) {
    return (
        <div
            className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer border border-gray-200 overflow-hidden"
            onClick={onClick}
        >
            <div className="p-6">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <div className="flex items-center mb-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <BookOpenIcon className="h-6 w-6 text-blue-600" />
                            </div>
                            <div className="ml-3">
                                <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
                                    {subject.subjectName}
                                </h3>
                                <p className="text-sm text-gray-500 font-mono">
                                    {subject.subjectCode}
                                </p>
                            </div>
                        </div>
                    </div>
                    <ChevronRightIcon className="h-5 w-5 text-gray-400" />
                </div>

                <div className="space-y-3">
                    <div className="flex items-center text-sm text-gray-600">
                        <AcademicCapIcon className="h-4 w-4 mr-2" />
                        <span>Semester {subject.semester?.semesterNumber || 'N/A'}</span>
                    </div>

                    <div className="flex items-center text-sm text-gray-600">
                        <CalendarIcon className="h-4 w-4 mr-2" />
                        <span>Academic Year 2024-25</span>
                    </div>

                    <div className="flex items-center text-sm text-gray-600">
                        <UserGroupIcon className="h-4 w-4 mr-2" />
                        <span>All Divisions</span>
                    </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">View Details</span>
                        <div className="flex items-center text-blue-600">
                            <span>Click to expand</span>
                            <ChevronRightIcon className="h-4 w-4 ml-1" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function SubjectDetailsModal({ subject, onClose }) {
    return (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-96 overflow-y-auto">
                <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900">Subject Details</h3>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                <div className="px-6 py-4">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Subject Name</label>
                            <p className="mt-1 text-sm text-gray-900">{subject.subjectName}</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Subject Code</label>
                            <p className="mt-1 text-sm text-gray-900 font-mono bg-gray-50 px-2 py-1 rounded">
                                {subject.subjectCode}
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Semester</label>
                            <p className="mt-1 text-sm text-gray-900">
                                {subject.semester?.semesterNumber || 'Not assigned'}
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Academic Information</label>
                            <div className="mt-2 bg-gray-50 rounded-lg p-3">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-gray-600">Type:</span>
                                        <span className="ml-2 text-gray-900">Core Subject</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Credits:</span>
                                        <span className="ml-2 text-gray-900">4</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Hours/Week:</span>
                                        <span className="ml-2 text-gray-900">5</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Status:</span>
                                        <span className="ml-2 text-green-600 font-medium">Active</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Quick Actions</label>
                            <div className="mt-2 flex flex-wrap gap-2">
                                <button className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors">
                                    <ClockIcon className="h-4 w-4 mr-1" />
                                    View Attendance
                                </button>
                                <button className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors">
                                    <AcademicCapIcon className="h-4 w-4 mr-1" />
                                    View Marks
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                    <div className="flex justify-end">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}