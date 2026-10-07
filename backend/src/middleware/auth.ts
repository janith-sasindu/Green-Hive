import type { Request, RequestHandler } from 'express';
import type { AuthUser, UserRole } from '../types/auth';
import { forbidden, unauthorized } from '../utils/AppError';
import { verifyToken } from '../utils/jwt';

/** Requires a valid `Authorization: Bearer <token>` header and attaches the user to the request. */
export const authenticate: RequestHandler = (req, _res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    next(unauthorized('Sign in to continue'));
    return;
  }

  try {
    req.user = verifyToken(header.slice('Bearer '.length).trim());
    next();
  } catch {
    next(unauthorized('Your session is invalid or has expired. Sign in again.'));
  }
};

/** Restricts a route to the given roles. Use after `authenticate`. */
export const authorize =
  (...roles: UserRole[]): RequestHandler =>
  (req, _res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      next(forbidden('You do not have access to this resource'));
      return;
    }
    next();
  };

/** The authenticated user of a request that has passed `authenticate`. */
export const currentUser = (req: Request): AuthUser => {
  if (!req.user) throw unauthorized('Sign in to continue');
  return req.user;
};
