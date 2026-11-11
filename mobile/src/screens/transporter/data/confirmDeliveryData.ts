/**
 * Transporter Confirm Delivery Screen Data & Text Constants
 * Centralizes UI copy, banner labels, modal texts, alerts, and placeholders
 * to eliminate hardcoding from the screen component.
 */

export const CONFIRM_DELIVERY_HEADER = {
  title: "Confirm Delivery",
  backAccessibilityLabel: "Go back to active trip",
  notificationsAccessibilityLabel: "View notifications",
  profileAccessibilityLabel: "View profile",
};

export const CONFIRM_DELIVERY_BANNER = {
  icon: "📍",
  title: "Confirm Delivery at Destination",
  fallbackDropoffLocation: "the destination",
  fallbackPickupLocation: "the farm",
};

export const CONFIRM_DELIVERY_CARGO = {
  cardTitle: "Cargo Details",
  productLabel: "Product",
  quantityLabel: "Quantity",
  earningsLabel: "Earnings to Release:",
  fallbackProduct: "Agricultural Produce",
  fallbackQuantity: "Standard Load",
  fallbackPrice: "Rs. 0",
};

export const CONFIRM_DELIVERY_INPUTS = {
  timestampLabel: "Delivery Timestamp",
  timestampPlaceholder: "Delivery date and time",
  receiverLabel: "Received By / Contact Person",
  receiverPlaceholder: "e.g. Mr. Sunil (Market Manager)",
  notesLabel: "Delivery Notes (optional)",
  notesPlaceholder:
    "Observations, condition of goods upon arrival, receiving bay number...",
};

export const CONFIRM_DELIVERY_PHOTO = {
  sectionTitle: "Photo Evidence / Proof of Delivery",
  uploadTitle: "Upload Delivery Proof Photo",
  uploadSubtitle: "Capture unloaded cargo or signed delivery receipt",
  attachedBadge: "Delivery Proof Attached",
  removeButton: "Remove",
  tapToEnlarge: "Tap to enlarge",
  retakeButton: "Retake / Change Photo",
  previewTitle: "Delivery Cargo Proof",
  closePreview: "Close Preview",
};

export const CONFIRM_DELIVERY_MODAL = {
  title: "Add Delivery Proof Photo",
  subtitle: "Select an option to capture or upload delivered cargo proof",
  optionCamera: {
    title: "Take Photo with Camera",
    description: "Capture unloaded cargo on-site",
    icon: "camera" as const,
  },
  optionGallery: {
    title: "Choose from Gallery",
    description: "Select existing photo from device",
    icon: "images" as const,
  },
  optionSample: {
    title: "Use Sample Delivery Photo",
    description: "Quick demo proof for simulator",
    icon: "checkmark-done" as const,
  },
  cancelButton: "Cancel",
};

export const CONFIRM_DELIVERY_ALERTS = {
  cameraPermission: {
    title: "Camera Permission Required",
    message:
      "Green-Hive needs camera access to capture proof photo of the delivered cargo at destination. Please allow camera access in device settings.",
  },
  cameraError: {
    title: "Camera Error",
    message:
      "Could not launch camera. Please check your device settings or choose from gallery.",
  },
  galleryPermission: {
    title: "Gallery Permission Required",
    message:
      "Green-Hive needs photo library access to select proof of cargo delivery. Please allow photo library access in your settings.",
  },
  galleryError: {
    title: "Gallery Error",
    message:
      "Could not access photos. Please check device permissions and try again.",
  },
  success: {
    title: "Delivery Confirmed!",
    message: (dropoff: string, price: string) =>
      `Cargo successfully delivered to ${dropoff}. Payment of ${price} has been released and credited to your wallet.`,
    buttonText: "View Trip Status",
  },
  failure: {
    title: "Delivery Confirmation Failed",
    message:
      "Could not confirm cargo delivery on the server. Please check your internet connection and try again.",
    buttonText: "OK",
  },
  loadError: {
    title: "Could Not Load Trip",
    message: "Unable to retrieve the active delivery details from the server.",
    buttonText: "OK",
  },
};

export const CONFIRM_DELIVERY_ACTIONS = {
  submitButton: "Confirm Delivery",
  submittingButton: "Confirming Delivery...",
};

export const CONFIRM_DELIVERY_LOADING = {
  message: "Loading delivery trip details...",
};

export const CONFIRM_DELIVERY_TABS = {
  home: "Home",
  jobs: "Jobs",
  active: "Active",
  profile: "Profile",
};

