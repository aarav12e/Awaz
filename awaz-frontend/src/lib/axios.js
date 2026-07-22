import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const raw = localStorage.getItem('awaz-session');
    if (raw) {
      try {
        const session = JSON.parse(raw);
        if (session && session.token) {
          config.headers.Authorization = `Bearer ${session.token}`;
        }
      } catch (err) {
        console.error('Failed to parse auth session from localStorage', err);
      }
    }
  }
  return config;
});

export default api;
