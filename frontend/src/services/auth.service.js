import api from './api';

const login = async (email, password) => {
    const response = await api.post('/api/v1/admin/login', { email, password });
    return response.data;
};

const logout = async () => {
    // Optional: Call logout endpoint if your API has one
    // return api.post('/api/v1/admin/logout');

    // Clear tokens from localStorage
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    return true;
};

const getCurrentUser = async () => {
    const response = await api.get('/api/v1/admin/profile');
    return response.data;
};

const AuthService = {
    login,
    logout,
    getCurrentUser
};

export default AuthService;