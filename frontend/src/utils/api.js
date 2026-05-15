import axios from 'axios';

// Ensure the URL ends with /api even if the user forgets it in the env var
let baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5002/api';

if (!baseUrl.endsWith('/api')) {
  baseUrl = baseUrl.replace(/\/$/, '') + '/api';
}

const api = axios.create({
  baseURL: baseUrl,
  withCredentials: true,
});

export default api;
