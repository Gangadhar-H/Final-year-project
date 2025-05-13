import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../../api/axios';

export default function StudentDetail() {
    const { studentId } = useParams();
    const navigate = useNavigate();

    const [student, setStudent] = useState(null);
    const [semesters, setSemesters] = useState([]);
    const [availableDivisions, setAvailableDivisions] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        semesterId: '',
        division: ''
    });
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    // Fetch student details and semesters
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                // Get student data
                const studentResponse = await API.get(`/admin/students/${studentId}`);
                setStudent(studentResponse.data);

                // Get all semesters for the dropdown
                const semestersResponse = await API.get('/admin/semesters/getAllSemesters');
                setSemesters(semestersResponse.data.semesters);

                // Initialize form data with student details
                const studentData = studentResponse.data;
                setFormData({
                    name: studentData.name,
                    email: studentData.email,
                    semesterId: studentData.semester._id || studentData.semester,
                    division: studentData.division
                });

                // Find the current semester to get available divisions
                const currentSemester = semestersResponse.data.semesters.find(
                    sem => sem._id === (studentData.semester._id || studentData.semester)
                );

                if (currentSemester) {
                    setAvailableDivisions(currentSemester.divisions);
                }

            } catch (err) {
                console.error('Error loading student details:', err);
                setError('Failed to load student details');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [studentId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Update available divisions when semester changes
        if (name === 'semesterId') {
            const selectedSemester = semesters.find(sem => sem._id === value);
            if (selectedSemester) {
                setAvailableDivisions(selectedSemester.divisions);
                // Reset division if the previously selected is not available in the new semester
                if (!selectedSemester.divisions.includes(formData.division)) {
                    setFormData(prev => ({
                        ...prev,
                        division: selectedSemester.divisions.length > 0 ? selectedSemester.divisions[0] : ''
                    }));
                }
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setUpdating(true);
        setError(null);
        setSuccess(false);

        try {
            const response = await API.put(`/admin/students/${studentId}`, formData);

            setSuccess(true);
            setStudent({
                ...student,
                ...formData,
                semester: { _id: formData.semesterId }
            });

            setTimeout(() => {
                setSuccess(false);
            }, 3000);
        } catch (err) {
            console.error('Error updating student:', err);
            setError(err.response?.data?.message || 'Failed to update student');
        } finally {
            setUpdating(false);
        }
    };

    if (loading) {
        return <div className="text-center py-8">Loading student details...</div>;
    }

    if (error && !student) {
        return (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
                <div className="mt-4">
                    <button
                        onClick={() => navigate('/admin/students')}
                        className="bg-blue-600 text-white px-4 py-2 rounded"
                    >
                        Back to Students
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white shadow-md rounded p-6 mt-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Student Details</h2>
                <button
                    onClick={() => navigate('/admin/students')}
                    className="bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded"
                >
                    Back to Students
                </button>
            </div>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            {success && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                    Student updated successfully!
                </div>
            )}

            <div className="mb-6">
                <h3 className="text-lg font-medium mb-2">Student Information</h3>
                <div className="bg-gray-50 p-4 rounded">
                    <p><span className="font-medium">UUCMS No:</span> {student?.uucmsNo}</p>
                    <p><span className="font-medium">Current Semester:</span> {student?.semester?.semesterNumber && `Semester ${student.semester.semesterNumber}`}</p>
                    <p><span className="font-medium">Current Division:</span> {student?.division}</p>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name
                    </label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        className="w-full p-2 border rounded"
                        value={formData.name}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="mb-4">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address
                    </label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        className="w-full p-2 border rounded"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="mb-4">
                    <label htmlFor="semesterId" className="block text-sm font-medium text-gray-700 mb-1">
                        Semester
                    </label>
                    <select
                        id="semesterId"
                        name="semesterId"
                        className="w-full p-2 border rounded"
                        value={formData.semesterId}
                        onChange={handleChange}
                        required
                    >
                        <option value="">Select Semester</option>
                        {semesters.map(semester => (
                            <option key={semester._id} value={semester._id}>
                                Semester {semester.semesterNumber}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="mb-4">
                    <label htmlFor="division" className="block text-sm font-medium text-gray-700 mb-1">
                        Division
                    </label>
                    <select
                        id="division"
                        name="division"
                        className="w-full p-2 border rounded"
                        value={formData.division}
                        onChange={handleChange}
                        required
                        disabled={availableDivisions.length === 0}
                    >
                        <option value="">Select Division</option>
                        {availableDivisions.map(division => (
                            <option key={division} value={division}>
                                {division}
                            </option>
                        ))}
                    </select>
                    {availableDivisions.length === 0 && (
                        <p className="text-sm text-red-500 mt-1">
                            No divisions available for this semester. Please add divisions first.
                        </p>
                    )}
                </div>

                <div className="flex justify-end mt-6">
                    <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                        disabled={updating || availableDivisions.length === 0}
                    >
                        {updating ? 'Updating...' : 'Update Student'}
                    </button>
                </div>
            </form>
        </div>
    );
}