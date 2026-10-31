/**
 * Mock Data for Transporter Module
 * Cleanly separated and organized to avoid hardcoding inside UI components.
 */

export interface TransporterProfile {
    name: string;
    greeting: string;
    avatarLetter: string;
    avatarUri?: string;
    email: string;
    phone: string;
    vehicleType: string;
    vehiclePlate: string;
    baseLocation?: string;
    isVerified: boolean;
    rating: number;
    completedJobs: number;
    totalEarnings?: string;
    onTimeDeliveryRate?: string;
}

export interface TransporterStats {
    openJobsCount: number;
    myOffersCount: number;
    activeJobsCount: number;
    thisMonthEarnings: string;
}

export interface ActiveTransportJob {
    id: string;
    cropName: string;
    weight: string;
    status: "In Progress" | "At Pickup" | "In Transit" | "Delivered";
    pickup: string;
    dropoff: string;
    distance: string;
    price: string;
    farmerName: string;
    farmerPhone: string;
    pickupDate: string;
    sellerName?: string;
    specialInstructions?: string;
    proofPhotoUri?: string;
    pickupTimestamp?: string;
    pickupNotes?: string;
    deliveryProofPhotoUri?: string;
    deliveryTimestamp?: string;
    deliveryNotes?: string;
    receiverName?: string;
}

export interface AvailableTransportJob {
    id: string;
    cropName: string;
    weight: string;
    status: "Open" | "Assigned";
    pickup: string;
    pickupLocationDetail?: string;
    dropoff: string;
    dropoffLocationDetail?: string;
    pickupDate?: string;
    pickupRequiredTime?: string;
    pickupTime: string;
    price: string;
    distance?: string;
    farmerName?: string;
    farmerPhone?: string;
    sellerName?: string;
    specialInstructions?: string;
}

export interface TransportOffer {
    id: string;
    cropName: string;
    weight: string;
    route?: string;
    quotePrice: string;
    status: "Submitted" | "Accepted" | "Under Review" | "Declined" | "Pending Farmer Approval" | string;
    title?: string;
    estimatedDelivery?: string;
    notes?: string;
    submittedDate?: string;
    sellerName?: string;
    pickupLocation?: string;
    dropoffLocation?: string;
    distance?: string;
}

export interface PaymentSummaryData {
    pendingRelease: string;
    thisMonth: string;
}

export interface TransporterNotificationItem {
    id: string;
    title: string;
    message: string;
    type: "pickup" | "request" | "payment" | "assignment";
    timestamp?: string;
    isRead?: boolean;
    iconEmoji?: string;
    jobId?: string;
}

/**
 * Logged-in Transporter Profile
 */
export const MOCK_TRANSPORTER_PROFILE: TransporterProfile = {
    name: "Ruwan Bandara",
    greeting: "Good morning,",
    avatarLetter: "R",
    email: "ruwan@transport.lk",
    phone: "+94 76 345 6789",
    vehicleType: "Lorry - 3 Ton",
    vehiclePlate: "WP-LH-4821",
    baseLocation: "Colombo",
    isVerified: true,
    rating: 4.8,
    completedJobs: 47,
    totalEarnings: "Rs. 320k",
    onTimeDeliveryRate: "98%",
};

/**
 * Transporter Dashboard 2x2 Metric Statistics
 */
export const MOCK_TRANSPORTER_STATS: TransporterStats = {
    openJobsCount: 2,
    myOffersCount: 3,
    activeJobsCount: 1,
    thisMonthEarnings: "Rs. 42k",
};

/**
 * Current Active Job in Transit
 */
export const MOCK_ACTIVE_JOB: ActiveTransportJob = {
    id: "#GH-T1024",
    cropName: "Fresh Cabbage",
    weight: "100 kg",
    status: "In Progress",
    pickup: "Nuwara Eliya Farm, Hanguranketha Road",
    dropoff: "Colombo Fresh Market, Colombo 07",
    distance: "142 km",
    price: "Rs. 1,500",
    farmerName: "Sunil Perera",
    farmerPhone: "+94 77 123 4567",
    pickupDate: "Today, 06:30 AM",
    sellerName: "Colombo Fresh Market",
    specialInstructions: "Handle with care. Keep cool. Arrive by 8 AM for market opening.",
};

/**
 * Available Jobs Open for Transporter Bids
 */
