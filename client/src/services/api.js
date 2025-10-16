import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
};

// Properties API
export const propertiesAPI = {
  getAll: () => api.get('/properties'),
  getOne: (id) => api.get(`/properties/${id}`),
  add: (data) => api.post('/properties/add', data),
  getInsight: (data) => api.post('/properties/insight', data),
  delete: (id) => api.delete(`/properties/${id}`),
  chat: (data) => api.post('/properties/chat', data),
};

export default api;
