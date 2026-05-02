import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://https://als-trade-wholesale-production.up.railway.app/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('dw_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
