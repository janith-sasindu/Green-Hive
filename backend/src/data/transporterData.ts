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

export const DEFAULT_BANK_DETAILS = {
  accountHolderName: 'Transporter',
  bankName: 'Commercial Bank of Ceylon',
  branchName: 'Colombo Main Branch',
  branchCode: '014',
  accountNumber: '8004529104',
  accountType: 'Savings Account',
  isVerified: true,
};

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
