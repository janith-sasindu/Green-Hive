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

/**
 * In-memory storage for users registered during the session.
 */
export interface RegisteredMockUser {
  username: string;
  email: string;
  password: string;
  user: User;
}

export const registeredMockUsers: RegisteredMockUser[] = [];

/**
 * Register a new mock user from the registration form.
 */
export const registerMockUser = (userData: {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  role: string;
}): User => {
  const roleKey = userData.role.toLowerCase();
  let mappedRole: "FARMER" | "SELLER" | "TRANSPORTER" = "FARMER";
  if (roleKey.includes("seller")) {
    mappedRole = "SELLER";
  } else if (roleKey.includes("transporter")) {
    mappedRole = "TRANSPORTER";
  }

  const newUser: User = {
    id: Date.now(),
    name: userData.fullName,
    email: userData.email.trim(),
    phone: userData.phone.trim(),
    role: mappedRole,
    isVerified: true,
  };

  registeredMockUsers.push({
    username: userData.email.split("@")[0].toLowerCase().trim(),
    email: userData.email.toLowerCase().trim(),
    password: userData.password,
    user: newUser,
  });

  return newUser;
};

/**
 * Helper function to validate mock login credentials.
 * Supports:
 * - user / user (Farmer)
 * - farmer / farmer or farmer@greenhive.com / farmer (Farmer)
 * - seller / seller or seller@greenhive.com / seller (Seller)
 * - transporter / transporter or transporter@greenhive.com / transporter (Transporter)
 * - Any newly registered user
 */
export const verifyMockLogin = (
  usernameOrEmail: string,
  password: string
): {
  success: boolean;
  data?: {
    token: string;
    user: User;
  };
  error?: string;
} => {
  const normalizedInput = usernameOrEmail.trim().toLowerCase();

  // 1. Check default 'user' credentials
  const isDefaultUser =
    normalizedInput === MOCK_LOGIN_CREDENTIALS.username.toLowerCase() ||
    normalizedInput === MOCK_LOGIN_CREDENTIALS.email.toLowerCase();

  if (isDefaultUser && password === MOCK_LOGIN_CREDENTIALS.password) {
    return {
      success: true,
      data: {
        token: "mock-jwt-token-greenhive-demo-2026",
        user: MOCK_USER,
      },
    };
  }

  // 2. Check role-based test accounts
  for (const [key, user] of Object.entries(MOCK_USERS_BY_ROLE)) {
    const isRoleMatch =
      normalizedInput === key ||
      normalizedInput === user.email.toLowerCase() ||
      normalizedInput === `${key}@greenhive.com`;

    if (isRoleMatch && (password === key || password === "password" || password === "12345678")) {
      return {
        success: true,
        data: {
          token: `mock-jwt-token-${key}-2026`,
          user,
        },
      };
    }
  }

  // 3. Check registered users in current session
  const registered = registeredMockUsers.find(
    (item) =>
      (item.email === normalizedInput || item.username === normalizedInput) &&
      item.password === password
  );

  if (registered) {
    return {
      success: true,
      data: {
        token: `mock-jwt-token-reg-${registered.user.id}`,
        user: registered.user,
      },
    };
  }

  return {
    success: false,
    error: "Invalid username or password. (Use 'farmer'/'farmer', 'seller'/'seller', 'transporter'/'transporter', or 'user'/'user')",
  };
};
