import type { Request, Response } from 'express';
import * as service from './consultations.service';
import { getPagination, getSearch } from '../../lib/pagination';

export async function listConsultationsHandler(req: Request, res: Response) {
  const { skip, take, page, limit } = getPagination(req);
  const { total, items } = await service.listConsultations({ q: getSearch(req), skip, take }, req.user!);
  res.json({ total, page, limit, items });
}
