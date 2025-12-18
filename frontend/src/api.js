import axios from 'axios';

const api = axios.create({
  baseURL: 'https://orange-space-invention-q7gg9xqj6g429jwv-3001.app.github.dev/api',
});

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

export default api;