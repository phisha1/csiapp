import type { NextFunction, Request, Response } from 'express';
import { Role, StatutCompte } from '@prisma/client';
import { prisma } from '../config/prisma';
import { verifyToken, type VerifiedToken } from '../lib/jwt';
import { isRevoked } from '../lib/tokenDenylist';
import { AppError } from './errors';
import { isTemporaryPasswordExpired } from '../lib/temporaryPassword';

const TEMPORARY_PASSWORD_ALLOWED_PATHS = new Set([
  '/api/auth/change-password',
  '/api/auth/logout',
  '/api/auth/me',
]);

export function isTemporaryPasswordRouteAllowed(path: string) {
  return TEMPORARY_PASSWORD_ALLOWED_PATHS.has(path);
}

/** Exige un jeton JWT valide, non révoqué, et un compte toujours actif. */
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
  // Signature valide ne suffit pas : le jeton a-t-il été révoqué (logout) ?
  if (await isRevoked(verified.jti)) {
    throw new AppError(401, 'Session terminée — veuillez vous reconnecter.');
  }
  // Le compte est-il toujours actif ? Une suspension/blocage prend ainsi effet
  // immédiatement, sans attendre l'expiration du jeton (coût : une lecture par requête).
  const compte = await prisma.utilisateur.findUnique({
    where: { id: verified.id },
    select: {
      statut: true,
      jetonsInvalidesAvant: true,
      versionSession: true,
      doitChangerMotDePasse: true,
      motDePasseTemporaireExpireLe: true,
    },
  });
  if (!compte) throw new AppError(401, 'Compte introuvable.');
  if (compte.statut !== StatutCompte.ACTIF) {
    throw new AppError(403, 'Compte non actif — accès suspendu. Contactez un administrateur.');
  }
  if (verified.versionSession !== compte.versionSession) {
    throw new AppError(401, 'Session remplacée ou expirée — veuillez vous reconnecter.');
  }
  // Jeton émis avant une invalidation globale (changement/réinitialisation de mot de passe) ?
  if (
    compte.jetonsInvalidesAvant &&
    verified.iat < Math.floor(compte.jetonsInvalidesAvant.getTime() / 1000)
  ) {
    throw new AppError(401, 'Session expirée après changement de mot de passe — reconnectez-vous.');
  }

  if (compte.doitChangerMotDePasse) {
    if (
      isTemporaryPasswordExpired(compte.motDePasseTemporaireExpireLe) &&
      req.originalUrl !== '/api/auth/logout'
    ) {
      throw new AppError(403, 'Mot de passe temporaire expiré. Demandez une réinitialisation à votre administrateur.');
    }
    if (!isTemporaryPasswordRouteAllowed(req.originalUrl)) {
      throw new AppError(428, 'Vous devez changer votre mot de passe temporaire avant de continuer.');
    }
  }

  req.user = {
    ...verified,
    doitChangerMotDePasse: compte.doitChangerMotDePasse,
    motDePasseTemporaireExpireLe: compte.motDePasseTemporaireExpireLe,
  };
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
