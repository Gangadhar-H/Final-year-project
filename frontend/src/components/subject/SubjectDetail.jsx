import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../../api/axios';

export default function SubjectDetail() {
    const { subjectId } = useParams();
    const navigate = useNavigate();

    const [subject, setSubject] = useState(null);
    const [semesters, setSemesters] = useState([]);
    const [formData, setFormData] = useState({
        subjectName: '',
        subjectCode: ''
    });
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [teachersAssigned, setTeachersAssigned] = useState([]);

    // Fetch subject details and semester data
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                // Get all semesters
                const semestersResponse = await API.get('/admin/semesters/getAllSemesters');
                setSemesters(semestersResponse.data.semesters);

                // Since we don't have a direct endpoint to get subject by ID, we need to get all subjects 
                // from each semester until we find the one we're looking for
                let foundSubject = null;

                for (const semester of semestersResponse.data.semesters) {
                    const subjectsResponse = await API.get(`/admin/semesters/${semester.semesterNumber}/subjects`);
                    foundSubject = subjectsResponse.data.subjects.find(s => s._id === subjectId);

                    if (foundSubject) {
                        foundSubject.semesterNumber = semester.semesterNumber;
                        break;
                    }
                }

                if (foundSubject) {
                    setSubject(foundSubject);
                    setFormData({
                        subjectName: foundSubject.subjectName,
                        subjectCode: foundSubject.subjectCode
                    });

                    // Try to get teachers assigned to this subject
                    try {
                        const teachersResponse = await API.get('/admin/teachers');
                        const assignedTeachers = teachersResponse.data.teachers.filter(teacher =>
                            teacher.assignedSubjects.some(assignment => assignment.subjectId === subjectId)
                        );
                        setTeachersAssigned(assignedTeachers);
                    } catch (err) {
                        console.error('Error fetching assigned teachers:', err);
                    }
                } else {
                    setError('Subject not found');
                }
            } catch (err) {
                setError('Error loading subject details');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [subjectId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setUpdating(true);
        setError(null);

        try {
            const response = await API.put(`/admin/subjects/${subjectId}`, formData);

            setSuccess(true);
            setSubject({
                ...subject,
                ...formData
            });

            setTimeout(() => {
                setSuccess(false);
            }, 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update subject');
        } finally {
            setUpdating(false);
        }
    };

    if (loading) {
        return <div className="text-center py-8">Loading subject details...</div>;
    }

    if (error && !subject) {
        return (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
                <div className="mt-4">
                    <button
                        onClick={() => navigate('/admin/subjects')}
                        className="bg-blue-600 text-white px-4 py-2 rounded"
                    >
                        Back to Subjects
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white shadow-md rounded p-6 mt-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Subject Details</h2>
                <button
                    onClick={() => navigate('/admin/subjects')}
                    className="bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded"
                >
                    Back to Subjects
                </button>
            </div>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            {success && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                    Subject updated successfully!
                </div>
            )}

            <div className="mb-6">
                <h3 className="text-lg font-medium mb-2">Basic Information</h3>
                <div className="bg-gray-50 p-4 rounded">
                    <p><span className="font-medium">Semester:</span> Semester {subject?.semesterNumber}</p>
                    <p><span className="font-medium">Created:</span> {new Date(subject?.createdAt).toLocaleDateString()}</p>
                    <p><span className="font-medium">Last Updated:</span> {new Date(subject?.updatedAt).toLocaleDateString()}</p>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label htmlFor="subjectCode" className="block text-sm font-medium text-gray-700 mb-1">
                        Subject Code
                    </label>
                    <input
                        type="text"
                        id="subjectCode"
                        name="subjectCode"
                        className="w-full p-2 border rounded"
                        value={formData.subjectCode}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="mb-4">
                    <label htmlFor="subjectName" className="block text-sm font-medium text-gray-700 mb-1">
                        Subject Name
                    </label>
                    <input
                        type="text"
                        id="subjectName"
                        name="subjectName"
                        className="w-full p-2 border rounded"
                        value={formData.subjectName}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="flex justify-end mt-6">
                    <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                        disabled={updating}
                    >
                        {updating ? 'Updating...' : 'Update Subject'}
                    </button>
                </div>
            </form>

            {/* Teachers assigned to this subject */}
            <div className="mt-8">
                <h3 className="text-lg font-medium mb-2">Assigned Teachers</h3>

                {teachersAssigned.length === 0 ? (
                    <div className="bg-gray-50 p-4 rounded text-center">
                        No teachers assigned to this subject yet.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Teacher ID
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Name
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Email
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Division
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {teachersAssigned.map(teacher => {
                                    // Get all divisions this teacher is assigned to for this subject
                                    const divisions = teacher.assignedSubjects
                                        .filter(assignment => assignment.subjectId === subjectId)
                                        .map(assignment => assignment.division);

                                    return (
                                        <tr key={teacher._id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {teacher.teacherId}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {teacher.name}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {teacher.email}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {divisions.join(', ')}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
