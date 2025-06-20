import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import {
    User,
    Mail,
    IdCard,
    Building,
    Shield,
    Key,
    Edit3,
    Save,
    X,
    Eye,
    EyeOff
} from 'lucide-react';
import officeService from '../../services/officeService';

const Profile = ({ user, onProfileUpdate }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const [profileData, setProfileData] = useState({
        name: user?.name || '',
        email: user?.email || ''
    });

    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [errors, setErrors] = useState({});

    // Handle profile update
    const handleProfileUpdate = async (e) => {
        e.preventDefault();

        // Validate form
        const newErrors = {};
        if (!profileData.name.trim()) {
            newErrors.name = 'Name is required';
        }
        if (!profileData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        try {
            setLoading(true);
            setErrors({});

            await officeService.updateProfile(profileData);

            toast.success('Profile updated successfully!');
            setIsEditing(false);

            // Refresh user data
            if (onProfileUpdate) {
                onProfileUpdate();
            }
        } catch (error) {
            console.error('Profile update failed:', error);
            toast.error(error.message || 'Failed to update profile');
            setErrors({ general: error.message || 'Failed to update profile' });
        } finally {
            setLoading(false);
        }
    };

    // Handle password change
    const handlePasswordChange = async (e) => {
        e.preventDefault();

        // Validate password form
        const newErrors = {};
        if (!passwordData.currentPassword) {
            newErrors.currentPassword = 'Current password is required';
        }
        if (!passwordData.newPassword) {
            newErrors.newPassword = 'New password is required';
        } else if (passwordData.newPassword.length < 6) {
            newErrors.newPassword = 'New password must be at least 6 characters';
        }
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        try {
            setLoading(true);
            setErrors({});

            await officeService.changePassword({
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });

            toast.success('Password changed successfully!');
            setIsChangingPassword(false);
            setPasswordData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
        } catch (error) {
            console.error('Password change failed:', error);
            toast.error(error.message || 'Failed to change password');
            setErrors({ password: error.message || 'Failed to change password' });
        } finally {
            setLoading(false);
        }
    };

    // Cancel editing
    const handleCancelEdit = () => {
        setIsEditing(false);
        setProfileData({
            name: user?.name || '',
            email: user?.email || ''
        });
        setErrors({});
    };

    // Cancel password change
    const handleCancelPasswordChange = () => {
        setIsChangingPassword(false);
        setPasswordData({
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
        });
        setErrors({});
    };

    // Get permission display text
    const getPermissionText = (key, value) => {
        const permissionLabels = {
            studentManagement: 'Student Management',
            feeManagement: 'Fee Management',
            certificateIssue: 'Certificate Issue',
            noticeManagement: 'Notice Management',
            reportGeneration: 'Report Generation'
        };

        return {
            label: permissionLabels[key] || key,
            status: value ? 'Granted' : 'Not Granted',
            color: value ? 'text-green-600' : 'text-red-600',
            bg: value ? 'bg-green-50' : 'bg-red-50'
        };
    };

    return (
        <div className="max-w-4xl mx-auto">
            {/* Page Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
                <p className="text-gray-600">Manage your account information and settings</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Profile Information Card */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-semibold text-gray-900">
                                Personal Information
                            </h2>
                            {!isEditing && (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="flex items-center space-x-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                >
                                    <Edit3 className="h-4 w-4" />
                                    <span>Edit</span>
                                </button>
                            )}
                        </div>

                        {!isEditing ? (
                            // Display Mode
                            <div className="space-y-4">
                                <div className="flex items-center space-x-3">
                                    <User className="h-5 w-5 text-gray-400" />
                                    <div>
                                        <p className="text-sm text-gray-500">Full Name</p>
                                        <p className="font-medium text-gray-900">{user?.name}</p>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-3">
                                    <Mail className="h-5 w-5 text-gray-400" />
                                    <div>
                                        <p className="text-sm text-gray-500">Email Address</p>
                                        <p className="font-medium text-gray-900">{user?.email}</p>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-3">
                                    <IdCard className="h-5 w-5 text-gray-400" />
                                    <div>
                                        <p className="text-sm text-gray-500">Staff ID</p>
                                        <p className="font-medium text-gray-900">{user?.staffId}</p>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-3">
                                    <Building className="h-5 w-5 text-gray-400" />
                                    <div>
                                        <p className="text-sm text-gray-500">Designation</p>
                                        <p className="font-medium text-gray-900">{user?.designation}</p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            // Edit Mode
                            <form onSubmit={handleProfileUpdate} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Full Name
                                    </label>
                                    <input
                                        type="text"
                                        value={profileData.name}
                                        onChange={(e) => setProfileData({
                                            ...profileData,
                                            name: e.target.value
                                        })}
                                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.name ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                        placeholder="Enter your full name"
                                    />
                                    {errors.name && (
                                        <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        value={profileData.email}
                                        onChange={(e) => setProfileData({
                                            ...profileData,
                                            email: e.target.value
                                        })}
                                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.email ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                        placeholder="Enter your email address"
                                    />
                                    {errors.email && (
                                        <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                                    )}
                                </div>

                                {errors.general && (
                                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                                        <p className="text-red-600 text-sm">{errors.general}</p>
                                    </div>
                                )}

                                <div className="flex space-x-3 pt-4">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <Save className="h-4 w-4" />
                                        <span>{loading ? 'Saving...' : 'Save Changes'}</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleCancelEdit}
                                        className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                                    >
                                        <X className="h-4 w-4" />
                                        <span>Cancel</span>
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>

                    {/* Password Change Card */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-semibold text-gray-900">
                                Security Settings
                            </h2>
                            {!isChangingPassword && (
                                <button
                                    onClick={() => setIsChangingPassword(true)}
                                    className="flex items-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                    <Key className="h-4 w-4" />
                                    <span>Change Password</span>
                                </button>
                            )}
                        </div>

                        {!isChangingPassword ? (
                            <div className="flex items-center space-x-3">
                                <Key className="h-5 w-5 text-gray-400" />
                                <div>
                                    <p className="text-sm text-gray-500">Password</p>
                                    <p className="font-medium text-gray-900">••••••••</p>
                                </div>
                            </div>
                        ) : (
                            <form onSubmit={handlePasswordChange} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Current Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showCurrentPassword ? "text" : "password"}
                                            value={passwordData.currentPassword}
                                            onChange={(e) => setPasswordData({
                                                ...passwordData,
                                                currentPassword: e.target.value
                                            })}
                                            className={`w-full px-3 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.currentPassword ? 'border-red-500' : 'border-gray-300'
                                                }`}
                                            placeholder="Enter current password"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                    {errors.currentPassword && (
                                        <p className="text-red-500 text-sm mt-1">{errors.currentPassword}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        New Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showNewPassword ? "text" : "password"}
                                            value={passwordData.newPassword}
                                            onChange={(e) => setPasswordData({
                                                ...passwordData,
                                                newPassword: e.target.value
                                            })}
                                            className={`w-full px-3 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.newPassword ? 'border-red-500' : 'border-gray-300'
                                                }`}
                                            placeholder="Enter new password"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowNewPassword(!showNewPassword)}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                    {errors.newPassword && (
                                        <p className="text-red-500 text-sm mt-1">{errors.newPassword}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Confirm New Password
                                    </label>
                                    <input
                                        type="password"
                                        value={passwordData.confirmPassword}
                                        onChange={(e) => setPasswordData({
                                            ...passwordData,
                                            confirmPassword: e.target.value
                                        })}
                                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                        placeholder="Confirm new password"
                                    />
                                    {errors.confirmPassword && (
                                        <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
                                    )}
                                </div>

                                {errors.password && (
                                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                                        <p className="text-red-600 text-sm">{errors.password}</p>
                                    </div>
                                )}

                                <div className="flex space-x-3 pt-4">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <Key className="h-4 w-4" />
                                        <span>{loading ? 'Changing...' : 'Change Password'}</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleCancelPasswordChange}
                                        className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                                    >
                                        <X className="h-4 w-4" />
                                        <span>Cancel</span>
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>

                {/* Permissions Card */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center space-x-2 mb-6">
                            <Shield className="h-5 w-5 text-gray-700" />
                            <h2 className="text-xl font-semibold text-gray-900">Permissions</h2>
                        </div>

                        <div className="space-y-3">
                            {user?.permissions && Object.entries(user.permissions).map(([key, value]) => {
                                const permission = getPermissionText(key, value);
                                return (
                                    <div key={key} className={`p-3 rounded-lg ${permission.bg}`}>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium text-gray-900">
                                                {permission.label}
                                            </span>
                                            <span className={`text-xs font-medium ${permission.color}`}>
                                                {permission.status}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="mt-6 p-3 bg-blue-50 rounded-lg">
                            <p className="text-xs text-blue-600">
                                Contact your administrator to modify permissions
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;