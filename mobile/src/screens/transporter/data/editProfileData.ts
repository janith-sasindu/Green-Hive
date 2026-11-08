/**
 * Edit Profile Screen Data & UI Content
 * Cleanly separated constants, validation alerts, placeholders, and static copy.
 */

export const EDIT_PROFILE_MESSAGES = {
  validation: {
    missingName: {
      title: "Missing Name",
      message: "Please enter your full driver name.",
    },
    invalidPhone: {
      title: "Invalid Phone Number",
      message: "Please enter a valid contact phone number.",
    },
    invalidEmail: {
      title: "Invalid Email",
      message: "Please enter a valid email address.",
    },
    missingVehicle: {
      title: "Missing Vehicle Type",
      message: "Please specify your vehicle type.",
    },
    missingPlate: {
      title: "Missing License Plate",
      message: "Please enter your vehicle license plate number.",
    },
  },
  permissions: {
    cameraRequired: {
      title: "Camera Permission Required",
      message:
        "GreenHive needs camera access to capture a picture for your profile. Please enable camera permission in your phone settings.",
    },
    cameraError: {
      title: "Camera Error",
      message:
        "Could not launch camera. Please check your device settings and try again.",
    },
    galleryRequired: {
      title: "Gallery Permission Required",
      message:
        "GreenHive needs photo library access to select a profile picture. Please enable gallery access in your device settings.",
    },
    galleryError: {
      title: "Gallery Error",
      message:
        "Could not open photo library. Please check your permissions and try again.",
    },
  },
  photo: {
    removeConfirm: {
      title: "Remove Photo",
      message:
        "Are you sure you want to remove your profile photo and restore the initial letter?",
      removeButton: "Remove",
      cancelButton: "Cancel",
    },
  },
  api: {
    saveSuccess: {
      title: "Profile Updated!",
      message:
        "Your contact details, vehicle information, and profile picture have been updated successfully.",
      doneButton: "Done",
    },
    saveError: {
      title: "Update Failed",
      message: "Failed to update profile. Please check your network and try again.",
    },
    loadError: {
      title: "Failed to Load Profile",
      message:
        "Could not fetch your profile details from the server. Loaded offline data.",
    },
  },
};

export const EDIT_PROFILE_PLACEHOLDERS = {
  name: "Enter your name",
  phone: "+94 7X XXX XXXX",
  email: "driver@transport.lk",
  baseLocation: "e.g. Colombo, Kandy, Dambulla",
  vehicleType: "e.g. Lorry - 3 Ton",
  vehiclePlate: "e.g. WP-LH-4821",
};

export const EDIT_PROFILE_TEXTS = {
  headerTitle: "Edit Profile",
  headerSubtitle: "Update your contact & vehicle details",
  saveHeaderButton: "Save",
  savingHeaderButton: "Saving...",
  changePhoto: "Change Profile Picture",
  personalSectionTitle: "Personal & Contact Details",
  fullNameLabel: "Full Name",
  phoneLabel: "Phone Number",
  emailLabel: "Email Address",
  baseLocationLabel: "Base Location",
  vehicleSectionTitle: "Vehicle Details",
  vehicleSectionSubtitle:
    "Displayed on your driver profile and transport offers",
  vehicleTypeLabel: "Vehicle Type / Capacity",
  vehiclePlateLabel: "Vehicle Registration Plate Number",
  submitButton: "Save Profile Changes",
  submittingButton: "Saving Changes...",
  cancelButton: "Cancel",
  photoModalTitle: "Update Photo",
  photoModalSubtitle: "Capture or choose a new profile picture",
  useCameraTitle: "Use Camera",
  useCameraSubtitle: "Open camera to capture a picture",
  chooseGalleryTitle: "Choose from Gallery",
  chooseGallerySubtitle: "Select a picture from your device library",
  removePhotoTitle: "Remove Current Photo",
  removePhotoSubtitle: "Revert back to default initial letter",
  previewTitle: "Preview Picture",
  previewSubtitle: "Review your photo before setting it on your profile",
  previewTag: "Looking sharp!",
  confirmPreviewButton: "Use as Profile Picture",
  retakePreviewButton: "Retake or Choose Again",
  loadingProfileText: "Loading profile data...",
};

