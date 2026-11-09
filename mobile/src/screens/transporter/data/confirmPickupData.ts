/**
 * Transporter Confirm Pickup Screen Data & Text Constants
 * Centralizes UI copy, banner labels, modal texts, alerts, and placeholders
 * to eliminate hardcoding from the screen component.
 */

export const CONFIRM_PICKUP_HEADER = {
  title: "Confirm Pickup",
  backAccessibilityLabel: "Go back to active trip",
  notificationsAccessibilityLabel: "View notifications",
  profileAccessibilityLabel: "View profile",
};

export const CONFIRM_PICKUP_BANNER = {
  icon: "📦",
  title: "Confirm Pickup at Farm",
  fallbackPickupLocation: "the farm",
  fallbackDropoffLocation: "the destination",
};

export const CONFIRM_PICKUP_CARGO = {
  cardTitle: "Cargo Details",
  productLabel: "Product",
  quantityLabel: "Quantity",
  fallbackProduct: "Agricultural Produce",
  fallbackQuantity: "Standard Load",
};

export const CONFIRM_PICKUP_INPUTS = {
  timestampLabel: "Timestamp",
  timestampPlaceholder: "Pickup date and time",
  notesLabel: "Notes (optional)",
  notesPlaceholder: "Any observations or notes...",
};

export const CONFIRM_PICKUP_PHOTO = {
  uploadTitle: "Upload Proof Photo",
  uploadSubtitle: "Optional but recommended",
  attachedBadge: "Proof Photo Attached",
  removeButton: "Remove",
  tapToEnlarge: "Tap to enlarge",
  retakeButton: "Retake / Change Photo",
  previewTitle: "Pickup Cargo Proof",
  closePreview: "Close Preview",
};

export const CONFIRM_PICKUP_MODAL = {
  title: "Add Proof Photo",
  subtitle: "Select an option to capture or upload loaded cargo proof",
  optionCamera: {
    title: "Take Photo with Camera",
    description: "Capture cargo picture on-site",
    icon: "camera" as const,
  },
  optionGallery: {
    title: "Choose from Gallery",
    description: "Select existing photo from device",
    icon: "images" as const,
  },
  optionSample: {
    title: "Use Sample Cargo Photo",
    description: "Quick demo proof for simulator",
    icon: "leaf" as const,
  },
  cancelButton: "Cancel",
};

export const CONFIRM_PICKUP_ALERTS = {
  cameraPermission: {
    title: "Camera Permission Required",
    message:
      "Green-Hive needs camera access to capture proof photo of the loaded cargo. Please allow camera access in your device settings.",
  },
  cameraError: {
    title: "Camera Error",
    message:
      "Could not launch camera. Please check your device settings or choose from gallery.",
  },
  galleryPermission: {
    title: "Gallery Permission Required",
    message:
      "Green-Hive needs photo library access to select proof of cargo pickup. Please allow photo library access in your settings.",
  },
  galleryError: {
    title: "Gallery Error",
    message:
      "Could not access photos. Please check device permissions and try again.",
  },
  success: {
    title: "Pickup Confirmed!",
    message: (pickup: string, dropoff: string) =>
      `Cargo has been verified and successfully loaded at ${pickup}. Job status is now 'In Transit'. Please proceed to ${dropoff}.`,
    buttonText: "View Trip",
  },
  failure: {
    title: "Confirmation Failed",
    message:
      "Could not confirm cargo pickup on the server. Please check your internet connection and try again.",
    buttonText: "OK",
  },
  loadError: {
    title: "Could Not Load Job",
    message: "Unable to retrieve the active job details from the server.",
    buttonText: "OK",
  },
};

export const CONFIRM_PICKUP_ACTIONS = {
  submitButton: "Confirm Pickup",
  submittingButton: "Confirming...",
};

export const CONFIRM_PICKUP_LOADING = {
  message: "Loading active trip details...",
};

export const CONFIRM_PICKUP_TABS = {
  home: "Home",
  jobs: "Jobs",
  active: "Active",
  profile: "Profile",
};

