import { Prisma } from '@prisma/client';
import { prisma } from '../../config/prisma';

interface ListAuditParams {
  action?: string;
  actions?: string[];
  from?: Date;
  to?: Date;
  skip: number;
  take: number;
}

/** Liste le journal d'audit avec filtres (BNF1 traçabilité, BNF7 rapports). */
export async function listAudit(params: ListAuditParams) {
  const where: Prisma.JournalAuditWhereInput = {};
  if (params.actions) where.action = { in: params.actions };
  else if (params.action) where.action = params.action;
  if (params.from || params.to) {
    where.horodatage = {};
    if (params.from) where.horodatage.gte = params.from;
    if (params.to) where.horodatage.lte = params.to;
  }
  const [total, items] = await prisma.$transaction([
    prisma.journalAudit.count({ where }),
    prisma.journalAudit.findMany({
      where,
      skip: params.skip,
      take: params.take,
      orderBy: { horodatage: 'desc' },
      include: { utilisateur: { select: { login: true, role: true } } },
    }),
  ]);
  return { total, items };
}