export const MOCK_AVAILABLE_JOBS: AvailableTransportJob[] = [
    {
        id: "#GH-T1025",
        cropName: "Ripe Tomatoes",
        weight: "150 kg",
        pickup: "Dambulla Agricultural Zone, Plot 14",
        pickupLocationDetail: "Dambulla Agricultural Zone, Plot 14",
        dropoff: "Colombo Fresh Market, Colombo 03",
        dropoffLocationDetail: "Colombo Fresh Market, Colombo 03",
        pickupTime: "2026-08-31 · 06:00 AM",
        pickupDate: "2026-08-31",
        pickupRequiredTime: "06:00 AM",
        status: "Open",
        price: "Rs. 15,500",
        distance: "148 km",
        farmerName: "Kamal Jayasinghe",
        farmerPhone: "+94 77 234 5678",
        sellerName: "Colombo Fresh Market",
        specialInstructions: "Fragile. Use padded transport. Early morning delivery required.",
    },
    {
        id: "#GH-T1020",
        cropName: "Organic Carrots",
        weight: "200 kg",
        pickup: "Nuwara Eliya Highlands Farm, Section 4",
        pickupLocationDetail: "Nuwara Eliya Highlands Farm, Section 4",
        dropoff: "Kandy Supermart, Peradeniya Road",
        dropoffLocationDetail: "Kandy Supermart, Peradeniya Road",
        pickupTime: "2026-08-29 · 07:00 AM",
        pickupDate: "2026-08-29",
        pickupRequiredTime: "07:00 AM",
        status: "Open",
        price: "Rs. 14,000",
        distance: "78 km",
        farmerName: "Wasantha Kumara",
        farmerPhone: "+94 71 876 5432",
        sellerName: "Kandy Supermart",
        specialInstructions: "Keep refrigerated. Handle with care during mountain transit.",
    },
];

/**
 * Transporter's Submitted Bids / Offers
 */
export const MOCK_MY_OFFERS: TransportOffer[] = [
    {
        id: "Job #GH-T1025",
        title: "Transportation Offer",
        cropName: "Ripe Tomatoes",
        weight: "150 kg",
        route: "Dambulla Agricultural Zone → Colombo Fresh Market",
        quotePrice: "Rs. 2,000",
        estimatedDelivery: "2026-08-31 08:00 AM",
        notes: "I have refrigerated vehicle available. On-time delivery guaranteed.",
        submittedDate: "2026-08-28",
        status: "Submitted",
        sellerName: "Colombo Fresh Market",
        pickupLocation: "Dambulla Agricultural Zone, Plot 14",
        dropoffLocation: "Colombo Fresh Market, Colombo 03",
        distance: "148 km",
    },
    {
        id: "Job #GH-T1019",
        title: "Transportation Offer",
        cropName: "Red Potatoes",
        weight: "500 kg",
        route: "Nuwara Eliya → Colombo Wholesale Market",
        quotePrice: "Rs. 22,000",
        estimatedDelivery: "2026-09-02 10:00 AM",
        notes: "Heavy duty 3-ton lorry ready for farm gate pickup with waterproof tarpaulin.",
        submittedDate: "2026-08-27",
        status: "Submitted",
        sellerName: "Nuwara Eliya Wholesale Hub",
        pickupLocation: "Nuwara Eliya Highlands Farm",
        dropoffLocation: "Colombo Wholesale Market",
        distance: "165 km",
    },
    {
        id: "Job #GH-T1016",
        title: "Transportation Offer",
        cropName: "Sweet Corn",
        weight: "300 kg",
        route: "Anuradhapura → Kurunegala Town",
        quotePrice: "Rs. 19,500",
        estimatedDelivery: "2026-08-30 02:00 PM",
        notes: "Insulated transport with temperature tracking. Delivery on schedule.",
        submittedDate: "2026-08-25",
        status: "Accepted",
        sellerName: "Kurunegala Fresh Veggie Mart",
        pickupLocation: "Anuradhapura Central Farm",
        dropoffLocation: "Kurunegala Town Center",
        distance: "95 km",
    },
];

/**
 * Payment Summary Metrics
 */
export const MOCK_PAYMENT_SUMMARY: PaymentSummaryData = {
    pendingRelease: "Rs. 1,500",
    thisMonth: "Rs. 42,000",
};

/**
 * Driver Notifications
 */
