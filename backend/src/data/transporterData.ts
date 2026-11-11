/**
 * Transporter Module Default & Fallback Data
 * Extracted from controllers and middleware to prevent hardcoding.
 */

export const DEFAULT_TRANSPORTER_ID = 7;

export const DEFAULT_DEV_USER = {
  id: DEFAULT_TRANSPORTER_ID,
  role: 'transporter',
  email: 'ruwan@transport.lk',
  name: 'Nimal Bandara',
};

export const DEFAULT_TRANSPORTER_PROFILE = {
  vehicleType: 'Lorry - 3 Ton',
  vehiclePlate: 'WP-LH-4821',
  rating: 4.8,
  onTimeRate: '98%',
  baseLocation: 'Colombo',
};

export const VEHICLE_TYPE_PRESETS: string[] = [
  'Lorry - 3 Ton',
  'Mini Lorry - 1.5 Ton',
  'Pickup Truck',
  'Van - 1 Ton',
  'Refrigerated Truck',
  'Heavy Lorry - 5 Ton',
];

export const PROFILE_VALIDATION_MESSAGES = {
  missingName: 'Full name is required',
  invalidPhone: 'Valid contact phone number is required (min 9 digits)',
  invalidEmail: 'Valid email address is required',
  missingVehicleType: 'Vehicle type is required',
  missingVehiclePlate: 'Vehicle license plate is required',
};

export const BANK_DETAILS_MESSAGES = {
  notFound: 'Transporter not found',
  fetchSuccess: 'Bank account details retrieved successfully',
  fetchFailed: 'Failed to fetch bank account details',
  updateSuccess: 'Bank details saved successfully',
  updateFailed: 'Failed to update bank details',
  validationError: 'Account holder name, bank name, branch name, and account number are required',
  invalidAccountNumber: 'Please enter a valid bank account number (at least 6 digits)',
};

export const DEFAULT_BANK_DETAILS = {
  accountHolderName: 'Nimal Bandara',
  bankName: 'Commercial Bank of Ceylon',
  branchName: 'Colombo Fort Branch',
  branchCode: '016',
  accountNumber: '8204918234',
  accountType: 'Savings',
  isVerified: true,
  verificationStatus: 'Verified',
  payoutMethod: 'Direct Bank Transfer (LANKAQR / SLIPS)',
  notes: 'Primary account for Green-Hive trip payouts and toll reimbursements.',
};

export const POPULAR_SRI_LANKAN_BANKS = [
  'Commercial Bank of Ceylon',
  'Bank of Ceylon (BOC)',
  'People\'s Bank',
  'Hatton National Bank (HNB)',
  'Sampath Bank',
  'National Development Bank (NDB)',
  'DFCC Bank',
  'Seylan Bank',
  'Nations Trust Bank (NTB)',
  'Amana Bank',
];

export const BANK_ACCOUNT_TYPES = ['Savings', 'Current'];

export const DEFAULT_NOTIFICATION_SETTINGS = {
  newJobsPush: true,
  currentJobUpdatesPush: true,
  offerStatusPush: true,
  paymentPush: true,
  soundAndVibration: true,
};

export const DEFAULT_JOB_METADATA = {
  farmerRating: '4.8 ⭐',
  activeFarmerRating: '4.9 ⭐',
  urgent: false,
  featured: false,
  tags: ['Direct Farmer', 'Express Delivery'],
  defaultEta: 'Today • 02:30 PM',
  defaultCropName: 'Agricultural Produce',
  defaultWeight: 'Standard Load',
  defaultFarmerName: 'Farmer',
  defaultFarmerPhone: '+94 77 000 0000',
  defaultSellerName: 'Green Hive Buyer',
  defaultScheduledDate: 'Tomorrow • 07:00 AM',
};

export const DEFAULT_STAT_FALLBACKS = {
  openJobsCount: 0,
  myOffersCount: 2,
  activeJobsCount: 0,
  completedJobsCount: 0,
  pendingRelease: 0,
  thisMonth: 0,
};

export const DEFAULT_SUPPORT_CONTACT = {
  hotline: '1920',
  email: 'support@greenhive.lk',
  message: 'For carrier support, contact our 24/7 hotline at 1920 or email support@greenhive.lk',
};

