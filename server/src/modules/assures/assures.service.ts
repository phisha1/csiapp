import { Prisma, TypeMedecin } from '@prisma/client';
import { prisma } from '../../config/prisma';
import { AppError } from '../../middlewares/errors';
import { recordAudit } from '../../lib/audit';
import { encrypt, maskAccount } from '../../lib/crypto';
import type { CreateAssureInput, UpdateAssureInput } from './assures.schemas';

/** Masque le numéro de compte chiffré avant de renvoyer l'assuré (BNF1). */
function serializeAssure<T extends { coordBancaire?: { numeroCompte: string } | null }>(a: T): T {
  if (a && a.coordBancaire) {
    a.coordBancaire = { ...a.coordBancaire, numeroCompte: maskAccount(a.coordBancaire.numeroCompte) };
  }
  return a;
}

async function genMatricule(tx: Prisma.TransactionClient): Promise<string> {
  const year = new Date().getFullYear();
  const count = await tx.assure.count();
  return `ASS-${year}-${String(count + 1).padStart(4, '0')}`;
}

const detailInclude = {
  personne: { include: { medecin: { include: { specialite: true } } } },
  coordBancaire: true,
  traitant: { include: { personne: true } },
  traitantHist: { orderBy: { dateDebut: 'desc' as const }, include: { medecin: { include: { personne: true } } } },
} satisfies Prisma.AssureInclude;

/** Inscrit un assuré (BF3). `medecinId` permet de lier à un médecin existant (dualité). */
export async function createAssure(input: CreateAssureInput, actorId: string) {
  if (input.matricule && (await prisma.assure.findUnique({ where: { matricule: input.matricule } }))) {
    throw new AppError(409, 'Ce matricule est déjà utilisé.');
  }

  // Dualité assuré/médecin : on réutilise la personne du médecin existant.
  let personneIdLie: string | null = null;
  if (input.medecinId) {
    const medecin = await prisma.medecin.findUnique({
      where: { id: input.medecinId },
      include: { personne: { include: { assure: true } } },
    });
    if (!medecin) throw new AppError(404, 'Médecin introuvable.');
    if (medecin.personne.assure) throw new AppError(409, 'Ce médecin est déjà enregistré comme assuré.');
    personneIdLie = medecin.personneId;
  }

  const assure = await prisma.$transaction(async (tx) => {
    let personneId = personneIdLie;
    if (!personneId) {
      const personne = await tx.personne.create({
        data: {
          nom: input.nom!,
          prenom: input.prenom!,
          sexe: input.sexe!,
          dateNaissance: input.dateNaissance!,
          telephone: input.telephone,
          email: input.email,
        },
      });
      personneId = personne.id;
    }
    const matricule = input.matricule ?? (await genMatricule(tx));
    return tx.assure.create({
      data: {
        personneId,
        matricule,
        numeroSecu: input.numeroSecu,
        profession: input.profession,
        employeur: input.employeur,
        groupe: input.groupe,
        modeRembPref: input.modeRembPref,
        coordBancaire: input.coordBancaire
          ? {
              create: {
                banque: input.coordBancaire.banque,
                numeroCompte: encrypt(input.coordBancaire.numeroCompte),
                titulaire: input.coordBancaire.titulaire,
              },
            }
          : undefined,
      },
      include: { personne: { include: { medecin: true } }, coordBancaire: true },
    });
  });
  await recordAudit({ utilisateurId: actorId, action: 'ASSURE_CREE', entite: 'Assure', entiteId: assure.id, details: input.medecinId ? { lieAuMedecin: input.medecinId } : undefined });
  return serializeAssure(assure);
}

export async function listAssures(params: { q?: string; skip: number; take: number }) {
  const { q, skip, take } = params;
  const where: Prisma.AssureWhereInput = q
    ? {
        OR: [
          { matricule: { contains: q, mode: 'insensitive' } },
          { profession: { contains: q, mode: 'insensitive' } },
          { personne: { nom: { contains: q, mode: 'insensitive' } } },
          { personne: { prenom: { contains: q, mode: 'insensitive' } } },
        ],
      }
    : {};
  const [total, items] = await prisma.$transaction([
    prisma.assure.count({ where }),
    prisma.assure.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: { personne: { include: { medecin: { select: { id: true } } } }, traitant: { include: { personne: true } } },
    }),
  ]);
  return { total, items };
}

export async function getAssure(id: string) {
  const assure = await prisma.assure.findUnique({ where: { id }, include: detailInclude });
  if (!assure) throw new AppError(404, 'Assuré introuvable.');
  return serializeAssure(assure);
}

export async function updateAssure(id: string, input: UpdateAssureInput, actorId: string) {
  if (!(await prisma.assure.findUnique({ where: { id } }))) {
    throw new AppError(404, 'Assuré introuvable.');
  }
  const updated = await prisma.assure.update({
    where: { id },
    data: {
      profession: input.profession,
      employeur: input.employeur,
      groupe: input.groupe,
      statut: input.statut,
      modeRembPref: input.modeRembPref,
      personne:
        input.telephone !== undefined || input.email !== undefined
          ? { update: { telephone: input.telephone, email: input.email } }
          : undefined,
    },
    include: { personne: true, coordBancaire: true },
  });
  await recordAudit({ utilisateurId: actorId, action: 'ASSURE_MODIFIE', entite: 'Assure', entiteId: id });
  return serializeAssure(updated);
}

/** Affecte / change le médecin traitant (BF4) avec historisation. */
export async function setTraitant(assureId: string, medecinId: string, actorId: string) {
  if (!(await prisma.assure.findUnique({ where: { id: assureId } }))) {
    throw new AppError(404, 'Assuré introuvable.');
  }
  const medecin = await prisma.medecin.findUnique({ where: { id: medecinId } });
  if (!medecin) throw new AppError(404, 'Médecin introuvable.');
  if (medecin.type !== TypeMedecin.GENERALISTE) {
    throw new AppError(422, 'Le médecin traitant doit être un généraliste.');
  }
  await prisma.$transaction(async (tx) => {
    await tx.medecinTraitantHist.updateMany({ where: { assureId, dateFin: null }, data: { dateFin: new Date() } });
    await tx.medecinTraitantHist.create({ data: { assureId, medecinId } });
    await tx.assure.update({ where: { id: assureId }, data: { traitantId: medecinId } });
  });
  await recordAudit({
    utilisateurId: actorId,
    action: 'MEDECIN_TRAITANT_AFFECTE',
    entite: 'Assure',
    entiteId: assureId,
    details: { medecinId },
  });
  return getAssure(assureId);
}
