import type { Request, Response } from 'express';
import * as service from './admin.service';
import { createAssureurSchema } from './admin.schemas';

export async function listHandler(_req: Request, res: Response) {
  res.json({ utilisateurs: await service.listUtilisateurs() });
}

export async function createAssureurHandler(req: Request, res: Response) {
  const input = createAssureurSchema.parse(req.body);
  res.status(201).json(await service.creerAssureur(input, req.user!.id));
}

export async function reactiverHandler(req: Request, res: Response) {
  res.json(await service.reactiver(req.params.id as string, req.user!.id));
}

export async function suspendreHandler(req: Request, res: Response) {
  res.json(await service.suspendre(req.params.id as string, req.user!.id));
}

export async function resetPasswordHandler(req: Request, res: Response) {
  res.json(await service.reinitialiserMotDePasse(req.params.id as string, req.user!.id));
}
