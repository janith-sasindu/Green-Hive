export const USER_ROLES = ['FARMER', 'SELLER', 'TRANSPORTER', 'ADMIN'] as const;

export type UserRole = (typeof USER_ROLES)[number];

/** The identity carried in the JWT and attached to authenticated requests. */
export interface AuthUser {
  id: number;
  role: UserRole;
}

/** User fields that are safe to return to the client. */
export interface PublicUser {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  isVerified: boolean;
}

export interface AuthResult {
  token: string;
  user: PublicUser;
}
