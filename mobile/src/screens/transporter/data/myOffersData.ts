/**
 * Transporter My Offers Data & UI Constants
 * Centralized strings, filter options, empty states, and alert configurations.
 */

export type OfferFilterType = "All" | "Submitted" | "Accepted";

export const OFFER_FILTERS: { id: OfferFilterType; label: string }[] = [
  { id: "All", label: "All" },
  { id: "Submitted", label: "Submitted" },
  { id: "Accepted", label: "Accepted" },
];

export const MY_OFFERS_TEXTS = {
  headerTitle: "Transport Offers",
  headerSubtitle: "Submitted to seller job cards",
  filterAll: "All",
  filterSubmitted: "Submitted",
  filterAccepted: "Accepted",
  yourCostLabel: "Your Cost",
  estDeliveryLabel: "Est. Delivery",
  submittedPrefix: "Submitted",
  activeTripButton: "Active Trip →",
  withdrawButton: "Withdraw",
  withdrawingButton: "Withdrawing...",
  browseJobsButton: "Browse Available Jobs",
  loadingText: "Loading your submitted offers...",
  emptyState: {
    emoji: "📋",
    title: "No Transport Offers Found",
    description: "You haven't submitted any offers in this category yet.",
  },
  bottomTabs: {
    home: "Home",
    jobs: "Jobs",
    active: "Active",
    profile: "Profile",
  },
};

export const MY_OFFERS_MESSAGES = {
  withdrawConfirm: {
    title: "Withdraw Offer",
    message: (jobLabel: string) =>
      `Are you sure you want to withdraw your submitted offer for ${jobLabel}? The seller will no longer be able to accept your quote.`,
    primaryButton: "Withdraw",
    secondaryButton: "Keep Offer",
  },
  withdrawSuccess: {
    title: "Offer Withdrawn",
    message: (jobLabel: string) =>
      `Your transport offer for ${jobLabel} has been successfully withdrawn.`,
    primaryButton: "OK",
  },
  withdrawError: {
    title: "Withdrawal Failed",
    message: "Could not withdraw this offer. Please check your connection and try again.",
    primaryButton: "Got It",
  },
  cannotWithdrawAccepted: {
    title: "Cannot Withdraw",
    message: "This offer has already been accepted and cannot be withdrawn as the trip is active.",
    primaryButton: "Understood",
  },
  fetchError: {
    title: "Connection Error",
    message: "Could not fetch latest offers from server. Showing local records.",
    primaryButton: "Got It",
  },
};

