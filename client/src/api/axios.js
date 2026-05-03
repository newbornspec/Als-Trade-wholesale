import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://als-trade-wholesale-production.up.railway.app/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('als_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;