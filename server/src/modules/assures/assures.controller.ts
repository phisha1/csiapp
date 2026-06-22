import type { Request, Response } from 'express';
import { createAssureSchema, setTraitantSchema, updateAssureSchema } from './assures.schemas';
import * as service from './assures.service';
import { getPagination, getSearch } from '../../lib/pagination';

export async function createAssureHandler(req: Request, res: Response) {
  const input = createAssureSchema.parse(req.body);
  res.status(201).json(await service.createAssure(input, req.user!.id));
}

export async function listAssuresHandler(req: Request, res: Response) {
  const { skip, take, page, limit } = getPagination(req);
  const { total, items } = await service.listAssures({ q: getSearch(req), skip, take });
  res.json({ total, page, limit, items });
}

export async function getAssureHandler(req: Request, res: Response) {
  res.json(await service.getAssure(req.params.id as string));
}

export async function updateAssureHandler(req: Request, res: Response) {
  const input = updateAssureSchema.parse(req.body);
  res.json(await service.updateAssure(req.params.id as string, input, req.user!.id));
}

export async function setTraitantHandler(req: Request, res: Response) {
  const { medecinId } = setTraitantSchema.parse(req.body);
  res.json(await service.setTraitant(req.params.id as string, medecinId, req.user!.id));
}
