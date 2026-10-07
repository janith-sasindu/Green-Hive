import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { AuthUser, USER_ROLES, UserRole } from '../types/auth';

const getSecret = (): string => {
  if (!env.jwtSecret) throw new Error('JWT_SECRET is not configured');
  return env.jwtSecret;
};

export const signToken = (user: AuthUser): string =>
  jwt.sign({ role: user.role }, getSecret(), {
    subject: String(user.id),
    expiresIn: env.jwtExpiresIn as jwt.SignOptions['expiresIn'],
  });

/** Returns the token's user, or throws when the token is invalid, expired or malformed. */
export const verifyToken = (token: string): AuthUser => {
  const payload = jwt.verify(token, getSecret());
  if (typeof payload === 'string') throw new Error('Unexpected token payload');

  const id = Number(payload.sub);
  const role = USER_ROLES.find((item) => item === payload.role) as UserRole | undefined;
  if (!Number.isInteger(id) || id <= 0 || !role) throw new Error('Unexpected token payload');
  return { id, role };
};
