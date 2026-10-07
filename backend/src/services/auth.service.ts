import bcrypt from 'bcryptjs';
import { pool, withTransaction } from '../config/db';
import { insertSellerProfile } from '../models/seller.model';
import { findUserByEmail, findUserById, insertUser, toPublicUser } from '../models/user.model';
import type { AuthResult, PublicUser, UserRole } from '../types/auth';
import { conflict, notFound, unauthorized } from '../utils/AppError';
import { signToken } from '../utils/jwt';

const BCRYPT_ROUNDS = 10;
const MYSQL_DUPLICATE_ENTRY = 'ER_DUP_ENTRY';

export interface RegisterInput {
  name: string;
  email: string;
  phone: string;
  password: string;
  /** Administrators are created by the platform, not through self registration. */
  role: Exclude<UserRole, 'ADMIN'>;
  location?: string;
  /** Required for sellers. */
  businessName?: string;
  address?: string;
}

const toAuthResult = (user: PublicUser): AuthResult => ({
  token: signToken({ id: user.id, role: user.role }),
  user,
});

export async function registerUser(input: RegisterInput): Promise<AuthResult> {
  if (await findUserByEmail(pool, input.email)) {
    throw conflict('An account with this email already exists');
  }

  const passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);

  try {
    const userId = await withTransaction(async (connection) => {
      const id = await insertUser(connection, {
        name: input.name,
        email: input.email,
        phone: input.phone,
        passwordHash,
        role: input.role,
        location: input.location,
      });
      if (input.role === 'SELLER') {
        await insertSellerProfile(connection, id, input.businessName ?? input.name, input.address);
      }
      return id;
    });

    const user = await findUserById(pool, userId);
    if (!user) throw notFound('The new account could not be loaded');
    return toAuthResult(toPublicUser(user));
  } catch (error) {
    // Two registrations with the same email can pass the check above at the same time
    if ((error as { code?: string }).code === MYSQL_DUPLICATE_ENTRY) {
      throw conflict('An account with this email already exists');
    }
    throw error;
  }
}

export async function loginUser(email: string, password: string): Promise<AuthResult> {
  const user = await findUserByEmail(pool, email);
  // The same message for an unknown email and a wrong password, so accounts cannot be probed
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    throw unauthorized('Incorrect email or password');
  }
  return toAuthResult(toPublicUser(user));
}

export async function getCurrentUser(userId: number): Promise<PublicUser> {
  const user = await findUserById(pool, userId);
  if (!user) throw unauthorized('This account no longer exists');
  return toPublicUser(user);
}
