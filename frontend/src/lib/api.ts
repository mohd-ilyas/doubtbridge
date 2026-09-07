import axios from 'axios';
import { ApiError } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('doubtbridge_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    // Format error to match standard ApiError structure
    const customError: ApiError = {
      success: false,
      message: 'An unexpected error occurred',
      errors: [],
    };
    if (error.response?.data) {
      customError.message = error.response.data.message || customError.message;
      customError.errors = error.response.data.errors || [];
    }
    return Promise.reject(customError);
  }
);
