import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add auth token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle auth errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401 || error.response?.status === 403) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Auth API
export const authAPI = {
    login: (credentials) => api.post('/auth/login', credentials),
    register: (userData) => api.post('/auth/register', userData),
    getProfile: () => api.get('/auth/me'),
    updatePassword: (passwords) => api.put('/auth/password', passwords)
};

// Students API
export const studentsAPI = {
    getAll: (params) => api.get('/students', { params }),
    getById: (id) => api.get(`/students/${id}`),
    create: (formData) => api.post('/students', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    update: (id, formData) => api.put(`/students/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    delete: (id) => api.delete(`/students/${id}`),
    getClasses: () => api.get('/students/meta/classes'),
    getSections: (className) => api.get(`/students/meta/sections/${className}`)
};

// Attendance API
export const attendanceAPI = {
    createSession: (formData) => api.post('/attendance/session', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    getSessions: (params) => api.get('/attendance/sessions', { params }),
    getSessionById: (id) => api.get(`/attendance/sessions/${id}`),
    updateRecord: (id, data) => api.put(`/attendance/records/${id}`, data),
    approveSession: (id) => api.put(`/attendance/sessions/${id}/approve`),
    deleteSession: (id) => api.delete(`/attendance/sessions/${id}`)
};

// Analytics API
export const analyticsAPI = {
    getStudentStats: (studentId) => api.get(`/analytics/student/${studentId}`),
    getClassStats: (className, params) => api.get(`/analytics/class/${className}`, { params }),
    getSubjectStats: (subject, params) => api.get(`/analytics/subject/${subject}`, { params }),
    getDashboard: () => api.get('/analytics/dashboard'),
    exportCSV: (params) => api.get('/analytics/export/csv', {
        params,
        responseType: 'blob'
    })
};

export default api;
