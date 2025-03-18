import axios from 'axios';
import { toast } from 'react-toastify';
import { API_URL } from '../config/constants';

// Create axios instance with default config
const api = axios.create({
  baseURL: 'https://helpdesk-fuxiona-v2-0.onrender.com/api/v1',

  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const status = error.response?.status;
    
    if (status === 401) {
      toast.error('Session expired. Please login again.');
      window.location.href = '/login';
    } else if (status === 403) {
      toast.error('You do not have permission to perform this action.');
    } else if (status === 404) {
      toast.error('Resource not found.');
    } else if (status === 500) {
      toast.error('Server error. Please try again later.');
    } else if (!error.response) {
      toast.error('Network error. Please check your connection.');
    }
    
    return Promise.reject(error);
  }
);

// Auth Services
export const authService = {
  login: (credentials) => api.post('/sessions', credentials),
  logout: () => api.delete('/sessions'),
  getProfile: () => api.get('/users/me'),
  register: (userData) => api.post('/users', userData)
};

// User Services
export const userService = {
  getAllUsers: () => api.get('/users'),
  createUser: (userData) => api.post('/users', userData),
  deleteUser: (id) => api.delete(`/users/${id}`) // Agregar la función deleteUser
};

// Incident Services
export const incidentService = {
  getAllIncidents: () => api.get('/incidents'),
  getIncidentById: (id) => api.get(`/incidents/${id}`),
  createIncident: (formData) => {
    return api.post('/incidents', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  updateIncident: (id, data) => api.patch(`/incidents/${id}`, data),
  deleteIncident: (id) => api.delete(`/incidents/${id}`),
  addFiles: (id, formData) => {
    return api.patch(`/incidents/${id}/files`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  removeFile: (id, public_id) => api.delete(`/incidents/${id}/files`, {
    data: { public_id }
  })
};

export default api;
