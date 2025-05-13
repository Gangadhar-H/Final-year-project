import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../api/axios';

const TeacherAssignPage = () => {
    const [teachers, setTeachers] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [semesters, setSemesters] = useState([]);
    const [selectedSemester, setSelectedSemester] = useState('');
    const [selectedTeacher, setSelectedTeacher] = useState(null);
    const [selectedSubject, setSelectedSubject] = useState('');
    const [selectedDivision, setSelectedDivision] = useState('');
    const [divisions, setDivisions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const navigate = useNavigate();

    // Fetch teachers and semesters on component mount
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                setLoading(true);

                // Fetch teachers
                const teachersResponse = await API.get('/admin/teachers');
                setTeachers(teachersResponse.data.teachers || []);

                // Fetch semesters
                const semestersResponse = await API.get('/admin/semesters/getAllSemesters');
                setSemesters(semestersResponse.data.semesters || []);

                // If semesters exist, select the first one by default
                if (semestersResponse.data.semesters && semestersResponse.data.semesters.length > 0) {
                    setSelectedSemester(semestersResponse.data.semesters[0].semesterNumber);
                    setDivisions(semestersResponse.data.semesters[0].divisions || []);

                    // If divisions exist, select the first one by default
                    if (semestersResponse.data.semesters[0].divisions.length > 0) {
                        setSelectedDivision(semestersResponse.data.semesters[0].divisions[0]);
                    }
                }

                setError(null);
            } catch (err) {
                setError('Failed to load initial data');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchInitialData();
    }, []);

    // Fetch subjects when selected semester changes
    useEffect(() => {
        const fetchSubjectsForSemester = async () => {
            if (!selectedSemester) return;

            try {
                setLoading(true);
                const response = await API.get(`/admin/semesters/${selectedSemester}/subjects`);
                setSubjects(response.data.subjects || []);

                // If subjects exist, select the first one by default
                if (response.data.subjects && response.data.subjects.length > 0) {
                    setSelectedSubject(response.data.subjects[0]._id);
                } else {
                    setSelectedSubject('');
                }

                setError(null);
            } catch (err) {
                setError('Failed to load subjects for this semester');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchSubjectsForSemester();
    }, [selectedSemester]);

    // Update divisions when semester changes
    useEffect(() => {
        if (selectedSemester && semesters.length > 0) {
            const semester = semesters.find(s => s.semesterNumber === parseInt(selectedSemester));
            if (semester) {
                setDivisions(semester.divisions || []);
                if (semester.divisions && semester.divisions.length > 0) {
                    setSelectedDivision(semester.divisions[0]);
                } else {
                    setSelectedDivision('');
                }
            }
        }
    }, [selectedSemester, semesters]);

    const handleSemesterChange = (e) => {
        setSelectedSemester(e.target.value);
    };

    const handleDivisionChange = (e) => {
        setSelectedDivision(e.target.value);
    };

    const handleSubjectChange = (e) => {
        setSelectedSubject(e.target.value);
    };

    const handleTeacherSelection = (teacher) => {
        setSelectedTeacher(teacher);
    };

    const handleAddTeacher = () => {
        navigate('/admin/teachers/add');
    };

    const handleAssignSubject = async () => {
        if (!selectedTeacher || !selectedSubject || !selectedDivision) {
            setError('Please select a teacher, subject, and division');
            return;
        }

        try {
            setLoading(true);
            await API.post(`/admin/subjects/${selectedSubject}/assign-teacher`, {
                teacherId: selectedTeacher._id,
                division: selectedDivision
            });

            // Update the teacher's assigned subjects locally
            const updatedTeachers = teachers.map(teacher => {
                if (teacher._id === selectedTeacher._id) {
                    // Check if the subject is already assigned to this division
                    const alreadyAssigned = teacher.assignedSubjects.some(
                        assignment => assignment.subjectId === selectedSubject &&
                            assignment.division === selectedDivision
                    );

                    if (!alreadyAssigned) {
                        return {
                            ...teacher,
                            assignedSubjects: [
                                ...teacher.assignedSubjects,
                                { subjectId: selectedSubject, division: selectedDivision }
                            ]
                        };
                    }
                }
                return teacher;
            });

            setTeachers(updatedTeachers);
            setSuccess('Subject assigned successfully!');

            // Clear success message after 3 seconds
            setTimeout(() => {
                setSuccess(null);
            }, 3000);

            setError(null);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to assign subject to teacher');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const getTeacherSubjects = (teacher) => {
        if (!teacher || !teacher.assignedSubjects || teacher.assignedSubjects.length === 0) {
            return [];
        }

        return teacher.assignedSubjects.map(assignment => {
            const subject = subjects.find(s => s._id === assignment.subjectId);
            return {
                ...assignment,
                subjectName: subject ? subject.subjectName : 'Unknown Subject',
                subjectCode: subject ? subject.subjectCode : 'N/A'
            };
        });
    };

    const handleRemoveAssignment = async (teacher, assignment) => {
        // This would require a backend endpoint to remove an assignment
        // For now, we'll just show an alert
        alert('Remove assignment functionality would be implemented here.');

        // Ideally, you would have an API call like:
        // await API.delete(`/admin/teachers/${teacher._id}/assignments/${assignment.subjectId}`, { data: { division: assignment.division } });
    };

    const renderTeacherCard = (teacher) => {
        const isSelected = selectedTeacher && selectedTeacher._id === teacher._id;
        const assignedSubjects = getTeacherSubjects(teacher);

        return (
            <div
                key={teacher._id}
                className={`bg-white rounded-lg shadow hover:shadow-md transition border overflow-hidden mb-4
                          ${isSelected ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200'}`}
                onClick={() => handleTeacherSelection(teacher)}
            >
                <div className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2"></div>
                <div className="p-4">
                    <h3 className="text-lg font-bold">{teacher.name}</h3>
                    <p className="text-gray-600">ID: {teacher.teacherId}</p>
                    <p className="text-gray-600">Email: {teacher.email}</p>

                    {assignedSubjects.length > 0 && (
                        <div className="mt-3">
                            <h4 className="font-medium text-sm text-gray-700 mb-1">Assigned Subjects:</h4>
                            <ul className="text-sm">
                                {assignedSubjects.map((assignment, idx) => (
                                    <li key={idx} className="flex items-center justify-between bg-gray-50 p-2 rounded mb-1">
                                        <span>
                                            {assignment.subjectCode} - {assignment.subjectName} (Div: {assignment.division})
                                        </span>
                                        <button
                                            className="text-red-500 hover:text-red-700 text-xs"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleRemoveAssignment(teacher, assignment);
                                            }}
                                        >
                                            Remove
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Teacher Subject Assignment</h2>
                <button
                    onClick={handleAddTeacher}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition flex items-center"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    Add Teacher
                </button>
            </div>

            {/* Error and Success messages */}
            {error && (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded">
                    <p>{error}</p>
                </div>
            )}

            {success && (
                <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded">
                    <p>{success}</p>
                </div>
            )}

            {/* Loading state */}
            {loading && (
                <div className="text-center py-6">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
                    <p className="mt-2 text-gray-600">Loading...</p>
                </div>
            )}

            {/* Assignment Controls */}
            <div className="bg-white p-6 rounded shadow">
                <h3 className="text-lg font-semibold mb-4">Assign Subject to Teacher</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Semester Selector */}
                    <div>
                        <label htmlFor="semester-select" className="block text-sm font-medium text-gray-700 mb-1">
                            Semester
                        </label>
                        <select
                            id="semester-select"
                            value={selectedSemester}
                            onChange={handleSemesterChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">-- Select a semester --</option>
                            {semesters.map((semester) => (
                                <option key={semester._id} value={semester.semesterNumber}>
                                    Semester {semester.semesterNumber}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Division Selector */}
                    <div>
                        <label htmlFor="division-select" className="block text-sm font-medium text-gray-700 mb-1">
                            Division
                        </label>
                        <select
                            id="division-select"
                            value={selectedDivision}
                            onChange={handleDivisionChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            disabled={!selectedSemester || divisions.length === 0}
                        >
                            <option value="">-- Select a division --</option>
                            {divisions.map((division) => (
                                <option key={division} value={division}>
                                    {division}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Subject Selector */}
                    <div>
                        <label htmlFor="subject-select" className="block text-sm font-medium text-gray-700 mb-1">
                            Subject
                        </label>
                        <select
                            id="subject-select"
                            value={selectedSubject}
                            onChange={handleSubjectChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            disabled={!selectedSemester || subjects.length === 0}
                        >
                            <option value="">-- Select a subject --</option>
                            {subjects.map((subject) => (
                                <option key={subject._id} value={subject._id}>
                                    {subject.subjectCode}: {subject.subjectName}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Assign Button */}
                    <div className="flex items-end">
                        <button
                            onClick={handleAssignSubject}
                            disabled={!selectedTeacher || !selectedSubject || !selectedDivision}
                            className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
                        >
                            Assign Subject
                        </button>
                    </div>
                </div>

                {/* Selected Teacher Info */}
                {selectedTeacher && (
                    <div className="mt-4 p-3 bg-blue-50 rounded border border-blue-200">
                        <p className="font-medium">Selected Teacher: {selectedTeacher.name} ({selectedTeacher.teacherId})</p>
                    </div>
                )}
            </div>

            {/* Teachers List */}
            <div className="bg-white p-6 rounded shadow">
                <h3 className="text-lg font-semibold mb-4">Teachers</h3>

                {teachers.length === 0 ? (
                    <div className="text-center py-6 bg-gray-50 rounded">
                        <p className="text-gray-500">No teachers found. Add your first teacher!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {teachers.map(renderTeacherCard)}
                    </div>
                )}
            </div>
        </div>
    );
};

export default TeacherAssignPage;