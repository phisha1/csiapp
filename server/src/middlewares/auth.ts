import type { NextFunction, Request, Response } from 'express';
import { Role, StatutCompte } from '@prisma/client';
import { prisma } from '../config/prisma';
import { verifyToken, type VerifiedToken } from '../lib/jwt';
import { isRevoked } from '../lib/tokenDenylist';
import { AppError } from './errors';

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
    select: { statut: true, jetonsInvalidesAvant: true },
  });
  if (!compte) throw new AppError(401, 'Compte introuvable.');
  if (compte.statut !== StatutCompte.ACTIF) {
    throw new AppError(403, 'Compte non actif — accès suspendu. Contactez un administrateur.');
  }
  // Jeton émis avant une invalidation globale (changement/réinitialisation de mot de passe) ?
  // iat est en secondes (tronqué) : on compare donc en secondes entières, sinon un jeton
  // émis dans la même seconde que l'invalidation serait rejeté à tort.
  if (
    compte.jetonsInvalidesAvant &&
    verified.iat < Math.floor(compte.jetonsInvalidesAvant.getTime() / 1000)
  ) {
    throw new AppError(401, 'Session expirée après changement de mot de passe — reconnectez-vous.');
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
