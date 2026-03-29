import axios from 'axios';

const BASE = import.meta.env.VITE_API_URL || '';

export const registerUser = (data) =>
    axios.post(`${BASE}/api/auth/register`, data);

export const loginUser = (data) =>
    axios.post(`${BASE}/api/auth/login`, data);
