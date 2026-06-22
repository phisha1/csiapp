import type { Request, Response } from 'express';
import { loginSchema, registerSchema } from './auth.schemas';
import * as authService from './auth.service';
import { recordAudit } from '../../lib/audit';

// Express 5 transmet automatiquement les rejets de promesse au gestionnaire d'erreurs.

export async function loginHandler(req: Request, res: Response) {
  const input = loginSchema.parse(req.body);
  res.json(await authService.login(input));
}

export async function registerHandler(req: Request, res: Response) {
  const input = registerSchema.parse(req.body);
  res.status(201).json(await authService.register(input));
}

export async function logoutHandler(req: Request, res: Response) {
  await recordAudit({ utilisateurId: req.user?.id ?? null, action: 'DECONNEXION' });
  res.json({ message: 'Déconnexion réussie.' });
}

export async function meHandler(req: Request, res: Response) {
  res.json({ utilisateur: req.user });
}
