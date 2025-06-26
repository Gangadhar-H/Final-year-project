// frontend/src/services/feeService.js
import API from '../api/axios';

class FeeService {
    // ================== ADMIN SERVICES ==================

    // Create fee structure
    async createFeeStructure(feeStructureData) {
        try {
            const response = await API.post('/fee/admin/fee-structure', feeStructureData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    }

    // Get all fee structures
    async getAllFeeStructures() {
        try {
            const response = await API.get('/fee/admin/fee-structure');
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    }

    // Update fee structure
    async updateFeeStructure(id, feeStructureData) {
        try {
            const response = await API.put(`/fee/admin/fee-structure/${id}`, feeStructureData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    }

    // Delete fee structure
    async deleteFeeStructure(id) {
        try {
            const response = await API.delete(`/fee/admin/fee-structure/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    }

    // ================== STUDENT SERVICES ==================

    // Get student fee details
    async getStudentFeeDetails() {
        try {
            const response = await API.get('/fee/student/fee-details');
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    }

    // Submit fee payment
    async submitFeePayment(paymentData) {
        try {
            const formData = new FormData();
            Object.keys(paymentData).forEach(key => {
                if (key === 'paymentProof') {
                    formData.append(key, paymentData[key]);
                } else {
                    formData.append(key, paymentData[key]);
                }
            });

            const response = await API.post('/fee/student/submit-payment', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    }

    // Download receipt
    async downloadReceipt(receiptNumber) {
        try {
            const response = await API.get(`/fee/student/receipt/${receiptNumber}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    }

    // ================== OFFICE SERVICES ==================

    // Get pending payments
    async getPendingPayments(params = {}) {
        try {
            const queryParams = new URLSearchParams();
            if (params.page) queryParams.append('page', params.page);
            if (params.limit) queryParams.append('limit', params.limit);
            if (params.status) queryParams.append('status', params.status);

            const response = await API.get(`/fee/office/pending-payments?${queryParams.toString()}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    }

    // Get payment details
    async getPaymentDetails(paymentId) {
        try {
            const response = await API.get(`/fee/office/payment/${paymentId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    }

    // Add this method to frontend/src/services/feeService.js
    async getPaymentHistory() {
        try {
            const response = await API.get('/fee/student/payment-history');
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to fetch payment history' };
        }
    }

    // Verify payment
    async verifyPayment(paymentId, verificationData) {
        try {
            const response = await API.put(`/fee/office/verify-payment/${paymentId}`, verificationData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    }

    // ================== PUBLIC SERVICES ==================

    // Get public fee structures
    async getPublicFeeStructures() {
        try {
            const response = await API.get('/fee/fee-structures');
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    }
}

const feeService = new FeeService();
export default feeService;