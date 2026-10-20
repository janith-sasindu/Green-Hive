/**
 * Mock Data for Transporter Module
 * Cleanly separated and organized to avoid hardcoding inside UI components.
 */

export interface TransporterProfile {
    name: string;
    greeting: string;
    avatarLetter: string;
    email: string;
    phone: string;
    vehicleType: string;
    vehiclePlate: string;
    isVerified: boolean;
    rating: number;
    completedJobs: number;
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
}

export interface AvailableTransportJob {
    id: string;
    cropName: string;
    weight: string;
    status: "Open" | "Assigned";
    pickup: string;
    dropoff: string;
    pickupTime: string;
    price: string;
    distance?: string;
    farmerName?: string;
    farmerPhone?: string;
}

export interface TransportOffer {
    id: string;
    cropName: string;
    weight: string;
    route: string;
    quotePrice: string;
    status: string;
}

export interface PaymentSummaryData {
    pendingRelease: string;
    thisMonth: string;
}

export interface TransporterNotificationItem {
    id: string;
    title: string;
    message: string;
    type: "pickup" | "request" | "payment";
}

/**
 * Logged-in Transporter Profile
 */
export const MOCK_TRANSPORTER_PROFILE: TransporterProfile = {
    name: "Ruwan Bandara",
    greeting: "Good morning,",
    avatarLetter: "R",
    email: "transporter@greenhive.com",
    phone: "+94 77 777 8899",
    vehicleType: "Lorry - 3 Ton",
    vehiclePlate: "WP-LH-4821",
    isVerified: true,
    rating: 4.8,
    completedJobs: 47,
};

/**
 * Transporter Dashboard 2x2 Metric Statistics
 */
export const MOCK_TRANSPORTER_STATS: TransporterStats = {
    openJobsCount: 2,
    myOffersCount: 1,
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
    price: "Rs. 18,500",
    farmerName: "Sunil Rathnayake",
    farmerPhone: "+94 77 123 4567",
    pickupDate: "Today, 06:30 AM",
};

/**
 * Available Jobs Open for Transporter Bids
 */
export const MOCK_AVAILABLE_JOBS: AvailableTransportJob[] = [
    {
        id: "#GH-T1025",
        cropName: "Ripe Tomatoes",
        weight: "150 kg",
        pickup: "Dambulla Agricultural Zone",
        dropoff: "Colombo Fresh Market",
        pickupTime: "2026-08-31 · 06:00 AM",
        status: "Open",
        price: "Rs. 15,500",
        distance: "148 km",
        farmerName: "Jagath Samarasinghe",
        farmerPhone: "+94 77 234 5678",
    },
    {
        id: "#GH-T1020",
        cropName: "Organic Carrots",
        weight: "200 kg",
        pickup: "Nuwara Eliya Highlands Farm",
        dropoff: "Kandy Supermart",
        pickupTime: "2026-08-29 · 07:00 AM",
        status: "Open",
        price: "Rs. 14,000",
        distance: "78 km",
        farmerName: "Wasantha Kumara",
        farmerPhone: "+94 71 876 5432",
    },
];

/**
 * Transporter's Submitted Bids / Offers
 */
export const MOCK_MY_OFFERS: TransportOffer[] = [
    {
        id: "#GH-T1019",
        cropName: "Red Potatoes",
        weight: "500 kg",
        route: "Nuwara Eliya → Colombo Wholesale Market",
        quotePrice: "Rs. 22,000",
        status: "Pending Farmer Approval",
    },
    {
        id: "#GH-T1016",
        cropName: "Sweet Corn",
        weight: "300 kg",
        route: "Anuradhapura → Kurunegala Town",
        quotePrice: "Rs. 19,500",
        status: "Accepted",
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
