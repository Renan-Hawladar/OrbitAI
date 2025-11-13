import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8001';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
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

// Handle 401 errors (unauthorized)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('userEmail');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (email: string, password: string) =>
    api.post('/api/auth/register', { email, password }),
  
  login: (email: string, password: string) =>
    api.post('/api/auth/login', { email, password }),
};

export const profileAPI = {
  getProfile: () => api.get('/api/profile'),
  
  updateProfile: (data: any) => api.put('/api/profile', data),
};

export const careerAPI = {
  analyzeCareer: () => api.post('/api/analyze-career'),
  
  searchCareer: (careerQuery: string) =>
    api.post('/api/search-career', { career_query: careerQuery }),
  
  getAnalyses: () => api.get('/api/analyses'),
};

export default api;