import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:3000', // Đã chuyển về port 3000 cho backend
  withCredentials: true, // Nếu backend cần cookie/session
});

// Interceptor tự động gắn JWT token vào header Authorization.
// Mỗi request gửi đi sẽ đọc token từ localStorage và đính kèm.
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;
