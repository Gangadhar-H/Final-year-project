import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import officeService from '../../services/officeService';
import { toast } from 'react-toastify';
import {
    User,
    Mail,
    IdCard,
    Briefcase,
    Shield,
    Key,
    Save,
    Eye,
    EyeOff,
    CheckCircle,
    AlertCircle
} from 'lucide-react';

export default function Profile() {
    const { user, updateUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('profile');

    // Profile form state
    const [profileData, setProfileData] = useState({
        name: '',
        email: ''
    });

    // Password form state
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    // UI state
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [profileErrors, setProfileErrors] = useState({});
    const [passwordErrors, setPasswordErrors] = useState({});

    // Load profile data on component mount
    useEffect(() => {
        if (user) {
            setProfileData({
                name: user.name || '',
                email: user.email || ''
            });
        }
    }, [user]);

    // Handle profile form changes
    const handleProfileChange = (e) => {
        const { name, value } = e.target;
        setProfileData(prev => ({
            ...prev,
            [name]: value
        }));

        // Clear specific error when user starts typing
        if (profileErrors[name]) {
            setProfileErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    // Handle password form changes
    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({
            ...prev,
            [name]: value
        }));

        // Clear specific error when user starts typing
        if (passwordErrors[name]) {
            setPasswordErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    // Validate profile form
    const validateProfile = () => {
        const errors = {};

        if (!profileData.name.trim()) {
            errors.name = 'Name is required';
        }

        if (!profileData.email.trim()) {
            errors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileData.email)) {
            errors.email = 'Please enter a valid email address';
        }

        return errors;
    };

    // Validate password form
    const validatePassword = () => {
        const errors = {};

        if (!passwordData.currentPassword) {
            errors.currentPassword = 'Current password is required';
        }

        if (!passwordData.newPassword) {
            errors.newPassword = 'New password is required';
        } else if (passwordData.newPassword.length < 6) {
            errors.newPassword = 'New password must be at least 6 characters';
        }

        if (!passwordData.confirmPassword) {
            errors.confirmPassword = 'Please confirm your new password';
        } else if (passwordData.newPassword !== passwordData.confirmPassword) {
            errors.confirmPassword = 'Passwords do not match';
        }

        return errors;
    };

    // Handle profile update
    const handleProfileSubmit = async (e) => {
        e.preventDefault();

        const errors = validateProfile();
        if (Object.keys(errors).length > 0) {
            setProfileErrors(errors);
            return;
        }

        setLoading(true);
        try {
            const response = await officeService.updateProfile(profileData);

            // Update user in context
            updateUser(response.staff);

            toast.success('Profile updated successfully!');
            setProfileErrors({});

        } catch (error) {
            console.error('Profile update error:', error);
            toast.error(error.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    // Handle password change
    const handlePasswordSubmit = async (e) => {
        e.preventDefault();

        const errors = validatePassword();
        if (Object.keys(errors).length > 0) {
            setPasswordErrors(errors);
            return;
        }

        setLoading(true);
        try {
            await officeService.changePassword({
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });

            toast.success('Password changed successfully!');
            setPasswordData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
            setPasswordErrors({});

        } catch (error) {
            console.error('Password change error:', error);
            toast.error(error.message || 'Failed to change password');
        } finally {
            setLoading(false);
        }
    };

    // Get permission status display
    const getPermissionStatus = (permission) => {
        return user?.permissions?.[permission] ? (
            <span className="inline-flex items-center gap-1 text-green-600">
                <CheckCircle className="w-4 h-4" />
                Granted
            </span>
        ) : (
            <span className="inline-flex items-center gap-1 text-red-600">
                <AlertCircle className="w-4 h-4" />
                Not Granted
            </span>
        );
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Page Header */}
            <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
                        <p className="text-gray-600">Manage your account information and preferences</p>
                    </div>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="bg-white rounded-lg shadow-sm">
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
                            onClick={() => setActiveTab('security')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'security'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            Security
                        </button>
                        <button
                            onClick={() => setActiveTab('permissions')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'permissions'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            Permissions
                        </button>
                    </nav>
                </div>

                {/* Tab Content */}
                <div className="p-6">
                    {/* Profile Information Tab */}
                    {activeTab === 'profile' && (
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>

                                {/* Read-only fields */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            <IdCard className="w-4 h-4 inline mr-2" />
                                            Staff ID
                                        </label>
                                        <div className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600">
                                            {user?.staffId || 'N/A'}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            <Briefcase className="w-4 h-4 inline mr-2" />
                                            Designation
                                        </label>
                                        <div className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600">
                                            {user?.designation || 'N/A'}
                                        </div>
                                    </div>
                                </div>

                                {/* Editable form */}
                                <form onSubmit={handleProfileSubmit} className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                <User className="w-4 h-4 inline mr-2" />
                                                Full Name
                                            </label>
                                            <input
                                                type="text"
                                                name="name"
                                                value={profileData.name}
                                                onChange={handleProfileChange}
                                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${profileErrors.name ? 'border-red-500' : 'border-gray-300'
                                                    }`}
                                                placeholder="Enter your full name"
                                            />
                                            {profileErrors.name && (
                                                <p className="mt-1 text-sm text-red-600">{profileErrors.name}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                <Mail className="w-4 h-4 inline mr-2" />
                                                Email Address
                                            </label>
                                            <input
                                                type="email"
                                                name="email"
                                                value={profileData.email}
                                                onChange={handleProfileChange}
                                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${profileErrors.email ? 'border-red-500' : 'border-gray-300'
                                                    }`}
                                                placeholder="Enter your email address"
                                            />
                                            {profileErrors.email && (
                                                <p className="mt-1 text-sm text-red-600">{profileErrors.email}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex justify-end">
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                                        >
                                            <Save className="w-4 h-4" />
                                            {loading ? 'Updating...' : 'Update Profile'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* Security Tab */}
                    {activeTab === 'security' && (
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Change Password</h3>

                                <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-md">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Current Password
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={showCurrentPassword ? 'text' : 'password'}
                                                name="currentPassword"
                                                value={passwordData.currentPassword}
                                                onChange={handlePasswordChange}
                                                className={`w-full px-3 py-2 pr-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${passwordErrors.currentPassword ? 'border-red-500' : 'border-gray-300'
                                                    }`}
                                                placeholder="Enter current password"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                            >
                                                {showCurrentPassword ? (
                                                    <EyeOff className="w-4 h-4 text-gray-400" />
                                                ) : (
                                                    <Eye className="w-4 h-4 text-gray-400" />
                                                )}
                                            </button>
                                        </div>
                                        {passwordErrors.currentPassword && (
                                            <p className="mt-1 text-sm text-red-600">{passwordErrors.currentPassword}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            New Password
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={showNewPassword ? 'text' : 'password'}
                                                name="newPassword"
                                                value={passwordData.newPassword}
                                                onChange={handlePasswordChange}
                                                className={`w-full px-3 py-2 pr-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${passwordErrors.newPassword ? 'border-red-500' : 'border-gray-300'
                                                    }`}
                                                placeholder="Enter new password"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowNewPassword(!showNewPassword)}
                                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                            >
                                                {showNewPassword ? (
                                                    <EyeOff className="w-4 h-4 text-gray-400" />
                                                ) : (
                                                    <Eye className="w-4 h-4 text-gray-400" />
                                                )}
                                            </button>
                                        </div>
                                        {passwordErrors.newPassword && (
                                            <p className="mt-1 text-sm text-red-600">{passwordErrors.newPassword}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Confirm New Password
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={showConfirmPassword ? 'text' : 'password'}
                                                name="confirmPassword"
                                                value={passwordData.confirmPassword}
                                                onChange={handlePasswordChange}
                                                className={`w-full px-3 py-2 pr-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${passwordErrors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                                                    }`}
                                                placeholder="Confirm new password"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                            >
                                                {showConfirmPassword ? (
                                                    <EyeOff className="w-4 h-4 text-gray-400" />
                                                ) : (
                                                    <Eye className="w-4 h-4 text-gray-400" />
                                                )}
                                            </button>
                                        </div>
                                        {passwordErrors.confirmPassword && (
                                            <p className="mt-1 text-sm text-red-600">{passwordErrors.confirmPassword}</p>
                                        )}
                                    </div>

                                    <div className="flex justify-end">
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                                        >
                                            <Key className="w-4 h-4" />
                                            {loading ? 'Changing...' : 'Change Password'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* Permissions Tab */}
                    {activeTab === 'permissions' && (
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-4">
                                    <Shield className="w-5 h-5 inline mr-2" />
                                    Your Permissions
                                </h3>
                                <p className="text-gray-600 mb-6">
                                    These permissions determine what actions you can perform in the system.
                                </p>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <h4 className="font-medium text-gray-900">Student Management</h4>
                                                <p className="text-sm text-gray-600">Add, edit, and manage student records</p>
                                            </div>
                                            {getPermissionStatus('studentManagement')}
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <h4 className="font-medium text-gray-900">Fee Management</h4>
                                                <p className="text-sm text-gray-600">Manage student fees and payments</p>
                                            </div>
                                            {getPermissionStatus('feeManagement')}
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <h4 className="font-medium text-gray-900">Certificate Issue</h4>
                                                <p className="text-sm text-gray-600">Issue certificates and documents</p>
                                            </div>
                                            {getPermissionStatus('certificateIssue')}
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <h4 className="font-medium text-gray-900">Notice Management</h4>
                                                <p className="text-sm text-gray-600">Create and manage notices</p>
                                            </div>
                                            {getPermissionStatus('noticeManagement')}
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <h4 className="font-medium text-gray-900">Report Generation</h4>
                                                <p className="text-sm text-gray-600">Generate various reports</p>
                                            </div>
                                            {getPermissionStatus('reportGeneration')}
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                                    <p className="text-sm text-blue-800">
                                        <strong>Note:</strong> If you need additional permissions, please contact your system administrator.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}