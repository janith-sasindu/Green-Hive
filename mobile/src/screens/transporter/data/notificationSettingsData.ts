/**
 * Transporter Notification Settings Screen Data & Copy Constants
 * Centralizes header text, card labels, toggle descriptions, and alert messages.
 */

export const NOTIFICATION_SETTINGS_HEADER = {
  title: "Notification Settings",
  subtitle: "Manage phone push alerts",
  backButton: "Back to Profile",
};

export const NOTIFICATION_SETTINGS_CARDS = {
  pushSectionTitle: "Phone Push Alert Types",
  newJobs: {
    title: "New Jobs Notifications",
    description: "Alert on phone when new transport jobs are posted near you",
  },
  currentJob: {
    title: "Current Job Updates",
    description: "Alert on phone for active trip milestones, pickup, and updates",
  },
  offerStatus: {
    title: "Offer Acceptance & Bids",
    description: "Alert on phone when a farmer accepts or counters your offer",
  },
  payment: {
    title: "Payment Releases",
    description: "Alert on phone when earnings are credited to your account",
  },
  soundSectionTitle: "Alert Sounds",
  sound: {
    title: "Sound & Vibration",
    description: "Play phone ringtone and vibrate on arrival",
  },
};

export const NOTIFICATION_SETTINGS_ACTIONS = {
  saveButton: "Save Notification Preferences",
  savingButton: "Saving Preferences...",
  backToProfileButton: "Back to Profile",
};

export const NOTIFICATION_SETTINGS_ALERTS = {
  saveSuccess: {
    title: "Notification Settings Saved",
    message: "Your notification preferences have been saved successfully.",
    primaryButtonText: "Done",
  },
  saveFailed: {
    title: "Save Failed",
    defaultMessage: "Failed to save notification preferences. Please try again.",
  },
  connectionError: {
    title: "Connection Error",
    message: "Could not connect to the backend server. Please verify your connection.",
  },
};

