import axios from 'axios';

// Backend Base URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/admin';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Automatic JWT Token Injection
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('green_hive_admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response Interceptor: Auto logout if token expires
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('green_hive_admin_token');
      localStorage.removeItem('green_hive_admin_user');
      // If unauthorized, redirect to login if not already there
    }
    return Promise.reject(error);
  }
);

// ====================================================
// Admin API Functions
// ====================================================

// 1. Auth
export const loginAdmin = (credentials: { email: string; password: string }) =>
  api.post('/login', credentials);

export const getAdminProfile = () => api.get('/me');

// 2. Dashboard
export const getDashboardStats = () => api.get('/dashboard/stats');
export const getDashboardCharts = () => api.get('/dashboard/charts');

// 3. Users
export const getUsers = (params?: { role?: string; status?: string; search?: string }) =>
  api.get('/users', { params });

export const createUser = (userData: any) => api.post('/users', userData);

export const updateUserStatus = (id: string | number, status: 'active' | 'suspended' | 'pending') =>
  api.patch(`/users/${id}/status`, { status });

// 4. Approvals
export const getApprovals = (params?: { status?: string }) =>
  api.get('/approvals', { params });

export const updateApprovalStatus = (id: string | number, status: 'approved' | 'rejected', reason?: string) =>
  api.patch(`/approvals/${id}/status`, { status, rejection_reason: reason });

// 5. Ads
export const getAds = () => api.get('/ads');
export const deleteAd = (id: string | number, type: 'selling' | 'requirement') =>
  api.delete(`/ads/${id}?type=${type}`);

// 6. Operations
export const getOperations = () => api.get('/operations');

// 7. Payments
export const getPayments = () => api.get('/payments');
export const releasePayment = (id: string | number) =>
  api.patch(`/payments/${id}/release`);

// 8. Manage Admins
export const getAdmins = () => api.get('/admins');
export const createAdminAccount = (data: any) => api.post('/create-admin', data);