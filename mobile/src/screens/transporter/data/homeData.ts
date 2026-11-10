/**
 * Transporter Home Screen Data & UI Copy Constants
 * Centralizes dashboard header copy, driver profile banner labels, 2x2 stats grid,
 * quick action buttons, active job section, available jobs section, payment summary,
 * bottom navigation tabs, and dialog / modal copy.
 */

export const HOME_HEADER = {
  title: "Dashboard",
  unreadAlertDotLabel: "Unread Alert",
};

export const HOME_BANNER = {
  verifiedDriver: "Verified Driver",
  completedJobsSubtitle: (count: number) => `· ${count} completed jobs`,
};

export const HOME_STATS_LABELS = {
  openJobs: "Open Jobs",
  myOffers: "My Offers",
  activeJobs: "Active Jobs",
  thisMonth: "This Month",
};

export const HOME_QUICK_ACTIONS = {
  availableJobs: "Available Jobs",
  activeJobs: "Active Jobs",
  myOffers: "My Offers",
  profile: "Profile",
  bankDetails: "Bank Details",
};

export const HOME_ACTIVE_JOB_SECTION = {
  sectionTitle: "ACTIVE JOB",
  viewLiveTrip: "View Live Trip →",
  confirmPickupButton: "Confirm Pickup",
  confirmDeliveryButton: "Confirm Delivery",
};

export const HOME_AVAILABLE_JOBS_SECTION = {
  sectionTitle: "AVAILABLE JOBS",
  viewAll: "View all",
  viewDetails: "View Details >",
  submitOffer: "Submit Offer →",
};

export const HOME_PAYMENT_SUMMARY_SECTION = {
  sectionTitle: "Payment Summary",
  pendingRelease: "Pending Release",
  thisMonth: "This Month",
};

export const HOME_NAV_TABS = {
  home: "Home",
  jobs: "Jobs",
  active: "Active",
  profile: "Profile",
};

export const HOME_ALERTS = {
  pickupAlreadyConfirmed: (cropName: string, weight: string, status: string) => ({
    title: "Cargo Already Picked Up",
    message: `You have already confirmed pickup for ${cropName} · ${weight}. Status: ${status}.`,
    viewTripButton: "View Trip",
    okButton: "OK",
  }),
  deliveryAlreadyConfirmed: (price: string) => ({
    title: "Job Already Delivered",
    message: `This shipment has already been delivered. Payment of ${price} has been released.`,
    viewDetailsButton: "View Details",
    okButton: "OK",
  }),
  updateDeliveryStatus: (jobId: string) => ({
    title: "Update Delivery Status",
    message: `Select current status for job ${jobId}:`,
    statusInProgress: "In Progress",
    statusAtPickup: "At Pickup Location",
    statusInTransit: "In Transit on Highway",
    statusDelivered: "Delivered to Destination",
    cancelButton: "Cancel",
  }),
  deliveryCompleted: (cropName: string, price: string) => ({
    title: "Delivery Completed!",
    message: `${cropName} delivered. Payment of ${price} has been added to your earnings.`,
  }),
  makeOfferConfirm: (cropInfo: string, jobId: string) => ({
    title: "Submit Transport Offer",
    message: `Do you want to submit your standard rate offer for ${cropInfo} (${jobId})?`,
    cancelButton: "Cancel",
    submitButton: "Submit Offer",
  }),
  offerSentSuccess: (jobId: string) => ({
    title: "Offer Sent!",
    message: `Your quote for ${jobId} has been sent to the farmer. You will receive an alert once accepted.`,
  }),
  signOut: {
    title: "Sign Out",
    message: "Are you sure you want to log out of your driver account?",
    cancelButton: "Cancel",
    signOutButton: "Sign Out",
  },
};

export const HOME_OFFERS_MODAL = {
  headerTitle: "📋 My Transport Offers",
  subtitle: (count: number) => `${count} submitted quotes under review`,
  yourQuoteLabel: "Your Quote:",
};

export const HOME_NOTIFICATIONS_MODAL = {
  headerTitle: "🔔 Recent Notifications",
  seeMoreButton: "See More",
  dismissButton: "Dismiss",
};

export const HOME_AVAILABLE_JOB_MODAL = {
  routeTitle: "ROUTE",
  pickupTitle: "Pickup",
  farmerPrefix: "Farmer: ",
  deliveryTitle: "Delivery",
  sellerPrefix: "Seller: ",
  requiredDateLabel: "Required Date",
  requiredTimeLabel: "Required Time",
  specialInstructionsTitle: "Special Instructions",
  paymentProtectedTitle: "Payment Protected",
  paymentProtectedDesc:
    "Transportation payment is held by Green Hive and released upon successful delivery confirmation.",
  backButton: "Back",
  submitOfferButton: "Submit Offer",
};

export const HOME_ACTIVE_JOB_MODAL = {
  headerTitle: "Active Job Details",
  cargoSummaryTitle: "Cargo Summary",
  statusPrefix: "Status: ",
  pickupPrefix: "Pickup:",
  dropoffPrefix: "Dropoff:",
  farePrefix: "Fare:",
  distancePrefix: "Distance:",
  confirmPickupButton: "Confirm Pickup",
  confirmDeliveryButton: "Confirm Delivery",
};

export const HOME_PROFILE_MODAL = {
  headerTitle: "Driver Profile",
  ratingSubtitle: (rating: number, trips: number) =>
    `⭐ ${rating.toFixed(1)} Rating (${trips} Completed Trips)`,
  darkMode: "Dark Mode",
  registeredVehicleTitle: "Registered Vehicle",
  typeLabel: "Type:",
  plateLabel: "Plate:",
  statusLabel: "Status:",
  statusVerified: "Green-Hive Verified",
  signOutButton: "Log Out of Transporter Account",
};

