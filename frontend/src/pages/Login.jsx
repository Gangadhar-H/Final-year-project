import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        userType: 'auto' // 'auto', 'admin', 'teacher'
    });
    const [showPassword, setShowPassword] = useState(false);

    const { autoLogin, login, user, loading, error, clearError } = useAuth();
    const navigate = useNavigate();

    // Redirect if user is already authenticated
    useEffect(() => {
        if (user && user.role) {
            navigate(`/${user.role}/`, { replace: true });
        }
    }, [user, navigate]);

    // Clear error when form data changes
    useEffect(() => {
        if (error) {
            clearError();
        }
    }, [formData.email, formData.password, formData.userType]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            clearError();
            const credentials = {
                email: formData.email.trim(),
                password: formData.password
            };

            let role;

            if (formData.userType === 'auto') {
                // Auto-detect user type
                role = await autoLogin(credentials);
            } else {
                // Explicit role-based login
                role = await login(credentials, formData.userType);
            }

            // Navigate to appropriate dashboard
            navigate(`/${role}/`, { replace: true });

        } catch (err) {
            console.error('Login error:', err);
            // Error is handled by AuthContext
        }
    };

    // Don't render the form if user is already authenticated
    if (user && user.role) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-800 via-slate-700 to-slate-600">
                <div className="bg-slate-700/90 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-slate-500/30">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-10 w-10 border-3 border-emerald-300 border-t-emerald-500 mx-auto mb-4"></div>
                        <p className="text-slate-200 font-medium">Redirecting to your dashboard...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-800 via-slate-700 to-slate-600 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Animated geometric background elements */}
            <div className="absolute top-10 left-10 w-80 h-80 opacity-10">
                <div className="w-full h-full border-2 border-emerald-400 rounded-full animate-spin" style={{ animationDuration: '20s' }}></div>
            </div>
            <div className="absolute bottom-10 right-10 w-64 h-64 opacity-15">
                <div className="w-full h-full border-2 border-cyan-400 rounded-lg rotate-45 animate-pulse"></div>
            </div>
            <div className="absolute top-1/2 left-1/6 w-32 h-32 opacity-20">
                <div className="w-full h-full bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full blur-xl animate-bounce" style={{ animationDuration: '3s' }}></div>
            </div>

            {/* Floating particles */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-emerald-400 rounded-full opacity-60 animate-ping"></div>
                <div className="absolute top-3/4 left-3/4 w-1 h-1 bg-cyan-400 rounded-full opacity-40 animate-ping" style={{ animationDelay: '1s' }}></div>
                <div className="absolute top-1/2 right-1/4 w-1.5 h-1.5 bg-emerald-300 rounded-full opacity-50 animate-ping" style={{ animationDelay: '2s' }}></div>
            </div>

            <div className="relative w-full max-w-md">
                {/* Main container with enhanced glassmorphism */}
                <div className="bg-slate-700/80 backdrop-blur-2xl p-8 rounded-3xl shadow-2xl border border-slate-500/30 relative overflow-hidden">
                    {/* Subtle gradient overlay */}
                    <div className="absolute inset-0 rounded-3xl bg-gradient-to-b from-slate-600/20 to-transparent pointer-events-none"></div>

                    {/* Decorative corner elements */}
                    <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-emerald-400/20 to-transparent rounded-bl-3xl"></div>
                    <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-cyan-400/20 to-transparent rounded-tr-3xl"></div>

                    {/* Header */}
                    <div className="text-center mb-8 relative z-10">
                        <div className="mb-4">
                            <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-2xl mx-auto flex items-center justify-center shadow-xl relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                                <svg className="w-8 h-8 text-white relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                            </div>
                        </div>
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-100 to-slate-300 bg-clip-text text-transparent mb-2">
                            School Management
                        </h1>
                        <p className="text-slate-300 font-medium">Welcome back! Please sign in</p>
                    </div>

                    {/* Error Display */}
                    {error && (
                        <div className="bg-red-900/40 backdrop-blur-sm border border-red-700/50 text-red-300 px-4 py-3 rounded-xl mb-6 relative z-10">
                            <div className="flex items-center">
                                <div className="w-5 h-5 bg-red-800/60 rounded-full flex items-center justify-center mr-3">
                                    <svg className="w-3 h-3 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <span className="text-sm font-medium">{error}</span>
                            </div>
                        </div>
                    )}

                    {/* Login Form */}
                    <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                        {/* User Type Selection */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-200 flex items-center">
                                <svg className="w-4 h-4 mr-2 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                Login As
                            </label>
                            <div className="relative">
                                <select
                                    name="userType"
                                    value={formData.userType}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 bg-slate-600/60 backdrop-blur-sm border border-slate-500/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400/70 focus:border-emerald-400/50 transition-all duration-300 appearance-none font-medium text-slate-200 hover:bg-slate-600/80"
                                >
                                    <option value="auto">Auto Detect Role</option>
                                    <option value="admin">Administrator</option>
                                    <option value="teacher">Teacher</option>
                                </select>
                                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                    <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>
                            <p className="text-xs text-slate-400 font-medium flex items-center">
                                <svg className="w-3 h-3 mr-1 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Auto Detect will identify your role automatically
                            </p>
                        </div>

                        {/* Email Field */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-200 flex items-center">
                                <svg className="w-4 h-4 mr-2 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                Email Address
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                                    </svg>
                                </div>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="Enter your email"
                                    className="w-full pl-10 pr-4 py-3 bg-slate-600/60 backdrop-blur-sm border border-slate-500/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400/70 focus:border-emerald-400/50 transition-all duration-300 font-medium text-slate-200 placeholder-slate-400 hover:bg-slate-600/80"
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-200 flex items-center">
                                <svg className="w-4 h-4 mr-2 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                                Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="Enter your password"
                                    className="w-full pl-10 pr-12 py-3 bg-slate-600/60 backdrop-blur-sm border border-slate-500/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400/70 focus:border-emerald-400/50 transition-all duration-300 font-medium text-slate-200 placeholder-slate-400 hover:bg-slate-600/80"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-emerald-400 transition-colors duration-200"
                                >
                                    {showPassword ? (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19.5c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L8.465 8.465m1.413 1.413L6.584 8.584m0 0L4.935 7.119M7.242 7.242l4.242 4.242" />
                                        </svg>
                                    ) : (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 px-4 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-semibold rounded-xl shadow-xl hover:shadow-2xl transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-emerald-400/70 focus:ring-offset-2 focus:ring-offset-slate-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none transition-all duration-300 relative overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                            {loading ? (
                                <div className="flex items-center justify-center relative z-10">
                                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white mr-3"></div>
                                    <span>Signing in...</span>
                                </div>
                            ) : (
                                <div className="flex items-center justify-center relative z-10">
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                                    </svg>
                                    <span>Sign In</span>
                                </div>
                            )}
                        </button>
                    </form>

                    {/* Footer */}
                    <div className="mt-8 text-center relative z-10">
                        <p className="text-xs text-slate-400 font-medium flex items-center justify-center">
                            <svg className="w-3 h-3 mr-1 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Need help? Contact your administrator
                        </p>
                    </div>

                    {/* Demo Credentials (for development) */}
                    {process.env.NODE_ENV === 'development' && (
                        <div className="mt-6 p-4 bg-slate-600/40 backdrop-blur-sm rounded-xl border border-slate-500/30 relative z-10">
                            <h4 className="text-sm font-semibold text-slate-200 mb-3 flex items-center">
                                <svg className="w-4 h-4 mr-2 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Demo Credentials
                            </h4>
                            <div className="space-y-2 text-xs">
                                <div className="flex items-center justify-between p-2 bg-slate-700/50 rounded-lg border border-slate-600/30">
                                    <span className="font-medium text-slate-300 flex items-center">
                                        <svg className="w-3 h-3 mr-1 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                        </svg>
                                        Admin:
                                    </span>
                                    <span className="text-slate-400 font-mono">admin@example.com / admin123</span>
                                </div>
                                <div className="flex items-center justify-between p-2 bg-slate-700/50 rounded-lg border border-slate-600/30">
                                    <span className="font-medium text-slate-300 flex items-center">
                                        <svg className="w-3 h-3 mr-1 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                        </svg>
                                        Teacher:
                                    </span>
                                    <span className="text-slate-400 font-mono">teacher@example.com / teacher123</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Login;