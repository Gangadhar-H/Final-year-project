// pages/admin/FeeManagementPage.jsx
import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import FeeStructureForm from '../../components/fee/FeeStructureForm';
import FeeStructureList from '../../components/fee/FeeStructureList';
import feeService from '../../services/feeService';

const FeeManagementPage = () => {
    const [activeTab, setActiveTab] = useState('list');
    const [showForm, setShowForm] = useState(false);
    const [editingFeeStructure, setEditingFeeStructure] = useState(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [stats, setStats] = useState({
        total: 0,
        active: 0,
        overdue: 0,
        dueSoon: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, [refreshTrigger]);

    const fetchStats = async () => {
        try {
            setLoading(true);
            const response = await feeService.getAllFeeStructures();
            const feeStructures = response.data || [];

            const today = new Date();
            const stats = feeStructures.reduce((acc, fee) => {
                acc.total++;

                const dueDate = new Date(fee.dueDate);
                const diffTime = dueDate - today;
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                if (diffDays < 0) {
                    acc.overdue++;
                } else if (diffDays <= 7) {
                    acc.dueSoon++;
                } else {
                    acc.active++;
                }

                return acc;
            }, { total: 0, active: 0, overdue: 0, dueSoon: 0 });

            setStats(stats);
        } catch (error) {
            console.error('Error fetching stats:', error);
            toast.error('Failed to fetch statistics');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateNew = () => {
        setEditingFeeStructure(null);
        setShowForm(true);
        setActiveTab('form');
    };

    const handleEdit = (feeStructure) => {
        setEditingFeeStructure(feeStructure);
        setShowForm(true);
        setActiveTab('form');
    };

    const handleFormSuccess = () => {
        setShowForm(false);
        setEditingFeeStructure(null);
        setActiveTab('list');
        setRefreshTrigger(prev => prev + 1);
        toast.success(editingFeeStructure ? 'Fee structure updated successfully' : 'Fee structure created successfully');
    };

    const handleFormCancel = () => {
        setShowForm(false);
        setEditingFeeStructure(null);
        setActiveTab('list');
    };

    const handleDelete = () => {
        setRefreshTrigger(prev => prev + 1);
    };

    const StatCard = ({ title, value, color, icon, description }) => (
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4" style={{ borderLeftColor: color }}>
            <div className="flex items-center justify-between">
                <div>
                    <div className="flex items-center">
                        <div className="p-2 rounded-full" style={{ backgroundColor: `${color}20` }}>
                            {icon}
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">{title}</p>
                            <p className="text-2xl font-bold text-gray-900">{loading ? '...' : value}</p>
                            {description && (
                                <p className="text-xs text-gray-500 mt-1">{description}</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const TabButton = ({ tab, label, isActive, onClick }) => (
        <button
            onClick={() => onClick(tab)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${isActive
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
        >
            {label}
        </button>
    );

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Fee Management</h1>
                            <p className="text-gray-600 mt-2">Manage fee structures and monitor payment status</p>
                        </div>

                        <button
                            onClick={handleCreateNew}
                            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors flex items-center space-x-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            <span>Create Fee Structure</span>
                        </button>
                    </div>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatCard
                        title="Total Structures"
                        value={stats.total}
                        color="#3B82F6"
                        description="All fee structures"
                        icon={
                            <svg className="w-6 h-6" style={{ color: '#3B82F6' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        }
                    />

                    <StatCard
                        title="Active"
                        value={stats.active}
                        color="#10B981"
                        description="Payment period active"
                        icon={
                            <svg className="w-6 h-6" style={{ color: '#10B981' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        }
                    />

                    <StatCard
                        title="Due Soon"
                        value={stats.dueSoon}
                        color="#F59E0B"
                        description="Due within 7 days"
                        icon={
                            <svg className="w-6 h-6" style={{ color: '#F59E0B' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        }
                    />

                    <StatCard
                        title="Overdue"
                        value={stats.overdue}
                        color="#EF4444"
                        description="Past due date"
                        icon={
                            <svg className="w-6 h-6" style={{ color: '#EF4444' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.966-.833-2.736 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                        }
                    />
                </div>

                {/* Navigation Tabs */}
                <div className="bg-white rounded-lg shadow-md mb-6">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <div className="flex space-x-2">
                            <TabButton
                                tab="list"
                                label="Fee Structures"
                                isActive={activeTab === 'list'}
                                onClick={setActiveTab}
                            />
                            {showForm && (
                                <TabButton
                                    tab="form"
                                    label={editingFeeStructure ? 'Edit Fee Structure' : 'Create Fee Structure'}
                                    isActive={activeTab === 'form'}
                                    onClick={setActiveTab}
                                />
                            )}
                        </div>
                    </div>
                </div>

                {/* Content Area */}
                <div className="space-y-6">
                    {activeTab === 'list' && (
                        <FeeStructureList
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            refreshTrigger={refreshTrigger}
                        />
                    )}

                    {activeTab === 'form' && showForm && (
                        <FeeStructureForm
                            feeStructure={editingFeeStructure}
                            onSuccess={handleFormSuccess}
                            onCancel={handleFormCancel}
                        />
                    )}
                </div>

            </div>
        </div>
    );
};

export default FeeManagementPage;