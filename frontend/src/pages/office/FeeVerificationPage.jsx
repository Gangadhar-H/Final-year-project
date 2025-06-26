import React, { useState, useEffect } from 'react';
import { DollarSign, Clock, CheckCircle, XCircle, TrendingUp, Users, AlertCircle } from 'lucide-react';
import PendingPaymentsList from '../../components/fee/PendingPaymentsList';
import feeService from '../../services/feeService';
import toast from 'react-hot-toast';

const FeeVerificationPage = () => {
    const [stats, setStats] = useState({
        pending: 0,
        approved: 0,
        rejected: 0,
        totalAmount: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        setLoading(true);
        try {
            // Fetch statistics for all statuses
            const [pendingResponse, approvedResponse, rejectedResponse] = await Promise.all([
                feeService.getPendingPayments({ status: 'pending', limit: 1 }),
                feeService.getPendingPayments({ status: 'approved', limit: 1 }),
                feeService.getPendingPayments({ status: 'rejected', limit: 1 })
            ]);

            // Calculate total amount from approved payments
            const approvedPayments = await feeService.getPendingPayments({
                status: 'approved',
                limit: 1000 // Get all approved payments for total calculation
            });

            const totalAmount = approvedPayments.data.payments.reduce((sum, payment) => {
                return sum + (payment.paymentDetails?.paidAmount || 0);
            }, 0);

            setStats({
                pending: pendingResponse.data.total || 0,
                approved: approvedResponse.data.total || 0,
                rejected: rejectedResponse.data.total || 0,
                totalAmount
            });
        } catch (error) {
            console.error('Error fetching stats:', error);
            toast.error('Failed to fetch payment statistics');
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    };

    const StatCard = ({ title, value, icon: Icon, color, bgColor, textColor }) => (
        <div className={`${bgColor} rounded-lg p-6 border border-gray-200`}>
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
                    <p className={`text-2xl font-bold ${textColor}`}>
                        {typeof value === 'number' && title.includes('Amount')
                            ? formatCurrency(value)
                            : value
                        }
                    </p>
                </div>
                <div className={`${color} p-3 rounded-full`}>
                    <Icon className="w-6 h-6 text-white" />
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Fee Verification</h1>
                            <p className="text-gray-600 mt-1">Manage and verify student fee payments</p>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                            <Clock className="w-4 h-4" />
                            <span>Last updated: {new Date().toLocaleTimeString()}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatCard
                        title="Pending Verification"
                        value={loading ? '...' : stats.pending}
                        icon={Clock}
                        color="bg-yellow-500"
                        bgColor="bg-yellow-50"
                        textColor="text-yellow-700"
                    />
                    <StatCard
                        title="Approved Payments"
                        value={loading ? '...' : stats.approved}
                        icon={CheckCircle}
                        color="bg-green-500"
                        bgColor="bg-green-50"
                        textColor="text-green-700"
                    />
                    <StatCard
                        title="Rejected Payments"
                        value={loading ? '...' : stats.rejected}
                        icon={XCircle}
                        color="bg-red-500"
                        bgColor="bg-red-50"
                        textColor="text-red-700"
                    />
                    <StatCard
                        title="Total Collected"
                        value={loading ? '...' : stats.totalAmount}
                        icon={TrendingUp}
                        color="bg-blue-500"
                        bgColor="bg-blue-50"
                        textColor="text-blue-700"
                    />
                </div>

                {/* Quick Stats Summary */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                            <Users className="w-5 h-5 mr-2" />
                            Payment Overview
                        </h2>
                        <button
                            onClick={fetchStats}
                            disabled={loading}
                            className="text-sm text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50"
                        >
                            {loading ? 'Refreshing...' : 'Refresh Stats'}
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-gray-900 mb-1">
                                {loading ? '...' : (stats.pending + stats.approved + stats.rejected)}
                            </div>
                            <div className="text-sm text-gray-500">Total Submissions</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-green-600 mb-1">
                                {loading ? '...' : `${stats.approved + stats.rejected > 0
                                    ? Math.round((stats.approved / (stats.approved + stats.rejected)) * 100)
                                    : 0}%`}
                            </div>
                            <div className="text-sm text-gray-500">Approval Rate</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-yellow-600 mb-1">
                                {loading ? '...' : stats.pending}
                            </div>
                            <div className="text-sm text-gray-500">Awaiting Review</div>
                        </div>
                    </div>
                </div>

                {/* Instructions Panel */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
                    <div className="flex items-start">
                        <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                        <div>
                            <h3 className="text-sm font-medium text-blue-800 mb-1">Verification Guidelines</h3>
                            <ul className="text-sm text-blue-700 space-y-1">
                                <li>• Review payment proof documents carefully before approving</li>
                                <li>• Verify transaction ID matches the payment proof</li>
                                <li>• Add remarks for rejected payments explaining the reason</li>
                                <li>• Approved payments will automatically generate receipt numbers</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Payments List Component */}
                <div className="bg-white rounded-lg shadow-sm">
                    <PendingPaymentsList />
                </div>
            </div>
        </div>
    );
};

export default FeeVerificationPage;