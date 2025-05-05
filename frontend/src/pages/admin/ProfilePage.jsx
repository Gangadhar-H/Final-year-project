import { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../../context/AuthContext';
import API from '../../api/axios';

function ProfilePage() {
    const { user } = useContext(AuthContext);

    const [profileData, setProfileData] = useState({
        name: '',
        email: '',
        adminId: ''
    });

    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    // Fetch profile data or use cached data from auth context
    useEffect(() => {
        if (user) {
            setProfileData({
                name: user.name || '',
                email: user.email || '',
                adminId: user.adminId || ''
            });
        }
    }, [user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProfileData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const updateProfile = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ text: '', type: '' });

        try {
            // Assuming there's an endpoint to update admin profile
            const response = await API.put(`/admin/profile/${user._id}`, {
                name: profileData.name,
                email: profileData.email
            });

            // Update local context with new data
            // Would need to implement this in AuthContext

            setMessage({
                text: 'Profile updated successfully!',
                type: 'success'
            });
            setIsEditing(false);
        } catch (error) {
            setMessage({
                text: error.response?.data?.message || 'Failed to update profile',
                type: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    const changePassword = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ text: '', type: '' });

        // Validate passwords match
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            setMessage({ text: 'New passwords do not match', type: 'error' });
            setLoading(false);
            return;
        }

        try {
            // Assuming there's an endpoint to change password
            const response = await API.put(`/admin/change-password/${user._id}`, {
                currentPassword: passwordForm.currentPassword,
                newPassword: passwordForm.newPassword
            });

            setMessage({
                text: 'Password changed successfully!',
                type: 'success'
            });

            // Reset password form
            setPasswordForm({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
        } catch (error) {
            setMessage({
                text: error.response?.data?.message || 'Failed to change password',
                type: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8">
            <h2 className="text-2xl font-bold">Admin Profile</h2>

            {/* Message display */}
            {message.text && (
                <div className={`p-4 rounded ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {message.text}
                </div>
            )}

            {/* Profile Information Card */}
            <div className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-semibold">Profile Information</h3>
                    <button
                        onClick={() => setIsEditing(!isEditing)}
                        className="text-blue-600 hover:text-blue-800 flex items-center"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                        {isEditing ? 'Cancel' : 'Edit Profile'}
                    </button>
                </div>

                {isEditing ? (
                    <form onSubmit={updateProfile} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Admin ID</label>
                            <input
                                type="text"
                                value={profileData.adminId}
                                disabled
                                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-500"
                            />
                            <p className="text-xs text-gray-500 mt-1">Admin ID cannot be changed</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                            <input
                                type="text"
                                name="name"
                                value={profileData.name}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input
                                type="email"
                                name="email"
                                value={profileData.email}
                                onChange={handleChange}
                                disabled
                                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-500"
                                required
                            />
                            <p className="text-xs text-gray-500 mt-1">Emailcannot be changed</p>
                        </div>

                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={loading}
                                className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                            >
                                {loading ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className="space-y-4">
                        <div>
                            <h4 className="text-sm font-medium text-gray-500">Admin ID</h4>
                            <p className="mt-1">{profileData.adminId}</p>
                        </div>

                        <div>
                            <h4 className="text-sm font-medium text-gray-500">Name</h4>
                            <p className="mt-1">{profileData.name}</p>
                        </div>

                        <div>
                            <h4 className="text-sm font-medium text-gray-500">Email</h4>
                            <p className="mt-1">{profileData.email}</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Change Password Card */}
            <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-xl font-semibold mb-6">Change Password</h3>

                <form onSubmit={changePassword} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                        <input
                            type="password"
                            name="currentPassword"
                            value={passwordForm.currentPassword}
                            onChange={handlePasswordChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                        <input
                            type="password"
                            name="newPassword"
                            value={passwordForm.newPassword}
                            onChange={handlePasswordChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                            minLength={6}
                        />
                        <p className="text-xs text-gray-500 mt-1">Password must be at least 6 characters</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                        <input
                            type="password"
                            name="confirmPassword"
                            value={passwordForm.confirmPassword}
                            onChange={handlePasswordChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={loading}
                            className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {loading ? 'Changing...' : 'Change Password'}
                        </button>
                    </div>
                </form>
            </div>

            {/* Account Security Card - can be expanded in the future */}
            <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-xl font-semibold mb-6">Account Security</h3>

                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-blue-700">
                                For security purposes, please remember to log out when using shared devices.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="border-t pt-4">
                    <h4 className="font-medium mb-2">Login Sessions</h4>
                    <div className="flex items-center space-x-3">
                        <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                        <div>
                            <p className="font-medium">Current Session</p>
                            <p className="text-sm text-gray-500">Logged in {new Date().toLocaleDateString()}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ProfilePage;