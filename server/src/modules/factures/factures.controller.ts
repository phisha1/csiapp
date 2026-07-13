import type { Request, Response } from 'express';
import * as service from './factures.service';
import { getPagination, getSearch } from '../../lib/pagination';

export async function listFacturesHandler(req: Request, res: Response) {
  const { skip, take, page, limit } = getPagination(req);
  const { total, items } = await service.listFactures({ q: getSearch(req), skip, take });
  res.json({ total, page, limit, items });
}

export async function getFactureHandler(req: Request, res: Response) {
  res.json(await service.getFacture(req.params.id as string, req.user!.id));
}

export async function getFacturePdfHandler(req: Request, res: Response) {
  const { buffer, filename } = await service.genererPdf(req.params.id as string, req.user!.id);
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
  res.send(buffer);
}
