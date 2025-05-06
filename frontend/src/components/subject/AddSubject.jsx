import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../api/axios';

export default function AddSubject({ semesters: propSemesters }) {
    const navigate = useNavigate();
    const [semesters, setSemesters] = useState(propSemesters || []);
    const [formData, setFormData] = useState({
        subjectName: '',
        subjectCode: '',
        semesterNumber: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    // Fetch semesters if not provided as props
    useEffect(() => {
        if (!propSemesters || propSemesters.length === 0) {
            const fetchSemesters = async () => {
                try {
                    const response = await API.get('/admin/semesters/getAllSemesters');
                    setSemesters(response.data.semesters);
                    if (response.data.semesters.length > 0) {
                        setFormData(prev => ({
                            ...prev,
                            semesterNumber: response.data.semesters[0].semesterNumber
                        }));
                    }
                } catch (err) {
                    setError('Failed to fetch semesters. Please try again later.');
                }
            };
            fetchSemesters();
        } else if (propSemesters.length > 0 && !formData.semesterNumber) {
            setFormData(prev => ({
                ...prev,
                semesterNumber: propSemesters[0].semesterNumber
            }));
        }
    }, [propSemesters]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            await API.post(`/admin/semesters/${formData.semesterNumber}/subjects`, {
                subjectName: formData.subjectName,
                subjectCode: formData.subjectCode
            });

            setSuccess(true);
            setFormData({
                subjectName: '',
                subjectCode: '',
                semesterNumber: formData.semesterNumber // keep the same semester selected
            });

            // Redirect after a short delay
            setTimeout(() => {
                navigate('/admin/subjects');
            }, 1500);
        } catch (err) {
            console.error('Error adding subject:', err);
            setError(err.response?.data?.message || 'Failed to add subject. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white shadow-md rounded p-6 mt-6">
            <h2 className="text-xl font-semibold mb-6">Add New Subject</h2>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            {success && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                    Subject added successfully! Redirecting...
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label htmlFor="semesterNumber" className="block text-sm font-medium text-gray-700 mb-1">
                        Semester
                    </label>
                    <select
                        id="semesterNumber"
                        name="semesterNumber"
                        className="w-full p-2 border rounded"
                        value={formData.semesterNumber}
                        onChange={handleChange}
                        required
                    >
                        <option value="">Select Semester</option>
                        {semesters.map(semester => (
                            <option key={semester._id} value={semester.semesterNumber}>
                                Semester {semester.semesterNumber}
                            </option>
                        ))}
                    </select>
                </div>

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
                        placeholder="e.g. CS101"
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
                        placeholder="e.g. Introduction to Computer Science"
                        required
                    />
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                    <button
                        type="button"
                        className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded"
                        onClick={() => navigate('/admin/subjects')}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                        disabled={loading}
                    >
                        {loading ? 'Adding...' : 'Add Subject'}
                    </button>
                </div>
            </form>
        </div>
    );
}