export const MOCK_NOTIFICATIONS: TransporterNotificationItem[] = [
    {
        id: "notif-1",
        title: "Cargo Ready for Pickup",
        message: "Farmer Sunil loaded 100 kg Cabbage in Nuwara Eliya.",
        type: "pickup",
    },
    {
        id: "notif-2",
        title: "New Transport Request",
        message: "150 kg Ripe Tomatoes available in Dambulla Zone.",
        type: "request",
    },
    {
        id: "notif-3",
        title: "Payment Received",
        message: "Rs. 18,500 transferred to your bank account for trip #GH-T1015.",
        type: "payment",
    },
];

/**
 * Full Notification Page Data
 */
export const MOCK_DETAILED_NOTIFICATIONS: TransporterNotificationItem[] = [
    {
        id: "notif-assigned-1",
        title: "Job Assigned",
        message: "You have been selected for Transport Job #GH-T1024. Please confirm pickup.",
        timestamp: "8/26/2026, 9:00:00 AM",
        isRead: false,
        type: "assignment",
        iconEmoji: "🚚",
        jobId: "#GH-T1024",
    },
];

/**
 * Transporter Phone Notification Settings
 */
export interface TransporterNotificationSettings {
    newJobsPush: boolean;
    currentJobUpdatesPush: boolean;
    offerStatusPush: boolean;
    paymentPush: boolean;
    soundAndVibration: boolean;
}

export const MOCK_TRANSPORTER_NOTIFICATION_SETTINGS: TransporterNotificationSettings = {
    newJobsPush: true,
    currentJobUpdatesPush: true,
    offerStatusPush: true,
    paymentPush: true,
    soundAndVibration: true,
};

/**
 * Transporter Driving License & Vehicle Details
 */
export interface TransporterVehicleAndLicense {
    // Driver's License
    driverName: string;
    licenseNumber: string;
    licenseExpiry: string;
    licenseIssueDate: string;
    licenseCategories: string[];
    nicNumber: string;
    bloodGroup: string;
    licenseFrontPhotoUri?: string;
    licenseBackPhotoUri?: string;
    licenseStatus: "Verified" | "Pending Review" | "Expired";

    // Vehicle Details
    vehicleType: string;
    vehiclePlate: string;
    vehicleMakeModel: string;
    vehicleYear: string;
    vehicleColor: string;
    maxCapacityKg: number;
    cargoDimensions: string;
    fuelType: string;
    refrigerated: boolean;
    vehiclePhotoUri?: string;

    // Legal & Permits
    revenueLicenseNo: string;
    revenueLicenseExpiry: string;
    insuranceProvider: string;
    insurancePolicyNo: string;
    insuranceExpiry: string;
    emissionCertificateStatus: "Passed" | "Pending";
    emissionCertificateExpiry: string;
    verificationDate: string;
    verificationStatus: "Verified" | "Under Review" | "Action Required";
}

export const MOCK_TRANSPORTER_VEHICLE_LICENSE: TransporterVehicleAndLicense = {
    driverName: "Ruwan Bandara",
    licenseNumber: "B3849201",
    licenseExpiry: "14/03/2028",
    licenseIssueDate: "15/03/2018",
    licenseCategories: ["B (Dual Purpose)", "C1 (Light Lorry)", "C (Heavy Lorry 3T+)"],
    nicNumber: "198923401234",
    bloodGroup: "O+",
    licenseFrontPhotoUri: "https://images.unsplash.com/photo-1589330694653-dad6d3240a2b?auto=format&fit=crop&w=800&q=80",
    licenseBackPhotoUri: "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80",
    licenseStatus: "Verified",

    vehicleType: "Lorry - 3 Ton",
    vehiclePlate: "WP-LH-4821",
    vehicleMakeModel: "Isuzu Elf NPR 71",
    vehicleYear: "2020",
    vehicleColor: "Polar White",
    maxCapacityKg: 3000,
    cargoDimensions: "14.5 ft × 6.2 ft × 6.0 ft",
    fuelType: "Diesel",
    refrigerated: false,
    vehiclePhotoUri: "https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&w=800&q=80",

    revenueLicenseNo: "RL-2025-98321",
    revenueLicenseExpiry: "30/11/2026",
    insuranceProvider: "Sri Lanka Insurance Corporation (SLIC)",
    insurancePolicyNo: "SLIC-CV-783921",
    insuranceExpiry: "15/01/2027",
    emissionCertificateStatus: "Passed",
    emissionCertificateExpiry: "24/10/2026",
    verificationDate: "12 Jan 2026",
    verificationStatus: "Verified",
};

