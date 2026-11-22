import { Platform } from "react-native";

/**
 * Transporter Module API Endpoints Configuration
 * Centralized API URLs separated from UI screen components.
 */
export const TRANSPORTER_API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL
    ? `${process.env.EXPO_PUBLIC_API_URL}/transporter`
    : Platform.OS === "android"
    ? "http://10.0.2.2:5000/api/transporter"
    : "http://localhost:5000/api/transporter";

export const TRANSPORTER_API_ENDPOINTS = {
  home: `${TRANSPORTER_API_BASE_URL}/home`,
  availableJobs: `${TRANSPORTER_API_BASE_URL}/jobs/available`,
  activeJob: `${TRANSPORTER_API_BASE_URL}/jobs/active`,
  jobDetails: (id: string | number) => `${TRANSPORTER_API_BASE_URL}/jobs/${id}`,
  jobOffers: (id: string | number) => `${TRANSPORTER_API_BASE_URL}/jobs/${id}/offers`,
  jobStatus: (id: string | number) => `${TRANSPORTER_API_BASE_URL}/jobs/${id}/status`,
  confirmPickup: (id: string | number) => `${TRANSPORTER_API_BASE_URL}/jobs/${id}/pickup`,
  confirmDelivery: (id: string | number) => `${TRANSPORTER_API_BASE_URL}/jobs/${id}/delivery`,
  profile: `${TRANSPORTER_API_BASE_URL}/profile`,
  avatar: `${TRANSPORTER_API_BASE_URL}/profile/avatar`,
  bankDetails: `${TRANSPORTER_API_BASE_URL}/bank-details`,
  notifications: `${TRANSPORTER_API_BASE_URL}/notifications`,
  notificationsReadAll: `${TRANSPORTER_API_BASE_URL}/notifications/read-all`,
  notificationRead: (id: string | number) => `${TRANSPORTER_API_BASE_URL}/notifications/${id}/read`,
  notificationSettings: `${TRANSPORTER_API_BASE_URL}/notification-settings`,
  offers: `${TRANSPORTER_API_BASE_URL}/offers`,
  withdrawOffer: (id: string | number) => `${TRANSPORTER_API_BASE_URL}/offers/${id}`,
  latestOffer: `${TRANSPORTER_API_BASE_URL}/offers/latest`,
  jobOffer: (jobId: string | number) =>
    `${TRANSPORTER_API_BASE_URL}/offers/latest?jobId=${encodeURIComponent(String(jobId))}`,
  supportTickets: `${TRANSPORTER_API_BASE_URL}/support/tickets`,
  vehicleLicense: `${TRANSPORTER_API_BASE_URL}/vehicle-license`,
  vehicleLicenseDocument: `${TRANSPORTER_API_BASE_URL}/vehicle-license/documents`,
};

