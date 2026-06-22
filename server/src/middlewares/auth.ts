import type { NextFunction, Request, Response } from 'express';
import type { Role } from '@prisma/client';
import { verifyToken } from '../lib/jwt';
import { AppError } from './errors';

/** Exige un jeton JWT valide ; attache l'utilisateur à `req.user`. */
export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    throw new AppError(401, 'Authentification requise.');
  }
  try {
    req.user = verifyToken(header.slice(7));
  } catch {
    throw new AppError(401, 'Jeton invalide ou expiré.');
  }
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
