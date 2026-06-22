import type { AuthUser } from '../lib/jwt';

// Étend Express.Request avec l'utilisateur authentifié (middleware requireAuth).
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export {};
