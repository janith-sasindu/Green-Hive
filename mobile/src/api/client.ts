import axios from 'axios';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

/**
 * Dynamically resolves backend API base URL for physical devices (via Expo Go), emulators, and web.
 */
const getBaseUrl = (): string => {
  // If explicitly pointing to a remote cloud server (e.g. Render / Heroku / AWS), use it
  if (
    process.env.EXPO_PUBLIC_API_URL &&
    !process.env.EXPO_PUBLIC_API_URL.includes('localhost') &&
    !process.env.EXPO_PUBLIC_API_URL.includes('127.0.0.1')
  ) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  // On physical mobile devices (Expo Go / standalone), 'localhost' points to the phone itself.
  // Extract your computer's local Wi-Fi IP automatically from Expo Constants.
  if (Platform.OS !== 'web') {
    const hostUri = Constants.expoConfig?.hostUri;
    if (hostUri) {
      const hostIp = hostUri.split(':')[0];
      return `http://${hostIp}:5000/api`;
    }
  }

  // Default for Web / Local browser
  return 'http://localhost:5000/api';
};

const resolvedBaseUrl = getBaseUrl();
console.log('🌐 Mobile API Base URL:', resolvedBaseUrl);

// API Base Client Configuration
export const apiClient = axios.create({
  baseURL: resolvedBaseUrl,
  timeout: 10000,
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
