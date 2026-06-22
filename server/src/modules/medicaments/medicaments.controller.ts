import type { Request, Response } from 'express';
import { createMedicamentSchema } from './medicaments.schemas';
import * as service from './medicaments.service';
import { getPagination, getSearch } from '../../lib/pagination';

export async function listMedicamentsHandler(req: Request, res: Response) {
  const { skip, take, page, limit } = getPagination(req);
  const { total, items } = await service.listMedicaments({ q: getSearch(req), skip, take });
  res.json({ total, page, limit, items });
}

export async function createMedicamentHandler(req: Request, res: Response) {
  const input = createMedicamentSchema.parse(req.body);
  res.status(201).json(await service.createMedicament(input, req.user!.id));
}
