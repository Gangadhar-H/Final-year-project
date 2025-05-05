import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import API from '../../api/axios';

const SemesterDetail = () => {
    const [semester, setSemester] = useState(null);
    const [subjects, setSubjects] = useState([]);
    const [showAddDivision, setShowAddDivision] = useState(false);
    const [showAddSubject, setShowAddSubject] = useState(false);
    const [newDivision, setNewDivision] = useState('');
    const [newSubject, setNewSubject] = useState({ subjectName: '', subjectCode: '' });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    // Extract semester ID from URL
    const semesterId = window.location.pathname.split('/').pop();

    useEffect(() => {
        const fetchSemesterDetails = async () => {
            try {
                setLoading(true);
                // First get the semester details
                const semRes = await API.get('/admin/semesters/getAllSemesters');
                const foundSemester = semRes.data.semesters.find(s => s._id === semesterId);

                if (!foundSemester) {
                    throw new Error('Semester not found');
                }

                setSemester(foundSemester);

                // Then get subjects for this semester
                const subRes = await API.get(`/admin/semesters/${foundSemester.semesterNumber}/subjects`);
                setSubjects(subRes.data.subjects || []);
            } catch (err) {
                setError('Failed to load semester details');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchSemesterDetails();
    }, [semesterId]);

    const handleAddDivision = async (e) => {
        e.preventDefault();
        if (!newDivision.trim()) return;

        try {
            await API.patch(`/admin/semesters/${semester.semesterNumber}/addDivision`, {
                division: newDivision.trim()
            });

            // Update local state
            setSemester({
                ...semester,
                divisions: [...semester.divisions, newDivision.trim()]
            });

            setNewDivision('');
            setShowAddDivision(false);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to add division');
        }
    };

    const handleAddSubject = async (e) => {
        e.preventDefault();
        if (!newSubject.subjectName || !newSubject.subjectCode) return;

        try {
            const res = await API.post(`/admin/semesters/${semester.semesterNumber}/subjects`, newSubject);

            // Update local state
            setSubjects([...subjects, res.data.subject]);

            setNewSubject({ subjectName: '', subjectCode: '' });
            setShowAddSubject(false);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to add subject');
        }
    };

    const handleRemoveDivision = async (division) => {
        try {
            await API.patch(`/admin/semesters/${semester.semesterNumber}/deleteDivison`, {
                division
            });

            // Update local state
            setSemester({
                ...semester,
                divisions: semester.divisions.filter(d => d !== division)
            });
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to remove division');
        }
    };

    const handleDeleteSubject = async (subjectId) => {
        try {
            await API.delete(`/admin/subjects/${subjectId}`);

            // Update local state
            setSubjects(subjects.filter(s => s._id !== subjectId));
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to delete subject');
        }
    };

    if (loading) return <div className="text-center py-10">Loading semester details...</div>;
    if (error) return <div className="text-red-500 text-center py-10">{error}</div>;
    if (!semester) return <div className="text-center py-10">Semester not found</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center mb-6">
                <button
                    onClick={() => navigate('/admin/semesters')}
                    className="mr-2 text-gray-500 hover:text-gray-700"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                </button>
                <h2 className="text-2xl font-bold">Semester {semester.semesterNumber} Details</h2>
            </div>

            {/* Divisions Section */}
            <div className="bg-white shadow rounded-lg p-6 mb-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Divisions</h3>
                    <button
                        onClick={() => setShowAddDivision(!showAddDivision)}
                        className="text-blue-600 hover:text-blue-800 flex items-center"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                        </svg>
                        Add Division
                    </button>
                </div>

                {showAddDivision && (
                    <form onSubmit={handleAddDivision} className="mb-4 bg-gray-50 p-4 rounded">
                        <div className="flex items-center">
                            <input
                                type="text"
                                value={newDivision}
                                onChange={(e) => setNewDivision(e.target.value)}
                                placeholder="Division name"
                                className="shadow appearance-none border rounded flex-1 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring focus:border-blue-500"
                            />
                            <button
                                type="submit"
                                className="ml-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                            >
                                Add
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowAddDivision(false)}
                                className="ml-2 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                )}

                <div className="flex flex-wrap gap-2">
                    {semester.divisions.length === 0 ? (
                        <p className="text-gray-500">No divisions added yet</p>
                    ) : (
                        semester.divisions.map((division, idx) => (
                            <div
                                key={idx}
                                className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full flex items-center"
                            >
                                <span>{division}</span>
                                <button
                                    onClick={() => handleRemoveDivision(division)}
                                    className="ml-2 text-blue-600 hover:text-blue-800"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Subjects Section */}
            <div className="bg-white shadow rounded-lg p-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Subjects</h3>
                    <button
                        onClick={() => setShowAddSubject(!showAddSubject)}
                        className="text-blue-600 hover:text-blue-800 flex items-center"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                        </svg>
                        Add Subject
                    </button>
                </div>

                {showAddSubject && (
                    <form onSubmit={handleAddSubject} className="mb-4 bg-gray-50 p-4 rounded">
                        <div className="mb-3">
                            <label className="block text-gray-700 text-sm font-bold mb-1" htmlFor="subjectCode">
                                Subject Code
                            </label>
                            <input
                                id="subjectCode"
                                type="text"
                                value={newSubject.subjectCode}
                                onChange={(e) => setNewSubject({ ...newSubject, subjectCode: e.target.value })}
                                placeholder="e.g. CS101"
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring focus:border-blue-500"
                                required
                            />
                        </div>
                        <div className="mb-3">
                            <label className="block text-gray-700 text-sm font-bold mb-1" htmlFor="subjectName">
                                Subject Name
                            </label>
                            <input
                                id="subjectName"
                                type="text"
                                value={newSubject.subjectName}
                                onChange={(e) => setNewSubject({ ...newSubject, subjectName: e.target.value })}
                                placeholder="e.g. Introduction to Programming"
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring focus:border-blue-500"
                                required
                            />
                        </div>
                        <div className="flex justify-end">
                            <button
                                type="button"
                                onClick={() => setShowAddSubject(false)}
                                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded mr-2"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                            >
                                Add Subject
                            </button>
                        </div>
                    </form>
                )}

                {subjects.length === 0 ? (
                    <p className="text-gray-500">No subjects added yet</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Code
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Name
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {subjects.map((subject) => (
                                    <tr key={subject._id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{subject.subjectCode}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{subject.subjectName}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button
                                                onClick={() => handleDeleteSubject(subject._id)}
                                                className="text-red-600 hover:text-red-900"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};


export default SemesterDetail