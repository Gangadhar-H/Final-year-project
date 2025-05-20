import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../../api/axios';

const TeacherDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [teacher, setTeacher] = useState(null);
    const [subjectDetails, setSubjectDetails] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [allSubjects, setAllSubjects] = useState([]);

    useEffect(() => {
        const fetchTeacherDetails = async () => {
            try {
                setLoading(true);
                const response = await API.get(`/admin/teacher/${id}`);
                setTeacher(response.data.teacher);
                setError(null);

                // Fetch all semester information
                const semestersResponse = await API.get('/admin/semesters/getAllSemesters');
                const semesters = semestersResponse.data.semesters || [];

                // Fetch subjects for all semesters
                const subjectsPromises = semesters.map(semester =>
                    API.get(`/admin/semesters/${semester.semesterNumber}/subjects`)
                );

                const subjectsResponses = await Promise.all(subjectsPromises);
                let allSubjectsData = [];

                subjectsResponses.forEach(response => {
                    if (response.data.subjects) {
                        allSubjectsData = [...allSubjectsData, ...response.data.subjects];
                    }
                });

                setAllSubjects(allSubjectsData);

                // Populate subject details if teacher has assigned subjects
                if (response.data.teacher.assignedSubjects?.length > 0) {
                    mapSubjectsToAssignments(response.data.teacher.assignedSubjects, allSubjectsData);
                }
            } catch (err) {
                setError('Failed to load teacher details');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchTeacherDetails();
    }, [id]);

    // Map subjects to teacher assignments
    const mapSubjectsToAssignments = (assignedSubjects, subjects) => {
        const subjectsMap = {};

        assignedSubjects.forEach(assignment => {
            const subject = subjects.find(s => s._id === assignment.subjectId);
            if (subject) {
                subjectsMap[assignment.subjectId] = subject;
            } else {
                // Fallback if subject not found
                subjectsMap[assignment.subjectId] = {
                    subjectName: 'Unknown Subject',
                    subjectCode: 'N/A'
                };
            }
        });

        setSubjectDetails(subjectsMap);
    };

    // Update subject details when all subjects or teacher assignments change
    useEffect(() => {
        if (teacher?.assignedSubjects?.length > 0 && allSubjects.length > 0) {
            mapSubjectsToAssignments(teacher.assignedSubjects, allSubjects);
        }
    }, [teacher?.assignedSubjects, allSubjects]);

    const handleEditTeacher = () => {
        navigate(`/admin/teachers/edit/${id}`);
    };

    const handleDeleteConfirmation = () => {
        setDeleteModalOpen(true);
    };

    const handleDeleteTeacher = async () => {
        try {
            await API.delete(`/admin/teacher/${id}`);
            setDeleteModalOpen(false);
            navigate('/admin/teachers');
        } catch (err) {
            setError('Failed to delete teacher');
            console.error(err);
            setDeleteModalOpen(false);
        }
    };

    const handleRemoveSubjectAssignment = async (subjectId, division) => {
        try {
            await API.delete(`/admin/subjects/${subjectId}/teacher-assignment`, {
                data: {
                    teacherId: id,
                    division
                }
            });

            // Update local state
            setTeacher(prev => ({
                ...prev,
                assignedSubjects: prev.assignedSubjects.filter(
                    assignment => !(assignment.subjectId === subjectId && assignment.division === division)
                )
            }));
        } catch (err) {
            setError('Failed to remove subject assignment');
            console.error(err);
        }
    };

    const handleBackToList = () => {
        navigate('/admin/teachers');
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
                <p className="ml-2">Loading teacher details...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded mb-4">
                <p>{error}</p>
                <button
                    onClick={handleBackToList}
                    className="mt-2 text-blue-600 hover:text-blue-800"
                >
                    Back to Teachers List
                </button>
            </div>
        );
    }

    if (!teacher) {
        return (
            <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded mb-4">
                <p>Teacher not found</p>
                <button
                    onClick={handleBackToList}
                    className="mt-2 text-blue-600 hover:text-blue-800"
                >
                    Back to Teachers List
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header with navigation and actions */}
            <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                    <button
                        onClick={handleBackToList}
                        className="flex items-center text-gray-600 hover:text-blue-600"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                        </svg>
                        Back to Teachers
                    </button>
                    <h2 className="text-2xl font-bold">Teacher Details</h2>
                </div>
                <div className="flex space-x-2">
                    <button
                        onClick={handleEditTeacher}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition flex items-center"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                        Edit Teacher
                    </button>
                    <button
                        onClick={handleDeleteConfirmation}
                        className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition flex items-center"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        Delete Teacher
                    </button>
                </div>
            </div>

            {/* Teacher Basic Information */}
            <div className="bg-white p-6 rounded shadow">
                <h3 className="text-lg font-semibold mb-4 border-b pb-2">Teacher Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <p className="text-gray-600 text-sm">Teacher ID</p>
                        <p className="font-medium">{teacher.teacherId}</p>
                    </div>
                    <div>
                        <p className="text-gray-600 text-sm">Full Name</p>
                        <p className="font-medium">{teacher.name}</p>
                    </div>
                    <div>
                        <p className="text-gray-600 text-sm">Email Address</p>
                        <p className="font-medium">{teacher.email}</p>
                    </div>
                    <div>
                        <p className="text-gray-600 text-sm">Account Created</p>
                        <p className="font-medium">{new Date(teacher.createdAt).toLocaleDateString()}</p>
                    </div>
                </div>
            </div>

            {/* Assigned Subjects Section */}
            <div className="bg-white p-6 rounded shadow">
                <h3 className="text-lg font-semibold mb-4 border-b pb-2">
                    Assigned Subjects
                    <span className="ml-2 bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                        {teacher.assignedSubjects?.length || 0}
                    </span>
                </h3>

                {!teacher.assignedSubjects || teacher.assignedSubjects.length === 0 ? (
                    <div className="text-center py-10 bg-gray-50 rounded">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="text-gray-500">No subjects assigned to this teacher yet.</p>
                        <button
                            onClick={() => navigate('/admin/teachers/assign')}
                            className="mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                            Go to subject assignment
                        </button>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-white">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="py-2 px-4 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject Code</th>
                                    <th className="py-2 px-4 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject Name</th>
                                    <th className="py-2 px-4 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Division</th>
                                    <th className="py-2 px-4 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {teacher.assignedSubjects.map((assignment, index) => {
                                    const subject = subjectDetails[assignment.subjectId] || {};
                                    return (
                                        <tr key={`${assignment.subjectId}-${assignment.division}-${index}`} className="hover:bg-gray-50">
                                            <td className="py-2 px-4 whitespace-nowrap">{subject.subjectCode || 'N/A'}</td>
                                            <td className="py-2 px-4 whitespace-nowrap">{subject.subjectName || 'Unknown Subject'}</td>
                                            <td className="py-2 px-4 whitespace-nowrap">{assignment.division}</td>
                                            <td className="py-2 px-4 whitespace-nowrap">
                                                <button
                                                    onClick={() => handleRemoveSubjectAssignment(assignment.subjectId, assignment.division)}
                                                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                                                >
                                                    Remove
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            {deleteModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
                        <h3 className="text-lg font-semibold text-red-600 mb-4">Delete Teacher</h3>
                        <p className="mb-6">
                            Are you sure you want to delete teacher <strong>{teacher.name}</strong>? This action cannot be undone.
                        </p>
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => setDeleteModalOpen(false)}
                                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteTeacher}
                                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TeacherDetail;