import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import API from '../../api/axios';

// Student List Component
const StudentPage = () => {
    const [students, setStudents] = useState([]);
    const [semesters, setSemesters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filter, setFilter] = useState('all');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                // Fetch students and semesters in parallel
                const [studentsResponse, semestersResponse] = await Promise.all([
                    API.get('/admin/students'),
                    API.get('/admin/semesters/getAllSemesters')
                ]);

                setStudents(studentsResponse.data || []);
                setSemesters(semestersResponse.data.semesters || []);
            } catch (err) {
                setError('Failed to load students data');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleViewStudent = (studentId) => {
        navigate(`/admin/students/${studentId}`);
    };

    const handleAddStudent = () => {
        navigate('/admin/students/add');
    };

    const handleDeleteStudent = async (studentId, e) => {
        // Prevent the click from propagating to the parent (which would navigate to student details)
        e.stopPropagation();

        if (window.confirm('Are you sure you want to delete this student?')) {
            try {
                await API.delete(`/admin/students/${studentId}`);
                // Remove student from state
                setStudents(students.filter(student => student._id !== studentId));
            } catch (err) {
                console.error('Error deleting student:', err);
                alert('Failed to delete student. Please try again.');
            }
        }
    };

    // Filter and search functionality
    const filteredStudents = students.filter(student => {
        const matchesSearch =
            student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            student.uucmsNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
            student.email.toLowerCase().includes(searchQuery.toLowerCase());

        if (filter === 'all') return matchesSearch;
        return matchesSearch && student.semester._id === filter;
    });

    const getSemesterName = (semesterId) => {
        const semester = semesters.find(sem => sem._id === semesterId);
        return semester ? `${semester.semesterNumber}` : 'Unknown';
    };

    if (loading) return <div className="text-center py-10">Loading students...</div>;
    if (error) return <div className="text-red-500 text-center py-10">{error}</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Students</h2>
                <button
                    onClick={handleAddStudent}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition flex items-center"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    Add Student
                </button>
            </div>

            {/* Search and Filter Bar */}
            <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4 bg-white p-4 rounded shadow">
                <div className="flex-grow">
                    <input
                        type="text"
                        placeholder="Search by name, ID, or email..."
                        className="w-full p-2 border rounded"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="md:w-1/4">
                    <select
                        className="w-full p-2 border rounded"
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                    >
                        <option value="all">All Semesters</option>
                        {semesters.map(semester => (
                            <option key={semester._id} value={semester._id}>
                                Semester {semester.semesterNumber}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {filteredStudents.length === 0 ? (
                <div className="text-center py-10 bg-gray-50 rounded border">
                    <p className="text-gray-500">
                        {students.length === 0
                            ? 'No students found. Add your first student!'
                            : 'No students match your search criteria.'}
                    </p>
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Name
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        UUCMS No
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Email
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Semester
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Division
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredStudents.map((student) => (
                                    <tr
                                        key={student._id}
                                        className="hover:bg-gray-50 cursor-pointer"
                                        onClick={() => handleViewStudent(student._id)}
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 flex-shrink-0 rounded-full bg-gray-200 flex items-center justify-center">
                                                    <span className="text-gray-500 font-medium">
                                                        {student.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                                                    </span>
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">{student.name}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{student.uucmsNo}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-500">{student.email}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                {getSemesterName(student.semester._id)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                                {student.division}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button
                                                onClick={(e) => handleDeleteStudent(student._id, e)}
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
                </div>
            )}
        </div>
    );
};

export default StudentPage;