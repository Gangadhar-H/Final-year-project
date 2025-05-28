// src/services/adminService.js
import API from '../api/axios.js';

export const getSemesters = () =>
    API.get('/admin/semesters/getAllSemesters').then(res => res.data);

export const addSemester = (semesterNumber, divisions = []) =>
    API.post('/admin/semesters', { semesterNumber, divisions })
        .then(res => res.data);

export const updateSemester = (id, updates) =>
    API.put(`/admin/semesters/${id}`, updates)
        .then(res => res.data);

export const deleteSemester = (id) =>
    API.delete(`/admin/semesters/${id}`)
        .then(res => res.data);

// Additional service methods you might need
export const getSemesterById = (id) =>
    API.get(`/admin/semesters/${id}`).then(res => res.data);

export const getStudents = () =>
    API.get('/admin/students').then(res => res.data);

export const getTeachers = () =>
    API.get('/admin/teachers').then(res => res.data);

export const getSubjects = (semesterNumber) =>
    API.get(`/admin/semesters/${semesterNumber}/subjects`).then(res => res.data);