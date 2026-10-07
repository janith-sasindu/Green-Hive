import type { AuthUser } from './auth';

declare global {
  namespace Express {
    interface Request {
      /** Set by the authenticate middleware once the bearer token has been verified. */
      user?: AuthUser;
    }
  }
}

export {};
