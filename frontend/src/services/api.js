import axios from 'axios';

// Vite uses import.meta.env instead of process.env
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// FIXED: removed the default `Content-Type: application/json` header.
// Axios auto-detects FormData and skips JSON.stringify-ing it, sets the
// correct 'multipart/form-data; boundary=...' header itself - but ONLY
// if no Content-Type is already present on the request. Having it baked
// in here as a default header suppressed that auto-detection entirely,
// so every FormData request (task create/update with file upload) got
// silently JSON.stringify'd into "{}" and sent as an empty body.
// Axios still sets 'application/json' automatically for plain object
// payloads (login, register, etc.), so nothing is lost for those calls.
const api = axios.create({
  baseURL: API_URL
});

// Request interceptor to add token
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

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear local storage and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;