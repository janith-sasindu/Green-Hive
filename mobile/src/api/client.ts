import axios from 'axios';

// API Base Client Configuration
export const apiClient = axios.create({
  baseURL: 'http://localhost:5000/api', // Replace with production backend URL / local IP
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach Authorization Bearer JWT token
apiClient.interceptors.request.use((config) => {
  const token = ''; // Retrieve token from SecureStore or AsyncStorage
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
