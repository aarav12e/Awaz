import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5001/api',
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const raw = localStorage.getItem('awaz-session');
    if (raw) {
      try {
        const session = JSON.parse(raw);
        if (session) {
          if (session.token) {
            config.headers.Authorization = `Bearer ${session.token}`;
          }
          if (session.email) {
            config.headers['x-user-email'] = session.email;
          }
          if (session.handle) {
            config.headers['x-user-handle'] = session.handle;
          }
          if (session.id || session._id) {
            config.headers['x-user-id'] = session.id || session._id;
          }
        }
      } catch (err) {
        console.error('Failed to parse auth session from localStorage', err);
      }
    }
  }
  return config;
});

export default api;
