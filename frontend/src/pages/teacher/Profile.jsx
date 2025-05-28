import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
    getTeacherProfile,
    updateTeacherProfile,
    changeTeacherPassword,
    validateProfileData,
    validatePasswordData,
    handleApiError
} from '../../services/teacherService';

const Profile = () => {
    const { user, updateUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('profile');
    const [message, setMessage] = useState({ type: '', content: '' });

    // Profile form state
    const [profileData, setProfileData] = useState({
        name: '',
        email: '',
        teacherId: ''
    });
    const [profileErrors, setProfileErrors] = useState([]);

    // Password form state
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [passwordErrors, setPasswordErrors] = useState([]);
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false
    });

    // Load profile data on component mount
    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            setLoading(true);
            const response = await getTeacherProfile();
            const teacher = response.teacher;

            setProfileData({
                name: teacher.name || '',
                email: teacher.email || '',
                teacherId: teacher.teacherId || ''
            });
        } catch (error) {
            const errorInfo = handleApiError(error);
            setMessage({
                type: 'error',
                content: errorInfo.message
            });
        } finally {
            setLoading(false);
        }
    };

    const handleProfileChange = (e) => {
        const { name, value } = e.target;
        setProfileData(prev => ({
            ...prev,
            [name]: value
        }));

        // Clear errors when user starts typing
        if (profileErrors.length > 0) {
            setProfileErrors([]);
        }
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({
            ...prev,
            [name]: value
        }));

        // Clear errors when user starts typing
        if (passwordErrors.length > 0) {
            setPasswordErrors([]);
        }
    };

    const handleProfileSubmit = async (e) => {
        e.preventDefault();

        // Validate form data
        const validation = validateProfileData(profileData);
        if (!validation.isValid) {
            setProfileErrors(validation.errors);
            return;
        }

        try {
            setLoading(true);
            setProfileErrors([]);

            const response = await updateTeacherProfile({
                name: profileData.name,
                email: profileData.email
            });

            // Update user context with new data
            updateUser({
                name: profileData.name,
                email: profileData.email
            });

            setMessage({
                type: 'success',
                content: 'Profile updated successfully!'
            });

            // Auto-clear success message after 3 seconds
            setTimeout(() => {
                setMessage({ type: '', content: '' });
            }, 3000);

        } catch (error) {
            const errorInfo = handleApiError(error);
            setMessage({
                type: 'error',
                content: errorInfo.message
            });
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();

        // Validate password data
        const validation = validatePasswordData(passwordData);
        if (!validation.isValid) {
            setPasswordErrors(validation.errors);
            return;
        }

        try {
            setLoading(true);
            setPasswordErrors([]);

            await changeTeacherPassword({
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });

            // Clear password form
            setPasswordData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });

            setMessage({
                type: 'success',
                content: 'Password changed successfully!'
            });

            // Auto-clear success message after 3 seconds
            setTimeout(() => {
                setMessage({ type: '', content: '' });
            }, 3000);

        } catch (error) {
            const errorInfo = handleApiError(error);
            setMessage({
                type: 'error',
                content: errorInfo.message
            });
        } finally {
            setLoading(false);
        }
    };

    const togglePasswordVisibility = (field) => {
        setShowPasswords(prev => ({
            ...prev,
            [field]: !prev[field]
        }));
    };

    if (loading && !profileData.name) {
        return (
            <div className="min-h-full flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading profile...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-full bg-gray-50 py-6">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
                    <p className="mt-2 text-gray-600">
                        Manage your account settings and preferences
                    </p>
                </div>

                {/* Message Display */}
                {message.content && (
                    <div className={`mb-6 p-4 rounded-md ${message.type === 'success'
                            ? 'bg-green-50 border border-green-200 text-green-800'
                            : 'bg-red-50 border border-red-200 text-red-800'
                        }`}>
                        <div className="flex items-center">
                            {message.type === 'success' ? (
                                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                            ) : (
                                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                            )}
                            {message.content}
                        </div>
                    </div>
                )}

                {/* Profile Card */}
                <div className="bg-white shadow-sm rounded-lg overflow-hidden">
                    {/* Profile Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-8">
                        <div className="flex items-center space-x-4">
                            <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                                {user?.name?.charAt(0).toUpperCase() || 'T'}
                            </div>
                            <div className="text-white">
                                <h2 className="text-2xl font-bold">{user?.name || 'Teacher'}</h2>
                                <p className="text-blue-100">Teacher ID: {user?.teacherId || 'N/A'}</p>
                                <p className="text-blue-100">{user?.email || ''}</p>
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="border-b border-gray-200">
                        <nav className="flex space-x-8 px-6">
                            <button
                                onClick={() => setActiveTab('profile')}
                                className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'profile'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                Profile Information
                            </button>
                            <button
                                onClick={() => setActiveTab('password')}
                                className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'password'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                Change Password
                            </button>
                        </nav>
                    </div>

                    {/* Tab Content */}
                    <div className="p-6">
                        {activeTab === 'profile' ? (
                            <div className="max-w-2xl">
                                <h3 className="text-lg font-medium text-gray-900 mb-6">
                                    Personal Information
                                </h3>

                                {/* Profile Errors */}
                                {profileErrors.length > 0 && (
                                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
                                        <div className="flex">
                                            <svg className="w-5 h-5 text-red-400 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                            <div>
                                                <h4 className="text-sm font-medium text-red-800">
                                                    Please fix the following errors:
                                                </h4>
                                                <ul className="mt-1 text-sm text-red-700 list-disc list-inside">
                                                    {profileErrors.map((error, index) => (
                                                        <li key={index}>{error}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <form onSubmit={handleProfileSubmit} className="space-y-6">
                                    {/* Teacher ID (Read-only) */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Teacher ID
                                        </label>
                                        <input
                                            type="text"
                                            value={profileData.teacherId}
                                            readOnly
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500 cursor-not-allowed focus:outline-none"
                                        />
                                        <p className="mt-1 text-xs text-gray-500">
                                            Teacher ID cannot be changed
                                        </p>
                                    </div>

                                    {/* Name */}
                                    <div>
                                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                                            Full Name *
                                        </label>
                                        <input
                                            type="text"
                                            id="name"
                                            name="name"
                                            value={profileData.name}
                                            onChange={handleProfileChange}
                                            required
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="Enter your full name"
                                        />
                                    </div>

                                    {/* Email */}
                                    <div>
                                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                            Email Address *
                                        </label>
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            value={profileData.email}
                                            onChange={handleProfileChange}
                                            required
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="Enter your email address"
                                        />
                                    </div>

                                    {/* Submit Button */}
                                    <div className="pt-4">
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {loading ? (
                                                <>
                                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                    Updating...
                                                </>
                                            ) : (
                                                <>
                                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                    Update Profile
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        ) : (
                            <div className="max-w-2xl">
                                <h3 className="text-lg font-medium text-gray-900 mb-6">
                                    Change Password
                                </h3>

                                {/* Password Errors */}
                                {passwordErrors.length > 0 && (
                                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
                                        <div className="flex">
                                            <svg className="w-5 h-5 text-red-400 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                            <div>
                                                <h4 className="text-sm font-medium text-red-800">
                                                    Please fix the following errors:
                                                </h4>
                                                <ul className="mt-1 text-sm text-red-700 list-disc list-inside">
                                                    {passwordErrors.map((error, index) => (
                                                        <li key={index}>{error}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <form onSubmit={handlePasswordSubmit} className="space-y-6">
                                    {/* Current Password */}
                                    <div>
                                        <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-2">
                                            Current Password *
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={showPasswords.current ? "text" : "password"}
                                                id="currentPassword"
                                                name="currentPassword"
                                                value={passwordData.currentPassword}
                                                onChange={handlePasswordChange}
                                                required
                                                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                placeholder="Enter your current password"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => togglePasswordVisibility('current')}
                                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                            >
                                                {showPasswords.current ? (
                                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                                                    </svg>
                                                ) : (
                                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                    </svg>
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    {/* New Password */}
                                    <div>
                                        <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                                            New Password *
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={showPasswords.new ? "text" : "password"}
                                                id="newPassword"
                                                name="newPassword"
                                                value={passwordData.newPassword}
                                                onChange={handlePasswordChange}
                                                required
                                                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                placeholder="Enter your new password"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => togglePasswordVisibility('new')}
                                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                            >
                                                {showPasswords.new ? (
                                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                                                    </svg>
                                                ) : (
                                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                    </svg>
                                                )}
                                            </button>
                                        </div>
                                        <p className="mt-1 text-xs text-gray-500">
                                            Password must be at least 6 characters long
                                        </p>
                                    </div>

                                    {/* Confirm Password */}
                                    <div>
                                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                                            Confirm New Password *
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={showPasswords.confirm ? "text" : "password"}
                                                id="confirmPassword"
                                                name="confirmPassword"
                                                value={passwordData.confirmPassword}
                                                onChange={handlePasswordChange}
                                                required
                                                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                placeholder="Confirm your new password"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => togglePasswordVisibility('confirm')}
                                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                            >
                                                {showPasswords.confirm ? (
                                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                                                    </svg>
                                                ) : (
                                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                    </svg>
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Submit Button */}
                                    <div className="pt-4">
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {loading ? (
                                                <>
                                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                    Changing...
                                                </>
                                            ) : (
                                                <>
                                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                                    </svg>
                                                    Change Password
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;