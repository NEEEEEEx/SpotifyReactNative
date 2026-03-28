import axios from 'axios';

const api = axios.create({
  baseURL: 'https://api.example.com', // replace later
  timeout: 10000,
});

// Request interceptor
api.interceptors.request.use(
  config => {
    const token = useAuthStore.getState().token;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  error => Promise.reject(error),
);

// Response interceptor
api.interceptors.response.use(
  response => response,
  error => {
    console.log('API ERROR:', error?.response || error.message);
    return Promise.reject(error);
  },
);

export default api;
