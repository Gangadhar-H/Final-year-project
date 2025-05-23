import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login, user } = useContext(AuthContext);
    const navigate = useNavigate();

    // Redirect if user is already authenticated
    useEffect(() => {
        if (user && user.role) {
            navigate(`/${user.role}/`, { replace: true });
        }
    }, [user, navigate]);

    const handleSubmit = async e => {
        e.preventDefault();
        try {
            setError('');
            const role = await login({ email, password });
            console.log(role);
            navigate(`/${role}/`);
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
        }
    };

    // Don't render the form if user is already authenticated
    if (user && user.role) {
        return null; // or a loading spinner
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md w-80">
                <h2 className="text-xl font-bold mb-4 text-center">Login</h2>
                {error && <p className="text-red-500 mb-2">{error}</p>}

                <label className="block text-sm mb-1">Email</label>
                <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    className="w-full border px-3 py-2 rounded mb-4 focus:outline-none focus:ring"
                />

                <label className="block text-sm mb-1">Password</label>
                <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    className="w-full border px-3 py-2 rounded mb-6 focus:outline-none focus:ring"
                />

                <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
                >
                    Log In
                </button>
            </form>
        </div>
    );
};

export default Login;