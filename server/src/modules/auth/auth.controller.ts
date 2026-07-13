import type { Request, Response } from 'express';
import { changePasswordSchema, loginSchema } from './auth.schemas';
import * as authService from './auth.service';
import { recordAudit } from '../../lib/audit';
import { revokeToken } from '../../lib/tokenDenylist';

// Express 5 transmet automatiquement les rejets de promesse au gestionnaire d'erreurs.

export async function loginHandler(req: Request, res: Response) {
  const input = loginSchema.parse(req.body);
  res.json(await authService.login(input));
}

export async function logoutHandler(req: Request, res: Response) {
  // Révocation effective : le jeton est ajouté à la denylist jusqu'à son expiration.
  if (req.user) await revokeToken(req.user.jti, req.user.exp);
  await recordAudit({ utilisateurId: req.user?.id ?? null, action: 'DECONNEXION' });
  res.json({ message: 'Déconnexion réussie.' });
}

export async function changePasswordHandler(req: Request, res: Response) {
  const input = changePasswordSchema.parse(req.body);
  res.json(await authService.changePassword(req.user!.id, input));
}

export async function meHandler(req: Request, res: Response) {
  // On n'expose que l'identité publique (pas les métadonnées techniques du jeton).
  const u = req.user;
  res.json({ utilisateur: u && { id: u.id, login: u.login, role: u.role } });
}
