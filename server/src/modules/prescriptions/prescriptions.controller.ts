import type { Request, Response } from 'express';
import { orientationSchema, prescrireMedicamentsSchema } from './prescriptions.schemas';
import * as service from './prescriptions.service';
import { getPagination } from '../../lib/pagination';

export async function prescrireMedicamentsHandler(req: Request, res: Response) {
  const input = prescrireMedicamentsSchema.parse(req.body);
  res.status(201).json(await service.prescrireMedicaments(input, req.user!.id));
}

export async function orienterHandler(req: Request, res: Response) {
  const input = orientationSchema.parse(req.body);
  res.status(201).json(await service.orienter(input, req.user!.id));
}

export async function listPrescriptionsHandler(req: Request, res: Response) {
  const { skip, take, page, limit } = getPagination(req);
  const feuilleId = typeof req.query.feuille === 'string' ? req.query.feuille : undefined;
  const { total, items } = await service.listPrescriptions({ feuilleId, skip, take }, req.user!);
  res.json({ total, page, limit, items });
}

export async function getPrescriptionHandler(req: Request, res: Response) {
  res.json(await service.getPrescription(req.params.id as string));
}
