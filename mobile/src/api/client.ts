import axios from 'axios';
import Constants from 'expo-constants';

/**
 * Dynamically resolves backend API base URL for physical devices (via Expo Go) and emulators.
 */
const getBaseUrl = (): string => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  // Fallback: extract development host machine IP from Expo Constants
  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const hostIp = hostUri.split(':')[0];
    return `http://${hostIp}:5000/api`;
  }

  return 'http://localhost:5000/api';
};

// API Base Client Configuration
export const apiClient = axios.create({
  baseURL: getBaseUrl(),
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
