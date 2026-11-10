/**
 * Transporter Profile Screen Data & UI Copy Constants
 * Centralizes header text, hero labels, contact & vehicle fields, settings menu,
 * photo modal copy, and alert dialogs.
 */

export const PROFILE_HEADER = {
  title: "My Profile",
};

export const PROFILE_HERO = {
  jobsCompletedSubtitle: (count: number) => `${count} jobs completed`,
  statJobsLabel: "Jobs",
  statEarnedLabel: "Earned",
  statOnTimeLabel: "On Time",
};

export const PROFILE_CONTACT_SECTION = {
  sectionTitle: "Contact & Vehicle",
  phoneLabel: "Phone",
  emailLabel: "Email",
  baseLocationLabel: "Base Location",
  vehicleLabel: "Vehicle",
};

export const PROFILE_SETTINGS_MENU = {
  editProfile: "Edit Profile",
  bankDetails: "Bank Details",
  vehicleLicense: "Vehicle & License",
  notificationSettings: "Notification Settings",
  helpSupport: "Help & Support",
  darkMode: "Dark Mode",
  signOutButton: "Sign Out",
};

export const PROFILE_ALERTS = {
  signOut: {
    title: "Sign Out?",
    message: "Are you sure you want to sign out of your transporter account? You will return to the welcome screen.",
    primaryButtonText: "Sign Out",
    secondaryButtonText: "Cancel",
  },
  cameraPermission: {
    title: "Camera Permission Required",
    message: "GreenHive needs camera access to capture a picture for your profile. Please enable camera permission in your phone settings.",
  },
  cameraError: {
    title: "Camera Error",
    message: "Could not launch the camera. Please check your device settings and try again.",
  },
  galleryPermission: {
    title: "Gallery Permission Required",
    message: "GreenHive needs photo library access to select a profile picture. Please enable gallery access in your device settings.",
  },
  galleryError: {
    title: "Gallery Error",
    message: "Could not access photo library. Please check your permissions and try again.",
  },
  removeAvatarConfirm: {
    title: "Remove Profile Picture",
    message: "Are you sure you want to remove your profile picture and restore the default initial letter?",
    primaryButtonText: "Remove",
    secondaryButtonText: "Cancel",
  },
  avatarSuccess: {
    title: "Profile Picture Updated",
    message: "Your new profile picture has been successfully uploaded and set!",
    buttonText: "Great!",
  },
  avatarRemovedSuccess: {
    title: "Picture Removed",
    message: "Your profile picture has been reset to default.",
    buttonText: "Done",
  },
  vehicleLicenseDialog: (type: string, plate: string) => ({
    title: "Vehicle & License",
    message: `Vehicle: ${type}\nPlate: ${plate}\nDriver License: Verified`,
  }),
};

export const PROFILE_PHOTO_SOURCE_MODAL = {
  title: "Profile Photo",
  subtitle: "Choose an option to update your photo",
  useCameraTitle: "Use Camera",
  useCameraSubtitle: "Open camera to capture a picture",
  chooseGalleryTitle: "Choose from Gallery",
  chooseGallerySubtitle: "Select a picture from your device library",
  removePhotoTitle: "Remove Current Photo",
  removePhotoSubtitle: "Revert back to default initial letter",
  cancelButton: "Cancel",
};

export const PROFILE_PHOTO_PREVIEW_MODAL = {
  title: "Preview Profile Picture",
  subtitle: "Check how your photo looks before uploading it as your profile picture",
  badgeText: "Looking sharp!",
  uploadButton: "Upload as Profile Picture",
  selectAgainButton: "Retake or Choose Again",
  cancelButton: "Cancel",
};

export const PROFILE_NAV_TABS = {
  home: "Home",
  jobs: "Jobs",
  active: "Active",
  profile: "Profile",
};
