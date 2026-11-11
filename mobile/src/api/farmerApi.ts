import { apiClient } from './client';

export interface RegisterFarmerPayload {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  location?: string;
}

export interface RegisterFarmerResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: {
    id: number;
    name: string;
    email: string;
    phone: string;
    role: string;
    location: string;
    avatarLetter: string;
    isVerified: boolean;
  };
  error?: string;
}

/**
 * Register a new Farmer in the Green-Hive database.
 * Creates linked rows in:
 * - users
 * - farmer_profiles
 * - farmer_bank_details
 * - farmer_notification_settings
 */
export const registerFarmerApi = async (
  payload: RegisterFarmerPayload
): Promise<RegisterFarmerResponse> => {
  const response = await apiClient.post<RegisterFarmerResponse>('/farmer/register', payload);
  return response.data;
};

/**
 * Authenticate an existing Farmer against the database.
 */
export const loginFarmerApi = async (email: string, password: string) => {
  const response = await apiClient.post('/farmer/login', { email, password });
  return response.data;
};

/**
 * Fetch Farmer profile details from the database.
 */
export const getFarmerProfileApi = async (farmerId: number | string) => {
  const response = await apiClient.get(`/farmer/profile/${farmerId}`);
  return response.data;
};

