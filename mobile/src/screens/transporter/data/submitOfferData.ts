/**
 * Transporter Submit Offer Screen Data & UI Constants
 * Centralized strings, placeholders, form validation rules, and modal copy.
 */

export const SUBMIT_OFFER_TEXTS = {
  headerTitle: "Submit Offer",
  jobSummarySection: {
    specialInstructionsFallback: "Handle with care. Keep covered during transport.",
    jobPrefix: "JOB",
  },
  formSection: {
    title: "Your Offer",
    costLabel: "Transportation Cost (Rs.)",
    costRequiredAsterisk: "*",
    deliveryTimeLabel: "Estimated Delivery Date & Time",
    additionalNotesLabel: "Additional Notes",
  },
  buttons: {
    cancel: "Cancel",
    submitOffer: "Submit Offer",
    submitting: "Submitting...",
  },
  profileModal: {
    title: "Driver Profile",
    verifiedBadge: "Green-Hive Verified",
    ratingSuffix: "Rating",
    completedTripsSuffix: "Completed Trips",
    registeredVehicleSection: "Registered Vehicle",
    typeLabel: "Type:",
    plateLabel: "Plate:",
    statusLabel: "Status:",
    darkModeTitle: "Dark Mode",
    darkModeActive: "Dark theme is active",
    lightModeActive: "Light theme is active",
    logOutButton: "Log Out of Transporter Account",
  },
  bottomTabs: {
    home: "Home",
    jobs: "Jobs",
    active: "Active",
    profile: "Profile",
  },
};

export const SUBMIT_OFFER_PLACEHOLDERS = {
  cost: "e.g. 2000",
  notes: "Vehicle type, cool chain capability, cargo care notes...",
  defaultDeliveryTime: "Tomorrow · 07:00 AM",
};

export const SUBMIT_OFFER_MESSAGES = {
  validation: {
    missingCost: {
      inputError: "Please enter your proposed transportation cost.",
      alertTitle: "Missing Transportation Cost",
      alertMessage: "Please enter your proposed transportation cost (in Rs.) before submitting.",
      primaryButton: "Got It",
    },
    invalidCost: {
      inputError: "Please enter a valid amount greater than 0.",
      alertTitle: "Invalid Transportation Cost",
      alertMessage: "Please enter a valid transportation cost amount greater than 0.",
      primaryButton: "Got It",
    },
  },
  api: {
    duplicateOffer: {
      title: "Offer Already Submitted",
      message: "You have already submitted an active offer for this job.",
      primaryButton: "Understood",
    },
    submitError: {
      title: "Submission Failed",
      message: "Failed to submit transport offer. Please check your connection and try again.",
      primaryButton: "Got It",
    },
  },
  alerts: {
    logOut: {
      title: "Log Out",
      message: "Are you sure you want to log out of your driver account?",
      primaryButton: "Log Out",
      secondaryButton: "Cancel",
    },
  },
};

