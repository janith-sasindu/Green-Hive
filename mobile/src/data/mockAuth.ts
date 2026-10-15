import { User } from '../types/auth';

/**
 * Mock login credentials for testing and development.
 */
export const MOCK_LOGIN_CREDENTIALS = {
  username: "user",
  password: "user",
  email: "user@greenhive.com",
};

/**
 * Mock authenticated user profile.
 */
export const MOCK_USER: User = {
  id: 1,
  name: "GreenHive Demo User",
  email: "user@greenhive.com",
  phone: "+94 77 123 4567",
  role: "FARMER",
  isVerified: true,
};

/**
 * Mock login response with auth token and user profile.
 */
export const MOCK_AUTH_RESPONSE = {
  token: "mock-jwt-token-greenhive-demo-2026",
  user: MOCK_USER,
};

/**
 * Helper function to validate mock login credentials.
 * Supports checking against both username ("user") and email ("user@greenhive.com").
 * 
 * @param usernameOrEmail - Input username or email
 * @param password - Input password
 * @returns Object with success boolean, mock data on success, or error message on failure
 */
export const verifyMockLogin = (
  usernameOrEmail: string,
  password: string
): {
  success: boolean;
  data?: typeof MOCK_AUTH_RESPONSE;
  error?: string;
} => {
  const normalizedInput = usernameOrEmail.trim().toLowerCase();
  const isValidIdentifier =
    normalizedInput === MOCK_LOGIN_CREDENTIALS.username.toLowerCase() ||
    normalizedInput === MOCK_LOGIN_CREDENTIALS.email.toLowerCase();

  const isValidPassword = password === MOCK_LOGIN_CREDENTIALS.password;

  if (isValidIdentifier && isValidPassword) {
    return {
      success: true,
      data: MOCK_AUTH_RESPONSE,
    };
  }

  return {
    success: false,
    error: "Invalid username or password. (Use 'user' / 'user')",
  };
};

/**
 * Pre-configured mock users for different roles to test different app flows.
 */
export const MOCK_USERS_BY_ROLE: Record<string, User> = {
  farmer: {
    id: 101,
    name: "Kamal Perera (Farmer)",
    email: "farmer@greenhive.com",
    phone: "+94 77 111 2233",
    role: "FARMER",
    isVerified: true,
  },
  seller: {
    id: 102,
    name: "Sunil Silva (Retail Seller)",
    email: "seller@greenhive.com",
    phone: "+94 77 444 5566",
    role: "SELLER",
    isVerified: true,
  },
  transporter: {
    id: 103,
    name: "Nimal Fernando (Transporter)",
    email: "transporter@greenhive.com",
    phone: "+94 77 777 8899",
    role: "TRANSPORTER",
    isVerified: true,
  },
};
