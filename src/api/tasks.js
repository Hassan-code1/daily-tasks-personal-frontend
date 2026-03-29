import axios from 'axios';

const BASE = import.meta.env.VITE_API_URL || '';

const api = axios.create({ baseURL: `${BASE}/api` });

// Attach JWT on every request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('dt_token');
    if (token) config.headers['Authorization'] = `Bearer ${token}`;
    return config;
});

// On 401 → clear auth and redirect to reload (triggers AuthPage)
api.interceptors.response.use(
    (res) => res,
    (err) => {
        if (err.response?.status === 401) {
            localStorage.removeItem('dt_token');
            localStorage.removeItem('dt_user');
            window.location.reload();
        }
        return Promise.reject(err);
    }
);

export const getTasks = (date) => api.get('/tasks', { params: { date } });
export const createTask = (data) => api.post('/tasks', data);
export const updateTask = (id, data) => api.put(`/tasks/${id}`, data);
export const deleteTask = (id, params = {}) => api.delete(`/tasks/${id}`, { params });
export const getSummary = (month, year) =>
    api.get('/tasks/summary', { params: { month, year } });
