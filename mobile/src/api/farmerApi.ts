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

export interface RequirementItemResponse {
  id: string;
  rawId: number;
  buyerName: string;
  buyerPhone: string;
  cropName: string;
  category: string;
  requiredQuantity: string;
  quantityValue: number;
  targetPrice: string;
  targetPriceValue: number;
  unit: string;
  location: string;
  deadline: string;
  description: string;
  status: string;
  myOfferStatus?: string | null;
  offeredQuantityKg?: number | null;
  offeredPricePerKg?: number | null;
}

export interface SubmitFulfillmentPayload {
  requirementId: number;
  farmerId: number;
  offeredQuantityKg: number;
  offeredPricePerKg: number;
  notes?: string;
}

/**
 * Fetch live buyer requirements from the database
 */
export const getFarmerRequirementsApi = async (farmerId?: number): Promise<{ success: boolean; requirements: RequirementItemResponse[] }> => {
  const response = await apiClient.get('/farmer/requirements', {
    params: { farmerId },
  });
  return response.data;
};

/**
 * Submit a fulfillment offer from the farmer to the buyer
 */
export const submitFulfillmentApi = async (payload: SubmitFulfillmentPayload): Promise<{ success: boolean; message: string; fulfillmentId: number }> => {
  const response = await apiClient.post(`/farmer/requirements/${payload.requirementId}/fulfill`, payload);
  return response.data;
};

/**
 * Fetch all fulfillment offers submitted by this farmer
 */
export const getFarmerFulfillmentsApi = async (farmerId: number) => {
  const response = await apiClient.get('/farmer/fulfillments', {
    params: { farmerId },
  });
  return response.data;
};

