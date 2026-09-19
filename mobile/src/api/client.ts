import axios from 'axios';

// API Base Client Configuration
export const apiClient = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api',
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
