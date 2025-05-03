import React, { useState, useEffect } from 'react';
import { PlusCircleIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import useAxios from '../../hooks/useAxios';
import Loader from '../../components/common/Loader';
import ErrorAlert from '../../components/common/ErrorAlert';
import SuccessAlert from '../../components/common/SuccessAlert';

const SemesterManagement = () => {
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState('add'); // 'add' or 'edit'
    const [currentSemester, setCurrentSemester] = useState(null);
    const [semesterNumber, setSemesterNumber] = useState('');
    const [divisions, setDivisions] = useState('');
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

    const {
        data: semestersData,
        loading,
        error: fetchError,
        refresh,
        sendRequest
    } = useAxios('/api/v1/admin/semesters/getAllSemesters');

    useEffect(() => {
        if (fetchError) {
            setError(fetchError);
        }
    }, [fetchError]);

    const handleOpenModal = (type, semester = null) => {
        setModalType(type);
        if (type === 'edit' && semester) {
            setCurrentSemester(semester);
            setSemesterNumber(semester.semesterNumber.toString());
            setDivisions(semester.divisions.join(', '));
        } else {
            setCurrentSemester(null);
            setSemesterNumber('');
            setDivisions('');
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate inputs
        if (!semesterNumber) {
            setError('Semester number is required');
            return;
        }

        const divisionsArray = divisions
            ? divisions.split(',').map(div => div.trim()).filter(div => div !== '')
            : [];

        try {
            if (modalType === 'add') {
                // Add new semester
                await sendRequest({
                    url: '/api/v1/admin/semesters/addSemester',
                    method: 'POST',
                    data: {
                        semesterNumber: Number(semesterNumber),
                        divisions: divisionsArray
                    }
                });
                setSuccess('Semester added successfully');
            } else if (modalType === 'edit') {
                // Update semester
                await sendRequest({
                    url: `/api/v1/admin/semesters/updateSemester/${currentSemester._id}`,
                    method: 'PUT',
                    data: {
                        semesterNumber: Number(semesterNumber),
                        divisions: divisionsArray
                    }
                });
                setSuccess('Semester updated successfully');
            }

            // Reset form and refresh data
            handleCloseModal();
            refresh();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to process your request');
        }
    };

    const handleDelete = async (semesterId) => {
        if (!window.confirm('Are you sure you want to delete this semester?')) {
            return;
        }

        try {
            await sendRequest({
                url: `/api/v1/admin/semesters/deleteSemester/${semesterId}`,
                method: 'DELETE'
            });
            setSuccess('Semester deleted successfully');
            refresh();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to delete semester');
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader />
            </div>
        );
    }

    const semesters = semestersData?.semesters || [];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="page-heading">Semester Management</h1>
                    <p className="text-gray-600 mt-1">Add, edit and manage semesters</p>
                </div>
                <button
                    onClick={() => handleOpenModal('add')}
                    className="btn btn-primary flex items-center"
                >
                    <PlusCircleIcon className="h-5 w-5 mr-2" />
                    Add Semester
                </button>
            </div>

            {error && <ErrorAlert message={error} onClose={() => setError('')} />}
            {success && <SuccessAlert message={success} onClose={() => setSuccess('')} />}

            <div className="bg-white shadow-sm rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Semester Number
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Divisions
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {semesters.length > 0 ? (
                                semesters.map((semester) => (
                                    <tr key={semester._id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {semester.semesterNumber}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {semester.divisions.join(', ') || 'No divisions'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button
                                                onClick={() => handleOpenModal('edit', semester)}
                                                className="text-indigo-600 hover:text-indigo-900 mr-4"
                                            >
                                                <PencilIcon className="h-5 w-5" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(semester._id)}
                                                className="text-red-600 hover:text-red-900"
                                            >
                                                <TrashIcon className="h-5 w-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="3" className="px-6 py-4 text-center text-sm text-gray-500">
                                        No semesters found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add/Edit Semester Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">
                            {modalType === 'add' ? 'Add New Semester' : 'Edit Semester'}
                        </h2>

                        {error && <ErrorAlert message={error} onClose={() => setError('')} />}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="semesterNumber" className="form-label">
                                    Semester Number
                                </label>
                                <input
                                    id="semesterNumber"
                                    type="number"
                                    className="form-input"
                                    value={semesterNumber}
                                    onChange={(e) => setSemesterNumber(e.target.value)}
                                    required
                                />
                            </div>

                            <div>
                                <label htmlFor="divisions" className="form-label">
                                    Divisions (comma separated)
                                </label>
                                <input
                                    id="divisions"
                                    type="text"
                                    className="form-input"
                                    value={divisions}
                                    onChange={(e) => setDivisions(e.target.value)}
                                    placeholder="A, B, C"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Enter division names separated by commas
                                </p>
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
                                    {modalType === 'add' ? 'Add Semester' : 'Update Semester'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SemesterManagement;