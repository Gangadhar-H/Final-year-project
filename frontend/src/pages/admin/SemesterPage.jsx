import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import API from '../../api/axios';

// Semester List Component
const SemesterPage = () => {
    const [semesters, setSemesters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchSemesters = async () => {
            try {
                setLoading(true);
                const response = await API.get('/admin/semesters/getAllSemesters');
                setSemesters(response.data.semesters || []);
            } catch (err) {
                setError('Failed to load semesters');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchSemesters();
    }, []);

    const handleSemesterClick = (semesterId) => {
        navigate(`/admin/semesters/${semesterId}`);
    };

    if (loading) return <div className="text-center py-10">Loading semesters...</div>;
    if (error) return <div className="text-red-500 text-center py-10">{error}</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Semesters</h2>
                <button
                    onClick={() => navigate('/admin/semesters/add')}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition flex items-center"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    Add Semester
                </button>
            </div>

            {semesters.length === 0 ? (
                <div className="text-center py-10 bg-gray-50 rounded border">
                    <p className="text-gray-500">No semesters found. Create your first semester!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {semesters.map((semester) => (
                        <div
                            key={semester._id}
                            onClick={() => handleSemesterClick(semester._id)}
                            className="bg-white rounded-lg shadow hover:shadow-md cursor-pointer transition border border-gray-100 overflow-hidden"
                        >
                            <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-3"></div>
                            <div className="p-6">
                                <h3 className="text-xl font-bold mb-2">Semester {semester.semesterNumber}</h3>
                                <div className="flex items-center text-gray-600 mb-4">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                                    </svg>
                                    <span>Divisions: {semester.divisions.length}</span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {semester.divisions.map((division, idx) => (
                                        <span
                                            key={idx}
                                            className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                                        >
                                            {division}
                                        </span>
                                    ))}
                                    {semester.divisions.length === 0 && (
                                        <span className="text-gray-400 text-sm">No divisions added</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SemesterPage