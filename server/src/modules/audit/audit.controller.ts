import type { Request, Response } from 'express';
import * as service from './audit.service';
import { getPagination } from '../../lib/pagination';

function dateParam(v: unknown): Date | undefined {
  if (typeof v !== 'string' || !v) return undefined;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

export async function listAuditHandler(req: Request, res: Response) {
  const { skip, take, page, limit } = getPagination(req);
  const action = typeof req.query.action === 'string' ? req.query.action : undefined;
  const { total, items } = await service.listAudit({
    action,
    from: dateParam(req.query.from),
    to: dateParam(req.query.to),
    skip,
    take,
  });
  res.json({ total, page, limit, items });
}

/** Rapport d'audit des opérations de remboursement (BNF7). */
export async function rapportRemboursementsHandler(req: Request, res: Response) {
  const { skip, take, page, limit } = getPagination(req);
  const { total, items } = await service.listAudit({
    actions: ['REMBOURSEMENT_EFFECTUE', 'REMBOURSEMENT_ECHEC'],
    from: dateParam(req.query.from),
    to: dateParam(req.query.to),
    skip,
    take,
  });
  res.json({ total, page, limit, items });
}