export const OFFER_MESSAGES = {
  notFound: 'Transport offer not found or not owned by you',
  withdrawSuccess: 'Transport offer withdrawn successfully',
  cannotWithdrawAccepted: 'Cannot withdraw an offer that has already been accepted',
  submitSuccess: 'Transport offer submitted successfully to farmer',
  duplicateActiveOffer: 'You have already submitted an active offer for this job',
  jobNotOpen: 'Job is no longer open for offers',
  jobNotFound: 'Transport job not found',
  missingQuotePrice: 'Quote price is required',
  invalidQuotePrice: 'Valid positive quote price is required',
};

export const DEFAULT_OFFER_CONSTANTS = {
  defaultTitle: 'Transportation Offer',
  defaultDeliveryWindow: 'Standard Delivery Window',
  defaultOfferNote: 'I have vehicle ready for safe agricultural transit.',
};

export const OFFER_SUBMITTED_CONSTANTS = {
  defaultStatusLabel: 'Offer Status: Under Review',
  defaultStatusDescription: 'You will be notified when the seller makes a decision',
  successTitle: 'Offer Submitted!',
  successDescription: 'The seller will review your offer and notify you of their decision.',
  noOfferFound: 'No submitted offer found for this job',
};

export const CONFIRM_PICKUP_MESSAGES = {
  success: 'Cargo pickup successfully confirmed. Job status updated to In Transit.',
  jobNotFound: 'Transport job not found or not assigned to you',
  invalidStatus: 'Cannot confirm pickup: Job is already delivered or cancelled',
  alreadyInTransit: 'Pickup has already been confirmed for this job',
  failedUpdate: 'Failed to confirm cargo pickup',
};

export const DEFAULT_PICKUP_CONSTANTS = {
  defaultNotes: 'Cargo loaded in good condition.',
  defaultStatus: 'In Transit',
};

export const CONFIRM_DELIVERY_MESSAGES = {
  success: 'Cargo delivery successfully confirmed. Payment has been released.',
  jobNotFound: 'Transport job not found or not assigned to you',
  invalidStatus: 'Cannot confirm delivery: Job is already delivered or cancelled',
  alreadyDelivered: 'This transport job is already marked as delivered',
  failedUpdate: 'Failed to confirm cargo delivery',
};

export const DEFAULT_DELIVERY_CONSTANTS = {
  defaultReceiver: 'Destination Receiving Manager',
  defaultNotes: 'Cargo delivered and inspected in satisfactory condition.',
  defaultStatus: 'Delivered',
};

export const SUPPORT_MESSAGES = {
  fetchSuccess: 'Support tickets fetched successfully',
  submitSuccess: 'Support inquiry submitted successfully. Admins will review your message shortly.',
  missingSubject: 'Subject / summary is required',
  missingMessage: 'Message description is required',
  ticketNotFound: 'Support ticket not found',
  failedSubmit: 'Failed to submit support inquiry',
  failedFetch: 'Failed to fetch support tickets',
};

export const DEFAULT_SUPPORT_CATEGORIES = [
  { id: 'payment', label: 'Payment & Wallet' },
  { id: 'trip', label: 'Trip & Delivery Issue' },
  { id: 'pickup', label: 'Farm Pickup Discrepancy' },
  { id: 'account', label: 'Account & Verification' },
  { id: 'technical', label: 'App Bug / Technical' },
  { id: 'other', label: 'Other Inquiry' },
];

export const DEFAULT_SUPPORT_TICKETS = [
  {
    ticketCode: '#SUP-8104',
    category: 'Payment & Wallet',
    subject: 'Highway toll charge reimbursement for Colombo trip',
    message: 'Expressway toll of Rs. 400 was incurred during transit from Nuwara Eliya. Receipt attached.',
    status: 'Resolved',
    adminReply: 'Toll fee of Rs. 400 has been credited to your transporter wallet. Thank you!',
    timeAgo: 'Oct 28, 2026 · 11:20 AM',
  },
  {
    ticketCode: '#SUP-7942',
    category: 'Trip & Delivery Issue',
    subject: 'Receiver delayed gate entry at Colombo Fresh Market',
    message: 'Wait time exceeded 45 minutes due to receiving bay congestion.',
    status: 'In Review',
    adminReply: 'Our logistics officer contacted Colombo wholesale receiving bay #3. Delay logged.',
    timeAgo: 'Oct 25, 2026 · 02:40 PM',
  },
];

