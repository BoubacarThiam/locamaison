import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Injecte automatiquement le JWT
api.interceptors.request.use(config => {
  const token = localStorage.getItem('lm_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Déconnecte si 401
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('lm_token');
      localStorage.removeItem('lm_user');
      window.location.href = '/connexion';
    }
    return Promise.reject(err);
  }
);

export default api;
