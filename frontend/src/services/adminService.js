// src/services/adminService.js
import API from '../api/axios.js';

export const getSemesters = () =>
    API.get('/admin/semesters').then(res => res.data);

export const addSemester = (semesterNumber, divisions = []) =>
    API.post('/admin/semesters', { semesterNumber, divisions })
        .then(res => res.data);

export const updateSemester = (id, updates) =>
    API.put(`/admin/semesters/${id}`, updates)
        .then(res => res.data);

export const deleteSemester = (id) =>
    API.delete(`/admin/semesters/${id}`)
        .then(res => res.data);
