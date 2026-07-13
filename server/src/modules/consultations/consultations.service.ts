import { Prisma } from '@prisma/client';
import { prisma } from '../../config/prisma';
import { decryptConsultation } from '../../lib/phi';
import type { AuthUser } from '../../lib/jwt';
import { consultationAccessWhere, resolveMedicalActor } from '../../lib/medicalAccess';
import { medicalAssureSelect, medicalMedecinSelect } from '../../lib/medicalProjections';

const select = {
  id: true,
  assureId: true,
  medecinId: true,
  date: true,
  motif: true,
  type: true,
  diagnostic: true,
  actes: true,
  suite: true,
  createdAt: true,
  assure: { select: medicalAssureSelect },
  medecin: { select: medicalMedecinSelect },
} satisfies Prisma.ConsultationSelect;

export async function listConsultations(params: { q?: string; skip: number; take: number }, user: AuthUser) {
  const filters: Prisma.ConsultationWhereInput[] = [];
  const actor = await resolveMedicalActor(user);
  if (actor.kind === 'medecin') {
    filters.push(consultationAccessWhere(actor.medecinId, actor.type));
  }
  if (params.q) {
    filters.push({
      OR: [
        // motif/diagnostic chiffrés au repos → non recherchables (choix conformité).
        { assure: { personne: { nom: { contains: params.q, mode: 'insensitive' } } } },
      ],
    });
  }
  const where: Prisma.ConsultationWhereInput = filters.length ? { AND: filters } : {};
  const [total, items] = await prisma.$transaction([
    prisma.consultation.count({ where }),
    prisma.consultation.findMany({ where, skip: params.skip, take: params.take, orderBy: { date: 'desc' }, select }),
  ]);
  return { total, items: items.map(decryptConsultation) };
}
