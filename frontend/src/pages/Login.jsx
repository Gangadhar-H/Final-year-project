import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Login = () => {
    const [email, setEmail] = useState('');    // changed field
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async e => {
        e.preventDefault();
        try {
            setError('');
            const role = await login({ email, password });  // pass email
            console.log(role);
            navigate(`/${role}/`);
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
        }
    };

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
