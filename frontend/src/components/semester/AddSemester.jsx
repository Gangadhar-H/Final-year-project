import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import API from '../../api/axios';

const AddSemester = () => {
    const [formData, setFormData] = useState({
        semesterNumber: '',
        divisions: ''
    });
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            setError(null);

            const divisionsArray = formData.divisions
                ? formData.divisions.split(',').map(div => div.trim())
                : [];

            await API.post('/admin/semesters', {
                semesterNumber: parseInt(formData.semesterNumber),
                divisions: divisionsArray
            });

            navigate('/admin/semesters');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to add semester');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <div className="flex items-center mb-6">
                <button
                    onClick={() => navigate('/admin/semesters')}
                    className="mr-2 text-gray-500 hover:text-gray-700"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                </button>
                <h2 className="text-2xl font-bold">Add New Semester</h2>
            </div>

            {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6">
                <div className="mb-6">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="semesterNumber">
                        Semester Number *
                    </label>
                    <input
                        id="semesterNumber"
                        name="semesterNumber"
                        type="number"
                        required
                        min="1"
                        value={formData.semesterNumber}
                        onChange={handleChange}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring focus:border-blue-500"
                    />
                </div>

                <div className="mb-6">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="divisions">
                        Divisions (comma separated)
                    </label>
                    <input
                        id="divisions"
                        name="divisions"
                        type="text"
                        placeholder="A, B, C"
                        value={formData.divisions}
                        onChange={handleChange}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring focus:border-blue-500"
                    />
                    <p className="text-gray-500 text-xs mt-1">Enter division names separated by commas (e.g. A, B, C)</p>
                </div>

                <div className="flex items-center justify-end">
                    <button
                        type="button"
                        onClick={() => navigate('/admin/semesters')}
                        className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded mr-2"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
                    >
                        {loading ? 'Saving...' : 'Add Semester'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddSemester