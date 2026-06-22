import { Prisma, Role } from '@prisma/client';
import { prisma } from '../../config/prisma';
import type { AuthUser } from '../../lib/jwt';

const include = {
  assure: { include: { personne: true } },
  medecin: { include: { personne: true } },
} satisfies Prisma.ConsultationInclude;

export async function listConsultations(params: { q?: string; skip: number; take: number }, user: AuthUser) {
  const filters: Prisma.ConsultationWhereInput[] = [];
  if (user.role !== Role.ASSUREUR) {
    const medecin = await prisma.medecin.findUnique({ where: { utilisateurId: user.id } });
    filters.push({ medecinId: medecin?.id ?? '00000000-0000-0000-0000-000000000000' });
  }
  if (params.q) {
    filters.push({
      OR: [
        { motif: { contains: params.q, mode: 'insensitive' } },
        { diagnostic: { contains: params.q, mode: 'insensitive' } },
        { assure: { personne: { nom: { contains: params.q, mode: 'insensitive' } } } },
      ],
    });
  }
  const where: Prisma.ConsultationWhereInput = filters.length ? { AND: filters } : {};
  const [total, items] = await prisma.$transaction([
    prisma.consultation.count({ where }),
    prisma.consultation.findMany({ where, skip: params.skip, take: params.take, orderBy: { date: 'desc' }, include }),
  ]);
  return { total, items };
}
