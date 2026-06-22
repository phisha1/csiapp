import type { Request, Response } from 'express';
import { effectuerRemboursementSchema } from './remboursements.schemas';
import * as service from './remboursements.service';
import { getPagination, getSearch } from '../../lib/pagination';

export async function effectuerRemboursementHandler(req: Request, res: Response) {
  const input = effectuerRemboursementSchema.parse(req.body);
  res.status(201).json(await service.effectuerRemboursement(input, req.user!.id));
}

export async function listRemboursementsHandler(req: Request, res: Response) {
  const { skip, take, page, limit } = getPagination(req);
  const { total, items } = await service.listRemboursements({ q: getSearch(req), skip, take });
  res.json({ total, page, limit, items });
}

export async function getRemboursementHandler(req: Request, res: Response) {
  res.json(await service.getRemboursement(req.params.id as string));
}
