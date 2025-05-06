import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../api/axios';

const SubjectPage = () => {
    const [subjects, setSubjects] = useState([]);
    const [semesters, setSemesters] = useState([]);
    const [selectedSemester, setSelectedSemester] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    // Fetch all semesters on component mount
    useEffect(() => {
        const fetchSemesters = async () => {
            try {
                const response = await API.get('/admin/semesters/getAllSemesters');
                setSemesters(response.data.semesters || []);

                // If semesters exist, select the first one by default
                if (response.data.semesters && response.data.semesters.length > 0) {
                    setSelectedSemester(response.data.semesters[0].semesterNumber);
                }
            } catch (err) {
                setError('Failed to load semesters');
                console.error(err);
            }
        };

        fetchSemesters();
    }, []);

    // Fetch subjects whenever the selected semester changes
    useEffect(() => {
        const fetchSubjects = async () => {
            if (!selectedSemester) return;

            try {
                setLoading(true);
                const response = await API.get(`/admin/semesters/${selectedSemester}/subjects`);
                console.log(response.data)
                setSubjects(response.data.subjects || []);
                setError(null);
            } catch (err) {
                setError('Failed to load subjects for this semester');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchSubjects();
    }, [selectedSemester]);

    const handleSemesterChange = (e) => {
        setSelectedSemester(e.target.value);
    };

    const handleAddSubject = () => {
        // Navigate to add subject page, passing selected semester as state
        navigate('/admin/subjects/add', { state: { semesterNumber: selectedSemester } });
    };

    const handleSubjectClick = (subjectId) => {
        navigate(`/admin/subjects/${subjectId}`);
    };

    const handleDeleteSubject = async (subjectId, e) => {
        e.stopPropagation(); // Prevent triggering the parent card click

        if (!window.confirm('Are you sure you want to delete this subject?')) {
            return;
        }

        try {
            await API.delete(`/admin/subjects/${subjectId}`);
            // Remove the deleted subject from state
            setSubjects(subjects.filter(subject => subject._id !== subjectId));
        } catch (err) {
            setError('Failed to delete subject');
            console.error(err);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Subjects</h2>
                <button
                    onClick={handleAddSubject}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition flex items-center"
                    disabled={!selectedSemester}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    Add Subject
                </button>
            </div>

            {/* Semester selector */}
            <div className="bg-white p-4 rounded shadow">
                <label htmlFor="semester-select" className="block text-sm font-medium text-gray-700 mb-2">
                    Select Semester:
                </label>
                <select
                    id="semester-select"
                    value={selectedSemester}
                    onChange={handleSemesterChange}
                    className="w-full md:w-64 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="">-- Select a semester --</option>
                    {semesters.map((semester) => (
                        <option key={semester._id} value={semester.semesterNumber}>
                            Semester {semester.semesterNumber}
                        </option>
                    ))}
                </select>
            </div>

            {/* Error message */}
            {error && (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded">
                    <p>{error}</p>
                </div>
            )}

            {/* Loading state */}
            {loading && (
                <div className="text-center py-10">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
                    <p className="mt-2 text-gray-600">Loading subjects...</p>
                </div>
            )}

            {/* Empty state */}
            {!loading && selectedSemester && subjects.length === 0 && (
                <div className="text-center py-10 bg-gray-50 rounded border">
                    <p className="text-gray-500">No subjects found for this semester. Add your first subject!</p>
                </div>
            )}

            {/* Subject cards */}
            {!loading && subjects.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {subjects.map((subject) => (
                        <div
                            key={subject._id}
                            onClick={() => handleSubjectClick(subject._id)}
                            className="bg-white rounded-lg shadow hover:shadow-md cursor-pointer transition border border-gray-100 overflow-hidden"
                        >
                            <div className="bg-gradient-to-r from-green-500 to-teal-500 h-3"></div>
                            <div className="p-6">
                                <h3 className="text-xl font-bold mb-2">{subject.subjectName}</h3>
                                <div className="flex items-center text-gray-600 mb-4">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                                    </svg>
                                    <span>Code: {subject.subjectCode}</span>
                                </div>
                                <div className="flex justify-end mt-4">
                                    <button
                                        onClick={(e) => handleDeleteSubject(subject._id, e)}
                                        className="text-red-500 hover:text-red-700 flex items-center text-sm"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                        </svg>
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SubjectPage;