import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../api/axios';

export default function AddStudent({ semesters: propSemesters }) {
    const navigate = useNavigate();
    const [semesters, setSemesters] = useState(propSemesters || []);
    const [formData, setFormData] = useState({
        name: '',
        uucmsNo: '',
        email: '',
        semesterId: '',
        division: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [availableDivisions, setAvailableDivisions] = useState([]);

    // Fetch semesters if not provided as props
    useEffect(() => {
        if (!propSemesters || propSemesters.length === 0) {
            const fetchSemesters = async () => {
                try {
                    const response = await API.get('/admin/semesters/getAllSemesters');
                    setSemesters(response.data.semesters);
                    if (response.data.semesters.length > 0) {
                        const firstSemester = response.data.semesters[0];
                        setFormData(prev => ({
                            ...prev,
                            semesterId: firstSemester._id
                        }));
                        setAvailableDivisions(firstSemester.divisions);
                    }
                } catch (err) {
                    setError('Failed to fetch semesters. Please try again later.');
                }
            };
            fetchSemesters();
        } else if (propSemesters.length > 0 && !formData.semesterId) {
            const firstSemester = propSemesters[0];
            setFormData(prev => ({
                ...prev,
                semesterId: firstSemester._id
            }));
            setAvailableDivisions(firstSemester.divisions);
        }
    }, [propSemesters]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });

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
        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            await API.post('/admin/students', formData);

            setSuccess(true);
            setFormData({
                name: '',
                uucmsNo: '',
                email: '',
                semesterId: formData.semesterId, // keep the same semester selected
                division: formData.division // keep the same division selected
            });

            // Redirect after a short delay
            setTimeout(() => {
                navigate('/admin/students');
            }, 1500);
        } catch (err) {
            console.error('Error adding student:', err);
            setError(err.response?.data?.message || 'Failed to add student. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white shadow-md rounded p-6 mt-6">
            <h2 className="text-xl font-semibold mb-6">Add New Student</h2>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            {success && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                    Student added successfully! Redirecting...
                </div>
            )}

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
                        placeholder="e.g. John Doe"
                        required
                    />
                </div>

                <div className="mb-4">
                    <label htmlFor="uucmsNo" className="block text-sm font-medium text-gray-700 mb-1">
                        UUCMS Number
                    </label>
                    <input
                        type="text"
                        id="uucmsNo"
                        name="uucmsNo"
                        className="w-full p-2 border rounded"
                        value={formData.uucmsNo}
                        onChange={handleChange}
                        placeholder="e.g. UU123456"
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
                        placeholder="e.g. student@example.com"
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

                <div className="flex justify-end space-x-3 mt-6">
                    <button
                        type="button"
                        className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded"
                        onClick={() => navigate('/admin/students')}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                        disabled={loading || availableDivisions.length === 0}
                    >
                        {loading ? 'Adding...' : 'Add Student'}
                    </button>
                </div>
            </form>
        </div>
    );
}