export const VEHICLE_LICENSE_MESSAGES = {
  fetchSuccess: 'Vehicle and driver license details fetched successfully',
  updateSuccess: 'Vehicle specifications and driving license information updated successfully',
  documentUploadSuccess: 'Document updated and submitted for fleet safety verification',
  missingRequiredSpecs: 'Vehicle license number, vehicle plate, and vehicle type are required',
  invalidTarget: 'Invalid document target. Must be licenseFront, licenseBack, or vehicle',
  missingDocumentPhoto: 'Document photo URI or URL is required',
  transporterNotFound: 'Transporter profile not found',
  failedUpdate: 'Failed to update vehicle and license details',
  failedFetch: 'Failed to fetch vehicle and license details',
  failedDocUpload: 'Failed to upload document photo',
};

export const DEFAULT_VEHICLE_LICENSE = {
  driverName: 'Nimal Bandara',
  licenseNumber: 'B3849201',
  licenseExpiry: '14/03/2028',
  licenseIssueDate: '15/03/2018',
  licenseCategories: ['B (Dual Purpose)', 'C1 (Light Lorry)', 'C (Heavy Lorry 3T+)'],
  nicNumber: '198923401234',
  bloodGroup: 'O+',
  licenseFrontPhotoUri: 'https://images.unsplash.com/photo-1589330694653-dad6d3240a2b?auto=format&fit=crop&w=800&q=80',
  licenseBackPhotoUri: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80',
  licenseStatus: 'Verified',

  vehicleType: 'Lorry - 3 Ton',
  vehiclePlate: 'WP-LH-4821',
  vehicleMakeModel: 'Isuzu Elf NPR 71',
  vehicleYear: '2020',
  vehicleColor: 'Polar White',
  maxCapacityKg: 3000,
  cargoDimensions: '14.5 ft × 6.2 ft × 6.0 ft',
  fuelType: 'Diesel',
  refrigerated: false,
  vehiclePhotoUri: 'https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&w=800&q=80',

  revenueLicenseNo: 'RL-2025-98321',
  revenueLicenseExpiry: '30/11/2026',
  insuranceProvider: 'Sri Lanka Insurance Corporation (SLIC)',
  insurancePolicyNo: 'SLIC-CV-783921',
  insuranceExpiry: '15/01/2027',
  emissionCertificateStatus: 'Passed',
  emissionCertificateExpiry: '24/10/2026',
  verificationDate: '12 Jan 2026',
  verificationStatus: 'Verified',
};

export const TRANSPORTER_CONTROLLER_MESSAGES = {
  transporterNotFound: 'Transporter profile not found',
  failedFetchHome: 'Failed to fetch home screen data',
  failedUpdateJobStatus: 'Failed to update transport job status',
  failedFetchAvailableJobs: 'Failed to fetch available transport jobs',
  jobNotFound: 'Transport job not found',
  failedFetchJobDetails: 'Failed to fetch job details',
  failedSubmitOffer: 'Failed to submit transport offer',
  failedFetchOffers: 'Failed to fetch transport offers',
  failedWithdrawOffer: 'Failed to withdraw transport offer',
  failedFetchLatestOffer: 'Failed to fetch latest transport offer',
  noActiveTrip: 'No active transport trip in progress',
  failedFetchActiveJob: 'Failed to fetch active job',
  failedFetchProfile: 'Failed to fetch transporter profile',
  profileUpdateSuccess: 'Profile updated successfully',
  failedUpdateProfile: 'Failed to update transporter profile',
  avatarUrlRequired: 'Valid avatar URL is required',
  avatarUpdateSuccess: 'Avatar updated successfully',
  failedUpdateAvatar: 'Failed to update avatar photo',
  avatarRemovedSuccess: 'Avatar photo removed successfully',
  failedRemoveAvatar: 'Failed to remove avatar photo',
  failedFetchNotifications: 'Failed to fetch notifications',
  notificationNotFound: 'Notification not found or unauthorized',
  notificationMarkedRead: 'Notification marked as read',
  failedUpdateNotification: 'Failed to update notification',
  allNotificationsMarkedRead: 'All notifications marked as read',
  failedMarkAllNotificationsRead: 'Failed to mark notifications as read',
  failedFetchNotificationSettings: 'Failed to fetch notification settings',
  notificationSettingsUpdateSuccess: 'Notification preferences updated successfully',
  failedUpdateNotificationSettings: 'Failed to update notification settings',
};



