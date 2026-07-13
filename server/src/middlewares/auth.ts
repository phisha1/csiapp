import type { NextFunction, Request, Response } from 'express';
import type { Role } from '@prisma/client';
import { verifyToken, type VerifiedToken } from '../lib/jwt';
import { isRevoked } from '../lib/tokenDenylist';
import { AppError } from './errors';

/** Exige un jeton JWT valide et non révoqué ; attache l'utilisateur à `req.user`. */
export async function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    throw new AppError(401, 'Authentification requise.');
  }
  let verified: VerifiedToken;
  try {
    verified = verifyToken(header.slice(7));
  } catch {
    throw new AppError(401, 'Jeton invalide ou expiré.');
  }
  // Signature valide ne suffit pas : le jeton a-t-il été révoqué (logout, suspension) ?
  if (await isRevoked(verified.jti)) {
    throw new AppError(401, 'Session terminée — veuillez vous reconnecter.');
  }
  req.user = verified;
  next();
}

/** Restreint l'accès aux rôles autorisés (RBAC — BNF1). */
export function requireRole(...roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) throw new AppError(401, 'Authentification requise.');
    if (!roles.includes(req.user.role)) {
      throw new AppError(403, 'Accès refusé : profil non autorisé pour cette action.');
    }
    next();
  };
}
