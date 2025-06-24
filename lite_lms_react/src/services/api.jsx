import axios from 'axios';

const api = axios.create({
  baseURL: 'http://127.0.0.1:5555', // change to your backend
});

api.interceptors.request.use((req) => {
  const token = localStorage.getItem('token');
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export default api;
