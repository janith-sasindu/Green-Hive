/**
 * Transporter Notifications Screen Data & UI Copy Constants
 * Centralizes header copy, empty states, modals, bottom navigation, and alert dialogs.
 */

export const NOTIFICATIONS_HEADER = {
  title: "Notifications",
  unreadLabel: (count: number) => `${count} unread`,
  markAllReadButton: "Mark all read",
};

export const NOTIFICATIONS_EMPTY_STATE = {
  title: "No Notifications",
  description: "You have caught up with all your transport alerts and updates.",
  loading: "Loading notifications...",
};

export const NOTIFICATIONS_ALERTS = {
  allCaughtUp: {
    title: "All Caught Up",
    message: "All notifications are already marked as read.",
  },
  markAllSuccess: {
    title: "Success",
    message: "All notifications marked as read.",
  },
  dismissButton: "Dismiss",
  viewJobDetailsButton: "View Job Details",
  jobReferenceLabel: "Job Reference:",
  signOut: {
    title: "Log Out",
    message: "Are you sure you want to log out?",
    cancelButton: "Cancel",
    confirmButton: "Log Out",
  },
};

export const NOTIFICATIONS_PROFILE_MODAL = {
  title: "Driver Profile",
  tripsSummary: (rating: number, count: number) =>
    `⭐ ${rating.toFixed(1)} Rating (${count} Completed Trips)`,
  vehicleSectionTitle: "Registered Vehicle",
  typeLabel: "Type:",
  plateLabel: "Plate:",
  statusLabel: "Status:",
  verifiedStatus: "Green-Hive Verified",
  darkModeTitle: "Dark Mode",
  darkModeActive: "Dark theme is active",
  lightModeActive: "Light theme is active",
  logOutButton: "Log Out of Transporter Account",
};

export const NOTIFICATIONS_NAV_TABS = {
  home: "Home",
  jobs: "Jobs",
  active: "Active",
  profile: "Profile",
};

