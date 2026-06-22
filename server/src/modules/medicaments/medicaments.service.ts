import { Prisma } from '@prisma/client';
import { prisma } from '../../config/prisma';
import { AppError } from '../../middlewares/errors';
import { recordAudit } from '../../lib/audit';
import type { CreateMedicamentInput } from './medicaments.schemas';

export async function listMedicaments(params: { q?: string; skip: number; take: number }) {
  const { q, skip, take } = params;
  const where: Prisma.MedicamentCatalogueWhereInput = q
    ? {
        OR: [
          { code: { contains: q, mode: 'insensitive' } },
          { nom: { contains: q, mode: 'insensitive' } },
        ],
      }
    : {};
  const [total, items] = await prisma.$transaction([
    prisma.medicamentCatalogue.count({ where }),
    prisma.medicamentCatalogue.findMany({ where, skip, take, orderBy: { nom: 'asc' } }),
  ]);
  return { total, items };
}

export async function createMedicament(input: CreateMedicamentInput, actorId: string) {
  if (await prisma.medicamentCatalogue.findUnique({ where: { code: input.code } })) {
    throw new AppError(409, 'Ce code médicament existe déjà.');
  }
  const medicament = await prisma.medicamentCatalogue.create({ data: input });
  await recordAudit({ utilisateurId: actorId, action: 'MEDICAMENT_AJOUTE', entite: 'MedicamentCatalogue', entiteId: medicament.id });
  return medicament;
}
