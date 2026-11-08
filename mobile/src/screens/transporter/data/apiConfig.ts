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
  profile: `${TRANSPORTER_API_BASE_URL}/profile`,
  avatar: `${TRANSPORTER_API_BASE_URL}/profile/avatar`,
  bankDetails: `${TRANSPORTER_API_BASE_URL}/bank-details`,
  notifications: `${TRANSPORTER_API_BASE_URL}/notifications`,
  notificationsReadAll: `${TRANSPORTER_API_BASE_URL}/notifications/read-all`,
  notificationRead: (id: string | number) => `${TRANSPORTER_API_BASE_URL}/notifications/${id}/read`,
  notificationSettings: `${TRANSPORTER_API_BASE_URL}/notification-settings`,
};

