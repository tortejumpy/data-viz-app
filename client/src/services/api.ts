import axios from 'axios';

const API_URL = 'http://localhost:5000/api';
const AI_API_URL = 'http://localhost:8000/api';

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add interceptor to add auth token to all requests
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

// Auth API calls
export const register = async (userData: { name: string; email: string; password: string }) => {
  try {
    const response = await api.post('/auth/register', userData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const login = async (credentials: { email: string; password: string }) => {
  try {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getCurrentUser = async () => {
  try {
    const response = await api.get('/auth/me');
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Dataset API calls
export const uploadDataset = async (formData: FormData) => {
  try {
    const response = await api.post('/data/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createDataset = async (datasetData: any) => {
  try {
    const response = await api.post('/data', datasetData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getUserDatasets = async () => {
  try {
    const response = await api.get('/data');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getDataset = async (id: string) => {
  try {
    const response = await api.get(`/data/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteDataset = async (id: string) => {
  try {
    const response = await api.delete(`/data/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getAIInsights = async (id: string) => {
  try {
    const response = await api.post(`/data/${id}/insights`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Direct API call to AI service (if needed)
export const getAIInsightsDirect = async (data: any) => {
  try {
    const response = await axios.post(`${AI_API_URL}/insights`, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export default api; 