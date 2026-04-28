import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:3000', // Đã chuyển về port 3000 cho backend
  withCredentials: true, // Nếu backend cần cookie/session
});

export default API;
