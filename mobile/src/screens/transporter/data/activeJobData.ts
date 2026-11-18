/**
 * Transporter Active Job Screen Data & Copy Constants
 * Centralizes header text, card labels, instructions, alert dialogs, and modal copy.
 */

export const ACTIVE_JOB_HEADER = {
  title: "Active Job",
};

export const ACTIVE_JOB_CARDS = {
  farmerPickupTitle: "Farmer / Pickup",
  sellerDeliveryTitle: "Seller / Delivery",
  pickupProofAttached: "Pickup Proof Attached",
  deliveryProofTitle: "Delivery Proof & Handover",
  deliveryNotePrefix: "Note:",
  receivedByPrefix: "Received by:",
  earningsTitle: "Your Earnings",
  escrowNotice: "Held by Green Hive · Released on delivery",
  instructionsTitle: "Special Instructions",
  defaultInstructions: "Handle with care. Keep cool. Arrive by 8 AM for market opening.",
};

export const ACTIVE_JOB_ACTIONS = {
  confirmPickup: "Confirm Pickup",
  pickupConfirmed: "Pickup Confirmed",
  confirmDelivery: "Confirm Delivery",
  deliveryCompleted: "Delivery Completed ✓",
};

export const ACTIVE_JOB_ALERTS = {
  tripCompleted: {
    title: "Trip Completed",
    message: "This cargo delivery is already completed.",
  },
  cargoAlreadyPickedUp: (crop: string, weight: string, dropoff: string) => ({
    title: "Cargo Already Picked Up",
    message: `You have already picked up ${crop} · ${weight}. Currently in transit to ${dropoff}.`,
    primaryButtonText: "View Pickup Details",
    secondaryButtonText: "Close",
  }),
  jobAlreadyDelivered: (price: string) => ({
    title: "Job Already Delivered",
    message: `This shipment has already been successfully delivered and payment of ${price} was released.`,
    primaryButtonText: "View Delivery Proof",
    secondaryButtonText: "Close",
  }),
  pickupRequired: {
    title: "Pickup Confirmation Required",
    message: "Please confirm cargo pickup at the farm before confirming delivery to the seller.",
    primaryButtonText: "Confirm Pickup First",
    secondaryButtonText: "Proceed Anyway",
  },
  signOut: {
    title: "Log Out",
    message: "Are you sure you want to log out of your transporter account?",
    primaryButtonText: "Log Out",
    secondaryButtonText: "Cancel",
  },
};

export const ACTIVE_JOB_NAV_TABS = {
  home: "Home",
  jobs: "Jobs",
  active: "Active",
  profile: "Profile",
};

export const ACTIVE_JOB_MODALS = {
  notificationsTitle: "Notifications",
  viewAllNotifications: "View All Notifications",
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

