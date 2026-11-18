/**
 * Transporter Bank Details Screen Data & Text Constants
 * Centralizes UI copy, field labels, placeholders, card labels, alerts,
 * and button texts to eliminate hardcoding from TransporterBankDetailsScreen.
 */

export const BANK_DETAILS_HEADER = {
  title: "Bank Details",
  subtitle: "Payout & Direct Transfer Account",
  backAccessibilityLabel: "Go back to profile",
  editButton: "Change",
  cancelButton: "Cancel",
};

export const BANK_DETAILS_CARD = {
  fallbackPayoutMethod: "Direct Bank Deposit",
  verifiedStatus: "Verified",
  pendingStatus: "Pending",
  accountHolderLabel: "Account Holder",
  branchTypeLabel: "Branch · Type",
  maskedFallback: "•••• •••• ••••",
};

export const BANK_DETAILS_FORM = {
  viewTitle: "Account Information",
  viewSubtitle: "Used by Green-Hive to deposit your delivery fees & earnings.",
  editTitle: "Edit Bank Account Data",
  editSubtitle: "Update your bank data below and tap Save to apply.",
  holderNameLabel: "Account Holder Full Name *",
  holderNamePlaceholder: "e.g. Ruwan Bandara",
  bankNameLabel: "Bank Name *",
  bankNamePlaceholder: "e.g. Commercial Bank of Ceylon",
  bankPresetsPrompt: "Or select your bank:",
  branchNameLabel: "Branch Name *",
  branchNamePlaceholder: "e.g. Colombo Fort",
  branchCodeLabel: "Branch Code",
  branchCodePlaceholder: "016",
  accountNumberLabel: "Bank Account Number *",
  accountNumberPlaceholder: "e.g. 8204918234",
  accountTypeLabel: "Account Type",
  accountTypeSuffix: "Account",
};

export const BANK_DETAILS_ACTIONS = {
  saveButton: "Save Bank Details",
  savingButton: "Saving Account Data...",
  editButton: "Edit or Update Bank Data",
};

export const BANK_DETAILS_SECURITY = {
  title: "Direct Payout Guarantee",
  description:
    "Upon confirmation of crop delivery by the receiver, all transport fees and approved reimbursements are credited directly to this bank account via LANKAQR / Sri Lanka Interbank Payment System (SLIPS).",
};

export const BANK_DETAILS_ALERTS = {
  missingHolderName: {
    title: "Account Holder Name Required",
    message:
      "Please enter the name of the bank account holder as it appears in bank records.",
    buttonText: "OK",
  },
  missingBankName: {
    title: "Bank Name Required",
    message: "Please select or enter the name of your commercial bank.",
    buttonText: "OK",
  },
  missingBranchName: {
    title: "Branch Required",
    message: "Please specify your bank branch name.",
    buttonText: "OK",
  },
  invalidAccountNumber: {
    title: "Valid Account Number Required",
    message: "Please enter a valid bank account number (at least 6 digits).",
    buttonText: "OK",
  },
  saveSuccess: {
    title: "Bank Details Saved",
    message:
      "Your payout bank account details have been updated successfully. Future delivery earnings will be deposited into this account.",
    buttonText: "Done",
  },
  saveFailure: {
    title: "Failed to Save Bank Details",
    message:
      "Could not update your bank details on the server. Please check your network and try again.",
    buttonText: "OK",
  },
  loadFailure: {
    title: "Could Not Load Bank Details",
    message: "Unable to retrieve your bank details from the server.",
    buttonText: "OK",
  },
};

export const BANK_DETAILS_LOADING = {
  message: "Loading bank account details...",
};

export const BANK_DETAILS_TABS = {
  home: "Home",
  jobs: "Jobs",
  active: "Active",
  profile: "Profile",
};

