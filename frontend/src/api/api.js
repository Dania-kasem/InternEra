import axios from 'axios';

export const API_BASE_URL = window.location.hostname === 'localhost' ? 'http://127.0.0.1:8000' : `http://${window.location.hostname}:8000`;

const API = axios.create({
  baseURL: API_BASE_URL,
});

export const getStoredToken = () => {
  const raw =
    localStorage.getItem('token') ||
    localStorage.getItem('access_token') ||
    localStorage.getItem('authToken') ||
    sessionStorage.getItem('token') ||
    sessionStorage.getItem('access_token') ||
    sessionStorage.getItem('authToken');

  if (!raw || raw === 'null' || raw === 'undefined') return null;
  let cleaned = String(raw).replace(/^"+|"+$/g, '').trim();
  if (cleaned.toLowerCase().startsWith('bearer ')) {
    cleaned = cleaned.slice(7).trim();
  }
  return cleaned || null;
};

API.interceptors.request.use((config) => {
  const token = getStoredToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;
