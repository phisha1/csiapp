import type { Request, Response } from 'express';
import * as service from './admin.service';

export async function listHandler(_req: Request, res: Response) {
  res.json({ utilisateurs: await service.listUtilisateurs() });
}

export async function reactiverHandler(req: Request, res: Response) {
  res.json(await service.reactiver(req.params.id as string, req.user!.id));
}

export async function suspendreHandler(req: Request, res: Response) {
  res.json(await service.suspendre(req.params.id as string, req.user!.id));
}
