/**
 * Transporter Vehicle & License Screen Data & Text Constants
 * Centralizes all UI copy, field labels, placeholders, card sections,
 * modal texts, and alerts to eliminate hardcoding from TransporterVehicleLicenseScreen.
 */

export const VEHICLE_LICENSE_HEADER = {
  title: "Vehicle & License",
  subtitle: "Official Registered Documents",
  editButton: "Edit",
  backAccessibilityLabel: "Go back to profile",
};

export const VEHICLE_LICENSE_BANNER = {
  title: "Carrier Documents Verified",
  agencySubtitle: (date: string) => `Verified on ${date} · Green-Hive Fleet Safety`,
  activeBadge: "Active",
};

export const VEHICLE_LICENSE_FILTERS = {
  all: "All Details",
  license: "Driver License",
  vehicle: "Vehicle Specs",
};

export const VEHICLE_LICENSE_LICENSE_SECTION = {
  sectionTitle: "Sri Lanka Driving Licence",
  cardTitle: "DEMOCRATIC SOCIALIST REPUBLIC OF SRI LANKA",
  cardSubtitle: "DRIVING LICENCE · NATIONAL TRANSPORT MEDICAL INSTITUTE",
  labelLicenseNo: "Licence No / අංකය",
  labelDriverName: "Name / නම",
  labelNic: "NIC No / ජා.හැ.අංකය",
  labelBloodGroup: "Blood Group / රුධිර ගණය",
  labelExpiry: "Valid Until / අවලංගු දිනය",
  labelIssueDate: "Date of Issue / නිකුත් කල දිනය",
  labelCategories: "Vehicle Classes / වාහන පන්ති",
  photosHeader: "Attached Licence Card Images",
  frontCardTitle: "Licence Card Front",
  backCardTitle: "Licence Card Back",
  uploadButton: "Upload",
  retakeButton: "Retake",
  tapToEnlarge: "Tap to enlarge",
};

export const VEHICLE_LICENSE_VEHICLE_SECTION = {
  sectionTitle: "Registered Transport Vehicle",
  badgeTitle: "Fleet Vehicle",
  labelVehicleType: "Vehicle Category",
  labelVehiclePlate: "Registration Plate No.",
  labelMakeModel: "Make & Model",
  labelVehicleYear: "Manufacturing Year",
  labelVehicleColor: "Color",
  labelMaxCapacity: "Payload Capacity",
  labelCargoDimensions: "Cargo Bed Dimensions",
  labelFuelType: "Fuel Type",
  labelRefrigerated: "Refrigerated / Cold Storage",
  refrigeratedYes: "Yes (Insulated Reefer)",
  refrigeratedNo: "No (Standard Open / Canopy)",
  photoCardTitle: "Vehicle Photo Evidence",
  photoUploadButton: "Upload Vehicle Photo",
  photoRetakeButton: "Change Vehicle Photo",
};

export const VEHICLE_LICENSE_PERMITS_SECTION = {
  sectionTitle: "Legal & Regulatory Compliance",
  badgeTitle: "Government Approvals",
  revenueLicenseTitle: "Revenue Licence (Vehicle Tax)",
  revenueLicenseNoLabel: "Licence No:",
  revenueLicenseExpiryLabel: "Valid Until:",
  insuranceTitle: "Commercial Vehicle Insurance",
  insuranceProviderLabel: "Insurer:",
  insurancePolicyLabel: "Policy No:",
  insuranceExpiryLabel: "Expires On:",
  emissionTestTitle: "DriveGreen Emission Certificate",
  emissionStatusLabel: "Test Result:",
  emissionExpiryLabel: "Valid Until:",
};

export const VEHICLE_LICENSE_EDIT_MODAL = {
  title: "Edit Vehicle & Licence Data",
  subtitle: "Update your vehicle specifications or licence numbers below",
  licenseNoLabel: "Driver Licence Number *",
  licenseNoPlaceholder: "e.g. B3849201",
  licenseExpiryLabel: "Licence Expiry Date",
  licenseExpiryPlaceholder: "DD/MM/YYYY",
  vehiclePlateLabel: "Vehicle Plate Number *",
  vehiclePlatePlaceholder: "e.g. WP-LH-4821",
  vehicleTypeLabel: "Vehicle Type / Class *",
  vehicleTypePresetsPrompt: "Or choose preset:",
  makeModelLabel: "Make & Model",
  makeModelPlaceholder: "e.g. Isuzu Elf NPR 71",
  capacityLabel: "Max Payload Capacity (Kg)",
  capacityPlaceholder: "e.g. 3000",
  cancelButton: "Cancel",
  saveButton: "Save Updates",
  savingButton: "Saving Changes...",
};

export const VEHICLE_LICENSE_PHOTO_MODAL = {
  title: "Upload Document Photo",
  subtitle: "Select a photo source to update document evidence",
  optionCamera: {
    title: "Take Photo with Camera",
    description: "Capture original document or vehicle photo",
    icon: "camera" as const,
  },
  optionGallery: {
    title: "Choose from Gallery",
    description: "Select existing document photo or scan",
    icon: "images" as const,
  },
  cancelButton: "Cancel",
};

export const VEHICLE_LICENSE_PREVIEW_MODAL = {
  closeButton: "Close Preview",
};

export const VEHICLE_LICENSE_NAV_TABS = {
  home: "Home",
  jobs: "Jobs",
  active: "Active",
  profile: "Profile",
};

export const VEHICLE_LICENSE_ALERTS = {
  cameraPermission: {
    title: "Camera Permission Required",
    message: "Please grant camera access to photograph your license or vehicle document.",
  },
  cameraError: {
    title: "Camera Error",
    message: "Could not open camera on this device.",
  },
  galleryPermission: {
    title: "Gallery Permission Required",
    message: "Please allow photo library access to upload documents.",
  },
  galleryError: {
    title: "Gallery Error",
    message: "Could not open photo library.",
  },
  documentUploaded: {
    title: "Document Uploaded",
    message: "Your document has been updated and sent to verification.",
  },
  documentUploadError: {
    title: "Upload Failed",
    message: "Could not upload document photo to the server. Please try again.",
  },
  missingInfo: {
    title: "Missing Information",
    message: "Vehicle Plate Number, Vehicle Type, and Driving License Number are required.",
  },
  detailsUpdated: {
    title: "Details Updated!",
    message: "Your vehicle specifications and driving license information have been successfully updated.",
  },
  updateError: {
    title: "Update Failed",
    message: "Could not update vehicle and license details on the server. Please try again.",
  },
  loadError: {
    title: "Could Not Load Details",
    message: "Unable to retrieve vehicle and license details from the server.",
  },
};

export const VEHICLE_LICENSE_LOADING = {
  message: "Loading vehicle and licence records...",
};

