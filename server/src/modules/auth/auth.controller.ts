import type { Request, Response } from 'express';
import { changePasswordSchema, loginSchema } from './auth.schemas';
import * as authService from './auth.service';
import { recordAudit } from '../../lib/audit';
import { revokeToken } from '../../lib/tokenDenylist';
import { verifyToken } from '../../lib/jwt';
import {
  clearSessionCookie,
  readSessionToken,
  setSessionCookie,
} from '../../lib/sessionCookie';

// Express 5 transmet automatiquement les rejets de promesse au gestionnaire d'erreurs.

export async function loginHandler(req: Request, res: Response) {
  const input = loginSchema.parse(req.body);
  const { token, utilisateur } = await authService.login(input);
  setSessionCookie(res, token);
  res.json({ utilisateur });
}

export async function logoutHandler(req: Request, res: Response) {
  const token = readSessionToken(req);
  clearSessionCookie(res);
  let utilisateurId: string | null = null;
  if (token) {
    let verified: ReturnType<typeof verifyToken> | null = null;
    try {
      verified = verifyToken(token);
    } catch {
      // Cookie expiré ou invalide : il est quand même supprimé du navigateur.
    }
    if (verified) {
      utilisateurId = verified.id;
      // Une erreur de persistance ne doit pas être masquée : sinon un jeton volé
      // resterait utilisable alors que l'interface annonce une déconnexion réussie.
      await revokeToken(verified.jti, verified.exp);
    }
  }
  await recordAudit({ utilisateurId, action: 'DECONNEXION' });
  res.json({ message: 'Déconnexion réussie.' });
}

export async function changePasswordHandler(req: Request, res: Response) {
  const input = changePasswordSchema.parse(req.body);
  const result = await authService.changePassword(req.user!.id, input);
  clearSessionCookie(res);
  res.json(result);
}

export async function meHandler(req: Request, res: Response) {
  // On n'expose que l'identité publique (pas les métadonnées techniques du jeton).
  const u = req.user;
  res.json({
    utilisateur: u && {
      id: u.id,
      login: u.login,
      role: u.role,
      doitChangerMotDePasse: u.doitChangerMotDePasse,
      motDePasseTemporaireExpireLe: u.motDePasseTemporaireExpireLe,
    },
  });
}
