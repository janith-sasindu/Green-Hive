/**
 * Transporter Help & Support Screen Data & Text Constants
 * Centralizes all UI copy, field labels, placeholders, category options,
 * modals, alerts, and button labels to avoid hardcoding in the screen component.
 */

export interface HelpSupportProblemCategory {
  id: string;
  label: string;
  icon: string;
}

export const HELP_SUPPORT_HEADER = {
  title: "Help & Support",
  subtitle: "Direct Contact with Green-Hive Admin",
  backAccessibilityLabel: "Go back to profile",
};

export const HELP_SUPPORT_SWITCHER = {
  composeTab: "Send Message",
  historyTab: (count: number) => `My Inquiries (${count})`,
  historyTitle: "Past Inquiries & Responses",
  historyCountBadge: (count: number) => `${count} submitted`,
};

export const HELP_SUPPORT_CATEGORIES: HelpSupportProblemCategory[] = [
  { id: "payment", label: "Payment & Wallet", icon: "wallet-outline" },
  { id: "trip", label: "Trip & Delivery Issue", icon: "bus-outline" },
  { id: "pickup", label: "Farm Pickup Discrepancy", icon: "cube-outline" },
  { id: "account", label: "Account & Verification", icon: "shield-checkmark-outline" },
  { id: "technical", label: "App Bug / Technical", icon: "bug-outline" },
  { id: "other", label: "Other Inquiry", icon: "help-circle-outline" },
];

export const HELP_SUPPORT_FORM = {
  cardTitle: "Send Your Problem to Admins",
  cardSubtitle:
    "Describe what went wrong. You can also attach an optional screenshot or photo evidence.",
  categoryLabel: "Select Problem Topic *",
  relatedJobLabel: "Related Transport Job (optional)",
  relatedJobPlaceholder: "e.g. #GH-T1024 (leave blank if general)",
  subjectLabel: "Subject / Summary *",
  subjectPlaceholder: "e.g., Payment delayed for Job #1024 or Incorrect weight",
  messageLabel: "Message Description *",
  messagePlaceholder:
    "Please write the details of your problem here. Include any timestamps, location, or issue details...",
  submitButton: "Send Message to Admin",
  submittingButton: "Sending to Admin...",
};

export const HELP_SUPPORT_PHOTO = {
  sectionTitle: "Upload Image Evidence (Optional)",
  optionalBadge: "Optional",
  attachedBadge: "Image Attached",
  removeButton: "Remove",
  tapToEnlarge: "Tap to enlarge",
  changePhotoButton: "Change / Retake Image",
  uploadBoxTitle: "Add Screenshot or Photo",
  uploadBoxSubtitle: "Optional · JPG or PNG up to 10MB",
};

export const HELP_SUPPORT_MODAL = {
  modalTitle: "Add Photo / Screenshot",
  modalSubtitle: "Optional image attachment for your problem",
  optionCamera: {
    title: "Take Photo with Camera",
    description: "Snap a picture of the issue on site",
    icon: "camera" as const,
  },
  optionGallery: {
    title: "Choose from Gallery",
    description: "Select a saved screenshot or photo",
    icon: "images" as const,
  },
  optionSample: {
    title: "Use Sample Issue Photo",
    description: "Quick demo attachment for simulator",
    icon: "document-attach" as const,
  },
  cancelButton: "Cancel",
};

export const HELP_SUPPORT_PREVIEW = {
  title: "Attached Photo Evidence",
  closeButton: "Close Preview",
  proofBadge: "Proof",
};

export const HELP_SUPPORT_HISTORY = {
  statusResolved: "Resolved",
  statusInReview: "In Review",
  statusPending: "Pending",
  adminResponseLabel: "Admin Response:",
  submittedPrefix: "Submitted: ",
  emptyMessage: "No inquiries submitted yet. If you face any issues, send a message above.",
};

export const HELP_SUPPORT_CONTACT = {
  cardTitle: "Your Registered Contact",
  fallbackName: "Nimal Bandara",
  fallbackPhone: "+94 77 123 4567",
};

export const HELP_SUPPORT_ALERTS = {
  cameraPermission: {
    title: "Camera Permission Required",
    message: "Please grant camera access to take a photo of the issue.",
  },
  cameraError: {
    title: "Camera Error",
    message: "Could not open camera on this device.",
  },
  galleryPermission: {
    title: "Gallery Permission Required",
    message: "Please allow photo library access to attach screenshots or photos.",
  },
  galleryError: {
    title: "Gallery Error",
    message: "Could not open photo library.",
  },
  missingSubject: {
    title: "Subject Required",
    message: "Please provide a brief subject or title for your problem.",
  },
  missingMessage: {
    title: "Message Details Required",
    message:
      "Please describe your problem or issue in detail so our admin team can assist you.",
  },
  submitSuccess: {
    title: "Message Sent to Admins!",
    message: (ticketId: string) =>
      `Your support request ${ticketId} has been successfully submitted. An administrator will review your message and reach out to you within 15–30 minutes.`,
    buttonText: "View Inquiry History",
  },
  submitFailure: {
    title: "Submission Failed",
    message:
      "Could not send your support inquiry to the server. Please check your network connection and try again.",
    buttonText: "OK",
  },
  loadFailure: {
    title: "Could Not Load Inquiries",
    message: "Unable to retrieve your past support inquiries from the server.",
    buttonText: "OK",
  },
};

export const HELP_SUPPORT_LOADING = {
  message: "Loading support inquiries...",
};

export const HELP_SUPPORT_NAV_TABS = {
  home: "Home",
  jobs: "Jobs",
  active: "Active",
  profile: "Profile",
};

