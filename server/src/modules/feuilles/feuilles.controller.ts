import type { Request, Response } from 'express';
import { completerSchema, createFeuilleSchema, motifSchema } from './feuilles.schemas';
import * as service from './feuilles.service';
import { getPagination, getSearch } from '../../lib/pagination';

export async function createFeuilleHandler(req: Request, res: Response) {
  const input = createFeuilleSchema.parse(req.body);
  res.status(201).json(await service.createFeuille(input, req.user!.id));
}

export async function listFeuillesHandler(req: Request, res: Response) {
  const { skip, take, page, limit } = getPagination(req);
  const { total, items } = await service.listFeuilles({ q: getSearch(req), skip, take }, req.user!);
  res.json({ total, page, limit, items });
}

export async function getFeuilleHandler(req: Request, res: Response) {
  res.json(await service.getFeuille(req.params.id as string));
}

export async function ouvrirHandler(req: Request, res: Response) {
  res.json(await service.ouvrir(req.params.id as string, req.user!.id));
}

export async function completerHandler(req: Request, res: Response) {
  const input = completerSchema.parse(req.body);
  res.json(await service.completer(req.params.id as string, input, req.user!.id));
}

export async function incompleteHandler(req: Request, res: Response) {
  const { motif } = motifSchema.parse(req.body);
  res.json(await service.marquerIncomplete(req.params.id as string, motif, req.user!.id));
}

export async function refuserHandler(req: Request, res: Response) {
  const { motif } = motifSchema.parse(req.body);
  res.json(await service.refuser(req.params.id as string, motif, req.user!.id));
}
