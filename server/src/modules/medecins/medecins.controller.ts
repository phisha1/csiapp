import type { Request, Response } from 'express';
import { createMedecinSchema, updateMedecinSchema } from './medecins.schemas';
import * as service from './medecins.service';
import { getPagination, getSearch } from '../../lib/pagination';

export async function createMedecinHandler(req: Request, res: Response) {
  const input = createMedecinSchema.parse(req.body);
  res.status(201).json(await service.createMedecin(input, req.user!.id));
}

export async function listMedecinsHandler(req: Request, res: Response) {
  const { skip, take, page, limit } = getPagination(req);
  const { total, items } = await service.listMedecins({ q: getSearch(req), skip, take });
  res.json({ total, page, limit, items });
}

export async function getMedecinHandler(req: Request, res: Response) {
  res.json(await service.getMedecin(req.params.id as string));
}

export async function updateMedecinHandler(req: Request, res: Response) {
  const input = updateMedecinSchema.parse(req.body);
  res.json(await service.updateMedecin(req.params.id as string, input, req.user!.id));
}
