import React, { useState, useEffect } from 'react';
import { PlusCircleIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import useAxios from '../../hooks/useAxios';
import Loader from '../../components/common/Loader';
import ErrorAlert from '../../components/common/ErrorAlert';
import SuccessAlert from '../../components/common/SuccessAlert';

const SubjectManagement = () => {
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState('add'); // 'add' or 'edit'
    const [currentSubject, setCurrentSubject] = useState(null);

    // Form states
    const [subjectCode, setSubjectCode] = useState('');
    const [subjectName, setSubjectName] = useState('');
    const [semesterId, setSemesterId] = useState('');

    // Alert states
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

    // Fetch subjects and semesters
    const {
        data: subjectsData,
        loading: subjectsLoading,
        error: subjectsError,
        refresh: refreshSubjects,
        sendRequest
    } = useAxios('/api/v1/admin/subjects');

    const {
        data: semestersData,
        loading: semestersLoading,
        error: semestersError
    } = useAxios('/api/v1/admin/semesters/getAllSemesters');

    useEffect(() => {
        if (subjectsError) {
            setError(subjectsError);
        }
        if (semestersError) {
            setError(semestersError);
        }
    }, [subjectsError, semestersError]);

    const handleOpenModal = (type, subject = null) => {
        setModalType(type);
        setError('');

        if (type === 'edit' && subject) {
            setCurrentSubject(subject);
            setSubjectCode(subject.subjectCode);
            setSubjectName(subject.subjectName);
            setSemesterId(subject.semester._id);
        } else {
            setCurrentSubject(null);
            setSubjectCode('');
            setSubjectName('');
            setSemesterId(semestersData?.semesters[0]?._id || '');
        }

        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate inputs
        if (!subjectCode || !subjectName || !semesterId) {
            setError('All fields are required');
            return;
        }

        try {
            if (modalType === 'add') {
                // Add new subject
                await sendRequest({
                    url: '/api/v1/admin/subjects/addSubject',
                    method: 'POST',
                    data: {
                        subjectCode,
                        subjectName,
                        semester: semesterId
                    }
                });
                setSuccess('Subject added successfully');
            } else if (modalType === 'edit') {
                // Update subject
                await sendRequest({
                    url: `/api/v1/admin/subjects/updateSubject/${currentSubject._id}`,
                    method: 'PUT',
                    data: {
                        subjectCode,
                        subjectName,
                        semester: semesterId
                    }
                });
                setSuccess('Subject updated successfully');
            }

            // Reset form and refresh data
            handleCloseModal();
            refreshSubjects();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to process your request');
        }
    };

    const handleDelete = async (subjectId) => {
        if (!window.confirm('Are you sure you want to delete this subject?')) {
            return;
        }

        try {
            await sendRequest({
                url: `/api/v1/admin/subjects/deleteSubject/${subjectId}`,
                method: 'DELETE'
            });
            setSuccess('Subject deleted successfully');
            refreshSubjects();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to delete subject');
        }
    };

    const isLoading = subjectsLoading || semestersLoading;

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader />
            </div>
        );
    }

    const subjects = subjectsData?.subjects || [];
    const semesters = semestersData?.semesters || [];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="page-heading">Subject Management</h1>
                    <p className="text-gray-600 mt-1">Add, edit and manage subjects</p>
                </div>
                <button
                    onClick={() => handleOpenModal('add')}
                    className="btn btn-primary flex items-center"
                    disabled={semesters.length === 0}
                >
                    <PlusCircleIcon className="h-5 w-5 mr-2" />
                    Add Subject
                </button>
            </div>

            {error && <ErrorAlert message={error} onClose={() => setError('')} />}
            {success && <SuccessAlert message={success} onClose={() => setSuccess('')} />}

            {semesters.length === 0 && (
                <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-md p-4">
                    <p>You need to create at least one semester before adding subjects.</p>
                </div>
            )}

            <div className="bg-white shadow-sm rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Subject Code
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Subject Name
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Semester
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {subjects.length > 0 ? (
                                subjects.map((subject) => (
                                    <tr key={subject._id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {subject.subjectCode}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {subject.subjectName}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {subject.semester?.semesterNumber || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button
                                                onClick={() => handleOpenModal('edit', subject)}
                                                className="text-indigo-600 hover:text-indigo-900 mr-4"
                                            >
                                                <PencilIcon className="h-5 w-5" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(subject._id)}
                                                className="text-red-600 hover:text-red-900"
                                            >
                                                <TrashIcon className="h-5 w-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">
                                        No subjects found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add/Edit Subject Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">
                            {modalType === 'add' ? 'Add New Subject' : 'Edit Subject'}
                        </h2>

                        {error && <ErrorAlert message={error} onClose={() => setError('')} />}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="subjectCode" className="form-label">
                                    Subject Code
                                </label>
                                <input
                                    id="subjectCode"
                                    type="text"
                                    className="form-input"
                                    value={subjectCode}
                                    onChange={(e) => setSubjectCode(e.target.value)}
                                    required
                                />
                            </div>

                            <div>
                                <label htmlFor="subjectName" className="form-label">
                                    Subject Name
                                </label>
                                <input
                                    id="subjectName"
                                    type="text"
                                    className="form-input"
                                    value={subjectName}
                                    onChange={(e) => setSubjectName(e.target.value)}
                                    required
                                />
                            </div>

                            <div>
                                <label htmlFor="semesterId" className="form-label">
                                    Semester
                                </label>
                                <select
                                    id="semesterId"
                                    className="form-input"
                                    value={semesterId}
                                    onChange={(e) => setSemesterId(e.target.value)}
                                    required
                                >
                                    <option value="">Select Semester</option>
                                    {semesters.map((semester) => (
                                        <option key={semester._id} value={semester._id}>
                                            Semester {semester.semesterNumber}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex justify-end space-x-3 pt-4">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={handleCloseModal}
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    {modalType === 'add' ? 'Add Subject' : 'Update Subject'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SubjectManagement;