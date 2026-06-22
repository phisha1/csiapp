import { Prisma, Role, TypeMedecin } from '@prisma/client';
import { prisma } from '../../config/prisma';
import { AppError } from '../../middlewares/errors';
import { hashPassword } from '../../lib/password';
import { recordAudit } from '../../lib/audit';
import type { CreateMedecinInput, UpdateMedecinInput } from './medecins.schemas';

const withRelations = { personne: true, specialite: true } as const;

async function resolveSpecialiteId(libelle?: string): Promise<string | null> {
  if (!libelle || !libelle.trim()) return null;
  const sp = await prisma.specialite.upsert({
    where: { libelle: libelle.trim() },
    update: {},
    create: { libelle: libelle.trim() },
  });
  return sp.id;
}

/** Enregistre un médecin + son compte utilisateur (BF2). */
export async function createMedecin(input: CreateMedecinInput, actorId: string) {
  if (await prisma.medecin.findUnique({ where: { numOrdre: input.numOrdre } })) {
    throw new AppError(409, "Ce numéro d'ordre est déjà enregistré.");
  }
  if (await prisma.utilisateur.findUnique({ where: { login: input.login } })) {
    throw new AppError(409, 'Cet identifiant est déjà utilisé.');
  }

  const specialiteId =
    input.type === 'SPECIALISTE' ? await resolveSpecialiteId(input.specialite) : null;
  const role = input.type === 'SPECIALISTE' ? Role.SPECIALISTE : Role.GENERALISTE;
  const motDePasseHash = await hashPassword(input.motDePasse);

  const medecin = await prisma.$transaction(async (tx) => {
    const personne = await tx.personne.create({
      data: {
        nom: input.nom,
        prenom: input.prenom,
        sexe: input.sexe,
        dateNaissance: input.dateNaissance,
        telephone: input.telephone,
        email: input.email,
      },
    });
    const utilisateur = await tx.utilisateur.create({
      data: { login: input.login, motDePasseHash, role },
    });
    return tx.medecin.create({
      data: {
        personneId: personne.id,
        utilisateurId: utilisateur.id,
        numOrdre: input.numOrdre,
        type: input.type as TypeMedecin,
        specialiteId,
        etablissement: input.etablissement,
      },
      include: withRelations,
    });
  });

  await recordAudit({ utilisateurId: actorId, action: 'MEDECIN_CREE', entite: 'Medecin', entiteId: medecin.id });
  return medecin;
}

export async function listMedecins(params: { q?: string; skip: number; take: number }) {
  const { q, skip, take } = params;
  const where: Prisma.MedecinWhereInput = q
    ? {
        OR: [
          { numOrdre: { contains: q, mode: 'insensitive' } },
          { etablissement: { contains: q, mode: 'insensitive' } },
          { personne: { nom: { contains: q, mode: 'insensitive' } } },
          { personne: { prenom: { contains: q, mode: 'insensitive' } } },
          { specialite: { libelle: { contains: q, mode: 'insensitive' } } },
        ],
      }
    : {};
  const [total, items] = await prisma.$transaction([
    prisma.medecin.count({ where }),
    prisma.medecin.findMany({ where, skip, take, orderBy: { createdAt: 'desc' }, include: withRelations }),
  ]);
  return { total, items };
}

export async function getMedecin(id: string) {
  const medecin = await prisma.medecin.findUnique({ where: { id }, include: withRelations });
  if (!medecin) throw new AppError(404, 'Médecin introuvable.');
  return medecin;
}

export async function updateMedecin(id: string, input: UpdateMedecinInput, actorId: string) {
  await getMedecin(id);
  const data: Prisma.MedecinUpdateInput = {
    etablissement: input.etablissement,
    personne:
      input.telephone !== undefined || input.email !== undefined
        ? { update: { telephone: input.telephone, email: input.email } }
        : undefined,
  };
  if (input.specialite !== undefined) {
    const specialiteId = await resolveSpecialiteId(input.specialite);
    data.specialite = specialiteId ? { connect: { id: specialiteId } } : { disconnect: true };
  }
  const updated = await prisma.medecin.update({ where: { id }, data, include: withRelations });
  await recordAudit({ utilisateurId: actorId, action: 'MEDECIN_MODIFIE', entite: 'Medecin', entiteId: id });
  return updated;
}
