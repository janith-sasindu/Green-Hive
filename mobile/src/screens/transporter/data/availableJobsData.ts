/**
 * Transporter Available Jobs Screen Data & UI Copy Constants
 * Centralizes header text, card labels, route details modal, and dialogs.
 */

export const AVAILABLE_JOBS_HEADER = {
  title: "Available Jobs",
  countSubtitle: (count: number) => `${count} transport jobs available near you`,
};

export const AVAILABLE_JOBS_CARD = {
  viewJobButton: "View Job >",
  defaultStatus: "Open",
};

export const AVAILABLE_JOBS_ROUTE_MODAL = {
  routeTitle: "ROUTE",
  pickupTitle: "Pickup",
  deliveryTitle: "Delivery",
  farmerPrefix: "Farmer:",
  sellerPrefix: "Seller:",
  requiredDateLabel: "Required Date",
  requiredTimeLabel: "Required Time",
  instructionsTitle: "Special Instructions",
  paymentProtectedTitle: "Payment Protected",
  paymentProtectedDesc:
    "Transportation payment is held by Green Hive and released upon successful delivery confirmation.",
  backButton: "Back",
  submitOfferButton: "Submit Offer",
};

export const AVAILABLE_JOBS_ALERTS = {
  contactFarmer: (name?: string, phone?: string) => ({
    title: "Contact Farmer",
    message: `Call ${name || "Farmer"} at ${phone || ""}?`,
    cancelButton: "Cancel",
    callButton: "Call",
  }),
  signOut: {
    title: "Log Out",
    message: "Are you sure you want to log out?",
    cancelButton: "Cancel",
    confirmButton: "Log Out",
  },
};

export const AVAILABLE_JOBS_NAV_TABS = {
  home: "Home",
  jobs: "Jobs",
  active: "Active",
  profile: "Profile",
};

export const AVAILABLE_JOBS_MODALS = {
  notificationsTitle: "Notifications",
  newCountBadge: (count: number) => `${count} new`,
  seeMoreButton: "See More",
  dismissButton: "Dismiss",
  profileTitle: "Driver Profile",
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

